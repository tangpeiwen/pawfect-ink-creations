import shutil
import os
from pathlib import Path
import uuid
import logging
import traceback
from fastapi import APIRouter, File, UploadFile, HTTPException, BackgroundTasks, status, Response
from app.core.config import settings
from app.models.schemas import UploadResponse, ErrorResponse
from app.utils.image_processing import validate_image, preprocess_image
from app.services.openai_service import analyze_pet_image
import io
import asyncio
from PIL import Image


router = APIRouter()
logger = logging.getLogger(__name__)

# 添加OPTIONS请求处理函数，处理CORS预检请求
@router.options("/upload")
async def options_upload(response: Response):
    """
    处理上传接口的OPTIONS请求（CORS预检请求）
    """
    print("接收到OPTIONS预检请求")
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:8080"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Accept"
    response.headers["Access-Control-Max-Age"] = "86400"  # 预检请求缓存24小时
    return {}

@router.post("/upload", response_model=UploadResponse, responses={
    400: {"model": ErrorResponse, "description": "无效的文件类型"},
    413: {"model": ErrorResponse, "description": "文件大小超出限制"},
    500: {"model": ErrorResponse, "description": "服务器错误"}
})
async def upload_image(
    image: UploadFile = File(...),
    background_tasks: BackgroundTasks = None,
    response: Response = None
):
    """
    上传宠物图片并进行预处理和分析
    """
    # 手动添加CORS头
    if response:
        response.headers["Access-Control-Allow-Origin"] = "http://localhost:8080"
        response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    
    print(f"开始处理上传图片: {image.filename}, 类型: {image.content_type}")
    print(f"请求头信息: {image.headers}")
    
    try:
        # 验证文件类型
        print(f"允许的文件类型: {settings.ALLOWED_IMAGE_TYPES}")
        
        # 创建唯一ID - 提前创建便于日志记录
        image_id = f"image_{uuid.uuid4()}"
        print(f"生成图片ID: {image_id}")
        
        # 文件类型检查
        if image.content_type not in settings.ALLOWED_IMAGE_TYPES:
            print(f"文件类型不支持: {image.content_type}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"不支持的文件类型: {image.content_type}，仅支持 {', '.join(settings.ALLOWED_IMAGE_TYPES)}"
            )
        
        # 确保目录存在，提前检查目录权限问题
        processed_dir = settings.PROCESSED_IMAGES_DIR
        print(f"处理图片目录: {processed_dir}, 是否存在: {processed_dir.exists()}")
        
        if not processed_dir.exists():
            print(f"创建目录: {processed_dir}")
            processed_dir.mkdir(parents=True, exist_ok=True)
            
        # 尝试文件写入权限测试
        try:
            test_file = processed_dir / "test_write.txt"
            with open(test_file, 'w') as f:
                f.write('test')
            os.remove(test_file)
            print("目录写入权限测试成功")
        except Exception as e:
            print(f"目录写入权限测试失败: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"存储目录写入权限错误: {str(e)}"
            )
        
        # 尝试读取图片内容
        try:
            print("读取上传的图片内容")
            content = await image.read()
            print(f"读取内容大小: {len(content)} 字节")
            
            # 测试内容是否为有效图片
            try:
                img_test = Image.open(io.BytesIO(content))
                print(f"图片预检成功: 模式={img_test.mode}, 尺寸={img_test.size}")
                # 不要关闭img_test，让它在测试后自动关闭
            except Exception as img_test_error:
                print(f"图片内容无效: {str(img_test_error)}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"上传的不是有效图片: {str(img_test_error)}"
                )
        except Exception as read_error:
            print(f"读取上传内容失败: {str(read_error)}")
            print(traceback.format_exc())
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"读取上传内容失败: {str(read_error)}"
            )
        
        # 设置处理后的图片路径
        processed_path = processed_dir / f"{image_id}.jpg"
        print(f"处理后的图片路径: {processed_path}")
        
        # 在后台处理图片
        def process_image_data():
            try:
                print("开始处理图片")
                with Image.open(io.BytesIO(content)) as img:
                    print(f"图片已打开，模式: {img.mode}, 尺寸: {img.size}")
                    
                    # 如果图片不是RGB模式，转换为RGB
                    if img.mode != 'RGB':
                        print(f"将图片从 {img.mode} 模式转换为 RGB 模式")
                        img = img.convert('RGB')
                    
                    # 保存处理后的图片
                    print(f"保存图片到: {processed_path}")
                    img.save(processed_path, 'JPEG', quality=85)
                    print(f"图片保存成功")
            except Exception as e:
                print(f"处理图片时出错: {str(e)}")
                print(traceback.format_exc())
                raise
        
        # 同步处理图片，方便调试
        print("处理图片")
        try:
            process_image_data()
        except Exception as process_error:
            print(f"处理图片失败: {str(process_error)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"处理图片失败: {str(process_error)}"
            )
        
        print("图片处理完成")
        
        # 返回处理后的图片URL
        return {
            "success": True,
            "imageId": image_id,
            "previewUrl": f"/storage/processed/{image_id}.jpg"
        }
        
    except HTTPException as he:
        print(f"HTTP异常: {he.detail}, 状态码: {he.status_code}")
        raise
    except Exception as e:
        # 记录并处理其他异常
        print(f"上传图片时出现未知错误: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"上传图片时出现错误: {str(e)}"
        ) 