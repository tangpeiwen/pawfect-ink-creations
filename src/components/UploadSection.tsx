import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface UploadSectionProps {
  onImageUploaded: (image: File) => void;
}

const UploadSection = ({ onImageUploaded }: UploadSectionProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    if (isProcessing) {
      toast.warning("正在处理上一张图片，请稍等");
      return;
    }

    const file = files[0];
    console.log('处理文件:', file.name, '类型:', file.type, '大小:', file.size);
    
    // 验证文件类型
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    
    if (!validTypes.includes(file.type)) {
      console.error('文件类型不支持:', file.type);
      toast.error("只支持JPG, PNG, WEBP格式的图片!");
      return;
    }
    
    // 验证文件大小
    if (file.size > 10 * 1024 * 1024) {
      console.error('文件大小超出限制:', file.size);
      toast.error("图片大小不能超过10MB!");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        console.log('预览图片生成成功');
        setPreviewImage(reader.result as string);
        setIsProcessing(false);
      };
      
      reader.onerror = () => {
        console.error('预览图片生成失败');
        toast.error("图片预览生成失败");
        setIsProcessing(false);
      };
      
      reader.readAsDataURL(file);
      
      // Call the callback
      console.log('调用onImageUploaded回调');
      onImageUploaded(file);
    } catch (error) {
      console.error('处理文件时出错:', error);
      toast.error("处理图片时出错");
      setIsProcessing(false);
    }
  };

  const onButtonClick = () => {
    if (isProcessing) {
      toast.warning("正在处理图片，请稍等");
      return;
    }
    
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const clearImage = () => {
    setPreviewImage(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      <Card className={`border-2 border-dashed p-4 rounded-2xl transition-all ${
        dragActive ? 'border-pet-pink bg-pet-pink/10' : 
        isProcessing ? 'border-blue-300 bg-blue-50' : 
        'border-gray-300'
      }`}>
        <CardContent className="p-4 flex flex-col items-center justify-center">
          {previewImage ? (
            <div className="relative w-full aspect-square max-w-md mx-auto">
              <img 
                src={previewImage} 
                alt="Preview" 
                className="w-full h-full object-cover rounded-xl"
              />
              <Button 
                className="absolute top-2 right-2 pet-button w-10 h-10 rounded-full p-0"
                onClick={clearImage}
                disabled={isProcessing}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </Button>
              {isProcessing && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-xl">
                  <div className="bg-white rounded-lg p-4 shadow-lg">
                    <div className="flex items-center space-x-2">
                      <svg className="animate-spin h-5 w-5 text-pet-pink" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-sm font-medium">处理中...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form
              className="flex flex-col items-center justify-center w-full h-64"
              onDragEnter={handleDrag}
              onSubmit={(e) => e.preventDefault()}
            >
              <input 
                ref={inputRef}
                type="file" 
                accept="image/jpeg,image/png,image/jpg,image/webp"
                className="hidden" 
                onChange={handleChange}
                disabled={isProcessing}
              />
              <div className="flex flex-col items-center justify-center p-4">
                <div className={`w-16 h-16 mb-4 rounded-full flex items-center justify-center transition-all ${
                  isProcessing ? 'bg-blue-500' : 'bg-pet-pink/20'
                }`}>
                  {isProcessing ? (
                    <svg className="animate-spin h-7 w-7 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-pet-pink" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/><line x1="16" x2="22" y1="5" y2="5"/><line x1="19" x2="19" y1="2" y2="8"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                  )}
                </div>
                <p className="text-lg font-display font-bold text-center">
                  {isProcessing ? "正在处理图片..." : "上传您的宠物照片"}
                </p>
                <p className="text-sm text-gray-500 text-center mt-1 mb-4">
                  {isProcessing ? "请稍等片刻" : "支持JPG, PNG, WEBP格式，最大10MB"}
                </p>
                <Button 
                  type="button"
                  className={`pet-button px-6 py-2 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={onButtonClick}
                  disabled={isProcessing}
                >
                  {isProcessing ? "处理中..." : "浏览照片"}
                </Button>
                {!isProcessing && (
                  <p className="text-sm text-gray-500 text-center mt-4">
                    或拖放图片到这里
                  </p>
                )}
              </div>
              {dragActive && !isProcessing && (
                <div
                  className="absolute inset-0 w-full h-full rounded-md"
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                ></div>
              )}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadSection;
