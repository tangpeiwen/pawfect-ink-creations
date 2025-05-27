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
        
        # 处理特征强调
        emphasis_instructions = generate_emphasis_instructions(
            task.emphasisFeatures,
            task.customFeatures,
            task.additionalElements
        )
        
        # 更新进度
        task.progress = 30
        generation_tasks[task.id] = task
        
        # 第一步：分析用户图片
        image_analysis = await analyze_pet_image(
            user_image_path, 
        )
        
        # 更新进度
        task.progress = 50
        generation_tasks[task.id] = task
        
        # 第二步：组合分析结果和风格，生成贴纸
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
    生成特征强调说明
    """
    feature_descriptions = {
        "eyes": "特别突出眼睛的神态和形状，保持眼睛的表现力",
        "ears": "强调耳朵的形状和比例，确保耳朵特征明显",
        "nose": "细致刻画鼻子形状和纹理，保持鼻子的特征",
        "fur": "注重毛发的质感和纹理，表现毛发的流动感",
        "posture": "保留宠物特有的姿势和肢体语言",
        "expression": "捕捉并强化宠物的表情，突出情感表达"
    }
    
    emphasis_instructions = []
    
    # 添加预设特征强调
    for feature in emphasis_features:
        if feature in feature_descriptions:
            emphasis_instructions.append(feature_descriptions[feature])
    
    # 添加自定义特征
    if custom_features and len(custom_features) > 0:
        emphasis_instructions.append("自定义强调特征：" + "，".join(custom_features))
    
    # 添加额外元素
    if additional_elements and len(additional_elements) > 0:
        emphasis_instructions.append("添加以下元素：" + "，".join(additional_elements))
    
    # 组合所有指令
    return "\n".join(emphasis_instructions) 