import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { fetchStyles } from "@/lib/api";

interface Style {
  id: string;
  name: string;
  image: string;
  description: string;
  promptDescription: string;
}

interface StyleSelectorProps {
  selectedStyle: string;
  onStyleSelect: (styleId: string) => void;
  onStylePromptChange?: (promptDescription: string) => void;
}

const StyleSelector = ({ 
  selectedStyle, 
  onStyleSelect,
  onStylePromptChange 
}: StyleSelectorProps) => {
  const [styles, setStyles] = useState<Style[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStyles = async () => {
      try {
        setLoading(true);
        const apiStyles = await fetchStyles();
        
        // 将API返回的数据转换为本地所需格式
        const formattedStyles = apiStyles.map((style: any) => ({
          id: style.id,
          name: style.name,
          image: style.previewUrl, // 使用API返回的previewUrl作为图片地址
          description: style.description,
          promptDescription: style.promptDescription
        }));
        
        setStyles(formattedStyles);
        
        // 如果已经有选中的风格，设置对应的stylePrompt
        if (selectedStyle && formattedStyles.length > 0) {
          const selectedStyleObj = formattedStyles.find(style => style.id === selectedStyle);
          if (selectedStyleObj && onStylePromptChange) {
            onStylePromptChange(selectedStyleObj.promptDescription);
          }
        }
        // 如果没有选中风格且有可用风格，则默认选择第一个
        else if (!selectedStyle && formattedStyles.length > 0) {
          handleStyleSelect(formattedStyles[0].id);
        }
      } catch (err) {
        console.error("获取风格列表失败:", err);
        setError("获取风格列表失败，请稍后重试");
        
        // 加载失败时使用默认数据
        const defaultStyles = [
          {
            id: "watercolor",
            name: "蜡笔插画风",
            image: "/styles/watercolor.jpg", // 修正路径，使用public目录下的文件
            description: "线条较粗，手绘感强，保留可爱氛围",
            promptDescription: "手绘笔触，蜡笔质感，涂鸦风格，粗线条勾勒，色彩鲜艳但有限，有轻微的不规则笔触纹理"
          },
          {
            id: "minimalist",
            name: "粗线条手绘风",
            image: "/styles/minimalist.jpg", // 修正路径，使用public目录下的文件
            description: "线条不规则，带有铅笔或炭笔质感",
            promptDescription: "粗线条手绘效果，线条不规则，带有铅笔或炭笔质感，简约但具有表现力，有意的粗糙感，线条有力"
          },
          {
            id: "ghibli",
            name: "吉卜力风",
            image: "/styles/ghibli.png", // 修正路径，使用public目录下的文件
            description: "吉卜力风格，温馨治愈的动画风格",
            promptDescription: "吉卜力风格，采用宫崎骏动画的艺术风格，线条柔和流畅，色彩温暖自然，充满童真色彩。"
          },
          {
            id: "des",
            name: "细节写意风",
            image: "/styles/detailed.jpg", // 修正路径，使用public目录下的文件，同时修正文件名
            description: "细节刻画细腻，强烈线条感",
            promptDescription: "细节写意风格，精细的线条变化，保留丰富的体态结构，细腻的纹理刻画，保持解剖学准确性但有艺术性简化"
          }
        ];
        
        setStyles(defaultStyles);
        
        // 如果已经有选中的风格，设置对应的stylePrompt
        if (selectedStyle) {
          const selectedStyleObj = defaultStyles.find(style => style.id === selectedStyle);
          if (selectedStyleObj && onStylePromptChange) {
            onStylePromptChange(selectedStyleObj.promptDescription);
          }
        }
        // 如果没有选中风格，则默认选择第一个
        else if (defaultStyles.length > 0) {
          handleStyleSelect(defaultStyles[0].id);
        }
      } finally {
        setLoading(false);
      }
    };

    loadStyles();
  }, []); // 移除selectedStyle依赖，避免重复加载

  const handleStyleSelect = (styleId: string) => {
    onStyleSelect(styleId);
    
    const selectedStyleObj = styles.find(style => style.id === styleId);
    if (selectedStyleObj && onStylePromptChange) {
      onStylePromptChange(selectedStyleObj.promptDescription);
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-xl font-display font-bold mb-4">选择纹身风格</h3>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pet-pink"></div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-500 rounded-md mb-4">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {styles.map((style) => (
            <Card 
              key={style.id}
              className={`cursor-pointer transition-all hover:shadow-md overflow-hidden ${selectedStyle === style.id ? 'ring-4 ring-pet-pink ring-offset-2' : ''}`}
              onClick={() => handleStyleSelect(style.id)}
            >
              <div className="aspect-square relative overflow-hidden bg-white p-2">
                <img 
                  src={style.image} 
                  alt={style.name} 
                  className="w-full h-full object-contain"
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
      )}
    </div>
  );
};

export default StyleSelector;
