/**
 * OpenAI API服务 - 前端接口
 * 连接到后端API服务进行宠物图片分析和贴纸生成
 */
import { uploadImage, generateSticker } from '@/lib/api';

/**
 * 使用OpenAI GPT-4V分析宠物图片
 * @param imageFile 宠物图片文件
 * @returns Promise<string> 分析结果
 */
export const analyzePetImage = async (imageFile: File): Promise<string> => {
  try {
    // 调用上传接口，将宠物图片上传到后端
    const uploadResult = await uploadImage(imageFile);
    
    if (!uploadResult.success) {
      throw new Error(uploadResult.message || '上传失败');
    }
    
    // 返回上传接口中包含的分析结果
    return uploadResult.analysis || '未能获取分析结果';
  } catch (error) {
    console.error('分析宠物图片失败:', error);
    throw error;
  }
};

/**
 * 接口定义：生成贴纸的响应
 */
interface GenerateStickerResponse {
  success: boolean;
  images: string[];
  imagesBase64?: string[];
}

/**
 * 生成宠物贴纸图片
 * @param imageFile 原始宠物图片
 * @param styleId 风格ID，用于后端查找对应的参考图片
 * @param stylePrompt 风格描述
 * @param features 需要强调的特征
 * @param additionalElements 额外添加的元素
 * @returns Promise<string[]> 生成的图片URL数组
 */
export const generatePetStickers = async (
  imageFile: File,
  styleId: string,
  stylePrompt: string,
  features: string[],
  additionalElements: string[]
): Promise<string[]> => {
  try {
    // 首先上传图片
    const uploadResult = await uploadImage(imageFile);
    
    if (!uploadResult.success || !uploadResult.imageId) {
      throw new Error(uploadResult.message || '上传失败');
    }
    
    const imageId = uploadResult.imageId;
    
    // 将中文特征转换为英文ID
    const featureMapping: { [key: string]: string } = {
      '眼睛': 'eyes',
      '耳朵': 'ears',
      '鼻子': 'nose',
      '毛发': 'fur',
      '姿势': 'posture',  // 注意：这里改为posture以匹配后端
      '表情': 'expression'
    };
    
    // 转换中文特征为英文特征ID
    const englishFeatures = features.map(f => featureMapping[f] || f);
    
    // 拆分特征，区分预设特征和自定义特征
    const standardFeatures = englishFeatures.filter(f => 
      ['eyes', 'ears', 'nose', 'fur', 'posture', 'expression'].includes(f)
    );
    
    const customFeatures = features.filter(f => 
      !['眼睛', '耳朵', '鼻子', '毛发', '姿势', '表情'].includes(f)
    );
    
    // 调用生成接口
    const generateResult = await generateSticker(
      imageId,
      styleId,
      standardFeatures,
      customFeatures,
      additionalElements
    );
    
    if (!generateResult.success) {
      throw new Error('生成失败');
    }
    
    // 显示进度、轮询状态等信息
    console.log('生成任务已创建，正在等待结果...');
    
    // 如果返回generationId，则直接返回它
    if (generateResult.generationId) {
      return [`generationId:${generateResult.generationId}`];
    }
    
    // 否则返回图片URL数组
    return generateResult.images || [];
  } catch (error) {
    console.error('生成宠物贴纸失败:', error);
    throw error;
  }
}; 