import os
from pathlib import Path
from typing import List
import logging
import random
from fastapi import HTTPException, status
from app.core.config import settings

logger = logging.getLogger(__name__)

async def get_processed_image_path(image_id: str) -> Path:
    """
    获取处理后的图片路径
    
    Args:
        image_id: 图片ID
    
    Returns:
        Path: 图片路径
    """
    path = settings.PROCESSED_IMAGES_DIR / f"{image_id}.jpg"
    if not path.exists():
        logger.error(f"图片不存在: {path}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"找不到图片 {image_id}"
        )
    return path

async def get_style_reference_images(style_id: str) -> List[Path]:
    """
    获取风格参考图片路径
    
    Args:
        style_id: 风格ID
    
    Returns:
        List[Path]: 参考图片路径列表
    """
    # 风格ID到多张参考图片的映射
    style_file_mapping = {
        "watercolor": ["watercolor.jpg"],  # 蜡笔插画风
        "minimalist": ["minimalist.jpg"],   # 粗线条手绘风
        "ghibli": ["ghibli.png"],      # Q版贴纸风
        "sanrio": ["sanrio.jpg"]      # 细节写意风
    }
    
    if style_id not in style_file_mapping:
        logger.error(f"未知的风格ID: {style_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"未找到风格 {style_id}"
        )
    
    # 构建参考图片路径列表
    style_files = style_file_mapping[style_id]
    style_image_paths = []
    
    for style_file in style_files:
        # 首先在风格子目录中查找
        style_image_path = settings.STORAGE_DIR / "styles" / style_id / style_file
        
        # 如果子目录中不存在，则在根目录中查找
        if not style_image_path.exists():
            style_image_path = settings.STORAGE_DIR / "styles" / style_file
        
        # 检查文件是否存在
        if not style_image_path.exists():
            logger.warning(f"风格参考图片不存在: {style_image_path}，跳过此文件")
            continue
            
        style_image_paths.append(style_image_path)
    
    # 确保至少有一张参考图片
    if not style_image_paths:
        logger.error(f"风格 {style_id} 没有可用的参考图片")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"风格 {style_id} 的参考图片不可用"
        )
    
    # 从可用的图片中随机选择一张
    selected_image = random.choice(style_image_paths)
    logger.info(f"风格 {style_id} 从 {len(style_image_paths)} 张图片中随机选择: {selected_image.name}")
    return [selected_image]

def get_public_url(file_path: Path) -> str:
    """
    获取文件的公共URL
    
    Args:
        file_path: 文件路径
        
    Returns:
        str: 公共URL
    """
    # 确保路径是绝对路径
    if not file_path.is_absolute():
        file_path = file_path.resolve()
    
    # 确保storage目录也是绝对路径
    storage_dir = settings.STORAGE_DIR
    if not storage_dir.is_absolute():
        storage_dir = storage_dir.resolve()
    
    # 将文件路径转换为相对于storage目录的路径
    try:
        relative_path = file_path.relative_to(storage_dir)
        url = f"/storage/{relative_path}"
        logger.info(f"生成公共URL: {file_path} -> {url}")
        return url
    except ValueError as e:
        # 如果路径不在storage目录下，记录错误并尝试其他方法
        logger.error(f"文件路径不在storage目录下: {file_path}, storage_dir: {storage_dir}, 错误: {e}")
        
        # 尝试从文件路径中提取相对部分
        path_str = str(file_path)
        if "storage/" in path_str:
            # 找到storage/之后的部分
            storage_index = path_str.find("storage/")
            relative_part = path_str[storage_index:]
            url = f"/{relative_part}"
            logger.info(f"通过字符串匹配生成URL: {file_path} -> {url}")
            return url
        
        # 如果都失败了，返回文件名作为最后的尝试
        logger.warning(f"无法生成相对URL，使用文件名: {file_path.name}")
        return f"/storage/results/{file_path.name}" 