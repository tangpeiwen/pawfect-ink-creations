import shutil
import os
from pathlib import Path
import uuid
import logging
import traceback
from fastapi import APIRouter, File, UploadFile, HTTPException, BackgroundTasks, status, Response, Depends
from app.core.config import settings
from app.models.schemas import UploadResponse, ErrorResponse, UploadedImageCreate
from app.utils.image_processing import validate_image, preprocess_image
from app.services.database import db_service
from app.services.supabase_storage import storage_service
from app.core.auth import get_current_user_id
import io
import asyncio
from PIL import Image


router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/upload", response_model=UploadResponse, responses={
    400: {"model": ErrorResponse, "description": "无效的文件类型"},
    413: {"model": ErrorResponse, "description": "文件大小超出限制"},
    500: {"model": ErrorResponse, "description": "服务器错误"}
})
async def upload_image(
    image: UploadFile = File(...),
    current_user_id: str = Depends(get_current_user_id)
):
    """
    上传宠物图片接口
    
    Args:
        image: 上传的图片文件
        current_user_id: 当前登录用户ID（通过认证中间件获取）
        
    Returns:
        UploadResponse: 上传结果，包含图片信息
        
    Raises:
        HTTPException: 当文件类型不支持、文件太大或处理失败时
    """
    logger.info(f"用户 {current_user_id} 开始上传图片: {image.filename}")
    
    try:
        # 验证文件类型
        if image.content_type not in settings.ALLOWED_IMAGE_TYPES:
            logger.warning(f"文件类型不支持: {image.content_type}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"不支持的文件类型: {image.content_type}，仅支持 {', '.join(settings.ALLOWED_IMAGE_TYPES)}"
            )
        
        # 读取图片内容
        try:
            content = await image.read()
            logger.info(f"读取图片内容成功，大小: {len(content)} 字节")
            
            # 验证内容是否为有效图片
            try:
                img_test = Image.open(io.BytesIO(content))
                logger.info(f"图片验证成功: 模式={img_test.mode}, 尺寸={img_test.size}")
            except Exception as img_test_error:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"上传的不是有效图片: {str(img_test_error)}"
                )
        except Exception as read_error:
            logger.error(f"读取上传内容失败: {str(read_error)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"读取上传内容失败: {str(read_error)}"
            )
        
        # 预处理图片
        try:
            processed_image = preprocess_image(content)
            logger.info("图片预处理成功")
        except Exception as preprocess_error:
            logger.error(f"图片预处理失败: {str(preprocess_error)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"图片预处理失败: {str(preprocess_error)}"
            )
        
        # 上传到Supabase存储
        try:
            file_id, public_url = await storage_service.upload_user_image(processed_image, "jpg")
            logger.info(f"上传成功，文件ID: {file_id}, URL: {public_url}")
        except Exception as upload_error:
            logger.error(f"上传到存储服务失败: {str(upload_error)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"上传失败: {str(upload_error)}"
            )
        
        # 创建数据库记录
        try:
            image_data = UploadedImageCreate(
                user_id=current_user_id,
                original_filename=image.filename or f"upload_{file_id}.jpg",
                file_size=len(processed_image),
                mime_type=image.content_type,
                storage_path=f"upload/{file_id}.jpg"
            )
            
            db_result = await db_service.create_uploaded_image(image_data)
            if not db_result:
                raise Exception("创建数据库记录失败")
            
            db_image_id = db_result['id']
            logger.info(f"数据库记录创建成功，ID: {db_image_id}")
            
        except Exception as db_error:
            logger.error(f"创建数据库记录失败: {str(db_error)}")
            # 如果数据库记录创建失败，尝试删除已上传的文件
            try:
                await storage_service.delete_file(f"upload/{file_id}.jpg")
            except:
                pass
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"创建记录失败: {str(db_error)}"
            )
        
        logger.info(f"用户 {current_user_id} 图片上传成功: {file_id}")
        
        return UploadResponse(
            success=True,
            message="图片上传成功",
            imageId=db_image_id,
            previewUrl=public_url
        )
        
    except HTTPException:
        # 重新抛出HTTP异常
        raise
    except Exception as e:
        logger.error(f"用户 {current_user_id} 图片上传失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"服务器内部错误: {str(e)}"
        )

@router.get("/images")
async def get_user_images(current_user_id: str = Depends(get_current_user_id)):
    """
    获取当前用户的所有上传图片
    
    Args:
        current_user_id: 当前登录用户ID
        
    Returns:
        list: 用户的图片列表
    """
    try:
        images = await db_service.get_user_uploaded_images(current_user_id)
        return {"success": True, "images": images}
    except Exception as e:
        logger.error(f"获取用户 {current_user_id} 图片列表失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取图片列表失败: {str(e)}"
        )

@router.get("/images/{image_id}")
async def get_image_details(
    image_id: str, 
    current_user_id: str = Depends(get_current_user_id)
):
    """
    获取指定图片的详细信息
    
    Args:
        image_id: 图片ID
        current_user_id: 当前登录用户ID
        
    Returns:
        dict: 图片详细信息
    """
    try:
        image = await db_service.get_uploaded_image(image_id)
        
        if not image:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="图片不存在"
            )
        
        # 验证图片属于当前用户
        if image.get('user_id') != current_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="无权访问此图片"
            )
        
        return {"success": True, "image": image}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取图片 {image_id} 详情失败: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取图片详情失败: {str(e)}"
        )

def preprocess_image(content: bytes) -> bytes:
    """
    预处理图片：转换格式、调整大小等
    
    Args:
        content: 原始图片字节数据
        
    Returns:
        bytes: 处理后的图片字节数据
    """
    try:
        with Image.open(io.BytesIO(content)) as img:
            # 如果不是RGB模式，转换为RGB
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # 调整大小（更加激进地减小尺寸）
            max_size = (800, 800)  # 从1024降到800
            if img.size[0] > max_size[0] or img.size[1] > max_size[1]:
                img.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # 保存为字节流，降低质量
            output = io.BytesIO()
            img.save(output, format='JPEG', quality=70, optimize=True)  # 从85%降到70%
            
            # 记录处理后的图片大小
            processed_size = len(output.getvalue()) / 1024  # KB
            logger.info(f"图片处理后大小: {processed_size:.2f} KB")
            
            return output.getvalue()
            
    except Exception as e:
        logger.error(f"图片预处理失败: {str(e)}")
        raise 