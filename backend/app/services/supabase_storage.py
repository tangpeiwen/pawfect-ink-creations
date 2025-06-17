import os
import logging
from typing import Optional, BinaryIO
from pathlib import Path
import uuid
from app.core.database import get_db_client
from fastapi import HTTPException, status

logger = logging.getLogger(__name__)

class SupabaseStorageService:
    """Supabase存储服务"""
    
    def __init__(self):
        self.client = get_db_client()
        self.bucket_name = "pawfect-images"  # 存储桶名称
    
    async def upload_user_image(self, file_content: bytes, file_extension: str = "jpg") -> tuple[str, str]:
        """
        上传用户图片到upload文件夹
        
        Args:
            file_content: 图片文件内容
            file_extension: 文件扩展名
            
        Returns:
            tuple[str, str]: (文件ID, 公共URL)
        """
        try:
            # 生成唯一文件名
            file_id = str(uuid.uuid4())
            file_path = f"upload/{file_id}.{file_extension}"
            
            # logger.info(f"准备上传文件到路径: {file_path}")
            # logger.info(f"使用的存储桶名称: {self.bucket_name}")
            
            # 上传到Supabase Storage
            response = self.client.storage.from_(self.bucket_name).upload(
                path=file_path,
                file=file_content,
                file_options={"content-type": f"image/{file_extension}"}
            )
            
            # logger.info(f"上传响应: {response}")
            
            # 检查Supabase响应是否有错误
            if hasattr(response, 'error') and response.error:
                logger.error(f"Supabase存储错误: {response.error}")
                raise Exception(f"上传失败: {response.error}")
            
            # 获取公共URL
            public_url_response = self.client.storage.from_(self.bucket_name).get_public_url(file_path)
            
            # 处理不同类型的URL响应
            if isinstance(public_url_response, str):
                public_url = public_url_response
            else:
                public_url = getattr(public_url_response, 'url', str(public_url_response))
            
            logger.info(f"用户图片上传成功: {file_path} -> {public_url}")
            return file_id, public_url
            
        except Exception as e:
            logger.error(f"上传用户图片失败: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"图片上传失败: {str(e)}"
            )
    
    async def upload_generated_image(self, file_content: bytes, generation_id: str, file_extension: str = "jpg") -> tuple[str, str]:
        """
        上传生成的图片到generation文件夹
        
        Args:
            file_content: 图片文件内容
            generation_id: 生成任务ID
            file_extension: 文件扩展名
            
        Returns:
            tuple[str, str]: (文件路径, 公共URL)
        """
        try:
            # 使用生成任务ID作为文件名
            file_path = f"generation/{generation_id}.{file_extension}"
            
            logger.info(f"准备上传生成图片到路径: {file_path}")
            
            # 上传到Supabase Storage
            response = self.client.storage.from_(self.bucket_name).upload(
                path=file_path,
                file=file_content,
                file_options={"content-type": f"image/{file_extension}"}
            )
            
            logger.info(f"生成图片上传响应: {response}")
            
            # 检查Supabase响应是否有错误
            if hasattr(response, 'error') and response.error:
                logger.error(f"Supabase存储错误: {response.error}")
                raise Exception(f"上传失败: {response.error}")
            
            # 获取公共URL
            public_url_response = self.client.storage.from_(self.bucket_name).get_public_url(file_path)
            
            # 处理不同类型的URL响应
            if isinstance(public_url_response, str):
                public_url = public_url_response
            else:
                public_url = getattr(public_url_response, 'url', str(public_url_response))
            
            logger.info(f"生成图片上传成功: {file_path} -> {public_url}")
            return file_path, public_url
            
        except Exception as e:
            logger.error(f"上传生成图片失败: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"生成图片上传失败: {str(e)}"
            )
    
    async def get_file_url(self, file_path: str) -> str:
        """
        获取文件的公共URL
        
        Args:
            file_path: 文件路径
            
        Returns:
            str: 公共URL
        """
        try:
            public_url = self.client.storage.from_(self.bucket_name).get_public_url(file_path)
            return public_url
        except Exception as e:
            logger.error(f"获取文件URL失败: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"获取文件URL失败: {str(e)}"
            )
    
    async def download_file(self, file_path: str) -> bytes:
        """
        下载文件内容
        
        Args:
            file_path: 文件路径
            
        Returns:
            bytes: 文件内容
        """
        try:
            response = self.client.storage.from_(self.bucket_name).download(file_path)
            if not response:
                raise Exception(f"File not found: {file_path}")
            return response
        except Exception as e:
            logger.error(f"下载文件失败: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"文件不存在或下载失败: {str(e)}"
            )
    
    async def delete_file(self, file_path: str) -> bool:
        """
        删除文件
        
        Args:
            file_path: 文件路径
            
        Returns:
            bool: 删除是否成功
        """
        try:
            response = self.client.storage.from_(self.bucket_name).remove([file_path])
            
            # 检查Supabase响应是否有错误
            if hasattr(response, 'error') and response.error:
                logger.error(f"删除文件失败: {response.error}")
                return False
            
            return True
        except Exception as e:
            logger.error(f"删除文件失败: {str(e)}")
            return False

# 创建全局存储服务实例
storage_service = SupabaseStorageService() 