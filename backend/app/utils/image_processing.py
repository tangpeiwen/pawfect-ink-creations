import os
from pathlib import Path
from PIL import Image
import io
import logging
from fastapi import UploadFile
import asyncio
from typing import Tuple

logger = logging.getLogger(__name__)

# 适合图像生成的尺寸
TARGET_SIZE = (1024, 1024)

async def validate_image(image: UploadFile) -> Tuple[bool, int]:
    """
    验证上传的文件是否为有效的图片，并返回文件大小
    
    Args:
        image: 上传的文件
        
    Returns:
        Tuple[bool, int]: (是否为有效图片, 文件大小)
    """
    try:
        # 获取文件大小
        content = await image.read()
        size = len(content)
        
        # 重置文件指针
        await image.seek(0)
        
        # 尝试用PIL打开图片，验证是否为有效图片
        try:
            img = Image.open(io.BytesIO(content))
            img.verify()  # 验证图片完整性
            return True, size
        except Exception as e:
            logger.error(f"图片验证失败: {str(e)}")
            return False, size
            
    except Exception as e:
        logger.error(f"读取上传文件时出错: {str(e)}")
        return False, 0

async def preprocess_image(source_path: Path, target_path: Path) -> Path:
    """
    预处理图片：调整大小，保存为JPEG格式
    
    Args:
        source_path: 源图片路径
        target_path: 目标图片路径
        
    Returns:
        Path: 处理后的图片路径
    """
    try:
        logger.info(f"预处理图片: {source_path} -> {target_path}")
        
        # 异步处理图片
        def _process_image():
            with Image.open(source_path) as img:
                # 转换为RGB模式（如果是RGBA或其他模式）
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # 保持宽高比调整大小
                img.thumbnail(TARGET_SIZE, Image.LANCZOS)
                
                # 如果缩略图不是正方形，创建一个白色正方形背景并居中粘贴缩略图
                if img.width != img.height:
                    # 创建正方形画布
                    square_size = max(img.width, img.height)
                    background = Image.new('RGB', (square_size, square_size), (255, 255, 255))
                    
                    # 计算居中位置
                    offset_x = (square_size - img.width) // 2
                    offset_y = (square_size - img.height) // 2
                    
                    # 粘贴图片
                    background.paste(img, (offset_x, offset_y))
                    img = background
                
                # 调整到目标尺寸
                if img.size != TARGET_SIZE:
                    img = img.resize(TARGET_SIZE, Image.LANCZOS)
                
                # 保存处理后的图片
                img.save(target_path, 'JPEG', quality=85, optimize=True)
        
        # 在线程池中执行IO密集型操作
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, _process_image)
        
        logger.info(f"图片预处理完成: {target_path}")
        return target_path
        
    except Exception as e:
        logger.error(f"预处理图片时出错: {str(e)}")
        if target_path.exists():
            os.unlink(target_path)
        raise 