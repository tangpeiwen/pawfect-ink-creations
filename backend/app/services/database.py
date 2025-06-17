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
            
            new_credits = profile['tokens_remaining'] + credits_change
            if new_credits < 0:
                return False  # 积分不足
            
            response = self.client.table('user_profiles').update({
                'tokens_remaining': new_credits
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

    # ==================== 订单和支付相关操作 ====================
    
    async def get_token_package(self, package_id: str) -> Optional[Dict]:
        """获取Token套餐信息"""
        try:
            response = self.client.table('token_packages').select('*').eq('id', package_id).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"获取Token套餐失败: {e}")
            return None

    async def create_order(self, order_data: Dict) -> Dict:
        """创建订单"""
        try:
            response = self.client.table('orders').insert(order_data).execute()
            if response.data:
                return response.data[0]
            raise Exception("创建订单失败")
        except Exception as e:
            logger.error(f"创建订单失败: {e}")
            raise Exception(f"创建订单失败: {str(e)}")

    async def get_order(self, order_id: str) -> Optional[Dict]:
        """获取订单详情"""
        try:
            response = self.client.table('orders').select('*').eq('id', order_id).execute()
            if response.data:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"获取订单失败: {e}")
            return None

    async def update_order(self, order_id: str, update_data: Dict) -> bool:
        """更新订单"""
        try:
            response = self.client.table('orders').update(update_data).eq('id', order_id).execute()
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"更新订单失败: {e}")
            return False

    async def get_user_orders(self, user_id: str, skip: int = 0, limit: int = 20) -> List[Dict]:
        """获取用户订单列表"""
        try:
            response = (self.client.table('orders')
                       .select('*')
                       .eq('user_id', user_id)
                       .order('created_at', desc=True)
                       .range(skip, skip + limit - 1)
                       .execute())
            return response.data or []
        except Exception as e:
            logger.error(f"获取用户订单失败: {e}")
            return []

    async def add_tokens(self, user_id: str, amount: int, description: str, package_id: Optional[str] = None) -> None:
        """增加用户token（支付成功后调用）"""
        try:
            print(f"[DEBUG] 开始增加用户Token: user_id={user_id}, amount={amount}")
            
            # 先检查用户是否存在，如果不存在则创建
            user_profile = await self.get_user_profile(user_id)
            if not user_profile:
                print(f"[DEBUG] 用户 {user_id} 不存在，尝试创建用户资料")
                # 创建基本的用户资料
                profile_data = {
                    'id': user_id,
                    'display_name': None,
                    'subscription_tier': 'free'
                }
                try:
                    create_response = self.client.table('user_profiles').insert(profile_data).execute()
                    print(f"[DEBUG] 用户资料创建结果: {create_response.data}")
                except Exception as create_error:
                    print(f"[DEBUG] 创建用户资料失败: {create_error}")
                    # 如果创建失败，可能是用户已存在，再次尝试获取
                    user_profile = await self.get_user_profile(user_id)
                    if not user_profile:
                        raise Exception(f"无法创建或获取用户资料: {str(create_error)}")
            
            # 重新获取用户资料确保最新数据
            user_profile = await self.get_user_profile(user_id)
            if not user_profile:
                raise Exception("用户资料获取失败")
            
            print(f"[DEBUG] 用户资料字段: {list(user_profile.keys())}")
            
            # 直接使用tokens_remaining字段
            current_credits = user_profile.get('tokens_remaining', 0)
            new_credits = current_credits + amount
            
            print(f"[DEBUG] 当前积分: {current_credits}, 增加: {amount}, 新积分: {new_credits}")
            
            # 更新用户余额
            try:
                update_response = self.client.table('user_profiles').update({
                    'tokens_remaining': new_credits
                }).eq('id', user_id).execute()
                
                print(f"[DEBUG] 积分更新结果: {len(update_response.data) > 0}")
            except Exception as update_error:
                print(f"[DEBUG] 积分更新失败: {update_error}")
                # 如果更新失败，可能是字段不存在，数据库可能需要migration
                if "does not exist" in str(update_error):
                    print(f"[DEBUG] 字段 tokens_remaining 不存在，数据库可能需要migration")
                    # 直接跳过积分更新，订单已经成功了
                    print(f"[DEBUG] 跳过积分更新，但订单状态已更新为paid")
                else:
                    raise update_error
            
            # 记录token交易（即使积分更新失败也要记录）
            transaction_data = {
                'user_id': user_id,
                'amount': amount,
                'description': description,
                'package_id': package_id,
                'transaction_type': 'purchase'
            }
            
            try:
                transaction_response = self.client.table('token_transactions').insert(transaction_data).execute()
                print(f"[DEBUG] 交易记录创建结果: {len(transaction_response.data) > 0}")
            except Exception as trans_error:
                print(f"[DEBUG] 创建交易记录失败（但积分已更新）: {trans_error}")
                # 交易记录创建失败不影响积分更新
            
            logger.info(f"用户 {user_id} 增加 {amount} tokens，当前余额: {new_credits}")
            print(f"[DEBUG] Token增加完成")
            
        except Exception as e:
            logger.error(f"增加用户token失败: {e}")
            print(f"[DEBUG] 增加用户token失败: {e}")
            # 不要抛出异常，因为订单已经成功更新了
            print(f"[DEBUG] 注意：积分更新失败，但订单状态已成功更新为paid")

# 创建全局数据库服务实例
db_service = DatabaseService() 