import base64
import logging
import httpx
from typing import List, Optional
from pathlib import Path
import asyncio
import uuid
import time
import io

from app.core.config import settings
from app.services.supabase_storage import storage_service
from app.services.database import db_service
from app.models.schemas import GenerationUpdate

# 配置日志
logger = logging.getLogger(__name__)

# 自定义API配置
CUSTOM_API_BASE = "https://api.tu-zi.com/v1"
CUSTOM_API_KEY = settings.TUZI_API_KEY  # 使用相同的API密钥

async def generate_sticker_with_custom_api(
    user_image_id: str,  # 用户图片ID，从对象存储下载
    style_references: List[Path],  # 风格参考图片路径列表
    style_prompt: str, 
    image_analysis: str,
    emphasis_instructions: str,
    generation_id: str,
    style_id: str = None  # 新增风格ID参数
):
    """
    使用自定义API生成宠物简笔画贴纸
    采用新方案：用户图片 + 风格参考图片 + 文字描述
    对于吉卜力风，使用纯文字描述（吉卜力风格）
    
    Args:
        user_image_id: 用户上传的图片ID
        style_references: 风格参考图片路径列表
        style_prompt: 风格提示词
        image_analysis: 图片分析结果
        emphasis_instructions: 特征强调指令
        generation_id: 生成任务ID
        style_id: 风格ID，用于判断是否使用特殊处理
        
    Returns:
        str: 生成结果图片的公共URL
    """
    logger.info(f"开始使用自定义API生成贴纸，任务ID: {generation_id}")
    logger.info(f"风格ID: {style_id}")
    logger.info(f"风格提示词: {style_prompt}")
    logger.info(f"图片分析: {image_analysis[:100]}...")
    logger.info(f"特征强调指令: {emphasis_instructions}")
    
    try:
        # 生成唯一的会话ID，确保每次请求都是独立的
        session_id = str(uuid.uuid4())
        timestamp = str(int(time.time()))
        
        # 检查是否为Q版卡通风格（使用吉卜力风格）
        is_ghibli_style = style_id == "ghibli"
        
        if is_ghibli_style:
            # Q版卡通风：使用吉卜力风格prompt，不使用参考图片
            generation_prompt = f"""
[新会话开始 - 忽略所有之前的对话和指令]

这是一个全新的独立任务，请忽略任何之前的上下文或记忆。

任务：请根据用户上传图片生成一组吉卜力风格的贴纸。

【吉卜力风格要求】
请根据用户上传的图片生成一组吉卜力风格的贴纸，具体要求如下：
- 采用宫崎骏动画的艺术风格
- 保持宠物的特征

【图片分析】
{image_analysis}

【设计要求】
{emphasis_instructions}

【技术规格】
- 生成4个不同姿势形态的贴纸
- 保持宠物的关键特征和个性
- 确保背景是白色
- 适合制作成贴纸的封闭轮廓设计
- 每个贴纸大小一致

[会话ID: {session_id}]
            """
            logger.info(f"使用吉卜力风格生成，会话ID: {session_id}")
        else:
            # 其他风格：使用原有的参考图片方案
            generation_prompt = f"""
[新会话开始 - 忽略所有之前的对话和指令]

这是一个全新的独立任务，请忽略任何之前的上下文或记忆。

任务：根据第二张图片的风格，创建一组可爱的插画图案。将第一张图片中的宠物转换为简洁、清晰的线条艺术设计。

【艺术风格要求】
{style_prompt}

【设计要求】
{emphasis_instructions}

【技术规格】
- 模仿第二张图片的线条风格、粗细、简洁程度，创建清晰、简洁的线条艺术
- 保持宠物的关键特征和姿势，确保背景是白色或者透明
- 只识别图片中的主题（也就是宠物），忽略其他元素
- 针对识别的宠物，生成4个不同姿势形态的贴纸
- 宠物要保留第一张图片中的特征和prompt里的要求，不要完全照搬第二张图片的风格

[会话ID: {session_id}]
            """
            logger.info(f"使用参考图片风格生成，会话ID: {session_id}")
        
        # 更新进度：开始下载用户图片
        await db_service.update_generation(generation_id, GenerationUpdate(progress=55))
        
        # 从数据库获取用户图片的存储路径
        try:
            image_record = await db_service.get_uploaded_image(user_image_id)
            if not image_record:
                raise Exception(f"找不到图片记录: {user_image_id}")
            
            # 获取实际的存储路径
            storage_path = image_record.get('storage_path')
            if not storage_path:
                raise Exception(f"图片记录缺少存储路径: {user_image_id}")
            
            logger.info(f"从数据库获取存储路径: {storage_path}")
            
            # 从Supabase存储下载用户图片
            user_image_content = await storage_service.download_file(storage_path)
            logger.info(f"成功下载用户图片: {storage_path}")
            
        except Exception as e:
            raise Exception(f"无法下载用户图片: {str(e)}")
        
        # 更新进度：准备风格参考图片
        await db_service.update_generation(generation_id, GenerationUpdate(progress=60))
        
        # 准备multipart/form-data请求
        headers = {
            "Authorization": f"Bearer {CUSTOM_API_KEY}",
            "X-Session-ID": session_id,
            "X-Request-ID": generation_id,
            "X-Timestamp": timestamp,
            "Cache-Control": "no-cache",
            "X-Clear-Context": "true"
        }
        
        if is_ghibli_style:
            # Q版卡通风：只发送用户图片，不发送参考图片
            files = [
                ('model', (None, 'gpt-image-1')),
                ('prompt', (None, generation_prompt)),
                ('image', (f'{user_image_id}.jpg', io.BytesIO(user_image_content), 'image/jpeg'))
            ]
            logger.info("使用吉卜力风格：仅发送用户图片")
        else:
            # 其他风格：发送用户图片 + 风格参考图片
            if not style_references or len(style_references) == 0:
                raise Exception("没有找到风格参考图片")
            
            # 使用第一张（也是唯一一张）风格参考图片
            style_image_path = style_references[0]
            logger.info(f"使用风格参考图片: {style_image_path.name}")
            
            # 检查风格图片文件是否存在
            if not style_image_path.exists():
                raise Exception(f"风格参考图片不存在: {style_image_path}")
            
            files = [
                ('model', (None, 'gpt-image-1')),
                ('prompt', (None, generation_prompt)),
                ('image', (f'{user_image_id}.jpg', io.BytesIO(user_image_content), 'image/jpeg')),
                ('image', (style_image_path.name, open(style_image_path, 'rb'), 'image/jpeg'))
            ]
            logger.info("使用参考图片风格：发送用户图片 + 风格参考图片")
        
        # 更新进度：开始API调用
        await db_service.update_generation(generation_id, GenerationUpdate(progress=65))
        
        try:
            # 创建客户端实例
            timeout_config = httpx.Timeout(
                connect=30.0,
                read=300.0,
                write=30.0,
                pool=30.0
            )
            
            async with httpx.AsyncClient(
                timeout=timeout_config,
                headers={"Connection": "close"},
                limits=httpx.Limits(max_connections=10, max_keepalive_connections=0)
            ) as client:
                logger.info(f"开始API调用，会话ID: {session_id}")
                
                response = await client.post(
                    f"{CUSTOM_API_BASE}/images/edits",
                    headers=headers,
                    files=files
                )
                
                logger.info(f"API响应状态码: {response.status_code}")
                
                if response.status_code != 200:
                    error_detail = response.text
                    logger.error(f"API调用失败: {response.status_code} - {error_detail}")
                    raise Exception(f"API调用失败: {response.status_code} - {error_detail}")
                
                # 更新进度：API调用成功，开始处理响应
                await db_service.update_generation(generation_id, GenerationUpdate(progress=80))
                
                response_data = response.json()
                
                # 获取base64编码的图像数据
                if "data" not in response_data or len(response_data["data"]) == 0:
                    raise Exception("API返回数据格式错误：没有图像数据")
                
                image_base64 = response_data["data"][0]["b64_json"]
                image_bytes = base64.b64decode(image_base64)
                
                logger.info(f"成功生成图像，会话ID: {session_id}, 图像大小: {len(image_bytes)} 字节")
                
                # 更新进度：开始上传生成结果
                await db_service.update_generation(generation_id, GenerationUpdate(progress=90))
                
                # 上传生成的图片到Supabase存储
                file_path, public_url = await storage_service.upload_generated_image(
                    image_bytes, 
                    generation_id, 
                    "png"
                )
                
                logger.info(f"贴纸生成完成，上传到存储桶: {file_path}")
                logger.info(f"公共URL: {public_url}")
                
                return public_url
                
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