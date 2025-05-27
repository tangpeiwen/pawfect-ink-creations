import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Feature {
  id: string;
  name: string;
  description: string;
}

interface FeatureSelectorProps {
  selectedFeatures: string[];
  onFeaturesChange: (features: string[]) => void;
  customFeatures: string[];
  onCustomFeaturesChange: (features: string[]) => void;
  additionalElements: string[];
  onAdditionalElementsChange: (elements: string[]) => void;
}

const FeatureSelector = ({ 
  selectedFeatures, 
  onFeaturesChange,
  customFeatures = [],
  onCustomFeaturesChange = () => {},
  additionalElements = [],
  onAdditionalElementsChange = () => {}
}: FeatureSelectorProps) => {
  const [newCustomFeature, setNewCustomFeature] = useState("");
  const [newAdditionalElement, setNewAdditionalElement] = useState("");
  
  const features: Feature[] = [
    {
      id: "eyes",
      name: "眼睛",
      description: "突出宠物的眼神特点"
    },
    {
      id: "ears",
      name: "耳朵",
      description: "强调宠物耳朵的形状"
    },
    {
      id: "nose",
      name: "鼻子",
      description: "展现鼻子的特征"
    },
    {
      id: "fur",
      name: "毛发",
      description: "突出毛发的纹理和特点"
    },
    {
      id: "posture",
      name: "姿势",
      description: "保留宠物特有的姿势" 
    },
    {
      id: "expression",
      name: "表情",
      description: "捕捉宠物独特的表情"
    }
  ];

  const handleFeatureToggle = (featureId: string) => {
    let newSelectedFeatures = [...selectedFeatures];
    
    if (newSelectedFeatures.includes(featureId)) {
      newSelectedFeatures = newSelectedFeatures.filter(id => id !== featureId);
    } else {
      newSelectedFeatures.push(featureId);
    }
    
    onFeaturesChange(newSelectedFeatures);
  };

  const addCustomFeature = () => {
    if (newCustomFeature.trim() !== "") {
      const updatedFeatures = [...customFeatures, newCustomFeature.trim()];
      onCustomFeaturesChange(updatedFeatures);
      setNewCustomFeature("");
    }
  };

  const removeCustomFeature = (index: number) => {
    const updatedFeatures = customFeatures.filter((_, i) => i !== index);
    onCustomFeaturesChange(updatedFeatures);
  };

  const addAdditionalElement = () => {
    if (newAdditionalElement.trim() !== "") {
      const updatedElements = [...additionalElements, newAdditionalElement.trim()];
      onAdditionalElementsChange(updatedElements);
      setNewAdditionalElement("");
    }
  };

  const removeAdditionalElement = (index: number) => {
    const updatedElements = additionalElements.filter((_, i) => i !== index);
    onAdditionalElementsChange(updatedElements);
  };

  return (
    <div className="w-full">
      <h3 className="text-xl font-display font-bold mb-4">选择需要强调的特征</h3>
      <p className="text-sm text-gray-500 mb-6">选择您希望在纹身贴中突出的宠物特征（至少选择1项）</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {features.map((feature) => (
          <div
            key={feature.id}
            className={`border rounded-xl p-4 cursor-pointer transition-all ${
              selectedFeatures.includes(feature.id) 
                ? 'bg-pet-pink/10 border-pet-pink' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => handleFeatureToggle(feature.id)}
          >
            <div className="flex items-start space-x-3">
              <Checkbox 
                checked={selectedFeatures.includes(feature.id)}
                onCheckedChange={() => handleFeatureToggle(feature.id)}
                className="mt-1"
              />
              <div>
                <Label 
                  htmlFor={feature.id} 
                  className="font-medium cursor-pointer"
                >
                  {feature.name}
                </Label>
                <p className="text-xs text-gray-500 mt-1">{feature.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 自定义特征输入 */}
      <div className="mt-8">
        <h4 className="text-lg font-display font-medium mb-3">添加自定义特征</h4>
        <p className="text-sm text-gray-500 mb-4">添加您希望增强的其他特征（如猫咪是对眼、身体长等）</p>
        
        <div className="flex gap-2 mb-3">
          <Input
            value={newCustomFeature}
            onChange={(e) => setNewCustomFeature(e.target.value)}
            placeholder="输入需要增强的特征"
            className="flex-1"
          />
          <Button 
            onClick={addCustomFeature} 
            variant="secondary"
          >
            添加
          </Button>
        </div>

        {customFeatures.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {customFeatures.map((feature, index) => (
              <div key={index} className="flex items-center bg-pet-pink/10 rounded-full px-3 py-1">
                <span className="text-sm">{feature}</span>
                <button
                  onClick={() => removeCustomFeature(index)}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 额外元素输入 */}
      <div className="mt-8">
        <h4 className="text-lg font-display font-medium mb-3">添加额外元素</h4>
        <p className="text-sm text-gray-500 mb-4">添加您希望在图片中包含的其他元素（如猫咪玩蝴蝶、毛线球，狗狗啃骨头等）</p>
        
        <div className="flex gap-2 mb-3">
          <Input
            value={newAdditionalElement}
            onChange={(e) => setNewAdditionalElement(e.target.value)}
            placeholder="输入想要添加的元素"
            className="flex-1"
          />
          <Button 
            onClick={addAdditionalElement} 
            variant="secondary"
          >
            添加
          </Button>
        </div>

        {additionalElements.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {additionalElements.map((element, index) => (
              <div key={index} className="flex items-center bg-pet-pink/10 rounded-full px-3 py-1">
                <span className="text-sm">{element}</span>
                <button
                  onClick={() => removeAdditionalElement(index)}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FeatureSelector;
