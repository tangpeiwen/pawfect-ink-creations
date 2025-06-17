from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends, status
from app.models.schemas import GenerationRequest, GenerationResponse, GenerationStatusResponse, GenerationTask, GenerationCreate, GenerationUpdate, GenerationResultCreate
from app.services.openai_service import analyze_pet_image
from app.services.custom_openai_service import generate_sticker_with_custom_api
from app.services.database import db_service
from app.utils.helpers import generate_unique_id, validate_generation_request
from app.core.auth import get_current_user_id
import logging
import os
from typing import Dict
from pathlib import Path
import asyncio
from app.core.config import settings
import uuid
from datetime import datetime
from app.services.storage_service import get_style_reference_images

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/generate", response_model=GenerationResponse)
async def generate_sticker(
    request: GenerationRequest,
    background_tasks: BackgroundTasks,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    生成宠物贴纸设计
    
    Args:
        request: 生成请求参数
        background_tasks: 后台任务管理器
        current_user_id: 当前登录用户ID
        
    Returns:
        GenerationResponse: 生成任务响应
    """
    logger.info(f"用户 {current_user_id} 开始生成贴纸，图片ID: {request.imageId}")
    
    try:
        # 验证生成请求
        await validate_generation_request(request, current_user_id)
        
        # 生成唯一任务ID
        generation_id = generate_unique_id()
        logger.info(f"创建生成任务: {generation_id}")
        
        # 创建生成任务记录
        generation_data = GenerationCreate(
            id=generation_id,
            user_id=current_user_id,
            uploaded_image_id=request.imageId,
            style_id=request.styleId,
            emphasis_features=request.emphasisFeatures,
            custom_features=request.customFeatures or [],
            additional_elements=request.additionalElements or [],
            status='pending',
            progress=0
        )
        
        logger.info(f"准备保存生成任务到数据库: {generation_data.dict()}")
        
        # 保存到数据库
        db_result = await db_service.create_generation(generation_data)
        
        if not db_result:
            logger.error(f"数据库创建生成任务失败，返回结果为: {db_result}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="创建生成任务失败"
            )
        
        logger.info(f"生成任务创建成功，数据库返回: {db_result}")
        
        # 启动后台生成任务
        background_tasks.add_task(
            generate_sticker_background,
            generation_id,
            request,
            current_user_id
        )
        
        logger.info(f"用户 {current_user_id} 的生成任务 {generation_id} 已启动")
        
        return GenerationResponse(
            success=True,
            message="生成任务已开始",
            generationId=generation_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"用户 {current_user_id} 创建生成任务失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"创建生成任务失败: {str(e)}"
        )

async def generate_sticker_background(
    generation_id: str,
    request: GenerationRequest,
    user_id: str
):
    """
    后台任务：执行贴纸生成
    
    Args:
        generation_id: 生成任务ID
        request: 生成请求参数
        user_id: 用户ID
    """
    try:
        logger.info(f"开始执行生成任务: {generation_id}")
        
        # 更新状态：正在处理
        await db_service.update_generation(generation_id, GenerationUpdate(
            status='processing',
            progress=10
        ))
        
        # 获取用户上传的图片信息
        image_info = await db_service.get_uploaded_image(request.imageId)
        if not image_info:
            raise Exception(f"图片不存在: {request.imageId}")
        
        # 验证图片属于当前用户
        if image_info.get('user_id') != user_id:
            raise Exception(f"无权访问图片: {request.imageId}")
        
        # 更新进度：获取风格参考
        await db_service.update_generation(generation_id, GenerationUpdate(progress=20))
        
        # 获取风格配置和提示词
        logger.info(f"任务 {generation_id} - 获取风格配置")
        from app.api.endpoints.styles import STYLES
        style = next((s for s in STYLES if s.id == request.styleId), None)
        if not style:
            raise Exception(f"找不到风格: {request.styleId}")
        
        style_prompt = style.promptDescription
        
        # 获取风格参考图片
        style_references = await get_style_reference_images(request.styleId)
        if not style_references:
            raise Exception(f"找不到风格参考图片: {request.styleId}")
        
        # 更新进度：准备生成参数
        await db_service.update_generation(generation_id, GenerationUpdate(progress=30))
        
        # 处理特征强调
        logger.info(f"任务 {generation_id} - 处理特征强调")
        emphasis_instructions = generate_emphasis_instructions(
            request.emphasisFeatures,
            request.customFeatures,
            request.additionalElements
        )
        
        # 添加详细的日志输出
        logger.info(f"任务 {generation_id} 的详细参数:")
        logger.info(f"  - 选择的特征: {request.emphasisFeatures}")
        logger.info(f"  - 自定义特征: {request.customFeatures}")
        logger.info(f"  - 额外元素: {request.additionalElements}")
        logger.info(f"  - 生成的特征强调指令: {emphasis_instructions}")
        
        # 更新进度
        await db_service.update_generation(generation_id, GenerationUpdate(progress=40))
        
        # 进行图片分析，结合用户选择的特征
        logger.info(f"任务 {generation_id} - 开始分析宠物图片特征")
        # 构建分析指导，让AI重点关注用户选择的特征
        analysis_guidance = []
        if request.emphasisFeatures:
            feature_names = {"eyes": "眼睛", "ears": "耳朵", "nose": "鼻子", "fur": "毛发", "posture": "姿势", "expression": "表情"}
            selected_features = [feature_names.get(f, f) for f in request.emphasisFeatures]
            analysis_guidance.append(f"请特别关注以下特征: {', '.join(selected_features)}")
        
        if request.customFeatures:
            analysis_guidance.append(f"用户特别提到的特征: {', '.join(request.customFeatures)}")
        
        # 使用图片文件名进行分析描述
        image_analysis = ""
        if analysis_guidance:
            image_analysis += f"\n分析重点: {'; '.join(analysis_guidance)}"
        
        logger.info(f"任务 {generation_id} - 图片分析完成: {image_analysis[:100]}...")
        
        # 更新进度：开始AI生成
        await db_service.update_generation(generation_id, GenerationUpdate(progress=50))
        
        # 调用AI生成服务
        result_url = await generate_sticker_with_custom_api(
            user_image_id=request.imageId,
            style_references=style_references,
            style_prompt=style_prompt,
            image_analysis=image_analysis,
            emphasis_instructions=emphasis_instructions,
            generation_id=generation_id
        )
        
        # 更新进度：生成完成
        await db_service.update_generation(generation_id, GenerationUpdate(progress=95))
        
        # 验证generation记录是否还存在（排查外键约束问题）
        logger.info(f"验证generation记录是否存在: {generation_id}")
        verification = await db_service.get_generation(generation_id)
        if not verification:
            logger.error(f"Generation记录不存在，无法保存结果: {generation_id}")
            raise Exception(f"Generation记录丢失: {generation_id}")
        
        logger.info(f"Generation记录验证成功: {verification.get('id')} - 状态: {verification.get('status')}")
        
        # 保存生成结果
        logger.info(f"开始保存generation_result: generation_id={generation_id}")
        result_data = GenerationResultCreate(
            generation_id=generation_id,
            result_url=result_url,
            generation_prompt=f"{style_prompt}\n{emphasis_instructions}",
            api_response_data={}
        )
        
        result_record = await db_service.create_generation_result(result_data)
        if not result_record:
            logger.error(f"保存generation_result失败: {generation_id}")
        else:
            logger.info(f"Generation_result保存成功: {result_record}")
        
        # 最终更新：任务完成（即使result保存失败也要更新状态）
        logger.info(f"开始最终状态更新: generation_id={generation_id}")
        final_update = await db_service.update_generation(generation_id, GenerationUpdate(
            status='completed',
            progress=100,
            result_url=result_url
        ))
        
        if not final_update:
            logger.error(f"最终状态更新失败: {generation_id}")
        else:
            logger.info(f"最终状态更新成功: {final_update}")
        
        logger.info(f"生成任务 {generation_id} 完成")
        
        # 生成任务完成后扣除token
        try:
            # 扣除200 token
            await db_service.consume_tokens(
                user_id=user_id,
                amount=200,
                description=f"生成图片: {generation_id}",
                generation_id=generation_id
            )
            logger.info(f"用户 {user_id} 成功扣除200 token用于生成任务 {generation_id}")
        except Exception as e:
            logger.error(f"扣除token失败: {str(e)}")
            # 即使扣除token失败，也不影响生成结果
            pass
        
    except Exception as e:
        logger.error(f"生成任务 {generation_id} 失败: {str(e)}")
        
        # 更新失败状态
        await db_service.update_generation(generation_id, GenerationUpdate(
            status='failed',
            error_message=str(e)
        ))

@router.get("/status/{generation_id}", response_model=GenerationStatusResponse)
async def get_generation_status(
    generation_id: str,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    获取生成任务状态
    
    Args:
        generation_id: 生成任务ID
        current_user_id: 当前登录用户ID
        
    Returns:
        GenerationStatusResponse: 任务状态信息
    """
    logger.info(f"开始查询生成状态: generation_id={generation_id}, user_id={current_user_id}")
    
    try:
        # 获取生成任务信息
        logger.info(f"调用数据库查询: db_service.get_generation({generation_id})")
        generation = await db_service.get_generation(generation_id)
        
        logger.info(f"数据库查询结果: {generation}")
        
        if not generation:
            logger.warning(f"未找到生成任务: generation_id={generation_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="生成任务不存在"
            )
        
        logger.info(f"找到生成任务，用户ID: {generation.get('user_id')}, 当前用户: {current_user_id}")
        
        # 验证任务属于当前用户
        if generation.get('user_id') != current_user_id:
            logger.warning(f"用户权限不匹配: 任务用户={generation.get('user_id')}, 当前用户={current_user_id}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="无权访问此生成任务"
            )
        
        response_data = GenerationStatusResponse(
            status=generation.get('status', 'unknown'),
            progress=generation.get('progress', 0),
            resultUrl=generation.get('result_url'),
            error=generation.get('error_message')
        )
        
        # 如果主表中没有result_url，但状态是completed，尝试从generation_results表获取
        if response_data.status == 'completed' and not response_data.resultUrl:
            logger.info(f"主表result_url为空，尝试从generation_results表获取: {generation_id}")
            try:
                results = await db_service.get_generation_results(generation_id)
                if results and len(results) > 0:
                    result_url = results[0].get('result_url')
                    if result_url:
                        response_data.resultUrl = result_url
                        logger.info(f"从generation_results表获取到result_url: {result_url}")
                    else:
                        logger.warning(f"generation_results表中也没有result_url: {generation_id}")
                else:
                    logger.warning(f"generation_results表中没有记录: {generation_id}")
            except Exception as e:
                logger.error(f"从generation_results表获取result_url失败: {str(e)}")
        
        logger.info(f"返回状态响应: {response_data.dict()}")
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取生成状态失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取生成状态失败: {str(e)}"
        )

