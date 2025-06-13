from fastapi import APIRouter
from app.api.endpoints import upload, styles, features, generator, database, users

# 创建主API路由
api_router = APIRouter()

# 注册各个模块的路由
api_router.include_router(upload.router, tags=["上传"])
api_router.include_router(styles.router, tags=["风格"])
api_router.include_router(features.router, tags=["特征"])
api_router.include_router(generator.router, tags=["生成"])
api_router.include_router(users.router, prefix="/users", tags=["用户"])
api_router.include_router(database.router, prefix="/database", tags=["数据库"]) 