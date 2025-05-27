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
    
    # CORS设置
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",  # Vite默认端口
        "http://localhost:8080",  # 添加前端运行的端口
        os.getenv("FRONTEND_URL", "")
    ]
    
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