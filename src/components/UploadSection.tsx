
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
    const file = files[0];
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    
    if (!validTypes.includes(file.type)) {
      toast.error("只支持JPG, PNG, WEBP格式的图片!");
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error("图片大小不能超过10MB!");
      return;
    }
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Call the callback
    onImageUploaded(file);
  };

  const onButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      <Card className={`border-2 border-dashed p-4 rounded-2xl transition-all ${dragActive ? 'border-pet-pink bg-pet-pink/10' : 'border-gray-300'}`}>
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
                onClick={() => {
                  setPreviewImage(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </Button>
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
              />
              <div className="flex flex-col items-center justify-center p-4">
                <div className="w-16 h-16 mb-4 rounded-full bg-pet-pink/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-pet-pink" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/><line x1="16" x2="22" y1="5" y2="5"/><line x1="19" x2="19" y1="2" y2="8"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                </div>
                <p className="text-lg font-display font-bold text-center">上传您的宠物照片</p>
                <p className="text-sm text-gray-500 text-center mt-1 mb-4">
                  支持JPG, PNG, WEBP格式，最大10MB
                </p>
                <Button 
                  type="button"
                  className="pet-button px-6 py-2"
                  onClick={onButtonClick}
                >
                  浏览照片
                </Button>
                <p className="text-sm text-gray-500 text-center mt-4">
                  或拖放图片到这里
                </p>
              </div>
              {dragActive && (
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
