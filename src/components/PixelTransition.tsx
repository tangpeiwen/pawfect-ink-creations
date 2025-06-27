import React, { useEffect, useRef, useState } from "react";

interface PixelTransitionProps {
  firstContent: React.ReactNode;
  secondContent: React.ReactNode;
  gridSize?: number;
  pixelColor?: string;
  animationStepDuration?: number;
  className?: string;
}

const PixelTransition: React.FC<PixelTransitionProps> = ({
  firstContent,
  secondContent,
  gridSize = 12,
  pixelColor = "#ffffff",
  animationStepDuration = 0.4,
  className = "",
}) => {
  const [showFirst, setShowFirst] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const pixelsRef = useRef<HTMLDivElement[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const startTransition = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    const pixels = pixelsRef.current.filter(Boolean);
    
    // 创建随机顺序
    const shuffledPixels = [...pixels].sort(() => Math.random() - 0.5);
    
    // 先让所有像素变为透明（显示下层内容）
    shuffledPixels.forEach((pixel, index) => {
      if (!pixel) return;
      
      setTimeout(() => {
        pixel.style.transform = "scale(0)";
      }, index * (animationStepDuration * 1000 / pixels.length));
    });

    // 动画完成后切换内容并重置像素
    timeoutRef.current = setTimeout(() => {
      setShowFirst(prev => !prev);
      
      // 重置所有像素为可见状态
      pixels.forEach(pixel => {
        if (pixel) {
          pixel.style.transform = "scale(1)";
        }
      });
      
      setIsTransitioning(false);
    }, animationStepDuration * 1000);
  };

  useEffect(() => {
    // 初始显示完整图片，延迟后开始第一次过渡
    const firstTransitionDelay = setTimeout(() => {
      startTransition();
    }, 3000); // 3秒后开始第一次过渡

    // 设置定期过渡
    const interval = setInterval(() => {
      startTransition();
    }, 5000); // 每6秒过渡一次

    return () => {
      clearTimeout(firstTransitionDelay);
      clearInterval(interval);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${className}`}
      ref={containerRef}
    >
      {/* 第一个内容 */}
      <div 
        className={`absolute inset-0 transition-opacity duration-300 ${
          showFirst ? "opacity-100 z-20" : "opacity-0 z-10"
        }`}
      >
        {firstContent}
      </div>
      
      {/* 第二个内容 */}
      <div 
        className={`absolute inset-0 transition-opacity duration-300 ${
          !showFirst ? "opacity-100 z-20" : "opacity-0 z-10"
        }`}
      >
        {secondContent}
      </div>
      
      {/* 像素网格覆盖层 - 只在过渡时显示 */}
      <div
        className={`absolute inset-0 z-30 pointer-events-none transition-opacity duration-200 ${
          isTransitioning ? "opacity-100" : "opacity-0"
        }`}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gap: "1px",
        }}
      >
        {Array.from({ length: gridSize * gridSize }).map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) pixelsRef.current[i] = el;
            }}
            style={{
              backgroundColor: pixelColor,
              transform: "scale(1)",
              transition: `transform ${animationStepDuration}s ease-out`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default PixelTransition; 