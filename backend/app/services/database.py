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
            logger.info(f"开始增加用户Token: user_id={user_id}, amount={amount}")
            
            # 先检查用户是否存在，如果不存在则创建
            user_profile = await self.get_user_profile(user_id)
            if not user_profile:
                logger.info(f"用户 {user_id} 不存在，创建用户资料")
                # 创建基本的用户资料
                profile_data = {
                    'id': user_id,
                    'display_name': None,
                    'subscription_tier': 'free',
                    'tokens_remaining': 500  # free tier 用户的初始token
                }
                try:
                    create_response = self.client.table('user_profiles').insert(profile_data).execute()
                    logger.info(f"用户资料创建成功: {len(create_response.data) > 0}")
                except Exception as create_error:
                    logger.error(f"创建用户资料失败: {create_error}")
                    # 如果创建失败，可能是用户已存在，再次尝试获取
                    user_profile = await self.get_user_profile(user_id)
                    if not user_profile:
                        raise Exception(f"无法创建或获取用户资料: {str(create_error)}")
            
            # 重新获取用户资料确保最新数据
            user_profile = await self.get_user_profile(user_id)
            if not user_profile:
                raise Exception("用户资料获取失败")
            
            # 计算新的token余额
            current_tokens = user_profile.get('tokens_remaining', 0)
            new_tokens = current_tokens + amount
            
            logger.info(f"用户 {user_id} 当前积分: {current_tokens}, 增加: {amount}, 新积分: {new_tokens}")
            
            # 更新用户余额
            update_response = self.client.table('user_profiles').update({
                'tokens_remaining': new_tokens
            }).eq('id', user_id).execute()
            
            if not update_response.data:
                raise Exception(f"更新用户token余额失败，没有返回数据")
            
            logger.info(f"用户 {user_id} token余额更新成功")
            
            # 记录token交易
            transaction_data = {
                'user_id': user_id,
                'amount': amount,
                'transaction_type': 'purchase',
                'description': description,
                'package_id': package_id,
                'balance_after': new_tokens  # 添加余额字段
            }
            
            transaction_response = self.client.table('token_transactions').insert(transaction_data).execute()
            if transaction_response.data:
                logger.info(f"Token交易记录创建成功")
            else:
                logger.warning(f"Token交易记录创建失败，但token已更新")
            
            logger.info(f"用户 {user_id} 成功增加 {amount} tokens，当前余额: {new_tokens}")
            
        except Exception as e:
            logger.error(f"增加用户token失败: {e}")
            # 重新抛出异常，让调用方知道失败了
            raise Exception(f"增加用户token失败: {str(e)}")

    async def consume_tokens(self, user_id: str, amount: int, description: str, generation_id: Optional[str] = None) -> bool:
        """消耗用户token（生成任务完成后调用）"""
        try:
            logger.info(f"开始消耗用户Token: user_id={user_id}, amount={amount}")
            
            # 获取用户当前token
            user_profile = await self.get_user_profile(user_id)
            if not user_profile:
                logger.error(f"用户 {user_id} 不存在")
                return False
            
            current_tokens = user_profile.get('tokens_remaining', 0)
            if current_tokens < amount:
                logger.error(f"用户 {user_id} token不足: 当前 {current_tokens}, 需要 {amount}")
                return False
            
            # 扣除token
            new_tokens = current_tokens - amount
            
            # 更新用户token余额
            update_response = self.client.table('user_profiles').update({
                'tokens_remaining': new_tokens
            }).eq('id', user_id).execute()
            
            if not update_response.data:
                logger.error(f"更新用户token余额失败: {user_id}")
                return False
            
            # 记录token消耗交易
            transaction_data = {
                'user_id': user_id,
                'amount': -amount,  # 负数表示消耗
                'description': description,
                'generation_id': generation_id,
                'transaction_type': 'consumption',
                'balance_after': new_tokens  # 添加余额字段
            }
            
            try:
                transaction_response = self.client.table('token_transactions').insert(transaction_data).execute()
                logger.info(f"Token消耗交易记录创建成功: {len(transaction_response.data) > 0}")
            except Exception as trans_error:
                logger.error(f"创建消耗交易记录失败（但token已扣除）: {trans_error}")
                # 交易记录创建失败不影响token扣除
            
            logger.info(f"用户 {user_id} 成功消耗 {amount} tokens，当前余额: {new_tokens}")
            return True
            
        except Exception as e:
            logger.error(f"消耗用户token失败: {e}")
            return False

    # ==================== 生成数量统计相关操作 ====================
    
    async def get_user_generations_count(self, user_id: str) -> int:
        """获取用户生成数量"""
        try:
            response = self.client.table('generations').select('id', count='exact').eq('user_id', user_id).eq('status', 'completed').execute()
            return response.count or 0
        except Exception as e:
            logger.error(f"Error getting user generations count: {e}")
            return 0

    async def get_user_images_count(self, user_id: str) -> int:
        """获取用户上传图片数量"""
        try:
            response = self.client.table('uploaded_images').select('id', count='exact').eq('user_id', user_id).execute()
            return response.count or 0
        except Exception as e:
            logger.error(f"Error getting user images count: {e}")
            return 0

    # ==================== 调试相关操作 ====================
    
    async def debug_user_generations(self, user_id: str) -> Dict[str, Any]:
        """调试用户生成任务状态"""
        try:
            # 获取所有生成任务
            all_generations = await self.get_user_generations(user_id, limit=100)
            
            # 统计各种状态的数量
            status_counts = {}
            for gen in all_generations:
                status = gen.get('status', 'unknown')
                status_counts[status] = status_counts.get(status, 0) + 1
            
            # 获取完成的生成任务数量
            completed_count = status_counts.get('completed', 0)
            
            # 获取用户资料中的total_generations
            user_profile = await self.get_user_profile(user_id)
            current_total = user_profile.get('total_generations', 0) if user_profile else 0
            
            return {
                'user_id': user_id,
                'status_counts': status_counts,
                'completed_generations': completed_count,
                'current_total_generations': current_total,
                'mismatch': completed_count != current_total,
                'all_generations': all_generations[:5]  # 只返回前5个用于检查
            }
        except Exception as e:
            logger.error(f"Error debugging user generations: {e}")
            return {'error': str(e)}

    async def fix_user_total_generations(self, user_id: str) -> bool:
        """修复用户的total_generations计数"""
        try:
            # 获取实际完成的生成任务数量
            completed_count = await self.get_user_generations_count(user_id)
            
            # 更新用户资料中的total_generations
            update_response = self.client.table('user_profiles').update({
                'total_generations': completed_count
            }).eq('id', user_id).execute()
            
            if update_response.data:
                logger.info(f"成功修复用户 {user_id} 的total_generations为 {completed_count}")
                return True
            else:
                logger.error(f"修复用户 {user_id} 的total_generations失败")
                return False
                
        except Exception as e:
            logger.error(f"修复用户total_generations失败: {e}")
            return False

# 创建全局数据库服务实例
db_service = DatabaseService() 