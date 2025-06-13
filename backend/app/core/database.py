from supabase import create_client, Client
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class DatabaseClient:
    """MemFireDB 数据库客户端"""
    
    def __init__(self):
        self._client: Client = None
        self._admin_client: Client = None
    
    @property
    def client(self) -> Client:
        """获取普通客户端（使用匿名密钥）"""
        if self._client is None:
            if not settings.MEMFIREDB_URL or not settings.MEMFIREDB_ANON_KEY:
                raise ValueError("Missing MemFireDB configuration")
            
            self._client = create_client(
                settings.MEMFIREDB_URL,
                settings.MEMFIREDB_ANON_KEY
            )
            logger.info("MemFireDB client initialized")
        
        return self._client
    
    @property
    def admin_client(self) -> Client:
        """获取管理员客户端（使用服务角色密钥）"""
        if self._admin_client is None:
            if not settings.MEMFIREDB_URL or not settings.MEMFIREDB_SERVICE_ROLE_KEY:
                raise ValueError("Missing MemFireDB admin configuration")
            
            self._admin_client = create_client(
                settings.MEMFIREDB_URL,
                settings.MEMFIREDB_SERVICE_ROLE_KEY
            )
            logger.info("MemFireDB admin client initialized")
        
        return self._admin_client
    
    async def test_connection(self) -> bool:
        """测试数据库连接"""
        try:
            # 测试基本连接
            response = self.client.table('user_profiles').select('count').limit(1).execute()
            logger.info("Database connection test successful")
            return True
        except Exception as e:
            logger.error(f"Database connection test failed: {e}")
            return False

# 创建全局数据库实例
db = DatabaseClient()

# 便捷函数
def get_db_client() -> Client:
    """获取数据库客户端"""
    return db.client

def get_admin_client() -> Client:
    """获取管理员数据库客户端"""
    return db.admin_client 