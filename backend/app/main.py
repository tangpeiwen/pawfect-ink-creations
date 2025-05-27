from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import logging

from app.api.router import api_router
from app.core.config import settings

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="宠物简笔画贴纸生成API",
    version="1.0.0"
)

# 设置CORS - 临时允许所有源访问，用于开发测试
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有源访问，用于开发环境
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有HTTP方法
    allow_headers=["*"],  # 允许所有HTTP头
    expose_headers=["*"],  # 暴露所有响应头给客户端
    max_age=86400,  # 预检请求缓存时间（秒）
)

# 注册API路由
app.include_router(api_router, prefix="/api")

# 挂载静态文件目录
app.mount("/storage", StaticFiles(directory=settings.STORAGE_DIR), name="storage")

@app.get("/")
async def root():
    return {"message": "宠物简笔画贴纸生成API服务"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"} 