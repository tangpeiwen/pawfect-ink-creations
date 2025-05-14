
import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";

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
      <h3 className="text-xl font-display font-bold mb-4 text-kawaii-text">选择纹身风格</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {styles.map((style) => (
          <Card 
            key={style.id}
            className={`cursor-pointer transition-all hover:shadow-lg overflow-hidden rounded-2xl ${selectedStyle === style.id ? 'ring-4 ring-kawaii-pink ring-offset-2' : ''}`}
            onClick={() => onStyleSelect(style.id)}
          >
            <div className="aspect-square relative overflow-hidden">
              <img 
                src={style.image} 
                alt={style.name} 
                className="w-full h-full object-cover"
              />
              {selectedStyle === style.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-kawaii-pink rounded-full flex items-center justify-center animate-pulse-soft">
                  <Heart width="16" height="16" className="text-white" fill="white" strokeWidth={3} />
                </div>
              )}
            </div>
            <CardContent className="p-3">
              <h4 className="font-display font-medium text-kawaii-text">{style.name}</h4>
              <p className="text-xs text-gray-500 mt-1">{style.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StyleSelector;
