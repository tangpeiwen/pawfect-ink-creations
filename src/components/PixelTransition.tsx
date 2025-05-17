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
  animationStepDuration = 0.2,
  className = "",
}) => {
  const [showFirst, setShowFirst] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const pixelsRef = useRef<HTMLDivElement[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const startTransition = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const pixels = pixelsRef.current;
    const shuffledPixels = [...pixels].sort(() => Math.random() - 0.5);
    
    const totalDuration = animationStepDuration * 1000 + (pixels.length * (animationStepDuration * 1000 / pixels.length));

    shuffledPixels.forEach((pixel, index) => {
      if (!pixel) return;
      pixel.style.transition = `transform ${animationStepDuration}s ease-in-out`;
      pixel.style.transitionDelay = `${index * (animationStepDuration / pixels.length)}s`;
      pixel.style.transform = showFirst ? "scale(0)" : "scale(1)";
    });

    timeoutRef.current = setTimeout(() => {
      setShowFirst(prev => !prev);
      setIsAnimating(false);
    }, totalDuration);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      startTransition();
    }, 5000);

    return () => {
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
      <div 
        className={`absolute inset-0 transition-opacity duration-300 ${
          showFirst ? "opacity-100 z-20" : "opacity-0 z-10"
        }`}
      >
        {firstContent}
      </div>
      <div 
        className={`absolute inset-0 transition-opacity duration-300 ${
          !showFirst ? "opacity-100 z-20" : "opacity-0 z-10"
        }`}
      >
        {secondContent}
      </div>
      <div
        className="absolute inset-0 z-30 pointer-events-none"
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
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default PixelTransition; 