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
        previewUrl="/storage/styles/watercolor.jpg",
        promptDescription="手绘笔触，蜡笔质感，涂鸦风格，粗线条勾勒，色彩鲜艳但有限，有轻微的不规则笔触纹理，突出宠物特征"
    ),
    Style(
        id="minimalist",
        name="粗线条手绘风",
        description="线条不规则，带有铅笔或炭笔质感",
        previewUrl="/storage/styles/minimalist.jpg",
        promptDescription="粗线条手绘效果，极其简约和扁平风格绘制。线条不规则，简约但具有表现力，有意的粗糙感，线条有力，突出宠物特征，没有任何阴影或阴影细节"
        # promptDescription="极其简约和扁平风格绘制，纯白背景上用粗黑线。宠物被描绘成非常小、可爱、卡通化，没有任何阴影或阴影细节。"
    ),
    Style(
        id="cartoon",
        name="Q版贴纸风",
        description="表情Q萌的卡通风格",
        previewUrl="/storage/styles/cartoon.jpg",
        promptDescription="Q版贴纸风格，简洁线条艺术，q版线稿，可爱清新风格，白色背景。扁平化设计插画，无阴影，不同角度表现，突出宠物特征，保留宠物颜色。"
    ),
    Style(
        id="detailed",
        name="细节写意风",
        description="细节刻画细腻,强烈线条感",
        previewUrl="/storage/styles/detailed.jpg",
        promptDescription="简洁线稿风格，只用轮廓线条勾勒，不填充颜色，线条清晰流畅，平面化设计，白色背景，线条感强但依旧保留简笔画风格，保留丰富体态结构，细节刻画细腻"
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