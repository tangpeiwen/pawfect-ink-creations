from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, Optional
import logging
from app.core.database import db
from app.services.database import db_service
from app.models.schemas import BaseResponse
from app.core.auth import get_optional_user_id

logger = logging.getLogger(__name__)

router = APIRouter()

# ========================================
# 数据库管理和监控端点
# 用途：系统运维、健康检查、数据统计
# 注意：这些不是核心业务功能
# ========================================

@router.get("/test", response_model=Dict[str, Any])
async def test_database_connection(current_user_id: Optional[str] = Depends(get_optional_user_id)):
    """
    测试数据库连接
    
    **管理工具端点** - 用于测试数据库连接状态和表访问权限
    - 可以无认证访问，但会记录访问者信息
    - 主要用于系统部署后的连接测试
    - 检查各个数据表的可访问性
    """
    try:
        if current_user_id:
            logger.info(f"用户 {current_user_id} 正在测试数据库连接")
        else:
            logger.info("匿名用户正在测试数据库连接")
            
        # 测试基本连接
        connection_ok = await db.test_connection()
        
        if not connection_ok:
            raise HTTPException(status_code=500, detail="Database connection failed")
        
        # 测试表访问
        tables_status = {}
        tables = ['user_profiles', 'uploaded_images', 'generations', 'generation_results']
        
        for table in tables:
            try:
                response = db.client.table(table).select('count').limit(1).execute()
                tables_status[table] = "accessible"
            except Exception as e:
                tables_status[table] = f"error: {str(e)}"
        
        return {
            "success": True,
            "message": "Database connection test completed",
            "connection": "ok",
            "tables": tables_status,
            "tested_by": current_user_id or "anonymous"
        }
        
    except Exception as e:
        logger.error(f"Database test failed: {e}")
        raise HTTPException(status_code=500, detail=f"Database test failed: {str(e)}")

@router.get("/user-stats")
async def get_database_user_stats(current_user_id: Optional[str] = Depends(get_optional_user_id)):
    """
    获取数据库用户统计信息
    
    **管理工具端点** - 用于查看整体系统使用情况
    - 显示用户总数、图片总数、生成任务总数
    - 用于运营分析和系统监控
    - 不涉及具体用户数据，只显示汇总统计
    """
    try:
        if current_user_id:
            logger.info(f"用户 {current_user_id} 正在查看数据库统计")
        else:
            logger.info("匿名用户正在查看数据库统计")
            
        # 获取基本统计
        stats = {}
        
        # 用户总数
        try:
            user_count_response = db.client.table('user_profiles').select('count').execute()
            stats['total_users'] = len(user_count_response.data) if user_count_response.data else 0
        except Exception as e:
            stats['total_users'] = f"error: {str(e)}"
        
        # 图片总数
        try:
            image_count_response = db.client.table('uploaded_images').select('count').execute()
            stats['total_images'] = len(image_count_response.data) if image_count_response.data else 0
        except Exception as e:
            stats['total_images'] = f"error: {str(e)}"
        
        # 生成任务总数
        try:
            generation_count_response = db.client.table('generations').select('count').execute()
            stats['total_generations'] = len(generation_count_response.data) if generation_count_response.data else 0
        except Exception as e:
            stats['total_generations'] = f"error: {str(e)}"
        
        return {
            "success": True,
            "stats": stats,
            "queried_by": current_user_id or "anonymous"
        }
        
    except Exception as e:
        logger.error(f"Database stats query failed: {e}")
        raise HTTPException(status_code=500, detail=f"Database stats query failed: {str(e)}")

@router.get("/health")
async def database_health_check():
    """
    数据库健康检查端点
    
    **系统监控端点** - 用于自动化健康检查
    - 公共端点，无需认证
    - 返回数据库服务状态
    - 用于负载均衡器、监控系统的健康检查
    """
    try:
        # 简单的连接测试
        connection_ok = await db.test_connection()
        
        return {
            "status": "healthy" if connection_ok else "unhealthy",
            "timestamp": db.get_current_timestamp() if hasattr(db, 'get_current_timestamp') else None,
            "service": "database"
        }
        
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "service": "database"
        } 