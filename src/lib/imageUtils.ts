/**
 * 图片处理工具函数
 */

/**
 * 将图片压缩到指定最大尺寸
 * @param file 原始图片文件
 * @param maxDimension 最大尺寸（宽或高）
 * @returns Promise<Blob> 压缩后的图片Blob
 */
export const compressImage = async (
  file: File,
  maxDimension: number = 800
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        // 计算调整后的尺寸，保持宽高比
        let width = img.width;
        let height = img.height;
        
        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
        
        // 创建canvas并绘制调整大小后的图像
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('无法创建Canvas上下文'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // 将canvas转换为blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('无法创建Blob'));
            }
          },
          file.type,
          0.8  // 质量参数，0.8通常是良好的压缩比
        );
      };
      
      img.onerror = () => {
        reject(new Error('图片加载失败'));
      };
    };
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };
  });
};

/**
 * 将Blob转换为Base64字符串
 * @param blob 图片Blob
 * @returns Promise<string> Base64编码的字符串
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    
    reader.onload = () => {
      const base64String = reader.result as string;
      // 移除Data URL前缀，只保留纯Base64部分
      const base64Content = base64String.split(',')[1];
      resolve(base64Content);
    };
    
    reader.onerror = () => {
      reject(new Error('Base64转换失败'));
    };
  });
};

/**
 * 将File直接转换为Base64字符串
 * @param file 图片文件
 * @returns Promise<string> Base64编码的字符串
 */
export const fileToBase64 = async (file: File): Promise<string> => {
  const compressedImage = await compressImage(file);
  return blobToBase64(compressedImage);
}; 