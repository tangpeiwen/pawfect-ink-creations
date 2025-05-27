import base64
import logging
import httpx
from typing import List, Optional
from pathlib import Path
import asyncio

from app.core.config import settings

# 配置日志
logger = logging.getLogger(__name__)

# 自定义API配置
CUSTOM_API_BASE = "https://api.tu-zi.com/v1"
CUSTOM_API_KEY = settings.TUZI_API_KEY  # 使用相同的API密钥

async def generate_sticker_with_custom_api(
    user_image_path: Path, 
    style_references: List[Path], 
    style_prompt: str, 
    image_analysis: str, 
    emphasis_instructions: str,
    generation_id: str
):
    """
    使用自定义API生成宠物简笔画贴纸
    采用方案2：用户图片 + 文字风格描述
    
    Args:
        user_image_path: 用户上传的图片路径
        style_references: 风格参考图片路径列表（此版本中不使用）
        style_prompt: 风格提示词
        image_analysis: 图片分析结果
        emphasis_instructions: 特征强调指令
        generation_id: 生成任务ID
        
    Returns:
        Path: 生成结果图片路径
    """
    logger.info(f"开始使用自定义API生成贴纸，任务ID: {generation_id}")
    
    try:
        # 构建详细提示词 - 方案2：纯文字描述风格
        generation_prompt = f"""
创建一个宠物简笔画贴纸设计, 请根据以下要求生成一个高质量的宠物简笔画贴纸。

宠物特征分析: {image_analysis}

风格要求: {style_prompt}

特征强调:
{emphasis_instructions}

设计要求:
- 创建清晰、简洁的线条贴纸
- 保留宠物的关键特征和个性
- 背景透明或白色
- 突出宠物的可爱特点
- 线条流畅，适合印刷
- 每张贴纸有5个同一个宠物不同姿势的图案
- 每个图案大小应该一致

        """
        
        logger.info(f"使用提示词: {generation_prompt[:200]}...")
        
        # 调用自定义API生成图像
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {CUSTOM_API_KEY}"
        }
        
        payload = {
            "model": "gpt-image-1",
            "prompt": generation_prompt,
        }
        
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{CUSTOM_API_BASE}/images/generations",
                headers=headers,
                json=payload
            )
            
            if response.status_code != 200:
                raise Exception(f"API调用失败: {response.status_code} - {response.text}")
            
            response_data = response.json()
            
            # 获取base64编码的图像数据
            image_base64 = response_data["data"][0]["b64_json"]
            image_bytes = base64.b64decode(image_base64)
            
            logger.info(f"成功生成图像")
            
            # 保存生成的图像
            result_path = settings.RESULTS_DIR / f"{generation_id}.png"
            
            with open(result_path, "wb") as f:
                f.write(image_bytes)
            
            logger.info(f"贴纸生成完成，保存到: {result_path}")
            return result_path
        
    except Exception as e:
        logger.error(f"使用自定义API生成贴纸时出错: {str(e)}")
        raise 