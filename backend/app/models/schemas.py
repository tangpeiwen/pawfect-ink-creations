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