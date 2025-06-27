import uuid
import os
import logging
from fastapi import HTTPException, status
from app.models.schemas import GenerationRequest
from app.core.config import settings
from app.services.database import db_service

logger = logging.getLogger(__name__)

def generate_unique_id() -> str:
    """
    生成唯一ID
    
    Returns:
        str: 唯一ID
    """
    return str(uuid.uuid4())

async def validate_generation_request(request: GenerationRequest, user_id: str) -> bool:
    """
    验证生成请求的完整性和权限
    
    Args:
        request: 生成请求参数
        user_id: 当前用户ID
        
    Returns:
        bool: 请求是否有效
        
    Raises:
        HTTPException: 当验证失败时抛出对应的HTTP错误
    """
    # 验证图片ID - 通过数据库查询而不是本地文件系统
    uploaded_image = await db_service.get_uploaded_image(request.imageId)
    if not uploaded_image:
        logger.error(f"找不到上传的图片记录: {request.imageId}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"找不到图片 {request.imageId}"
        )
    
    # 验证图片属于当前用户（重要的安全检查）
    if uploaded_image.get('user_id') != user_id:
        logger.error(f"用户 {user_id} 无权访问图片 {request.imageId}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权访问此图片"
        )
    
    # 验证图片状态（如果有状态字段的话）
    upload_status = uploaded_image.get('upload_status', 'completed')
    if upload_status != 'completed':
        logger.error(f"图片上传未完成: {request.imageId}, 状态: {upload_status}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"图片上传未完成: {request.imageId}"
        )
    
    # 验证风格ID是否在支持列表中
    valid_styles = ["watercolor", "minimalist", "ghibli", "sanrio"]
    if request.styleId not in valid_styles:
        logger.error(f"无效的风格ID: {request.styleId}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"无效的风格ID: {request.styleId}，有效的风格有 {', '.join(valid_styles)}"
        )
    
    # 验证用户Token是否足够（防止滥用）
    user_profile = await db_service.get_user_profile(user_id)
    if not user_profile:
        logger.error(f"找不到用户资料: {user_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="用户资料不存在"
        )
    
    tokens_required = 200  # 每次生成需要200个token
    current_tokens = user_profile.get('tokens_remaining', 0)
    if current_tokens < tokens_required:
        logger.error(f"用户 {user_id} token不足: 当前 {current_tokens}, 需要 {tokens_required}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Token不足，当前Token: {current_tokens}，需要Token: {tokens_required}"
        )
    
    # 验证特征强调列表（可选功能）
    # 用户可以选择强调宠物的特定特征，比如眼睛、耳朵等
    if request.emphasisFeatures:
        # 定义允许强调的宠物特征
        valid_features = ["eyes", "ears", "nose", "fur", "posture", "expression"]
        
        # 检查是否有无效的特征选择（防止API直接调用时的错误输入）
        invalid_features = [f for f in request.emphasisFeatures if f not in valid_features]
        if invalid_features:
            logger.error(f"用户 {user_id} 提交了无效的特征: {invalid_features}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"无效的特征选择: {', '.join(invalid_features)}"
            )
    
    return True

def validate_file_size(file_size: int) -> bool:
    """
    验证文件大小是否在允许范围内
    
    Args:
        file_size: 文件大小（字节）
        
    Returns:
        bool: 文件大小是否合法
        
    Raises:
        HTTPException: 当文件太大时
    """
    max_size = settings.MAX_UPLOAD_SIZE
    if file_size > max_size:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"文件太大，最大允许 {max_size // (1024*1280)} MB"
        )
    return True

def validate_file_type(content_type: str) -> bool:
    """
    验证文件类型是否被支持
    
    Args:
        content_type: 文件MIME类型
        
    Returns:
        bool: 文件类型是否合法
        
    Raises:
        HTTPException: 当文件类型不被支持时
    """
    allowed_types = settings.ALLOWED_IMAGE_TYPES
    if content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"不支持的文件类型: {content_type}，支持的类型: {', '.join(allowed_types)}"
        )
    return True

def generate_order_id() -> str:
    """
    生成订单ID
    格式：PT + 年月日时分秒 + 4位随机数
    示例：PT202403151234567890
    """
    from datetime import datetime
    import random
    
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    random_num = str(random.randint(1000, 9999))
    return f"PT{timestamp}{random_num}" 