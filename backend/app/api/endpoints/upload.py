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
    # 添加详细的请求日志
    logger.info(f"=== 开始处理图片上传请求 ===")
    logger.info(f"用户ID: {current_user_id}")
    logger.info(f"文件名: {image.filename}")
    logger.info(f"文件类型: {image.content_type}")
    logger.info(f"文件大小: {image.size if hasattr(image, 'size') else '未知'}")
    
    try:
        # 验证文件类型
        if image.content_type not in settings.ALLOWED_IMAGE_TYPES:
            logger.warning(f"文件类型不支持: {image.content_type}")
            logger.warning(f"支持的文件类型: {settings.ALLOWED_IMAGE_TYPES}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"不支持的文件类型: {image.content_type}，仅支持 {', '.join(settings.ALLOWED_IMAGE_TYPES)}"
            )
        
        # 读取图片内容
        try:
            logger.info("开始读取上传文件内容")
            
            # 分块读取大文件，避免内存溢出（简化版）
            content = await image.read()
            content_size = len(content)
            
            # 实时检查文件大小
            max_size = settings.MAX_UPLOAD_SIZE
            if content_size > max_size:
                logger.warning(f"文件大小超出限制: {content_size} > {max_size}")
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"文件大小超出限制，最大允许{max_size // (1024 * 1024)}MB，实际大小: {content_size / 1024 / 1024:.2f}MB"
                )
            
            logger.info(f"读取图片内容成功，实际大小: {content_size} 字节")
            
            # 验证内容是否为有效图片
            try:
                logger.info("验证图片内容")
                img_test = Image.open(io.BytesIO(content))
                
                # 获取图片基本信息
                img_mode = img_test.mode
                img_size = img_test.size
                img_format = img_test.format
                
                logger.info(f"图片基本信息: 模式={img_mode}, 尺寸={img_size}, 格式={img_format}")
                
                # 检查图片是否有效
                try:
                    img_test.verify()  # 验证图片完整性
                    logger.info("图片完整性验证通过")
                except Exception as verify_error:
                    logger.error(f"图片完整性验证失败: {str(verify_error)}")
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"图片文件损坏或不完整: {str(verify_error)}"
                    )
                
                # 检查图片尺寸是否合理
                if img_size[0] < 32 or img_size[1] < 32:
                    logger.error(f"图片尺寸太小: {img_size}")
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"图片尺寸太小，最小支持32x32像素，当前: {img_size[0]}x{img_size[1]}"
                    )
                
                if img_size[0] > 8192 or img_size[1] > 8192:
                    logger.error(f"图片尺寸太大: {img_size}")
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"图片尺寸太大，最大支持8192x8192像素，当前: {img_size[0]}x{img_size[1]}"
                    )
                
                # 检查图片模式是否支持
                unsupported_modes = ['1', 'P']  # 1位黑白图和调色板模式可能有问题
                if img_mode in unsupported_modes:
                    logger.warning(f"图片模式可能不兼容: {img_mode}")
                    # 不直接报错，让预处理尝试转换
                
                logger.info(f"图片验证成功: 模式={img_mode}, 尺寸={img_size}, 格式={img_format}")
                img_test.close()  # 释放资源
                
            except HTTPException:
                # 重新抛出HTTP异常
                raise
            except Exception as img_test_error:
                logger.error(f"图片验证失败: {str(img_test_error)}")
                logger.error(f"图片验证错误类型: {type(img_test_error).__name__}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"上传的不是有效图片或图片格式不支持: {str(img_test_error)}"
                )
        except HTTPException:
            # 重新抛出HTTP异常
            raise
        except Exception as read_error:
            logger.error(f"读取上传内容失败: {str(read_error)}")
            logger.error(f"错误详情: {traceback.format_exc()}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"读取上传内容失败: {str(read_error)}"
            )
        
        # 预处理图片
        try:
            logger.info("开始预处理图片")
            processed_image = preprocess_image(content)
            processed_size = len(processed_image)
            logger.info(f"图片预处理成功，处理后大小: {processed_size} 字节")
        except Exception as preprocess_error:
            logger.error(f"图片预处理失败: {str(preprocess_error)}")
            logger.error(f"错误详情: {traceback.format_exc()}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"图片预处理失败: {str(preprocess_error)}"
            )
        
        # 上传到Supabase存储
        try:
            logger.info("开始上传到Supabase存储")
            file_id, public_url = await storage_service.upload_user_image(processed_image, "jpg")
            logger.info(f"上传成功，文件ID: {file_id}")
            logger.info(f"公共URL: {public_url}")
        except Exception as upload_error:
            logger.error(f"上传到存储服务失败: {str(upload_error)}")
            logger.error(f"错误详情: {traceback.format_exc()}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"上传失败: {str(upload_error)}"
            )
        
        # 创建数据库记录
        try:
            logger.info("开始创建数据库记录")
            image_data = UploadedImageCreate(
                user_id=current_user_id,
                original_filename=image.filename or f"upload_{file_id}.jpg",
                file_size=processed_size,
                mime_type=image.content_type,
                storage_path=f"upload/{file_id}.jpg"
            )
            
            logger.info(f"数据库记录数据: {image_data.dict()}")
            
            db_result = await db_service.create_uploaded_image(image_data)
            if not db_result:
                raise Exception("创建数据库记录失败，返回None")
            
            db_image_id = db_result['id']
            logger.info(f"数据库记录创建成功，ID: {db_image_id}")
            
        except Exception as db_error:
            logger.error(f"创建数据库记录失败: {str(db_error)}")
            logger.error(f"错误详情: {traceback.format_exc()}")
            # 如果数据库记录创建失败，尝试删除已上传的文件
            try:
                logger.info("尝试清理已上传的文件")
                await storage_service.delete_file(f"upload/{file_id}.jpg")
                logger.info("文件清理成功")
            except Exception as cleanup_error:
                logger.error(f"清理文件失败: {str(cleanup_error)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"创建记录失败: {str(db_error)}"
            )
        
        logger.info(f"=== 用户 {current_user_id} 图片上传成功 ===")
        logger.info(f"文件ID: {file_id}")
        logger.info(f"数据库ID: {db_image_id}")
        logger.info(f"公共URL: {public_url}")
        
        return UploadResponse(
            success=True,
            message="图片上传成功",
            imageId=db_image_id,
            previewUrl=public_url
        )
        
    except HTTPException:
        # 重新抛出HTTP异常
        logger.error(f"HTTP异常: {traceback.format_exc()}")
        raise
    except Exception as e:
        logger.error(f"=== 用户 {current_user_id} 图片上传失败 ===")
        logger.error(f"未捕获异常: {str(e)}")
        logger.error(f"完整错误堆栈: {traceback.format_exc()}")
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
        logger.info("开始图片预处理")
        
        with Image.open(io.BytesIO(content)) as img:
            logger.info(f"原始图片信息: 模式={img.mode}, 尺寸={img.size}, 格式={img.format}")
            
            # 处理特殊的图片模式
            original_mode = img.mode
            
            # 如果是调色板模式，先转换为RGBA以保持透明度
            if img.mode == 'P':
                logger.info("检测到调色板模式，转换为RGBA")
                if 'transparency' in img.info:
                    img = img.convert('RGBA')
                else:
                    img = img.convert('RGB')
            # 如果是1位黑白图，转换为RGB
            elif img.mode == '1':
                logger.info("检测到1位黑白模式，转换为RGB")
                img = img.convert('RGB')
            # 如果是灰度图，转换为RGB
            elif img.mode == 'L':
                logger.info("检测到灰度模式，转换为RGB")
                img = img.convert('RGB')
            # 如果是RGBA模式，需要处理透明度
            elif img.mode == 'RGBA':
                logger.info("检测到RGBA模式，处理透明度")
                # 创建白色背景
                background = Image.new('RGB', img.size, (255, 255, 255))
                # 将RGBA图片粘贴到白色背景上
                background.paste(img, mask=img.split()[-1] if len(img.split()) == 4 else None)
                img = background
            # 如果不是RGB模式，转换为RGB
            elif img.mode != 'RGB':
                logger.info(f"转换图片模式: {img.mode} -> RGB")
                img = img.convert('RGB')
            
            logger.info(f"模式转换完成: {original_mode} -> {img.mode}")
            
            # 检查转换后的图片
            if img.size[0] == 0 or img.size[1] == 0:
                raise ValueError("图片转换后尺寸为0")
            
            # 调整大小（如果太大的话）
            max_size = (1024, 1024)
            original_size = img.size
            
            if img.size[0] > max_size[0] or img.size[1] > max_size[1]:
                logger.info(f"调整图片尺寸: {original_size} -> 最大{max_size}")
                img.thumbnail(max_size, Image.Resampling.LANCZOS)
                logger.info(f"尺寸调整完成: {original_size} -> {img.size}")
            
            # 保存为字节流
            logger.info("保存处理后的图片")
            output = io.BytesIO()
            
            # 使用更保守的JPEG保存参数
            save_params = {
                'format': 'JPEG',
                'quality': 85,
                'optimize': True,
                'progressive': True  # 渐进式JPEG
            }
            
            # 如果图片很小，提高质量
            if img.size[0] * img.size[1] < 100000:  # 小于100k像素
                save_params['quality'] = 95
                logger.info("小图片，提高JPEG质量到95")
            
            img.save(output, **save_params)
            result = output.getvalue()
            
            logger.info(f"图片预处理完成: 原始大小={len(content)}, 处理后大小={len(result)}")
            return result
            
    except Exception as e:
        logger.error(f"图片预处理失败: {str(e)}")
        logger.error(f"错误类型: {type(e).__name__}")
        logger.error(f"错误详情: {traceback.format_exc()}")
        
        # 提供更详细的错误信息
        if "cannot write mode" in str(e).lower():
            raise ValueError(f"图片格式不支持转换: {str(e)}")
        elif "decoder" in str(e).lower():
            raise ValueError(f"图片解码失败，可能文件损坏: {str(e)}")
        elif "truncated" in str(e).lower():
            raise ValueError(f"图片文件不完整: {str(e)}")
        else:
            raise ValueError(f"图片处理失败: {str(e)}") 