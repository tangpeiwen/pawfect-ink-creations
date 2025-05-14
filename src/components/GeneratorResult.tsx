import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { RefreshCw, Check } from "lucide-react";

interface GeneratorResultProps {
  loading: boolean;
  resultImage: string | null;
  onRegenerate: () => void;
  onConfirm: () => void;
}

const GeneratorResult = ({ loading, resultImage, onRegenerate, onConfirm }: GeneratorResultProps) => {
  return (
    <div className="w-full">
      <h3 className="text-xl font-sketch font-bold mb-4 sketch-title">生成结果</h3>
      
      <div className="sketch-card">
        <div className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-8 min-h-[300px]">
              <div className="w-24 h-24 border-2 border-sketch-ink relative flex items-center justify-center mb-4">
                <div className="absolute inset-0 animate-pulse-soft bg-sketch-accent/20"></div>
                <svg className="animate-spin text-sketch-ink w-12 h-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" fill="none">
                  <path d="M10,10 L90,10 L90,90 L10,90 Z" stroke="#393535" strokeWidth="1" strokeDasharray="5,5" className="animate-draw" style={{animationDelay: "0.5s"}} />
                </svg>
              </div>
              <p className="text-lg font-sketch font-medium text-center">AI正在为您生成纹身贴图案...</p>
              <p className="text-sm text-sketch-ink/70 text-center mt-2 font-handwriting">这可能需要10-30秒，请耐心等待</p>
            </div>
          ) : resultImage ? (
            <div className="p-4">
              <div className="relative w-full aspect-square max-w-md mx-auto mb-8 border-2 border-sketch-ink">
                <img 
                  src={resultImage} 
                  alt="生成的纹身贴" 
                  className="w-full h-full object-contain"
                />
                
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" fill="none">
                  <path d="M5,5 L95,5 L95,95 L5,95 Z" stroke="#393535" strokeWidth="1" strokeDasharray="4,4" className="animate-draw" style={{animationDelay: "0.3s"}} />
                </svg>
              </div>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button 
                  className="sketch-button"
                  onClick={onRegenerate}
                >
                  <RefreshCw className="mr-2 h-5 w-5" />
                  重新生成
                </Button>
                <Button 
                  className="sketch-button-primary"
                  onClick={onConfirm}
                >
                  <Check className="mr-2 h-5 w-5" />
                  确认使用
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 min-h-[300px] text-center border-2 border-dashed border-sketch-ink/50">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" stroke="#393535" strokeWidth="2" strokeLinecap="round" strokeDasharray="4,2" className="animate-draw" />
                <path d="M9 15 L15 9" stroke="#393535" strokeWidth="2" strokeLinecap="round" className="animate-draw" style={{animationDelay: "0.5s"}} />
                <path d="M9.5 9H15v5.5" stroke="#393535" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-draw" style={{animationDelay: "1s"}} />
              </svg>
              <p className="text-sketch-ink/70 mt-4 font-handwriting">上传照片并选择风格后，AI将在这里为您生成纹身贴图案</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeneratorResult;
