from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field, validator
from datetime import datetime
import uuid

# 基础响应模型
class BaseResponse(BaseModel):
    success: bool = True
    message: Optional[str] = None

# 上传响应模型
class UploadResponse(BaseResponse):
    imageId: str
    previewUrl: str
    analysis: Optional[str] = None

# 风格模型
class Style(BaseModel):
    id: str
    name: str
    description: str
    previewUrl: str
    promptDescription: str

# 风格列表响应
class StylesResponse(BaseResponse):
    styles: List[Style]

# 特征模型
class Feature(BaseModel):
    id: str
    name: str
    description: str

# 特征列表响应
class FeaturesResponse(BaseResponse):
    features: List[Feature]

# 生成请求模型
class GenerationRequest(BaseModel):
    imageId: str
    styleId: str
    emphasisFeatures: Optional[List[str]] = Field(default_factory=list)
    customFeatures: Optional[List[str]] = Field(default_factory=list)
    additionalElements: Optional[List[str]] = Field(default_factory=list)
    
    @validator('emphasisFeatures', 'customFeatures', 'additionalElements', pre=True)
    def ensure_list(cls, v):
        if v is None:
            return []
        return v

# 生成响应模型
class GenerationResponse(BaseResponse):
    status: str = "pending"
    generationId: str
    resultUrl: Optional[str] = None

# 生成状态响应模型
class GenerationStatusResponse(BaseModel):
    status: Literal["pending", "processing", "completed", "failed"]
    progress: int = 0
    resultUrl: Optional[str] = None
    error: Optional[str] = None

# 错误响应模型
class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    detail: Optional[Dict[str, Any]] = None

# 内部使用的生成任务模型
class GenerationTask(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    imageId: str
    styleId: str
    emphasisFeatures: List[str] = Field(default_factory=list)
    customFeatures: List[str] = Field(default_factory=list)
    additionalElements: List[str] = Field(default_factory=list)
    status: Literal["pending", "processing", "completed", "failed"] = "pending"
    progress: int = 0
    resultUrl: Optional[str] = None
    error: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.now)
    updatedAt: datetime = Field(default_factory=datetime.now)

# ==================== 数据库模型 ====================

# 用户资料模型
class UserProfileCreate(BaseModel):
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    subscription_tier: Literal['free', 'premium', 'pro'] = 'free'
    tokens_remaining: int = 500

class UserProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    subscription_tier: Optional[Literal['free', 'premium', 'pro']] = None
    tokens_remaining: Optional[int] = None

class UserProfile(BaseModel):
    id: str
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    subscription_tier: str = 'free'
    tokens_remaining: int = 500
    total_generations: int = 0
    created_at: datetime
    updated_at: datetime

# 上传图片模型
class UploadedImageCreate(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    original_filename: str
    file_size: int
    mime_type: str
    storage_path: str
    preview_path: Optional[str] = None
    upload_status: Literal['uploading', 'completed', 'failed'] = 'completed'
    metadata: Dict[str, Any] = Field(default_factory=dict)

class UploadedImageUpdate(BaseModel):
    preview_path: Optional[str] = None
    upload_status: Optional[Literal['uploading', 'completed', 'failed']] = None

class UploadedImage(BaseModel):
    id: str
    user_id: str
    original_filename: str
    file_size: int
    mime_type: str
    storage_path: str
    preview_path: Optional[str] = None
    upload_status: str = 'completed'
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime

# 生成任务模型
class GenerationCreate(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    uploaded_image_id: str
    style_id: str
    emphasis_features: List[str] = Field(default_factory=list)
    custom_features: List[str] = Field(default_factory=list)
    additional_elements: List[str] = Field(default_factory=list)
    status: Literal['pending', 'processing', 'completed', 'failed'] = 'pending'
    progress: int = 0
    title: Optional[str] = None

class GenerationUpdate(BaseModel):
    status: Optional[Literal['pending', 'processing', 'completed', 'failed']] = None
    progress: Optional[int] = None
    error_message: Optional[str] = None
    title: Optional[str] = None
    is_public: Optional[bool] = None
    started_at: Optional[str] = None
    completed_at: Optional[str] = None

class Generation(BaseModel):
    id: str
    user_id: str
    uploaded_image_id: str
    style_id: str
    emphasis_features: List[str] = Field(default_factory=list)
    custom_features: List[str] = Field(default_factory=list)
    additional_elements: List[str] = Field(default_factory=list)
    status: str = 'pending'
    progress: int = 0
    error_message: Optional[str] = None
    title: Optional[str] = None
    is_public: bool = False
    likes_count: int = 0
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

# 生成结果模型
class GenerationResultCreate(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    generation_id: str
    result_url: str
    file_size: Optional[int] = None
    image_analysis: Optional[str] = None
    generation_prompt: Optional[str] = None
    api_response_data: Dict[str, Any] = Field(default_factory=dict)

class GenerationResult(BaseModel):
    id: str
    generation_id: str
    result_url: str
    file_size: Optional[int] = None
    image_analysis: Optional[str] = None
    generation_prompt: Optional[str] = None
    api_response_data: Dict[str, Any] = Field(default_factory=dict)
    is_selected: bool = False
    created_at: datetime

class OrderCreate(BaseModel):
    package_id: str

class OrderResponse(BaseModel):
    id: str
    user_id: str
    package_id: str
    amount: int
    token_amount: int
    status: str
    payment_method: Optional[str] = None
    payment_id: Optional[str] = None
    extra: Optional[Dict] = None
    created_at: datetime
    paid_at: Optional[datetime] = None
    error_message: Optional[str] = None

class OrderCreateResponse(BaseModel):
    """订单创建响应，包含支付信息"""
    id: str
    user_id: str
    package_id: str
    amount: int
    token_amount: int
    status: str
    payment_method: Optional[str] = None
    payment_id: Optional[str] = None
    extra: Optional[Dict] = None
    created_at: datetime
    paid_at: Optional[datetime] = None
    error_message: Optional[str] = None
    
    # 支付相关字段（PC端）
    pay_url: Optional[str] = None
    qr_code: Optional[str] = None
    qr_img: Optional[str] = None
    
    # 支付表单（移动端）
    payment_form: Optional[Dict] = None 