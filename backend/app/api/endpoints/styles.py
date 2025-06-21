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
        previewUrl="/styles/watercolor.jpg",
        promptDescription="手绘笔触，蜡笔质感，涂鸦风格，粗线条勾勒，色彩鲜艳但有限，有轻微的不规则笔触纹理，突出宠物特征"
    ),
    Style(
        id="minimalist",
        name="粗线条手绘风",
        description="线条不规则，带有铅笔或炭笔质感",
        previewUrl="/styles/minimalist.jpg",
        promptDescription="粗线条手绘效果，极其简约和扁平风格绘制。线条不规则，简约但具有表现力，有意的粗糙感，线条有力，突出宠物特征，没有任何阴影或阴影细节"
        # promptDescription="极其简约和扁平风格绘制，纯白背景上用粗黑线。宠物被描绘成非常小、可爱、卡通化，没有任何阴影或阴影细节。"
    ),
    Style(
        id="ghibli",
        name="吉卜力风",
        description="吉卜力风，温馨治愈的动画风格",
        previewUrl="/styles/ghibli.png",
        promptDescription="吉卜力风格，采用宫崎骏动画的艺术风格，整体风格温馨治愈，充满童真色彩。"
    ),
    Style(
        id="sanrio",
        name="Q版卡通风",
        description="三丽鸥风格，可爱卡通的日系风格",
        previewUrl="/styles/sanrio.jpg",
        promptDescription="Sanrio风格，采用Hello Kitty等经典卡通角色的艺术风格，线条简洁可爱，具有日系卡通的萌系特质，充满童趣和温暖感。"
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