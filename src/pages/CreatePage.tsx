import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import UploadSection from "@/components/UploadSection";
import StyleSelector from "@/components/StyleSelector";
import FeatureSelector from "@/components/FeatureSelector";
import GeneratorResult from "@/components/GeneratorResult";
import PawLoadingAnimation from "@/components/PawLoadingAnimation";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate } from 'react-router-dom';
import { analyzePetImage } from '@/lib/openaiService';
import { generateSticker, checkGenerationStatus, uploadImage, getGenerationHistory, getUserTokenBalance } from '@/lib/api';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

const CreatePage = () => {
  const navigate = useNavigate();
  
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imageId, setImageId] = useState<string>("");
  const [selectedStyle, setSelectedStyle] = useState<string>("watercolor");
  const [stylePrompt, setStylePrompt] = useState<string>("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [customFeatures, setCustomFeatures] = useState<string[]>([]);
  const [additionalElements, setAdditionalElements] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [resultImages, setResultImages] = useState<string[]>([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState<number>(0);
  const [activeStep, setActiveStep] = useState<string>("upload");
  const [petFeatures, setPetFeatures] = useState<string>("");
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  
  // 添加生成进度状态
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [generationStatus, setGenerationStatus] = useState<string>("");
  
  // 添加生成任务ID状态，用于取消生成
  const [currentGenerationId, setCurrentGenerationId] = useState<string>("");
  const [statusCheckInterval, setStatusCheckInterval] = useState<NodeJS.Timeout | null>(null);
  
  // 添加超时标志，防止超时后的API调用继续更新状态
  const isGenerationTimedOutRef = useRef<boolean>(false);
  
  // 添加Token不足对话框状态
  const [showTokenDialog, setShowTokenDialog] = useState<boolean>(false);
  const [tokenErrorMessage, setTokenErrorMessage] = useState<string>("");
  
  // 添加上传状态管理
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string>("");

  // 添加历史生成记录状态
  const [historyImages, setHistoryImages] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [historyError, setHistoryError] = useState<string>("");
  
  // 添加选中的图片状态 - 用于统一管理当前选中的图片
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    type: 'current' | 'history';
    index?: number;
    historyId?: string;
  } | null>(null);

  // 添加状态变化跟踪
  useEffect(() => {
    console.log(`=== 生成状态变化 ===`);
    console.log(`generationStatus: "${generationStatus}"`);
    console.log(`isGenerating: ${isGenerating}`);
    console.log(`generationProgress: ${generationProgress}`);
  }, [generationStatus, isGenerating, generationProgress]);

  // 获取历史生成记录
  const fetchHistory = async () => {
    try {
      setIsLoadingHistory(true);
      setHistoryError("");
      
      const historyData = await getGenerationHistory(10, 0); // 获取最近10条记录
      
      if (historyData.success && historyData.history) {
        // 过滤出已完成且有结果URL的记录
        const completedHistory = historyData.history
          .filter((item: any) => item.status === 'completed')
          .map((item: any) => ({
            id: item.id,
            resultUrl: item.result_url,
            createdAt: item.created_at,
            styleId: item.style_id,
            title: item.title || '未命名作品'
          }))
          .filter((item: any) => item.resultUrl); // 确保有结果URL
        
        setHistoryImages(completedHistory);
        console.log('获取到历史记录:', completedHistory.length, '条');
      }
    } catch (error) {
      console.error('获取历史记录失败:', error);
      setHistoryError(error instanceof Error ? error.message : '获取历史记录失败');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // 组件加载时获取历史记录
  useEffect(() => {
    fetchHistory();
  }, []);

  // 处理Token不足的情况
  const handleTokenInsufficient = (errorMessage: string) => {
    setTokenErrorMessage(errorMessage);
    setShowTokenDialog(true);
  };

  // 跳转到充值页面
  const goToPricing = () => {
    setShowTokenDialog(false);
    navigate('/pricing');
  };

  // 处理取消生成
  const handleCancelGeneration = () => {
    // 清除状态检查定时器
    if (statusCheckInterval) {
      clearInterval(statusCheckInterval);
      setStatusCheckInterval(null);
    }
    
    // 重置生成相关状态
    setIsGenerating(false);
    setGenerationProgress(0);
    setGenerationStatus("");
    setCurrentGenerationId("");
    isGenerationTimedOutRef.current = false; // 重置超时标志
    
    // 显示取消提示
    toast.info("已取消生成任务");
    
    console.log("用户取消了生成任务");
  };

  const handleImageUpload = async (file: File) => {
    console.log('开始处理图片上传:', file.name);
    
    // 重置状态
    setUploadError("");
    setImageId("");
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // 设置上传文件
      setUploadedImage(file);
      
      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);
      
      console.log('调用uploadImage API');
      // 上传图片到后端
      const uploadResult = await uploadImage(file);
      
      // 清除进度定时器
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      console.log('上传结果:', uploadResult);
      
      if (uploadResult.success && uploadResult.imageId) {
        setImageId(uploadResult.imageId);
        setIsUploading(false);
        
        // 显示成功提示
        toast.success("图片上传成功！请点击下一步继续选择风格。");
        
        console.log('图片上传成功，imageId:', uploadResult.imageId);
      } else {
        throw new Error(uploadResult.message || '上传失败');
      }
    } catch (error) {
      console.error('上传失败:', error);
      setIsUploading(false);
      setUploadProgress(0);
      
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      setUploadError(errorMessage);
      
      // 重置状态
      setUploadedImage(null);
      setImageId("");
      
      toast.error(`上传失败: ${errorMessage}`);
    }
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
    // 验证输入
    if (!uploadedImage || !imageId) {
      toast.error("请先上传宠物照片");
      setActiveStep("upload");
      return;
    }

    if (!stylePrompt) {
      toast.error("请选择一种风格");
      return;
    }
    
    // 重置进度和结果
    setGenerationProgress(0);
    setGenerationStatus("正在准备...");
    isGenerationTimedOutRef.current = false; // 重置超时标志
    
    // Start generation process
    setIsGenerating(true);
    
    // 不要立即跳转到结果页面，让进度弹窗在当前页面显示
    // setActiveStep("result"); // 删除这行
    
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
      
      // 检查API调用是否成功
      if (!result.success) {
        // API调用失败，显示错误信息但不关闭弹窗
        setGenerationStatus("生成失败");
        
        // 显示错误信息，特别关注Token不足的情况
        const errorMessage = result.message || '生成请求失败';
        console.log('生成失败，错误信息:', errorMessage);
        
        // 检查是否是Token不足的错误
        if (errorMessage.includes('Token不足')) {
          // 使用模态对话框显示Token不足错误，同时关闭生成弹窗
          setIsGenerating(false);
          handleTokenInsufficient(errorMessage);
        } else {
          // 显示其他错误，但保持弹窗打开，让用户选择操作
          // 不设置 setIsGenerating(false)，让弹窗保持打开状态
          toast.error(errorMessage);
        }
        
        return;
      }
      
      // 设置进度监控
      setGenerationStatus("任务已提交，正在处理...");
      setGenerationProgress(20);
      
      // 如果结果中包含generationId，则开始轮询状态
      if (result.generationId) {
        const generationId = result.generationId;
        setCurrentGenerationId(generationId);
        console.log('开始轮询生成状态，generationId:', generationId);
        
        let pollCount = 0;
        const maxPollCount = 240; 
        
        // 开始轮询生成状态 - 使用更高效的策略
        const intervalId = setInterval(async () => {
          pollCount++;
          
          // 超时检查 - 在调用API之前检查
          if (pollCount > maxPollCount) {
            console.log(`=== 生成任务超时 ===`);
            console.log(`轮询次数: ${pollCount}/${maxPollCount}`);
            console.log(`当前isGenerating状态: ${isGenerating}`);
            
            clearInterval(intervalId);
            setStatusCheckInterval(null);
            isGenerationTimedOutRef.current = true; // 设置超时标志
            setGenerationStatus("生成失败，未扣除Token，请重新开始");
            setCurrentGenerationId("");
            
            console.log(`设置状态为"生成失败，未扣除Token，请重新开始"，isGenerating保持为: ${isGenerating}`);
            
            // 超时不关闭弹窗，让用户选择操作，并显示友好的错误提示
            toast.error("生成任务超时失败，未扣除Token，请重新开始", {
              duration: 8000
            });
            
            console.log(`生成任务超时失败，已轮询 ${pollCount} 次，未扣除Token`);
            return;
          }
          
          try {
            const statusResult = await checkGenerationStatus(generationId);
            console.log(`状态检查结果 (${pollCount}/${maxPollCount}):`, statusResult);
            
            // 如果已经超时，不再处理API返回的结果
            if (isGenerationTimedOutRef.current) {
              console.log('任务已超时，忽略API返回结果');
              return;
            }
            
            // 更新进度和状态描述
            const progress = statusResult.progress || 0;
            setGenerationProgress(progress);
            
            // 根据进度显示不同的状态描述
            let statusText = "正在生成中...";
            if (progress <= 20) statusText = "正在验证图片...";
            else if (progress <= 40) statusText = "正在分析宠物特征...";
            else if (progress <= 60) statusText = "正在准备风格参考...";
            else if (progress <= 80) statusText = "AI正在创作中...";
            else if (progress <= 95) statusText = "正在保存结果...";
            else if (progress < 100) statusText = "即将完成...";
            
            if (statusResult.status === 'completed') {
              statusText = '生成完成';
            } else if (statusResult.status === 'failed') {
              statusText = '生成失败';
            }
            
            setGenerationStatus(statusText);
            
            // 如果完成或失败，清除定时器并设置结果
            if (statusResult.status === 'completed' || statusResult.status === 'failed') {
              clearInterval(intervalId);
              setStatusCheckInterval(null);
              setCurrentGenerationId("");
              
              if (statusResult.status === 'completed' && statusResult.resultUrl) {
                console.log('=== 设置生成结果 ===');
                console.log('resultUrl:', statusResult.resultUrl);
                console.log('当前resultImages:', resultImages);
                
                handleGenerationComplete(statusResult.resultUrl);
              } else if (statusResult.status === 'failed') {
                setGenerationProgress(0);
                
                // 检查是否是Token不足的错误
                const errorMessage = statusResult.error || '未知错误';
                console.log('生成状态检查失败，错误信息:', errorMessage);
                
                // 检查是否是Token不足的错误
                if (errorMessage.includes('Token不足')) {
                  // 使用模态对话框显示Token不足错误，同时关闭生成弹窗
                  setIsGenerating(false);
                  handleTokenInsufficient(errorMessage);
                } else {
                  // 显示其他错误，但保持弹窗打开，让用户选择操作
                  // 不设置 setIsGenerating(false)，让弹窗保持打开状态
                  toast.error(`生成失败: ${errorMessage}`);
                }
              }
            }
          } catch (error) {
            console.error('检查状态失败:', error);
            // 如果检查状态失败，继续尝试，但增加失败计数
            if (pollCount > maxPollCount * 0.8) { // 在最后20%的时间里如果一直失败就停止
              clearInterval(intervalId);
              setStatusCheckInterval(null);
              setCurrentGenerationId("");
              setGenerationStatus("网络错误");
              toast.error('无法获取生成状态，请刷新页面重试');
            }
          }
        }, 1000);  // 改为每1秒检查一次，提供更及时的反馈
        
        // 保存定时器引用
        setStatusCheckInterval(intervalId);
      } else if (result.images && result.images.length > 0) {
        // 如果直接返回了图片，则设置结果
        handleGenerationComplete(result.images[0]);
      } else {
        throw new Error('生成结果格式错误');
      }
    } catch (error) {
      console.error('=== 生成失败 ===');
      console.error('错误详情:', error);
      setGenerationStatus("生成失败");
      // 不设置 setIsGenerating(false)，让弹窗保持打开状态
      toast.error(`生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };
  
  const handleRegenerate = () => {
    handleGenerate();
  };
  
  const handleConfirm = async () => {
    if (!selectedImage) {
      toast.error("请先选择一张图片");
      return;
    }
    
    try {
      // 获取用户token余额
      const tokenData = await getUserTokenBalance();
      const userTokens = tokenData.tokens_remaining || 0;
      
      // 如果余额不足1000，提醒用户充值
      if (userTokens < 1000) {
        // 先显示余额不足的提醒
        toast.error(`您的余额不足，无法制作纹身贴。当前余额: ${userTokens} Token，制作纹身贴需要: 1000 Token`, {
          duration: 5000
        });
        
        // 显示确认对话框询问是否跳转充值
        setTokenErrorMessage(`当前余额: ${userTokens} Token`);
        setShowTokenDialog(true);
        return;
      }
      
      // 余额充足，跳转到产品选择页面
      navigate("/product-selection", {
        state: {
          selectedImage: selectedImage.url
        }
      });
      
    } catch (error) {
      console.error('获取token余额失败:', error);
      toast.error('获取余额失败，请刷新页面重试');
    }
  };

  // 处理图片选择
  const handleImageSelect = (url: string, type: 'current' | 'history', index?: number, historyId?: string) => {
    setSelectedImage({
      url,
      type,
      index,
      historyId
    });
  };

  // 当前选中的结果图片 - 修改为使用selectedImage
  const currentResultImage = selectedImage?.url || (resultImages[selectedResultIndex] || null);

  // 处理平滑过渡到风格选择页面
  const handleProceedToStyle = async () => {
    if (!uploadedImage || !imageId) {
      toast.error("请先上传宠物照片");
      return;
    }
    
    // 如果仍在上传中，提示用户等待
    if (isUploading) {
      toast.warning("图片正在上传中，请稍等片刻");
      return;
    }
    
    // 如果上传出错，提示用户重新上传
    if (uploadError) {
      toast.error("图片上传失败，请重新上传");
      return;
    }
    
    setIsTransitioning(true);
    
    // 显示过渡提示
    toast.info("正在为您准备风格选择页面...", {
      duration: 1000,
    });
    
    // 短暂延迟以显示加载状态
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // 跳转到风格选择页面
    setActiveStep("style");
    
    // 再次短暂延迟以显示页面切换动画
    await new Promise(resolve => setTimeout(resolve, 200));
    
    setIsTransitioning(false);
    
    // 显示引导提示
    setTimeout(() => {
      toast.success("选择您喜欢的风格，让AI为您的宠物打造独特贴纸！", {
        duration: 3000,
      });
    }, 100);
  };
  
  // 修改生成完成后的处理逻辑
  const handleGenerationComplete = (resultUrl: string) => {
    console.log('=== 设置生成结果 ===');
    console.log('resultUrl:', resultUrl);
    
    setResultImages([resultUrl]);
    setSelectedResultIndex(0);
    // 自动选中新生成的结果
    setSelectedImage({
      url: resultUrl,
      type: 'current',
      index: 0
    });
    setIsGenerating(false);
    setGenerationProgress(100);
    
    console.log('结果设置完成，resultImages应该更新为:', [resultUrl]);
    toast.success("贴纸生成完成！");
    
    // 生成完成后跳转到结果页面
    setActiveStep("result");
    
    // 刷新历史记录，显示新生成的图片
    setTimeout(() => {
      fetchHistory();
    }, 1000); // 延迟1秒刷新，确保后端数据已保存
  };

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
          
          {/* Token不足对话框 */}
          <Dialog open={showTokenDialog} onOpenChange={setShowTokenDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl text-center">余额不足</DialogTitle>
                <DialogDescription className="text-center pt-4">
                  <div className="space-y-2">
                    <p>您的余额不足，无法制作纹身贴。</p>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm">
                        <span className="text-gray-600">当前余额:</span> 
                        <span className="font-semibold text-red-500 ml-1">{tokenErrorMessage.match(/当前余额: (\d+)/)?.[1] || '0'} Token</span>
                      </p>
                      <p className="text-sm mt-1">
                        <span className="text-gray-600">制作纹身贴需要:</span> 
                        <span className="font-semibold text-blue-500 ml-1">1000 Token</span>
                      </p>
                    </div>
                    <p className="text-sm text-gray-600">是否前往充值页面购买Token？</p>
                  </div>
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-center my-4">
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                </div>
              </div>
              <DialogFooter className="flex sm:justify-center gap-4 mt-4">
                <Button variant="outline" onClick={() => setShowTokenDialog(false)}>
                  取消
                </Button>
                <Button className="pet-button" onClick={goToPricing}>
                  前往充值
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* 生成进度对话框 */}
          <Dialog open={isGenerating} onOpenChange={(open) => {
            if (!open) {
              handleCancelGeneration();
            }
          }}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-center">AI正在生成您的宠物贴纸</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center space-y-4 py-6">
                <PawLoadingAnimation />
                <div className="text-center space-y-2">
                  <p className="text-lg font-medium">{generationStatus}</p>
                  {/* 添加调试信息
                  {process.env.NODE_ENV === 'development' && (
                    <p className="text-xs text-gray-400">调试: 当前状态 = "{generationStatus}"</p>
                  )} */}
                  {generationStatus === "生成失败" ? (
                    <div className="space-y-1">
                      <p className="text-sm text-red-600">生成任务失败，请重试</p>
                      <p className="text-xs text-gray-500">您可以重新生成或返回上一步调整参数</p>
                    </div>
                  ) : generationStatus === "生成超时" ? (
                    <div className="space-y-1">
                      <p className="text-sm text-amber-600">生成任务超时，可能仍在后台进行中</p>
                      <p className="text-xs text-gray-500">您可以重新生成或稍后在历史记录中查看结果</p>
                    </div>
                  ) : generationStatus === "生成失败，未扣除Token，请重新开始" ? (
                    <div className="space-y-1">
                      <p className="text-sm text-red-600">生成任务超时失败</p>
                      <p className="text-xs text-green-600 font-medium">✓ 未扣除Token，请重新开始</p>
                      <p className="text-xs text-gray-500">您可以重新生成或返回上一步调整参数</p>
                    </div>
                  ) : generationStatus === "网络错误" ? (
                    <div className="space-y-1">
                      <p className="text-sm text-red-600">网络连接异常</p>
                      <p className="text-xs text-gray-500">请检查网络连接后重试</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">这可能需要2-3分钟，请耐心等待</p>
                  )}
                </div>
                <div className="w-full space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>进度</span>
                    <span>{generationProgress}%</span>
                  </div>
                  <Progress value={generationProgress} className="h-2" />
                </div>
              </div>
              <DialogFooter className="flex justify-center">
                {generationStatus === "生成失败" || generationStatus === "生成超时" || generationStatus === "生成失败，未扣除Token，请重新开始" || generationStatus === "网络错误" ? (
                  <div className="flex space-x-2 w-full">
                    <Button 
                      variant="outline" 
                      onClick={handleCancelGeneration}
                      className="flex-1"
                    >
                      关闭
                    </Button>
                    <Button 
                      onClick={() => {
                        // 重置状态并重新生成
                        setGenerationProgress(0);
                        setGenerationStatus("正在准备...");
                        // 短暂延迟后重新生成
                        setTimeout(() => {
                          handleGenerate();
                        }, 500);
                      }}
                      className="flex-1 pet-button"
                    >
                      重新生成
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={handleCancelGeneration}
                    className="w-full"
                  >
                    取消生成
                  </Button>
                )}
              </DialogFooter>
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
              
              {/* 显示上传进度 */}
              {isUploading && (
                <Card className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">上传进度</span>
                          <span className="text-sm text-gray-500">{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} className="h-2" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 text-center">
                      正在上传您的宠物照片，请稍等...
                    </p>
                  </div>
                </Card>
              )}
              
              {/* 显示上传错误 */}
              {uploadError && (
                <Card className="p-6 border-red-200 bg-red-50">
                  <div className="text-center space-y-2">
                    <p className="text-red-600 font-medium">上传失败</p>
                    <p className="text-sm text-red-500">{uploadError}</p>
                    <Button 
                      onClick={() => {
                        setUploadError("");
                        setUploadedImage(null);
                        setImageId("");
                      }}
                      variant="outline"
                      className="mt-2"
                    >
                      重新上传
                    </Button>
                  </div>
                </Card>
              )}
              
              <div className="flex justify-end">
                <Button 
                  className={`pet-button transition-all duration-500 ${
                    uploadedImage && imageId && !isUploading ? 'scale-105 shadow-lg hover:scale-110' : ''
                  } ${isTransitioning || isUploading ? 'cursor-not-allowed opacity-90' : ''}`}
                  disabled={!uploadedImage || !imageId || isUploading || isTransitioning}
                  onClick={handleProceedToStyle}
                >
                  {isTransitioning ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="animate-pulse">准备中...</span>
                    </>
                  ) : isUploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>上传中...</span>
                    </>
                  ) : uploadedImage && imageId ? (
                    <>
                      选择风格
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 transition-transform group-hover:translate-x-1"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </>
                  ) : (
                    '请先上传照片'
                  )}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="style" className="space-y-8 animate-in fade-in-50 slide-in-from-right-4 duration-700">
              <div className="text-center mb-6 animate-in fade-in-0 slide-in-from-top-2 duration-500 delay-200">
                <h2 className="text-2xl font-display font-semibold mb-2 bg-clip-text text-transparent bg-gradient-pet">
                  选择您喜欢的画风
                </h2>
                <div className="w-20 h-1 bg-gradient-pet mx-auto mt-3 rounded-full"></div>
              </div>
              
              <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-300">
                <StyleSelector 
                  selectedStyle={selectedStyle}
                  onStyleSelect={handleStyleSelect}
                  onStylePromptChange={handleStylePromptChange}
                />
              </div>
              
              <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-500">
                <FeatureSelector
                  selectedFeatures={selectedFeatures}
                  onFeaturesChange={handleFeaturesChange}
                  customFeatures={customFeatures}
                  onCustomFeaturesChange={handleCustomFeaturesChange}
                  additionalElements={additionalElements}
                  onAdditionalElementsChange={handleAdditionalElementsChange}
                />
              </div>
              
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
              
              {/* 当前生成结果展示 - 只在有结果且结果数量大于1时显示 */}
              {resultImages.length > 1 && (
                <div className="mt-8">
                  <h3 className="text-lg font-display font-medium mb-4">本次生成的其他结果</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {resultImages.map((image, index) => (
                      <div 
                        key={`current-${index}`}
                        className={`cursor-pointer border-2 rounded-lg overflow-hidden transition-all duration-200 ${
                          selectedImage?.type === 'current' && selectedImage?.index === index 
                            ? 'border-pet-pink shadow-lg' 
                            : 'border-gray-200 hover:border-pet-pink/50'
                        }`}
                        onClick={() => handleImageSelect(image, 'current', index)}
                      >
                        <img 
                          src={image} 
                          alt={`生成结果 ${index + 1}`} 
                          className="w-full aspect-square object-cover"
                        />
                        {selectedImage?.type === 'current' && selectedImage?.index === index && (
                          <div className="absolute top-2 right-2 bg-pet-pink text-white rounded-full p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 历史生成记录展示 */}
              {historyImages.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-display font-medium mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pet-pink">
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                      <path d="M21 3v5h-5"></path>
                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                      <path d="M3 21v-5h5"></path>
                    </svg>
                    您的历史作品
                    <span className="text-sm text-gray-500 font-normal">({historyImages.length})</span>
                  </h3>
                  
                  {isLoadingHistory ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pet-pink"></div>
                    </div>
                  ) : historyError ? (
                    <div className="text-center py-8">
                      <p className="text-red-500 mb-2">{historyError}</p>
                      <Button onClick={fetchHistory} variant="outline" size="sm">
                        重新获取
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {historyImages.map((historyItem, index) => (
                        <div 
                          key={historyItem.id}
                          className={`group cursor-pointer border-2 rounded-lg overflow-hidden transition-all duration-200 relative ${
                            selectedImage?.type === 'history' && selectedImage?.historyId === historyItem.id
                              ? 'border-pet-pink shadow-lg'
                              : 'border-gray-200 hover:border-pet-pink/50 hover:shadow-md'
                          }`}
                          onClick={() => handleImageSelect(historyItem.resultUrl, 'history', undefined, historyItem.id)}
                        >
                          <img 
                            src={historyItem.resultUrl} 
                            alt={historyItem.title} 
                            className="w-full aspect-square object-cover"
                          />
                          {selectedImage?.type === 'history' && selectedImage?.historyId === historyItem.id && (
                            <div className="absolute top-2 right-2 bg-pet-pink text-white rounded-full p-1">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                            <p className="text-white text-xs truncate">{historyItem.title}</p>
                            <p className="text-white/70 text-xs">
                              {new Date(historyItem.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* 选择提示 */}
                  {(resultImages.length > 0 || historyImages.length > 0) && (
                    <div className="mt-6 p-4 bg-pet-yellow/10 border border-pet-yellow/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pet-orange">
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M12 16v-4"></path>
                          <path d="M12 8h.01"></path>
                        </svg>
                        <span className="text-sm font-medium text-pet-orange">选择提示</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {selectedImage 
                          ? `已选中${selectedImage.type === 'current' ? '本次生成' : '历史作品'}中的图片，点击"确认使用"继续` 
                          : '请点击选择一张图片，然后点击"确认使用"按钮继续'
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Usage Counter */}
        <div className="max-w-4xl mx-auto mt-12 p-4 bg-gray-50 rounded-xl">
          <p className="text-center text-sm text-gray-500">
            <Link to="/pricing" className="text-pet-pink ml-1 hover:underline">
              升级会员获取更多功能
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default CreatePage;
