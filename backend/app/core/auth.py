from fastapi import HTTPException, status, Depends, Header
from typing import Optional
import logging
import jwt
from app.core.config import settings

logger = logging.getLogger(__name__)

async def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    """
    从JWT token中获取当前用户ID
    
    Args:
        authorization: Bearer token格式的授权头
        
    Returns:
        str: 用户ID
        
    Raises:
        HTTPException: 当用户未认证时
    """
    if not authorization:
        logger.warning("请求缺少Authorization头")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户未认证：缺少Authorization头"
        )
    
    if not authorization.startswith("Bearer "):
        logger.warning("Authorization头格式错误")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户未认证：Authorization头格式错误"
        )
    
    token = authorization[7:]  # 移除 "Bearer " 前缀
    
    try:
        # 使用Supabase的JWT密钥验证token
        payload = jwt.decode(
            token, 
            settings.SUPABASE_JWT_SECRET, 
            algorithms=["HS256"],
            audience="authenticated"
        )
        
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token中缺少用户ID"
            )
        
        logger.info(f"认证用户: {user_id}")
        return user_id
        
    except jwt.ExpiredSignatureError:
        logger.warning("Token已过期")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token已过期"
        )
    except jwt.InvalidTokenError as e:
        logger.warning(f"无效的Token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的Token"
        )

async def get_optional_user_id(authorization: Optional[str] = Header(None)) -> Optional[str]:
    """
    从JWT token中获取用户ID（可选）
    用于不强制要求认证的端点
    
    Args:
        authorization: Bearer token格式的授权头
        
    Returns:
        Optional[str]: 用户ID或None
    """
    if not authorization or not authorization.startswith("Bearer "):
        return None
    
    token = authorization[7:]
    
    try:
        payload = jwt.decode(
            token, 
            settings.SUPABASE_JWT_SECRET, 
            algorithms=["HS256"],
            audience="authenticated"
        )
        
        user_id = payload.get("sub")
        if user_id:
            logger.info(f"可选认证用户: {user_id}")
        
        return user_id
        
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        logger.info("可选认证失败，继续以匿名用户处理")
        return None 