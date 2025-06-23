import { supabase } from './supabase';

// 使用相对路径，通过Vite代理访问API
const API_BASE = import.meta.env.PROD 
  ? (import.meta.env.VITE_API_BASE_URL || 'https://api.pawfect.ink') + '/api'  // 生产环境使用环境变量或默认值
  : '/api';  // 开发环境使用Vite代理

// 导出API_BASE供其他模块使用
export { API_BASE };

// 用于调试的辅助函数
const buildApiUrl = (endpoint: string) => {
  const url = `${API_BASE}${endpoint}`;
  console.log(`构建API URL: ${endpoint} -> ${url}`);
  return url;
};

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
    const apiUrl = buildApiUrl('/styles');
    const response = await fetch(apiUrl);
    
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
    console.log('=== 开始上传图片 ===');
    console.log('文件名:', file.name);
    console.log('文件类型:', file.type);
    console.log('文件大小:', file.size);
    console.log('当前环境:', import.meta.env.MODE);
    console.log('是否生产环境:', import.meta.env.PROD);
    console.log('API_BASE值:', API_BASE);
    
    const formData = new FormData();
    formData.append('image', file);
    
    // 检查用户认证状态
    const { data: sessionData } = await supabase.auth.getSession();
    console.log('当前认证状态:', !!sessionData.session);
    console.log('用户ID:', sessionData.session?.user?.id);
    
    const authHeaders = await getAuthHeadersForFormData();
    console.log('认证头信息:', Object.keys(authHeaders));
    
    // 检查是否获取到了认证令牌
    if (!authHeaders['Authorization']) {
      console.error('未获取到认证令牌，这将导致401错误');
      throw new Error('用户未登录或认证已过期，请重新登录');
    } else {
      console.log('认证令牌长度:', authHeaders['Authorization'].length);
    }
    
    const uploadUrl = buildApiUrl('/upload');
    console.log('开始发送上传请求...');
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
      headers: authHeaders,
      credentials: 'include'  // 包含凭证
    });

    console.log('上传请求发送完成');
    console.log('响应状态:', response.status, response.statusText);
    console.log('实际请求URL:', response.url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('上传失败, 服务器返回:', errorText);
      console.error('响应状态码:', response.status);
      
      // 根据状态码提供更具体的错误信息
      if (response.status === 401) {
        throw new Error('认证失败，请重新登录');
      } else if (response.status === 403) {
        throw new Error('权限不足，无法上传图片');
      } else if (response.status === 413) {
        throw new Error('文件太大，请选择小于10MB的图片');
      } else if (response.status === 404) {
        throw new Error('上传接口不存在，请检查服务器配置');
      } else {
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
    }

    const data = await response.json();
    console.log('上传成功，服务器返回:', data);
    
    if (!data.success) {
      throw new Error(data.message || '上传失败');
    }
    
    console.log('=== 上传完成 ===');
    return data;
  } catch (error) {
    console.error('=== 上传图片失败 ===');
    console.error('错误类型:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('错误信息:', error instanceof Error ? error.message : String(error));
    console.error('错误堆栈:', error instanceof Error ? error.stack : '无堆栈信息');
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
    const generateUrl = buildApiUrl('/generate/generate');
    console.log('请求体:', JSON.stringify(requestBody, null, 2));
    
    const authHeaders = await getAuthHeaders();
    
    // 发起生成请求
    const generateResponse = await fetch(generateUrl, {
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
      console.error('响应状态码:', generateResponse.status);
      
      // 尝试解析错误响应为JSON
      let errorDetail = '';
      try {
        // 尝试解析JSON错误响应
        const errorJson = JSON.parse(errorText);
        console.log('解析后的错误JSON:', errorJson);
        
        if (errorJson.detail) {
          // 如果是标准FastAPI错误格式
          errorDetail = typeof errorJson.detail === 'string' 
            ? errorJson.detail 
            : JSON.stringify(errorJson.detail);
        } else if (errorJson.message) {
          // 如果是自定义错误格式
          errorDetail = errorJson.message;
        } else {
          // 其他可能的格式
          errorDetail = JSON.stringify(errorJson);
        }
      } catch (parseError) {
        console.error('JSON解析失败:', parseError);
        // 如果无法解析JSON，使用原始错误文本
        errorDetail = errorText;
      }
      
      console.log('提取的错误信息:', errorDetail);
      console.log('错误信息是否包含Token不足:', errorDetail.includes('Token不足'));
      
      // 返回格式化的错误信息
      return {
        success: false,
        message: errorDetail || `请求失败 (${generateResponse.status})`
      };
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
    
    // 返回格式化的错误信息
    return {
      success: false,
      message: error instanceof Error ? error.message : '未知错误'
    };
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
    const statusUrl = buildApiUrl(`/status/${generationId}`);
    const statusResponse = await fetch(statusUrl);
    
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
    
    const statusUrl = buildApiUrl(`/generate/status/${generationId}`);
    const authHeaders = await getAuthHeaders();
    
    const response = await fetch(statusUrl, {
      headers: authHeaders
    });
    
    console.log('状态检查响应:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('状态检查错误响应:', errorText);
      
      // 尝试解析错误响应为JSON
      let errorDetail = '';
      try {
        // 尝试解析JSON错误响应
        const errorJson = JSON.parse(errorText);
        console.log('解析后的错误JSON:', errorJson);
        
        if (errorJson.detail) {
          // 如果是标准FastAPI错误格式
          errorDetail = typeof errorJson.detail === 'string' 
            ? errorJson.detail 
            : JSON.stringify(errorJson.detail);
        } else if (errorJson.message) {
          // 如果是自定义错误格式
          errorDetail = errorJson.message;
        } else {
          // 其他可能的格式
          errorDetail = JSON.stringify(errorJson);
        }
      } catch (parseError) {
        // 如果无法解析JSON，使用原始错误文本
        errorDetail = errorText;
      }
      
      console.log('提取的错误信息:', errorDetail);
      
      // 返回错误状态
      return {
        status: 'failed',
        error: errorDetail || `请求失败 (${response.status})`
      };
    }
    
    const data = await response.json();
    console.log('状态检查响应数据:', data);
    
    return data;
  } catch (error) {
    console.error('=== 检查生成状态失败 ===');
    console.error('错误详情:', error);
    
    // 返回错误状态
    return {
      status: 'failed',
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
};

/**
 * 获取用户的生成历史
 * @param {number} limit - 每页数量，默认10
 * @param {number} offset - 偏移量，默认0
 * @returns {Promise<Object>} 生成历史列表
 */
export const getGenerationHistory = async (limit: number = 10, offset: number = 0) => {
  try {
    console.log('=== 获取生成历史 ===');
    console.log('参数:', { limit, offset });
    
    const historyUrl = buildApiUrl(`/generate/history?limit=${limit}&offset=${offset}`);
    const authHeaders = await getAuthHeaders();
    
    const response = await fetch(historyUrl, {
      method: 'GET',
      headers: authHeaders,
      credentials: 'include'
    });

    console.log('历史记录请求响应状态:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('获取历史记录失败:', errorText);
      
      if (response.status === 401) {
        throw new Error('认证失败，请重新登录');
      } else if (response.status === 403) {
        throw new Error('权限不足');
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    const data = await response.json();
    console.log('历史记录数据:', data);
    
    if (!data.success) {
      throw new Error(data.message || '获取历史记录失败');
    }
    
    return data;
  } catch (error) {
    console.error('获取生成历史失败:', error);
    throw error;
  }
};
