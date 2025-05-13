
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface Feature {
  id: string;
  name: string;
  description: string;
}

interface FeatureSelectorProps {
  selectedFeatures: string[];
  onFeaturesChange: (features: string[]) => void;
}

const FeatureSelector = ({ selectedFeatures, onFeaturesChange }: FeatureSelectorProps) => {
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
      id: "pose",
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
    </div>
  );
};

export default FeatureSelector;
