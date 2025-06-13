from typing import Optional, List, Dict, Any
from uuid import UUID
import logging
from app.core.database import get_db_client, get_admin_client
from app.models.schemas import (
    UserProfileCreate, UserProfileUpdate,
    UploadedImageCreate, UploadedImageUpdate,
    GenerationCreate, GenerationUpdate,
    GenerationResultCreate
)

logger = logging.getLogger(__name__)

class DatabaseService:
    """数据库服务层"""
    
    def __init__(self):
        self.client = get_admin_client()  # 使用管理员客户端
        self.admin_client = get_admin_client()
    
    # ==================== 用户相关操作 ====================
    
    async def get_user_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """获取用户资料"""
        try:
            response = self.client.table('user_profiles').select('*').eq('id', user_id).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error getting user profile: {e}")
            return None
    
    async def create_user_profile(self, user_id: str, profile_data: UserProfileCreate) -> Optional[Dict[str, Any]]:
        """创建用户资料"""
        try:
            data = {
                'id': user_id,
                **profile_data.dict(exclude_unset=True)
            }
            response = self.client.table('user_profiles').insert(data).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error creating user profile: {e}")
            return None
    
    async def update_user_profile(self, user_id: str, profile_data: UserProfileUpdate) -> Optional[Dict[str, Any]]:
        """更新用户资料"""
        try:
            data = profile_data.dict(exclude_unset=True)
            response = self.client.table('user_profiles').update(data).eq('id', user_id).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error updating user profile: {e}")
            return None
    
    async def update_user_credits(self, user_id: str, credits_change: int) -> bool:
        """更新用户积分"""
        try:
            # 先获取当前积分
            profile = await self.get_user_profile(user_id)
            if not profile:
                return False
            
            new_credits = profile['credits_remaining'] + credits_change
            if new_credits < 0:
                return False  # 积分不足
            
            response = self.client.table('user_profiles').update({
                'credits_remaining': new_credits
            }).eq('id', user_id).execute()
            
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Error updating user credits: {e}")
            return False
    
    # ==================== 图片上传相关操作 ====================
    
    async def create_uploaded_image(self, image_data: UploadedImageCreate) -> Optional[Dict[str, Any]]:
        """创建上传图片记录"""
        try:
            data = image_data.dict()
            response = self.client.table('uploaded_images').insert(data).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error creating uploaded image: {e}")
            return None
    
    async def get_uploaded_image(self, image_id: str) -> Optional[Dict[str, Any]]:
        """获取上传图片信息"""
        try:
            response = self.client.table('uploaded_images').select('*').eq('id', image_id).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error getting uploaded image: {e}")
            return None
    
    async def get_user_uploaded_images(self, user_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        """获取用户上传的图片列表"""
        try:
            response = self.client.table('uploaded_images').select('*').eq('user_id', user_id).order('created_at', desc=True).limit(limit).execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Error getting user uploaded images: {e}")
            return []
    
    # ==================== 生成任务相关操作 ====================
    
    async def create_generation(self, generation_data: GenerationCreate) -> Optional[Dict[str, Any]]:
        """创建生成任务"""
        try:
            data = generation_data.dict()
            response = self.client.table('generations').insert(data).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error creating generation: {e}")
            return None
    
    async def get_generation(self, generation_id: str) -> Optional[Dict[str, Any]]:
        """获取生成任务信息"""
        try:
            response = self.client.table('generations').select('*').eq('id', generation_id).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error getting generation: {e}")
            return None
    
    async def update_generation(self, generation_id: str, update_data: GenerationUpdate) -> Optional[Dict[str, Any]]:
        """更新生成任务"""
        try:
            data = update_data.dict(exclude_unset=True)
            response = self.client.table('generations').update(data).eq('id', generation_id).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error updating generation: {e}")
            return None
    
    async def get_user_generations(self, user_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        """获取用户的生成历史"""
        try:
            response = self.client.table('generations').select('*').eq('user_id', user_id).order('created_at', desc=True).limit(limit).execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Error getting user generations: {e}")
            return []
    
    # ==================== 生成结果相关操作 ====================
    
    async def create_generation_result(self, result_data: GenerationResultCreate) -> Optional[Dict[str, Any]]:
        """创建生成结果"""
        try:
            data = result_data.dict()
            response = self.client.table('generation_results').insert(data).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Error creating generation result: {e}")
            return None
    
    async def get_generation_results(self, generation_id: str) -> List[Dict[str, Any]]:
        """获取生成任务的所有结果"""
        try:
            response = self.client.table('generation_results').select('*').eq('generation_id', generation_id).order('created_at', desc=True).execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Error getting generation results: {e}")
            return []
    
    async def update_generation_result_selection(self, result_id: str, is_selected: bool) -> bool:
        """更新生成结果的选择状态"""
        try:
            response = self.client.table('generation_results').update({
                'is_selected': is_selected
            }).eq('id', result_id).execute()
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Error updating generation result selection: {e}")
            return False

# 创建全局数据库服务实例
db_service = DatabaseService() 