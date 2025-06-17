import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# 加载.env文件中的环境变量
env_path = Path(__file__).parents[2] / '.env'
load_dotenv(dotenv_path=env_path)

class Settings(BaseSettings):
    # 项目基本设置
    PROJECT_NAME: str = "宠物简笔画贴纸生成器"
    API_PREFIX: str = "/api"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # MemFireDB 数据库配置
    MEMFIREDB_URL: str = os.getenv("VITE_SUPABASE_URL", "")
    MEMFIREDB_ANON_KEY: str = os.getenv("VITE_SUPABASE_ANON_KEY", "")
    MEMFIREDB_SERVICE_ROLE_KEY: str = os.getenv("MEMFIREDB_SERVICE_ROLE_KEY", "")
    
    # Supabase JWT密钥（用于验证前端传来的token）
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")
    
    # CORS设置
    def get_allowed_origins(self) -> List[str]:
        """动态获取允许的CORS源"""
        origins = [
            "http://localhost:3000",
            "http://localhost:5173",  # Vite默认端口
            "http://localhost:8080",  # 前端运行的端口
        ]
        
        # 添加前端域名
        if self.FRONTEND_DOMAIN:
            origins.append(self.FRONTEND_DOMAIN)
        
        # 添加额外的允许域名
        extra_origins = os.getenv("EXTRA_ALLOWED_ORIGINS", "")
        if extra_origins:
            origins.extend([origin.strip() for origin in extra_origins.split(",")])
        
        # 去重并过滤空值
        return list(set(filter(None, origins)))
    
    ALLOWED_ORIGINS: List[str] = []  # 初始化为空，通过get_allowed_origins()获取
    
    # 文件存储路径
    BASE_DIR: Path = Path(__file__).parents[2]
    STORAGE_DIR: Path = BASE_DIR / "storage"
    ORIGINAL_IMAGES_DIR: Path = STORAGE_DIR / "originals"
    PROCESSED_IMAGES_DIR: Path = STORAGE_DIR / "processed"
    RESULTS_DIR: Path = STORAGE_DIR / "results"
    STYLE_REFERENCES_DIR: Path = STORAGE_DIR / "styles"
    
    # 文件上传设置
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_IMAGE_TYPES: List[str] = ["image/jpeg", "image/png", "image/jpg", "image/webp"]
    
    # OpenAI API设置
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_API_BASE: str = os.getenv("OPENAI_API_BASE", "https://api.openai.com/v1")
    OPENAI_API_TIMEOUT: int = 60
    OPENAI_MAX_RETRIES: int = 2

    # Segmind API设置
    SEGMIND_API_KEY: str = os.getenv("SEGMIND_API_KEY", "")
    SEGMIND_API_BASE: str = os.getenv("SEGMIND_API_BASE", "https://api.segmind.com/v1")
    SEGMIND_API_TIMEOUT: int = 60
    SEGMIND_MAX_RETRIES: int = 2

    # TuZi API设置
    TUZI_API_KEY: str = os.getenv("TUZI_API_KEY", "")
    TUZI_API_BASE: str = os.getenv("TUZI_API_BASE", "https://api.tu-zi.com/v1")
    TUZI_API_TIMEOUT: int = 60
    TUZI_MAX_RETRIES: int = 2
    
    # 任务配置
    TASK_EXPIRY_HOURS: int = 24
    
    # 支付配置
    PAYMENT_DOMAIN: str = os.getenv("PAYMENT_DOMAIN", "http://localhost:3000")  # 开发环境用3000，生产环境通过环境变量设置
    FRONTEND_DOMAIN: str = os.getenv("FRONTEND_DOMAIN", "http://localhost:8080")  # 前端页面地址
    
    # Zpay支付配置
    ZPAY_PID: str = os.getenv("ZPAY_PID", "")
    ZPAY_PKEY: str = os.getenv("ZPAY_PKEY", "")
    ZPAY_API_URL: str = os.getenv("ZPAY_API_URL", "https://zpayz.cn")
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# 创建设置实例
settings = Settings()

# 创建必要的目录
for directory in [
    settings.STORAGE_DIR,
    settings.ORIGINAL_IMAGES_DIR,
    settings.PROCESSED_IMAGES_DIR,
    settings.RESULTS_DIR,
    settings.STYLE_REFERENCES_DIR
]:
    directory.mkdir(parents=True, exist_ok=True) 