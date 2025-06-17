from fastapi import APIRouter, HTTPException, status, Depends
from app.models.schemas import UserProfileCreate, UserProfileUpdate, UserProfile
from app.services.database import db_service
from app.core.auth import get_current_user_id
import logging
from typing import Optional
from pydantic import BaseModel

router = APIRouter()
logger = logging.getLogger(__name__)

class UserProfileSyncRequest(BaseModel):
    user_id: str
    email: str
    display_name: Optional[str] = None

@router.post("/profile")
async def sync_user_profile(request: UserProfileSyncRequest):
    """
    同步用户资料 - 登录时调用，确保后端有用户记录
    
    这个端点不需要认证，因为它是在用户登录成功后被调用的
    用于在后端创建用户记录
    """
    try:
        # 检查用户是否已存在
        existing_profile = await db_service.get_user_profile(request.user_id)
        
        if existing_profile:
            # 用户已存在，更新最后登录时间等信息
            logger.info(f"用户 {request.user_id} 已存在，跳过创建")
            return {"success": True, "message": "用户资料已存在", "profile": existing_profile}
        
        # 创建新用户资料
        profile_data = UserProfileCreate(
            display_name=request.display_name or request.email.split('@')[0],
            subscription_tier='free',
            tokens_remaining=500
        )
        
        result = await db_service.create_user_profile(request.user_id, profile_data)
        
        if result:
            logger.info(f"成功创建用户资料: {request.user_id}")
            return {"success": True, "message": "用户资料创建成功", "profile": result}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="创建用户资料失败"
            )
            
    except Exception as e:
        logger.error(f"同步用户资料失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"同步用户资料失败: {str(e)}"
        )

@router.get("/profile")
async def get_current_user_profile(current_user_id: str = Depends(get_current_user_id)):
    """
    获取当前用户的资料
    
    Args:
        current_user_id: 当前登录用户ID
        
    Returns:
        UserProfile: 用户资料信息
    """
    try:
        profile = await db_service.get_user_profile(current_user_id)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="用户资料不存在"
            )
        return {"success": True, "profile": profile}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取用户资料失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取用户资料失败: {str(e)}"
        )

@router.get("/profile/{user_id}")
async def get_user_profile(
    user_id: str, 
    current_user_id: str = Depends(get_current_user_id)
):
    """
    获取指定用户的资料（仅允许访问自己的资料）
    
    Args:
        user_id: 要查询的用户ID
        current_user_id: 当前登录用户ID
        
    Returns:
        UserProfile: 用户资料信息
    """
    try:
        # 验证只能访问自己的资料
        if user_id != current_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="无权访问其他用户的资料"
            )
        
        profile = await db_service.get_user_profile(user_id)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="用户资料不存在"
            )
        return {"success": True, "profile": profile}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取用户资料失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取用户资料失败: {str(e)}"
        )

@router.put("/profile")
async def update_user_profile(
    profile_update: UserProfileUpdate,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    更新当前用户的资料
    
    Args:
        profile_update: 更新的用户资料数据
        current_user_id: 当前登录用户ID
        
    Returns:
        dict: 更新结果
    """
    try:
        # 检查用户是否存在
        existing_profile = await db_service.get_user_profile(current_user_id)
        if not existing_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="用户资料不存在"
            )
        
        # 更新用户资料
        result = await db_service.update_user_profile(current_user_id, profile_update)
        
        if result:
            logger.info(f"用户 {current_user_id} 资料更新成功")
            return {"success": True, "message": "用户资料更新成功", "profile": result}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="更新用户资料失败"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"更新用户资料失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"更新用户资料失败: {str(e)}"
        )

@router.get("/stats")
async def get_user_stats(current_user_id: str = Depends(get_current_user_id)):
    """
    获取用户统计信息
    
    Args:
        current_user_id: 当前登录用户ID
        
    Returns:
        dict: 用户统计信息
    """
    try:
        # 获取用户基本信息
        profile = await db_service.get_user_profile(current_user_id)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="用户资料不存在"
            )
        
        # 获取用户统计数据
        total_images = await db_service.get_user_images_count(current_user_id)
        total_generations = await db_service.get_user_generations_count(current_user_id)
        
        # 获取最近的生成记录
        recent_generations = await db_service.get_user_generations(current_user_id, limit=5)
        
        return {
            "success": True,
            "stats": {
                "total_images": total_images,
                "total_generations": total_generations,
                "tokens_remaining": profile.get('tokens_remaining', 0),
                "subscription_tier": profile.get('subscription_tier', 'free'),
                "recent_generations": recent_generations
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取用户统计信息失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取用户统计信息失败: {str(e)}"
        )

@router.post("/credits/consume")
async def consume_credits(
    credits_to_consume: int,
    current_user_id: str = Depends(get_current_user_id)
):
    """
    消费用户积分
    
    Args:
        credits_to_consume: 要消费的积分数量
        current_user_id: 当前登录用户ID
        
    Returns:
        dict: 消费结果
    """
    try:
        if credits_to_consume <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="积分消费数量必须大于0"
            )
        
        # 获取用户当前积分
        profile = await db_service.get_user_profile(current_user_id)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="用户资料不存在"
            )
        
        current_credits = profile.get('tokens_remaining', 0)
        if current_credits < credits_to_consume:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"积分不足，当前积分: {current_credits}，需要积分: {credits_to_consume}"
            )
        
        # 消费积分
        new_credits = current_credits - credits_to_consume
        update_data = UserProfileUpdate(tokens_remaining=new_credits)
        
        result = await db_service.update_user_profile(current_user_id, update_data)
        
        if result:
            logger.info(f"用户 {current_user_id} 成功消费 {credits_to_consume} 积分")
            return {
                "success": True,
                "message": f"成功消费 {credits_to_consume} 积分",
                "tokens_remaining": new_credits
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="积分消费失败"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"用户积分消费失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"积分消费失败: {str(e)}"
        )

@router.delete("/profile")
async def delete_user_account(current_user_id: str = Depends(get_current_user_id)):
    """
    删除用户账号（软删除）
    
    Args:
        current_user_id: 当前登录用户ID
        
    Returns:
        dict: 删除结果
    """
    try:
        # 检查用户是否存在
        profile = await db_service.get_user_profile(current_user_id)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="用户资料不存在"
            )
        
        # 执行软删除（将状态标记为已删除）
        result = await db_service.soft_delete_user(current_user_id)
        
        if result:
            logger.info(f"用户 {current_user_id} 账号已删除")
            return {"success": True, "message": "账号删除成功"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="删除账号失败"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"删除用户账号失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"删除账号失败: {str(e)}"
        ) 