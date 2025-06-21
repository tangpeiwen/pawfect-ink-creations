import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface GeneratorResultProps {
  loading: boolean;
  resultImage: string | null;
  onRegenerate: () => void;
  onConfirm: () => void;
}

const GeneratorResult = ({ loading, resultImage, onRegenerate, onConfirm }: GeneratorResultProps) => {
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  // 添加调试信息
  console.log('GeneratorResult 渲染状态:', {
    loading,
    resultImage,
    imageError,
    imageLoaded
  });

  const handleImageLoad = () => {
    console.log('图片加载成功:', resultImage);
    setImageLoaded(true);
    setImageError(null);
  };

  const handleImageError = (error: any) => {
    console.error('图片加载失败:', resultImage, error);
    setImageError(`图片加载失败: ${resultImage}`);
    setImageLoaded(false);
  };

  return (
    <div className="w-full">
      <h3 className="text-xl font-display font-bold mb-4">生成结果</h3>
      
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-8 min-h-[300px]">
              <div className="w-20 h-20 rounded-full bg-gradient-pet animate-pulse-soft flex items-center justify-center mb-4">
                <svg className="animate-spin text-white w-10 h-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-lg font-display font-medium text-center">AI正在为您生成宠物贴纸...</p>
              <p className="text-sm text-gray-500 text-center mt-2">这可能需要1-2分钟，请耐心等待</p>
            </div>
          ) : resultImage ? (
            <div className="p-4">
              <div className="relative w-full aspect-square max-w-md mx-auto mb-4">
                {imageError ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mb-2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <p className="text-sm text-gray-500 text-center">{imageError}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => {
                        setImageError(null);
                        setImageLoaded(false);
                      }}
                    >
                      重试加载
                    </Button>
                  </div>
                ) : (
                  <>
                    <img 
                      src={resultImage} 
                      alt="生成的宠物贴纸" 
                      className="w-full h-full object-contain rounded-lg"
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                      style={{ display: imageLoaded ? 'block' : 'none' }}
                    />
                    {!imageLoaded && (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                        <div className="animate-spin h-8 w-8 border-2 border-pet-pink border-t-transparent rounded-full"></div>
                      </div>
                    )}
                  </>
                )}
                
                {imageLoaded && !imageError && (
                  <a 
                    href={resultImage} 
                    download="pet-sticker.png"
                    className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-sm text-pet-pink p-2 rounded-full hover:bg-white transition-all"
                    title="下载图片"
                    onClick={(e) => {
                      e.stopPropagation();
                      toast.success("开始下载宠物贴纸");
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                  </a>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  className="bg-white border border-pet-pink text-pet-pink hover:bg-pet-pink/10"
                  onClick={onRegenerate}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
                  重新生成
                </Button>
                <Button 
                  className="pet-button"
                  onClick={onConfirm}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  确认使用
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 min-h-[300px] text-center">
              <p className="text-gray-500">上传照片并选择风格后，AI将在这里为您生成宠物贴纸</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneratorResult;