@router.get("/history")
async def get_generation_history(
    limit: int = 20,
    offset: int = 0,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    获取用户的生成历史
    
    Args:
        limit: 每页数量，默认20
        offset: 偏移量，默认0
        current_user_id: 当前登录用户ID
        
    Returns:
        dict: 生成历史列表
    """
    try:
        history = await db_service.get_user_generations(current_user_id, limit, offset)
        total = await db_service.get_user_generations_count(current_user_id)
        
        return {
            "success": True,
            "history": history,
            "total": total,
            "limit": limit,
            "offset": offset
        }
        
    except Exception as e:
        logger.error(f"获取用户 {current_user_id} 生成历史失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取生成历史失败: {str(e)}"
        )

@router.delete("/{generation_id}")
async def delete_generation(
    generation_id: str,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    删除生成任务
    
    Args:
        generation_id: 生成任务ID
        current_user_id: 当前登录用户ID
        
    Returns:
        dict: 删除结果
    """
    try:
        # 获取生成任务信息
        generation = await db_service.get_generation(generation_id)
        
        if not generation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="生成任务不存在"
            )
        
        # 验证任务属于当前用户
        if generation.get('user_id') != current_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="无权删除此生成任务"
            )
        
        # 删除生成任务和相关结果
        await db_service.delete_generation(generation_id)
        
        return {"success": True, "message": "生成任务已删除"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"删除生成任务 {generation_id} 失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"删除生成任务失败: {str(e)}"
        )

def generate_emphasis_instructions(emphasis_features, custom_features, additional_elements):
    """
    生成设计要求说明（避免与图片分析重复）
    """
    instructions = []
    
    if emphasis_features:
        feature_map = {
            "eyes": "突出眼部特征的表现力",
            "ears": "强调耳朵的形状和质感",
            "nose": "突出鼻部的可爱特征",
            "fur": "表现毛发的纹理和质感",
            "posture": "保持原有的姿态特点",
            "expression": "捕捉面部表情的神韵"
        }
        selected_instructions = [feature_map.get(f, f"突出{f}特征") for f in emphasis_features]
        instructions.extend(selected_instructions)
    
    if custom_features:
        instructions.extend([f"特别注意{feature}" for feature in custom_features])
    
    if additional_elements:
        instructions.extend([f"添加{element}元素" for element in additional_elements])
    
    return "；".join(instructions) if instructions else "保持整体和谐统一" 