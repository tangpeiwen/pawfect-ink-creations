import os
from pathlib import Path
from typing import List
import logging
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
    # 查找风格目录下所有参考图片
    style_dir = settings.STYLE_REFERENCES_DIR / style_id
    
    # 如果不存在，使用样例图片
    if not style_dir.exists():
        logger.warning(f"风格目录不存在: {style_dir}，使用样例图片")
        
        # 创建样例风格图片路径
        sample_refs = [
            settings.STYLE_REFERENCES_DIR / "samples" / f"sample_{i}.jpg"
            for i in range(1, 3)  # 样例图片索引 1-2
        ]
        
        # 验证样例图片是否存在
        exists = [path.exists() for path in sample_refs]
        if not all(exists):
            logger.error(f"样例图片不完整: {sample_refs}")
            # 在实际应用中，可以在初始化时生成样例图片
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"风格 {style_id} 的参考图片不可用"
            )
        
        return sample_refs
    
    # 查找风格目录下的所有图片
    image_files = list(style_dir.glob("*.jpg")) + list(style_dir.glob("*.png"))
    
    # 限制最多使用2张参考图片
    image_files = image_files[:2]
    
    if not image_files:
        logger.error(f"风格 {style_id} 没有参考图片")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"风格 {style_id} 的参考图片不可用"
        )
    
    return image_files

def get_public_url(file_path: Path) -> str:
    """
    获取文件的公共URL
    
    Args:
        file_path: 文件路径
        
    Returns:
        str: 公共URL
    """
    # 将文件路径转换为相对于storage目录的路径
    try:
        relative_path = file_path.relative_to(settings.STORAGE_DIR)
        return f"/storage/{relative_path}"
    except ValueError:
        # 如果路径不在storage目录下，返回完整路径
        return str(file_path) 