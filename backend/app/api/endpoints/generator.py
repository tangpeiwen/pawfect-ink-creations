from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends, status
from app.models.schemas import GenerationRequest, GenerationResponse, GenerationStatusResponse, GenerationTask
from app.services.openai_service import analyze_pet_image
from app.services.custom_openai_service import generate_sticker_with_custom_api
from app.services.storage_service import get_processed_image_path, get_style_reference_images, get_public_url
from app.utils.helpers import generate_unique_id, validate_generation_request
import logging
import os
from typing import Dict
from pathlib import Path
import asyncio
from app.core.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

# 内存中存储生成任务
# 实际生产环境应使用持久化存储（如数据库）
generation_tasks: Dict[str, GenerationTask] = {}

def get_generation_task(generation_id: str) -> GenerationTask:
    """获取生成任务，如果不存在则抛出404异常"""
    if generation_id not in generation_tasks:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"未找到ID为 {generation_id} 的生成任务"
        )
    return generation_tasks[generation_id]

@router.post("/generate", response_model=GenerationResponse)
async def generate_sticker(
    request: GenerationRequest,
    background_tasks: BackgroundTasks
):
    """
    根据上传的图片和选择的风格，生成宠物简笔画贴纸
    """
    try:
        # 验证请求
        await validate_generation_request(request)
        
        # 创建生成任务ID
        generation_id = f"gen_{generate_unique_id()}"
        
        # 创建生成任务对象
        task = GenerationTask(
            id=generation_id,
            imageId=request.imageId,
            styleId=request.styleId,
            emphasisFeatures=request.emphasisFeatures,
            customFeatures=request.customFeatures,
            additionalElements=request.additionalElements
        )
        
        # 保存任务状态
        generation_tasks[generation_id] = task
        
        # 将生成任务添加到后台任务
        background_tasks.add_task(
            process_generation_task,
            task
        )
        
        # 返回任务ID
        return {
            "success": True,
            "status": "pending",
            "generationId": generation_id
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"创建生成任务时出错: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"创建生成任务时出现错误: {str(e)}"
        )

@router.get("/generation/{generation_id}/status", response_model=GenerationStatusResponse)
async def get_generation_status(generation_id: str):
    """
    获取贴纸生成任务的状态
    """
    try:
        task = get_generation_task(generation_id)
        return {
            "status": task.status,
            "progress": task.progress,
            "resultUrl": task.resultUrl,
            "error": task.error
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取生成状态时出错: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取生成状态时出现错误: {str(e)}"
        )

async def process_generation_task(task: GenerationTask):
    """
    处理生成任务的后台任务函数
    """
    try:
        # 更新任务状态为处理中
        task.status = "processing"
        task.progress = 10
        generation_tasks[task.id] = task
        
        # 获取预处理后的用户图片
        user_image_path = await get_processed_image_path(task.imageId)
        
        # 检查图片是否存在
        if not os.path.exists(user_image_path):
            raise Exception(f"找不到图片: {user_image_path}")
        
        # 获取风格参考图片
        style_reference_images = await get_style_reference_images(task.styleId)
        
        # 获取风格提示词
        from app.api.endpoints.styles import STYLES
        style = next((s for s in STYLES if s.id == task.styleId), None)
        if not style:
            raise Exception(f"找不到风格: {task.styleId}")
        
        style_prompt = style.promptDescription
        
        # 处理特征强调（简化版，避免与分析重复）
        emphasis_instructions = generate_emphasis_instructions(
            task.emphasisFeatures,
            task.customFeatures,
            task.additionalElements
        )
        
        # 添加详细的日志输出
        logger.info(f"任务 {task.id} 的详细参数:")
        logger.info(f"  - 选择的特征: {task.emphasisFeatures}")
        logger.info(f"  - 自定义特征: {task.customFeatures}")
        logger.info(f"  - 额外元素: {task.additionalElements}")
        logger.info(f"  - 生成的特征强调指令: {emphasis_instructions}")
        
        # 更新进度
        task.progress = 30
        generation_tasks[task.id] = task
        
        # 进行图片分析，结合用户选择的特征
        logger.info("开始分析宠物图片特征")
        # 构建分析指导，让AI重点关注用户选择的特征
        analysis_guidance = []
        if task.emphasisFeatures:
            feature_names = {"eyes": "眼睛", "ears": "耳朵", "nose": "鼻子", "fur": "毛发", "posture": "姿势", "expression": "表情"}
            selected_features = [feature_names.get(f, f) for f in task.emphasisFeatures]
            analysis_guidance.append(f"请特别关注以下特征: {', '.join(selected_features)}")
        
        if task.customFeatures:
            analysis_guidance.append(f"用户特别提到的特征: {', '.join(task.customFeatures)}")
        
        image_analysis = await analyze_pet_image(
            user_image_path, 
            analysis_guidance  # 传递分析指导字符串列表
        )
        logger.info(f"图片分析完成: {image_analysis[:100]}...")
        
        # 更新进度
        task.progress = 50
        generation_tasks[task.id] = task
        
        # 使用新方案：用户图片 + 风格参考图片 + 文字描述生成贴纸
        result_path = await generate_sticker_with_custom_api(
            user_image_path,
            style_reference_images,
            style_prompt,
            image_analysis,
            emphasis_instructions,
            task.id
        )
        
        # 构建结果URL
        result_url = get_public_url(result_path)
        
        # 更新任务状态为完成
        task.status = "completed"
        task.progress = 100
        task.resultUrl = result_url
        generation_tasks[task.id] = task
        
        logger.info(f"生成任务 {task.id} 已完成")
        
    except Exception as e:
        # 更新任务状态为失败
        logger.error(f"生成任务 {task.id} 失败: {str(e)}")
        task.status = "failed"
        task.error = str(e)
        generation_tasks[task.id] = task

def generate_emphasis_instructions(emphasis_features, custom_features, additional_elements):
    """
    生成设计要求说明（避免与图片分析重复）
    """
    design_instructions = []
    
    # 添加具体的特征强调要求
    if emphasis_features and len(emphasis_features) > 0:
        feature_names = {"eyes": "眼睛", "ears": "耳朵", "nose": "鼻子", "fur": "毛发", "posture": "姿势", "expression": "表情"}
        selected_features = [feature_names.get(f, f) for f in emphasis_features]
        design_instructions.append(f"重点突出：{', '.join(selected_features)}")
    
    # 添加自定义特征要求
    if custom_features and len(custom_features) > 0:
        custom_text = "，".join(custom_features)
        design_instructions.append(f"特别强调以下自定义特征：{custom_text}")
    
    # 添加额外元素
    if additional_elements and len(additional_elements) > 0:
        elements_text = "，".join(additional_elements)
        design_instructions.append(f"添加以下装饰元素：{elements_text}")
    
    # 如果没有特殊要求，返回空字符串而不是通用指导
    if not design_instructions:
        return ""
    
    # 组合所有指令
    return "\n".join(design_instructions) 