import uuid
import os
import logging
from fastapi import HTTPException, status
from app.models.schemas import GenerationRequest
from app.core.config import settings

logger = logging.getLogger(__name__)

def generate_unique_id() -> str:
    """
    生成唯一ID
    
    Returns:
        str: 唯一ID
    """
    return str(uuid.uuid4())

async def validate_generation_request(request: GenerationRequest) -> bool:
    """
    验证生成请求
    
    Args:
        request: 生成请求
        
    Returns:
        bool: 请求是否有效
    """
    # 验证图片ID
    image_id = request.imageId
    image_path = settings.PROCESSED_IMAGES_DIR / f"{image_id}.jpg"
    
    if not image_path.exists():
        logger.error(f"找不到图片: {image_path}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"找不到图片 {image_id}"
        )
    
    # 验证风格ID
    # 此处可以与styles.py中的风格列表保持同步，或者设计更灵活的验证机制
    valid_styles = ["watercolor", "minimalist", "cartoon", "detailed"]
    if request.styleId not in valid_styles:
        logger.error(f"无效的风格ID: {request.styleId}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"无效的风格ID: {request.styleId}，有效的风格有 {', '.join(valid_styles)}"
        )
    
    # 可以添加对特征列表的验证
    valid_features = ["eyes", "ears", "nose", "fur", "posture", "expression"]
    invalid_features = [f for f in request.emphasisFeatures if f not in valid_features]
    if invalid_features:
        logger.warning(f"忽略无效的特征: {invalid_features}")
        # 这里选择警告而不是错误，可以忽略无效特征
    
    return True 