
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Check } from "lucide-react";

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
      <h3 className="text-xl font-sketch font-bold mb-6 text-sketch-ink sketch-title">选择纹身风格</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {styles.map((style) => (
          <div 
            key={style.id}
            className={`cursor-pointer transition-all hover:translate-y-[-3px] border-2 border-sketch-ink bg-sketch-paper overflow-hidden ${
              selectedStyle === style.id 
                ? 'ring-2 ring-sketch-primary ring-offset-2' 
                : ''
            }`}
            style={{
              boxShadow: selectedStyle === style.id 
                ? '4px 4px 0px 0px #F47C7C' 
                : '4px 4px 0px 0px #393535'
            }}
            onClick={() => onStyleSelect(style.id)}
          >
            <div className="aspect-square relative overflow-hidden border-b-2 border-sketch-ink">
              <img 
                src={style.image} 
                alt={style.name} 
                className="w-full h-full object-cover"
              />
              {selectedStyle === style.id && (
                <div className="absolute top-2 right-2 w-8 h-8 border-2 border-sketch-ink bg-sketch-primary flex items-center justify-center">
                  <Check width="16" height="16" className="text-white" strokeWidth={3} />
                </div>
              )}
            </div>
            <div className="p-3">
              <h4 className="font-sketch font-bold text-sketch-ink">{style.name}</h4>
              <p className="text-xs text-sketch-ink/80 font-handwriting mt-1">{style.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StyleSelector;
