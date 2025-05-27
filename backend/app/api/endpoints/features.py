from fastapi import APIRouter, HTTPException, status
from app.models.schemas import FeaturesResponse, Feature
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# 预定义的特征列表
FEATURES = [
    Feature(
        id="eyes",
        name="眼睛",
        description="突出宠物的眼神特点"
    ),
    Feature(
        id="ears",
        name="耳朵",
        description="强调宠物耳朵的形状"
    ),
    Feature(
        id="nose",
        name="鼻子",
        description="展现鼻子的特征"
    ),
    Feature(
        id="fur",
        name="毛发",
        description="突出毛发的纹理和特点"
    ),
    Feature(
        id="posture",
        name="姿势",
        description="保留宠物特有的姿势"
    ),
    Feature(
        id="expression",
        name="表情",
        description="捕捉宠物独特的表情"
    )
]

@router.get("/feature-options", response_model=FeaturesResponse)
async def get_features():
    """
    获取所有可用的强调特征选项
    """
    try:
        return {
            "success": True,
            "features": FEATURES
        }
    except Exception as e:
        logger.error(f"获取特征列表时出错: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取特征列表时出现内部错误"
        ) 