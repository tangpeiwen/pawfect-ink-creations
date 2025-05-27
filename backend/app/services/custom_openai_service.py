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
    采用新方案：用户图片 + 风格参考图片 + 文字描述
    
    Args:
        user_image_path: 用户上传的图片路径
        style_references: 风格参考图片路径列表
        style_prompt: 风格提示词
        image_analysis: 图片分析结果
        emphasis_instructions: 特征强调指令
        generation_id: 生成任务ID
        
    Returns:
        Path: 生成结果图片路径
    """
    logger.info(f"开始使用自定义API生成贴纸，任务ID: {generation_id}")
    logger.info(f"风格提示词: {style_prompt}")
    logger.info(f"图片分析: {image_analysis[:100]}...")
    logger.info(f"特征强调指令: {emphasis_instructions}")
    
    try:
        # 构建详细的提示词 - 结合图片分析和用户要求
        generation_prompt = f"""
根据第二张图片的风格，创建一组可爱的卡通风格插画图案。将第一张图片中的宠物转换为简洁、清晰的线条艺术设计。

【宠物特征分析】
{image_analysis}

【艺术风格要求】
{style_prompt}

【设计要求】
{emphasis_instructions}

【技术规格】
- 模仿第二张图片的线条风格、粗细、简洁程度，创建清晰、简洁的线条艺术
- 保持宠物的关键特征和个性
- 只识别图片中的主题（也就是宠物），忽略其他元素
- 线条要与参考图片保持一致的风格特点
- 生成4个不同姿势的同一只宠物
- 宠物要保留第一张图片中的特征和prompt里的要求，不要完全照搬第二张图片的风格
        """
        
        logger.info(f"使用提示词: {generation_prompt[:50]}...")
        
        # 准备图片文件
        if not style_references or len(style_references) == 0:
            raise Exception("没有找到风格参考图片")
        
        # 使用第一张（也是唯一一张）风格参考图片
        style_image_path = style_references[0]
        logger.info(f"使用风格参考图片: {style_image_path.name}")
        
        # 检查文件是否存在
        if not user_image_path.exists():
            raise Exception(f"用户图片不存在: {user_image_path}")
        if not style_image_path.exists():
            raise Exception(f"风格参考图片不存在: {style_image_path}")
        
        # 准备multipart/form-data请求
        headers = {
            "Authorization": f"Bearer {CUSTOM_API_KEY}"
        }
        
        # 构建multipart数据 - 用户图片 + 单张风格参考图片
        files = [
            ('model', (None, 'gpt-image-1')),
            ('prompt', (None, generation_prompt)),
            ('image', (user_image_path.name, open(user_image_path, 'rb'), 'image/jpeg')),
            ('image', (style_image_path.name, open(style_image_path, 'rb'), 'image/jpeg'))
        ]
        
        try:
            async with httpx.AsyncClient(timeout=180.0) as client:
                logger.info(f"开始API调用，上传用户图片和1张风格参考图片...")
                response = await client.post(
                    f"{CUSTOM_API_BASE}/images/edits",
                    headers=headers,
                    files=files
                )
                
                if response.status_code != 200:
                    raise Exception(f"API调用失败: {response.status_code} - {response.text}")
                
                response_data = response.json()
                
                # 获取base64编码的图像数据
                if "data" not in response_data or len(response_data["data"]) == 0:
                    raise Exception("API返回数据格式错误")
                
                image_base64 = response_data["data"][0]["b64_json"]
                image_bytes = base64.b64decode(image_base64)
                
                logger.info(f"成功生成图像")
                
                # 保存生成的图像
                result_path = settings.RESULTS_DIR / f"{generation_id}.png"
                
                with open(result_path, "wb") as f:
                    f.write(image_bytes)
                
                logger.info(f"贴纸生成完成，保存到: {result_path}")
                return result_path
                
        finally:
            # 确保关闭所有文件句柄
            for file_tuple in files:
                if len(file_tuple) > 2 and hasattr(file_tuple[1], 'close'):
                    try:
                        file_tuple[1].close()
                    except:
                        pass
        
    except Exception as e:
        logger.error(f"使用自定义API生成贴纸时出错: {str(e)}")
        raise 