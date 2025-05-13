
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import UploadSection from "@/components/UploadSection";
import StyleSelector from "@/components/StyleSelector";
import FeatureSelector from "@/components/FeatureSelector";
import GeneratorResult from "@/components/GeneratorResult";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from 'react-router-dom';

const CreatePage = () => {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>("minimalist");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(["eyes", "expression"]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<string>("upload");
  
  const handleImageUpload = (file: File) => {
    setUploadedImage(file);
    // Auto advance to next step
    setActiveStep("style");
  };
  
  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
  };
  
  const handleFeaturesChange = (features: string[]) => {
    setSelectedFeatures(features);
  };
  
  const handleGenerate = () => {
    // Validate inputs
    if (!uploadedImage) {
      toast.error("请先上传宠物照片");
      setActiveStep("upload");
      return;
    }
    
    if (selectedFeatures.length === 0) {
      toast.error("请至少选择一个需要强调的特征");
      return;
    }
    
    // Start generation process
    setIsGenerating(true);
    toast.info("AI正在努力生成您的宠物纹身贴，请稍候...");
    
    // In a real application, we'd send the image and preferences to a backend
    // Here we'll simulate a delay and then show a placeholder result
    setTimeout(() => {
      setIsGenerating(false);
      setResultImage("/placeholder.svg"); // Replace with actual result from backend
      toast.success("纹身贴生成完成！");
    }, 3000);
  };
  
  const handleRegenerate = () => {
    setIsGenerating(true);
    toast.info("正在重新生成您的纹身贴，请稍候...");
    
    // Simulate regeneration
    setTimeout(() => {
      setIsGenerating(false);
      setResultImage("/placeholder.svg"); // Would be a different image in real app
      toast.success("纹身贴已重新生成！");
    }, 2000);
  };
  
  const handleConfirm = () => {
    toast.success("已确认设计！正在前往订单页面...");
    // In a real app, this would navigate to a payment/checkout page
  };
  
  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
              创建您的<span className="bg-clip-text text-transparent bg-gradient-pet">定制宠物纹身贴</span>
            </h1>
            <p className="text-gray-600">
              通过以下步骤，让AI将您的宠物转变为精美的纹身贴设计
            </p>
          </div>
          
          <Tabs defaultValue={activeStep} value={activeStep} onValueChange={setActiveStep} className="w-full">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="upload" className="text-sm sm:text-base">1. 上传照片</TabsTrigger>
              <TabsTrigger value="style" className="text-sm sm:text-base">2. 选择风格和特征</TabsTrigger>
              <TabsTrigger value="result" className="text-sm sm:text-base">3. 生成结果</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-8">
              <UploadSection onImageUploaded={handleImageUpload} />
              
              <div className="flex justify-end">
                <Button 
                  className="pet-button"
                  onClick={() => {
                    if (uploadedImage) {
                      setActiveStep("style");
                    } else {
                      toast.error("请先上传宠物照片");
                    }
                  }}
                >
                  下一步
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="style" className="space-y-8">
              <StyleSelector 
                selectedStyle={selectedStyle}
                onStyleSelect={handleStyleSelect}
              />
              
              <FeatureSelector
                selectedFeatures={selectedFeatures}
                onFeaturesChange={handleFeaturesChange}
              />
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveStep("upload")}
                  className="border-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                  返回上一步
                </Button>
                
                <Button 
                  className="pet-button"
                  onClick={() => {
                    setActiveStep("result");
                    handleGenerate();
                  }}
                >
                  生成纹身贴
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="result" className="space-y-8">
              <GeneratorResult 
                loading={isGenerating}
                resultImage={resultImage}
                onRegenerate={handleRegenerate}
                onConfirm={handleConfirm}
              />
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveStep("style")}
                  className="border-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                  返回上一步
                </Button>
                
                {resultImage && (
                  <Link to="/checkout">
                    <Button className="pet-button">
                      前往支付
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
                    </Button>
                  </Link>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Usage Counter */}
        <div className="max-w-4xl mx-auto mt-12 p-4 bg-gray-50 rounded-xl">
          <p className="text-center text-sm text-gray-500">
            您还有 <span className="font-bold text-pet-pink">5</span> 次免费生成次数 | 
            <Link to="/pricing" className="text-pet-pink ml-1 hover:underline">
              升级会员获取更多
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default CreatePage;
