
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface Style {
  id: string;
  name: string;
  image: string;
  description: string;
}

interface StyleSelectorProps {
  selectedStyle: string;
  onStyleSelect: (styleId: string) => void;
}

const StyleSelector = ({ selectedStyle, onStyleSelect }: StyleSelectorProps) => {
  const styles: Style[] = [
    {
      id: "minimalist",
      name: "简约线条风",
      image: "/placeholder.svg",
      description: "简单细腻的线条勾勒宠物特征"
    },
    {
      id: "watercolor",
      name: "水彩淡染风",
      image: "/placeholder.svg",
      description: "柔和的水彩效果展现宠物个性"
    },
    {
      id: "cartoon",
      name: "可爱卡通风",
      image: "/placeholder.svg",
      description: "萌趣的卡通风格彰显宠物魅力"
    },
    {
      id: "geometric",
      name: "几何创意风",
      image: "/placeholder.svg",
      description: "现代几何图形组合独特造型"
    }
  ];

  return (
    <div className="w-full">
      <h3 className="text-xl font-display font-bold mb-4">选择纹身风格</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {styles.map((style) => (
          <Card 
            key={style.id}
            className={`cursor-pointer transition-all hover:shadow-md overflow-hidden ${selectedStyle === style.id ? 'ring-4 ring-pet-pink ring-offset-2' : ''}`}
            onClick={() => onStyleSelect(style.id)}
          >
            <div className="aspect-square relative overflow-hidden">
              <img 
                src={style.image} 
                alt={style.name} 
                className="w-full h-full object-cover"
              />
              {selectedStyle === style.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-pet-pink rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              )}
            </div>
            <CardContent className="p-3">
              <h4 className="font-display font-medium">{style.name}</h4>
              <p className="text-xs text-gray-500 mt-1">{style.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StyleSelector;
