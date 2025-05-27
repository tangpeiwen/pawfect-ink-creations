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
import { analyzePetImage } from '@/lib/openaiService';
import { generateSticker, checkGenerationStatus, uploadImage } from '@/lib/api';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const CreatePage = () => {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imageId, setImageId] = useState<string>("");
  const [selectedStyle, setSelectedStyle] = useState<string>("watercolor");
  const [stylePrompt, setStylePrompt] = useState<string>("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(["eyes", "expression"]);
  const [customFeatures, setCustomFeatures] = useState<string[]>([]);
  const [additionalElements, setAdditionalElements] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [resultImages, setResultImages] = useState<string[]>([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState<number>(0);
  const [activeStep, setActiveStep] = useState<string>("upload");
  const [petFeatures, setPetFeatures] = useState<string>("");
  
  // 添加生成进度状态
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [generationStatus, setGenerationStatus] = useState<string>("");
  
  const handleImageUpload = async (file: File) => {
    setUploadedImage(file);
    
    try {
      // 上传图片到后端
      const uploadResult = await uploadImage(file);
      if (uploadResult.success && uploadResult.imageId) {
        setImageId(uploadResult.imageId);
        
        // 如果上传结果包含分析，使用它
        if (uploadResult.analysis) {
          setPetFeatures(uploadResult.analysis);
          
          // 基于分析结果提取一些自定义特征
          const analysisWords = uploadResult.analysis.split(/[,，、\s]+/).filter(word => word.trim().length > 0);
          if (analysisWords.length > 0) {
            const autoFeatures = analysisWords.slice(0, 3);
            setCustomFeatures(autoFeatures);
          }
        } else {
          // 如果没有分析结果，单独进行分析
          setIsAnalyzing(true);
          const analysis = await analyzePetImage(file);
          setPetFeatures(analysis);
          
          const analysisWords = analysis.split(/[,，、\s]+/).filter(word => word.trim().length > 0);
          if (analysisWords.length > 0) {
            const autoFeatures = analysisWords.slice(0, 3);
            setCustomFeatures(autoFeatures);
          }
          setIsAnalyzing(false);
        }
      } else {
        throw new Error(uploadResult.message || '上传失败');
      }
    } catch (error) {
      console.error('上传或分析失败:', error);
      setIsAnalyzing(false);
      toast.error(`上传失败: ${error instanceof Error ? error.message : '未知错误'}`);
      return;
    }
    
    // 自动前进到下一步
    setActiveStep("style");
  };
  
  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
  };

  const handleStylePromptChange = (promptDescription: string) => {
    setStylePrompt(promptDescription);
  };
  
  const handleFeaturesChange = (features: string[]) => {
    setSelectedFeatures(features);
  };
  
  const handleCustomFeaturesChange = (features: string[]) => {
    setCustomFeatures(features);
  };
  
  const handleAdditionalElementsChange = (elements: string[]) => {
    setAdditionalElements(elements);
  };
  
  const handleGenerate = async () => {
    // Validate inputs
    if (!uploadedImage || !imageId) {
      toast.error("请先上传宠物照片");
      setActiveStep("upload");
      return;
    }
    
    if (selectedFeatures.length === 0 && customFeatures.length === 0) {
      toast.error("请至少选择一个需要强调的特征");
      return;
    }

    if (!stylePrompt) {
      toast.error("请选择一种风格");
      return;
    }
    
    console.log('=== 开始生成流程 ===');
    console.log('imageId:', imageId);
    console.log('selectedStyle:', selectedStyle);
    console.log('selectedFeatures:', selectedFeatures);
    console.log('customFeatures:', customFeatures);
    console.log('additionalElements:', additionalElements);
    
    // 重置进度和结果
    setGenerationProgress(0);
    setGenerationStatus("正在准备...");
    
    // Start generation process
    setIsGenerating(true);
    
    // 跳转到结果页面
    setActiveStep("result");
    
    toast.info("AI正在努力生成您的宠物贴纸，请稍候...");
    
    try {
      console.log('开始调用generateSticker API，参数:', {
        imageId,
        selectedStyle,
        selectedFeatures,
        customFeatures,
        additionalElements
      });
      
      // 直接调用generateSticker API，使用已上传的imageId
      const result = await generateSticker(
        imageId,
        selectedStyle,
        selectedFeatures,
        customFeatures,
        additionalElements
      );
      
      console.log('generateSticker API返回结果:', result);
      
      // 设置进度监控
      setGenerationStatus("任务已提交，正在处理...");
      setGenerationProgress(20);
      
      // 如果结果中包含generationId，则开始轮询状态
      if (result.generationId) {
        const generationId = result.generationId;
        console.log('开始轮询生成状态，generationId:', generationId);
        
        // 开始轮询生成状态
        const statusCheckInterval = setInterval(async () => {
          try {
            const statusResult = await checkGenerationStatus(generationId);
            console.log('状态检查结果:', statusResult);
            
            // 更新进度
            setGenerationProgress(statusResult.progress || 0);
            setGenerationStatus(statusResult.status === 'completed' ? 
              '生成完成' : 
              statusResult.status === 'failed' ? '生成失败' : '正在生成中...');
            
            // 如果完成或失败，清除定时器并设置结果
            if (statusResult.status === 'completed' || statusResult.status === 'failed') {
              clearInterval(statusCheckInterval);
              
              if (statusResult.status === 'completed' && statusResult.resultUrl) {
                setResultImages([statusResult.resultUrl]);
                setSelectedResultIndex(0);
                setIsGenerating(false);
                toast.success("贴纸生成完成！");
              } else if (statusResult.status === 'failed') {
                setIsGenerating(false);
                toast.error(`生成失败: ${statusResult.error || '未知错误'}`);
              }
            }
          } catch (error) {
            console.error('检查状态失败:', error);
            // 如果检查状态失败，不要立即停止，让它继续尝试
          }
        }, 3000);  // 每3秒检查一次
      } else if (result.images && result.images.length > 0) {
        // 如果直接返回了图片，则设置结果
        setResultImages(result.images);
        setSelectedResultIndex(0);
        setGenerationProgress(100);
        setGenerationStatus("生成完成");
        setIsGenerating(false);
        toast.success("贴纸生成完成！");
      } else {
        throw new Error('生成结果格式错误');
      }
    } catch (error) {
      console.error('=== 生成失败 ===');
      console.error('错误详情:', error);
      setIsGenerating(false);
      setGenerationStatus("生成失败");
      toast.error(`生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };
  
  const handleRegenerate = () => {
    handleGenerate();
  };
  
  const handleConfirm = () => {
    toast.success("已确认设计！正在前往订单页面...");
    // In a real app, this would navigate to a payment/checkout page
  };

  // 当前选中的结果图片
  const currentResultImage = resultImages[selectedResultIndex] || null;
  
  return (
    <Layout>
      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
              创建您的<span className="bg-clip-text text-transparent bg-gradient-pet">定制宠物贴纸</span>
            </h1>
            <p className="text-gray-600">
              通过以下步骤，让AI将您的宠物转变为精美的贴纸设计
            </p>
          </div>
          
          {/* 生成进度对话框 */}
          <Dialog open={isGenerating} onOpenChange={() => {}}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-center">AI正在生成您的宠物贴纸</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center space-y-4 py-6">
                <div className="w-20 h-20 rounded-full bg-gradient-pet animate-pulse-soft flex items-center justify-center">
                  <svg className="animate-spin text-white w-10 h-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-lg font-medium">{generationStatus}</p>
                  <p className="text-sm text-gray-500">这可能需要30-60秒，请耐心等待</p>
                </div>
                <div className="w-full space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>进度</span>
                    <span>{generationProgress}%</span>
                  </div>
                  <Progress value={generationProgress} className="h-2" />
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Tabs defaultValue={activeStep} value={activeStep} onValueChange={setActiveStep} className="w-full">
            <TabsList className="h-12 items-center justify-center rounded-lg bg-gray-100 p-1 text-gray-600 grid grid-cols-3 mb-8 w-full">
              <TabsTrigger value="upload" className="text-sm sm:text-base font-medium rounded-lg transition-all hover:bg-pet-pink/10 h-10">
                1. 上传照片
              </TabsTrigger>
              <TabsTrigger value="style" className="text-sm sm:text-base font-medium rounded-lg transition-all hover:bg-pet-pink/10 h-10">
                2. 选择风格和特征
              </TabsTrigger>
              <TabsTrigger value="result" className="text-sm sm:text-base font-medium rounded-lg transition-all hover:bg-pet-pink/10 h-10">
                3. 生成结果
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-8">
              <UploadSection onImageUploaded={handleImageUpload} />
              
              {isAnalyzing && (
                <div className="flex items-center justify-center p-4 bg-pet-blue/20 rounded-lg">
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-pet-pink border-t-transparent rounded-full"></div>
                  <p className="text-sm text-gray-600">正在分析宠物特征...</p>
                </div>
              )}
              
              {petFeatures && (
                <div className="p-4 bg-pet-blue/20 rounded-lg">
                  <h4 className="font-medium mb-2">已检测到的宠物特征:</h4>
                  <p className="text-sm text-gray-600">{petFeatures}</p>
                </div>
              )}
              
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
                onStylePromptChange={handleStylePromptChange}
              />
              
              <FeatureSelector
                selectedFeatures={selectedFeatures}
                onFeaturesChange={handleFeaturesChange}
                customFeatures={customFeatures}
                onCustomFeaturesChange={handleCustomFeaturesChange}
                additionalElements={additionalElements}
                onAdditionalElementsChange={handleAdditionalElementsChange}
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
                  onClick={handleGenerate}
                >
                  生成贴纸
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="result" className="space-y-8">
              <GeneratorResult 
                loading={isGenerating}
                resultImage={currentResultImage}
                onRegenerate={handleRegenerate}
                onConfirm={handleConfirm}
              />
              
              {/* 生成的多个结果展示 */}
              {resultImages.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-display font-medium mb-4">其他生成结果</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {resultImages.map((image, index) => (
                      <div 
                        key={index}
                        className={`cursor-pointer border-2 rounded-lg overflow-hidden ${
                          selectedResultIndex === index ? 'border-pet-pink' : 'border-transparent'
                        }`}
                        onClick={() => setSelectedResultIndex(index)}
                      >
                        <img 
                          src={image} 
                          alt={`生成结果 ${index + 1}`} 
                          className="w-full aspect-square object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveStep("style")}
                  className="border-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                  返回上一步
                </Button>
                
                {currentResultImage && (
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
