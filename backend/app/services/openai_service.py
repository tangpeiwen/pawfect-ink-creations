import base64
import logging
import asyncio
from typing import List, Optional
from pathlib import Path
import os

from openai import AsyncOpenAI
from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.config import settings

# 配置日志
logger = logging.getLogger(__name__)

# 创建OpenAI客户端
openai_client = AsyncOpenAI(
    api_key=settings.OPENAI_API_KEY,
    base_url=settings.OPENAI_API_BASE,
    timeout=settings.OPENAI_API_TIMEOUT
)

@retry(
    stop=stop_after_attempt(settings.OPENAI_MAX_RETRIES),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    reraise=True
)
async def analyze_pet_image(image_path: Path, emphasis_features: Optional[List[str]] = None):
    """
    使用OpenAI的GPT-image-1模型分析宠物图片
    
    Args:
        image_path: 图片文件路径
        emphasis_features: 需要强调的特征列表
        
    Returns:
        str: 分析结果文本
    """
    logger.info(f"分析图片: {image_path}")
    
    try:
        # 加载图像
        with open(image_path, "rb") as image_file:
            base64_image = base64.b64encode(image_file.read()).decode('utf-8')
        
        # 特征指导
        feature_guidance = ""
        if emphasis_features and len(emphasis_features) > 0:
            feature_guidance = f"请特别关注以下特征: {', '.join(emphasis_features)}"
        
        # 准备消息
        messages = [
            {
                "role": "system",
                "content": "你是一个专业宠物卡通图片分析师，请分析图片中宠物的特征，包括种类、颜色、姿势和显著特点。"
            },
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": f"请分析这张宠物照片的主要特征，提供简洁的描述。{feature_guidance}"},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                ]
            }
        ]
        
        # 调用API
        response = await openai_client.chat.completions.create(
            model="gpt-4o",  # 使用支持图像的模型
            messages=messages,
            max_tokens=300
        )
        
        # 返回分析结果
        result = response.choices[0].message.content
        logger.info(f"分析完成，生成分析文本: {result[:50]}...")
        return result
        
    except Exception as e:
        logger.error(f"分析图片时出错: {str(e)}")
        raise

@retry(
    stop=stop_after_attempt(settings.OPENAI_MAX_RETRIES),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    reraise=True
)
async def generate_sticker_image(
    user_image_path: Path, 
    style_references: List[Path], 
    style_prompt: str, 
    image_analysis: str, 
    emphasis_instructions: str,
    generation_id: str
):
    """
    使用OpenAI的gpt-image-1模型生成宠物简笔画贴纸
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
    logger.info(f"开始生成贴纸，任务ID: {generation_id}")
    
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
- 适合作为贴纸使用的封闭轮廓设计
- 背景透明或简洁
- 突出宠物的可爱特点
- 线条流畅，适合印刷

请基于以上要求生成一个高质量的宠物简笔画贴纸。
每张贴纸有4个同一个宠物不同姿势的图案，每个图案大小一致，不要有贴纸的白边。
        """
        
        logger.info(f"使用提示词: {generation_prompt[:100]}...")
        
        # 调用API生成图像 - 使用正确的gpt-image-1格式
        response = await openai_client.images.generate(
            model="gpt-image-1",
            prompt=generation_prompt
        )
        
        # 获取base64编码的图像数据
        image_base64 = response.data[0].b64_json
        image_bytes = base64.b64decode(image_base64)
        
        logger.info(f"成功生成图像")
        
        # 保存生成的图像
        result_path = settings.RESULTS_DIR / f"{generation_id}.png"
        
        with open(result_path, "wb") as f:
            f.write(image_bytes)
        
        logger.info(f"贴纸生成完成，保存到: {result_path}")
        return result_path
        
    except Exception as e:
        logger.error(f"生成贴纸时出错: {str(e)}")
        raise 