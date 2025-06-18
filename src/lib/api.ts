import { supabase } from './supabase';

// 使用相对路径，通过Vite代理访问API
const API_BASE = '/api';

/**
 * 获取认证头信息
 */
const getAuthHeaders = async () => {
  const { data } = await supabase.auth.getSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  if (data.session?.access_token) {
    headers['Authorization'] = `Bearer ${data.session.access_token}`;
  }
  
  return headers;
};

/**
 * 获取包含认证信息的FormData请求头（不包含Content-Type）
 */
const getAuthHeadersForFormData = async () => {
  const { data } = await supabase.auth.getSession();
  const headers: Record<string, string> = {};
  
  if (data.session?.access_token) {
    headers['Authorization'] = `Bearer ${data.session.access_token}`;
  }
  
  return headers;
};

/**
 * 获取所有风格列表
 * @returns {Promise<Array>} 风格列表
 */
export const fetchStyles = async () => {
  try {
    const response = await fetch(`${API_BASE}/styles`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || '获取风格列表失败');
    }
    
    return data.styles;
  } catch (error) {
    console.error('获取风格列表失败:', error);
    throw error;
  }
};

/**
 * 上传宠物图片
 * @param {File} file - 要上传的文件
 * @returns {Promise<Object>} 上传结果，包含imageId和分析结果
 */
export const uploadImage = async (file: File) => {
  try {
    console.log('开始上传图片:', file.name, '类型:', file.type, '大小:', file.size);
    
    const formData = new FormData();
    formData.append('image', file);
    
    const authHeaders = await getAuthHeadersForFormData();
    console.log('认证头信息:', JSON.stringify(authHeaders));
    
    // 检查是否获取到了认证令牌
    if (!authHeaders['Authorization']) {
      console.warn('警告: 未获取到认证令牌，这可能导致401错误');
    } else {
      console.log('已设置认证令牌 (长度):', authHeaders['Authorization'].length);
    }
    
    console.log('通过Vite代理上传图片');
    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
      headers: authHeaders,
      credentials: 'include'  // 包含凭证
    });

    console.log('上传响应状态:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('上传失败, 服务器返回:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log('上传成功，服务器返回:', data);
    
    if (!data.success) {
      throw new Error(data.message || '上传失败');
    }
    
    return data;
  } catch (error) {
    console.error('上传图片失败:', error);
    throw error;
  }
};

/**
 * 定义生成贴纸的返回结果接口
 */
interface GenerateStickerResult {
  success: boolean;
  images?: string[];
  generationId?: string;
  message?: string;
}

/**
 * 生成宠物贴纸
 * @param {string} imageId - 已上传图片的ID
 * @param {string} styleId - 选择的风格ID
 * @param {Array<string>} emphasisFeatures - 需要强调的预设特征
 * @param {Array<string>} customFeatures - 自定义特征
 * @param {Array<string>} additionalElements - 额外添加的元素
 * @returns {Promise<GenerateStickerResult>} 生成结果
 */
export const generateSticker = async (
  imageId: string, 
  styleId: string, 
  emphasisFeatures: string[], 
  customFeatures: string[], 
  additionalElements: string[]
): Promise<GenerateStickerResult> => {
  try {
    const requestBody = {
      imageId,
      styleId,
      emphasisFeatures,
      customFeatures,
      additionalElements
    };
    
    console.log('=== generateSticker API调用 ===');
    console.log('请求URL:', `${API_BASE}/generate`);
    console.log('请求体:', JSON.stringify(requestBody, null, 2));
    
    const authHeaders = await getAuthHeaders();
    
    // 发起生成请求
    const generateResponse = await fetch(`${API_BASE}/generate`, {
      method: 'POST',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('响应状态:', generateResponse.status, generateResponse.statusText);
    
    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      console.error('API错误响应:', errorText);
      throw new Error(`HTTP error! status: ${generateResponse.status}, message: ${errorText}`);
    }

    const generateData = await generateResponse.json();
    console.log('API响应数据:', generateData);
    
    if (!generateData.success) {
      throw new Error(generateData.message || '生成请求失败');
    }
    
    // 如果后端直接返回了结果URL，则使用它
    if (generateData.resultUrl) {
      return {
        success: true,
        images: [generateData.resultUrl]
      };
    }
    
    // 如果后端返回了生成任务ID，则记录它
    const generationId = generateData.generationId;
    
    // 检查是否立即返回结果或开始轮询
    if (generateData.status === 'completed' && generateData.resultUrl) {
      // 直接返回结果
      return {
        success: true,
        images: [generateData.resultUrl]
      };
    } else {
      // 返回任务ID，由调用方决定是否轮询
      return {
        success: true,
        generationId: generationId
      };
    }
  } catch (error) {
    console.error('=== generateSticker API调用失败 ===');
    console.error('错误详情:', error);
    throw error;
  }
};

/**
 * 轮询生成任务状态
 * @param {string} generationId - 生成任务ID
 * @returns {Promise<Object>} 生成结果
 */
const pollGenerationStatus = async (generationId: string) => {
  const maxAttempts = 60; // 最多尝试60次，约10分钟
  const interval = 10000; // 每10秒轮询一次
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const statusResponse = await fetch(`${API_BASE}/status/${generationId}`);
    
    if (!statusResponse.ok) {
      throw new Error(`获取生成状态失败: HTTP error! status: ${statusResponse.status}`);
    }
    
    const statusData = await statusResponse.json();
    
    // 检查任务状态
    if (statusData.status === 'completed') {
      // 任务完成，返回结果
      return {
        success: true,
        images: [statusData.resultUrl]
      };
    } else if (statusData.status === 'failed') {
      // 任务失败
      throw new Error(statusData.error || '生成任务失败');
    }
    
    // 任务仍在进行中，等待一段时间后再次检查
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  // 超过最大尝试次数，认为任务失败
  throw new Error('生成任务超时');
};

/**
 * 检查生成任务状态
 * @param {string} generationId - 生成任务ID
 * @returns {Promise<Object>} 状态信息，包含status, progress, resultUrl, error等字段
 */
export const checkGenerationStatus = async (generationId: string) => {
  try {
    console.log('=== 检查生成状态 ===');
    console.log('generationId:', generationId);
    console.log('请求URL:', `${API_BASE}/status/${generationId}`);
    
    const authHeaders = await getAuthHeaders();
    
    const response = await fetch(`${API_BASE}/status/${generationId}`, {
      headers: authHeaders
    });
    
    console.log('状态检查响应:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('状态检查错误响应:', errorText);
      throw new Error(`获取生成状态失败: HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('状态检查响应数据:', data);
    
    return data;
  } catch (error) {
    console.error('=== 检查生成状态失败 ===');
    console.error('错误详情:', error);
    throw error;
  }
};
