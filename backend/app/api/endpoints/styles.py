from fastapi import APIRouter, HTTPException, status
from app.models.schemas import StylesResponse, Style
from app.core.config import settings
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# 预定义的风格列表
STYLES = [
    Style(
        id="watercolor",
        name="蜡笔插画风",
        description="线条较粗，手绘感强，保留可爱氛围",
        previewUrl="/storage/styles/彩色.jpg",
        promptDescription="手绘笔触，蜡笔质感，涂鸦风格，粗线条勾勒，色彩鲜艳但有限，有轻微的不规则笔触纹理"
    ),
    Style(
        id="minimalist",
        name="粗线条手绘风",
        description="线条不规则，带有铅笔或炭笔质感",
        previewUrl="/storage/styles/简笔.jpg",
        promptDescription="粗线条手绘效果，线条不规则，带有铅笔或炭笔质感，简约但具有表现力，有意的粗糙感，线条有力"
    ),
    Style(
        id="cartoon",
        name="Q版贴纸风",
        description="表情Q萌的卡通风格",
        previewUrl="/storage/styles/卡通.jpg",
        promptDescription="Q版贴纸风格，简笔画线稿，手绘可爱效果，略微夸张的特征，不要有贴纸的白边，保留宠物的颜色"
    ),
    Style(
        id="detailed",
        name="细节写意风",
        description="保留丰富体态结构，细节刻画细腻",
        previewUrl="/storage/styles/花纹.jpg",
        promptDescription="简洁线稿风格，只用轮廓线条勾勒，不填充颜色，不添加阴影，线条清晰流畅，线条粗细变化，平面化设计，白色背景，黑色线条，类似简笔画插图风格"
    )
]

@router.get("/styles", response_model=StylesResponse)
async def get_styles():
    """
    获取所有可用的生成风格
    """
    try:
        return {
            "success": True,
            "styles": STYLES
        }
    except Exception as e:
        logger.error(f"获取风格列表时出错: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取风格列表时出现内部错误"
        )
        
@router.get("/styles/{style_id}", response_model=Style)
async def get_style(style_id: str):
    """
    获取特定ID的风格详情
    """
    try:
        style = next((s for s in STYLES if s.id == style_id), None)
        if not style:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"未找到ID为 {style_id} 的风格"
            )
        return style
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取风格 {style_id} 时出错: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="获取风格详情时出现内部错误"
        ) 