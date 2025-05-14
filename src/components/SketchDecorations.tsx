
import React from 'react';
import { cn } from '@/lib/utils';

type SketchDecorationType = 'stars' | 'lines' | 'dots' | 'squiggles' | 'mixed';

interface SketchDecorationsProps {
  type?: SketchDecorationType;
  count?: number;
  className?: string;
}

const SketchDecorations: React.FC<SketchDecorationsProps> = ({
  type = 'mixed',
  count = 10,
  className,
}) => {
  // Create random positions for decorations
  const items = Array(count).fill(null).map((_, index) => {
    const randomPosition = {
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      transform: `rotate(${Math.random() * 360}deg)`,
      opacity: 0.2 + Math.random() * 0.8,
      animationDelay: `${Math.random() * 2}s`,
    };
    
    return { id: index, ...randomPosition };
  });

  const renderDecoration = (itemId: number) => {
    // Choose decoration type based on prop or randomly if mixed
    const decorationType = type === 'mixed' 
      ? ['stars', 'lines', 'dots', 'squiggles'][itemId % 4] 
      : type;

    switch (decorationType) {
      case 'stars':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sketch-decoration">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="sketch-line" />
          </svg>
        );
      case 'lines':
        // Random line length and direction
        const length = 20 + Math.random() * 30;
        const x2 = Math.cos(Math.random() * Math.PI * 2) * length;
        const y2 = Math.sin(Math.random() * Math.PI * 2) * length;
        
        return (
          <svg width={length} height={length} viewBox={`0 0 ${length} ${length}`} fill="none" xmlns="http://www.w3.org/2000/svg" className="sketch-decoration">
            <path d={`M${length/2} ${length/2} L${x2} ${y2}`} 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round"
              className="sketch-line" />
          </svg>
        );
      case 'dots':
        return (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="sketch-decoration">
            <circle cx="5" cy="5" r="3" fill="currentColor" />
          </svg>
        );
      case 'squiggles':
        // Random squiggle
        const width = 40;
        const height = 20;
        const path = `M0 ${height/2} 
                      C${width*0.2} ${height*0.8}, 
                       ${width*0.4} ${height*0.2}, 
                       ${width*0.6} ${height*0.8}, 
                       ${width*0.8} ${height*0.2}, 
                       ${width} ${height/2}`;
        
        return (
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" xmlns="http://www.w3.org/2000/svg" className="sketch-decoration">
            <path d={path} 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round"
              className="sketch-line" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {items.map(item => (
        <div
          key={item.id}
          className="absolute text-sketch-ink"
          style={{
            top: item.top,
            left: item.left,
            transform: item.transform,
            opacity: item.opacity,
            animationDelay: item.animationDelay,
          }}
        >
          {renderDecoration(item.id)}
        </div>
      ))}
    </div>
  );
};

export default SketchDecorations;
