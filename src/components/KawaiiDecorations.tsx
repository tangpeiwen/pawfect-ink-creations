
import { Star, Circle, Heart } from "lucide-react";
import { useEffect, useState } from "react";

interface KawaiiDecorationsProps {
  count?: number;
  type?: 'bubbles' | 'stars' | 'mixed';
}

const KawaiiDecorations = ({ count = 8, type = 'mixed' }: KawaiiDecorationsProps) => {
  const [decorations, setDecorations] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    const newDecorations: React.ReactNode[] = [];
    
    for (let i = 0; i < count; i++) {
      const size = 10 + Math.random() * 40;
      const positionX = Math.random() * 100;
      const positionY = Math.random() * 100;
      const rotation = Math.random() * 45;
      const animationDelay = Math.random() * 3;
      
      const decorType = type === 'mixed' 
        ? Math.random() > 0.6 ? 'star' : Math.random() > 0.5 ? 'bubble' : 'heart'
        : type === 'stars' ? 'star' : 'bubble';
      
      const opacity = 0.1 + Math.random() * 0.3;
      
      if (decorType === 'bubble') {
        newDecorations.push(
          <div 
            key={`bubble-${i}`}
            className="kawaii-bubble animate-pulse-soft"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${positionX}%`,
              top: `${positionY}%`,
              opacity: opacity,
              animationDelay: `${animationDelay}s`,
            }}
          />
        );
      } else if (decorType === 'star') {
        newDecorations.push(
          <Star 
            key={`star-${i}`}
            className="kawaii-star animate-pulse-soft"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${positionX}%`,
              top: `${positionY}%`,
              transform: `rotate(${rotation}deg)`,
              opacity: opacity,
              animationDelay: `${animationDelay}s`,
            }}
            fill="#FEF7CD"
            stroke="#FEF7CD"
          />
        );
      } else {
        newDecorations.push(
          <Heart 
            key={`heart-${i}`}
            className="kawaii-decoration animate-bounce-small"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${positionX}%`,
              top: `${positionY}%`,
              transform: `rotate(${rotation}deg)`,
              opacity: opacity,
              animationDelay: `${animationDelay}s`,
              color: '#FFB7D0',
            }}
            fill="#FFB7D0"
            stroke="#FFB7D0"
          />
        );
      }
    }
    
    setDecorations(newDecorations);
  }, [count, type]);
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {decorations}
    </div>
  );
};

export default KawaiiDecorations;
