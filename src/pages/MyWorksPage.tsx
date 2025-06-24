import { useState, useEffect } from 'react';
import Layout from "@/components/Layout";
import { PawPrint, Heart, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

interface GenerationData {
  id: string;
  title: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  style_id: string;
  uploaded_image_id: string;
  uploaded_images?: {
    id: string;
    storage_path: string;
    original_filename: string;
  };
  styles?: {
    id: string;
    name: string;
  };
  generation_results?: Array<{
    id: string;
    result_url: string;
  }>;
}

const MyWorksPage = () => {
  const { user } = useAuth();
  const [generations, setGenerations] = useState<GenerationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const ITEMS_PER_PAGE = 6;

  const fetchGenerations = async (pageNum: number = 0, append: boolean = false) => {
    if (!user) return;

    try {
      if (pageNum === 0) setLoading(true);
      else setLoadingMore(true);

      // 首先获取用户已完成的生成任务
      const { data: generationsData, error: generationsError } = await supabase
        .from('generations')
        .select('id, title, status, created_at, style_id, uploaded_image_id')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .range(pageNum * ITEMS_PER_PAGE, (pageNum + 1) * ITEMS_PER_PAGE - 1);

      if (generationsError) {
        console.error('获取作品失败:', generationsError);
        return;
      }

      if (!generationsData || generationsData.length === 0) {
        if (append) {
          setHasMore(false);
        } else {
          setGenerations([]);
        }
        return;
      }

      // 获取这些生成任务的结果
      const generationIds = generationsData.map(g => g.id);
      const { data: resultsData } = await supabase
        .from('generation_results')
        .select('generation_id, id, result_url')
        .in('generation_id', generationIds);

      // 只保留有结果的生成任务
      const generationsWithResults = generationsData.filter(gen => 
        resultsData?.some(result => result.generation_id === gen.id)
      );

      if (generationsWithResults.length === 0) {
        if (append) {
          setHasMore(false);
        } else {
          setGenerations([]);
        }
        return;
      }

      // 预定义的风格映射作为备用
      const styleMapping: Record<string, string> = {
        'watercolor': '蜡笔插画风',
        'minimalist': '粗线条手绘风',
        'ghibli': '吉卜力风',
        'sanrio': 'Q版卡通风',
      };

      // 获取样式信息
      const styleIds = [...new Set(generationsWithResults.map(g => g.style_id))];
      
      let stylesData: Array<{id: string, name: string}> = [];
      
      try {
        const { data, error } = await supabase
          .from('styles')
          .select('id, name')
          .in('id', styleIds);
          
        if (!error && data) {
          stylesData = data;
        }
      } catch (error) {
        console.log('styles表不存在，使用预定义映射');
      }

      // 组合数据
      const enrichedGenerations = generationsWithResults.map(generation => {
        const matchedStyle = stylesData?.find(style => style.id === generation.style_id);
        const fallbackStyleName = styleMapping[generation.style_id] || generation.style_id;
        
        return {
          id: generation.id,
          title: generation.title,
          status: generation.status as 'pending' | 'processing' | 'completed' | 'failed',
          created_at: generation.created_at,
          style_id: generation.style_id,
          uploaded_image_id: generation.uploaded_image_id,
          styles: matchedStyle || { id: generation.style_id, name: fallbackStyleName },
          generation_results: resultsData?.filter(result => result.generation_id === generation.id).map(result => ({
            id: result.id,
            result_url: result.result_url
          })) || []
        };
      });

      if (append) {
        setGenerations(prev => [...prev, ...enrichedGenerations]);
      } else {
        setGenerations(enrichedGenerations);
      }

      setHasMore(generationsData.length === ITEMS_PER_PAGE);

    } catch (error) {
      console.error('获取作品时出错:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchGenerations();
  }, [user]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchGenerations(nextPage, true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'processing':
        return '生成中';
      case 'failed':
        return '生成失败';
      default:
        return '等待中';
    }
  };

  // 获取原图URL
  const getImageUrl = (storagePath: string) => {
    const { data } = supabase.storage
      .from('pawfect-images')
      .getPublicUrl(storagePath);
    return data.publicUrl;
  };

  if (!user) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">请先登录</h1>
          <p className="text-gray-600">您需要登录后才能查看您的作品</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-12">
        <div className="text-center mb-12">
          <div className="inline-block">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4 relative">
              我的
              <span className="bg-clip-text text-transparent bg-gradient-pet">作品集</span>
              <div className="absolute -top-6 -right-6">
                <Heart className="h-6 w-6 text-pet-pink fill-pet-pink animate-pulse-soft" />
              </div>
              <div className="absolute -bottom-4 -left-6">
                <PawPrint className="h-5 w-5 text-pet-peach fill-pet-peach/30" />
              </div>
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            查看您创作的所有宠物纹身贴作品，记录与爱宠的美好时光
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-pet-pink mx-auto mb-4" />
              <p className="text-gray-600">正在加载您的作品...</p>
            </div>
          </div>
        ) : generations.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-pet-yellow/10 border border-pet-yellow/30 rounded-2xl p-8 max-w-md mx-auto">
              <PawPrint className="h-12 w-12 text-pet-orange mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">还没有作品</h3>
              <p className="text-gray-600 mb-4">
                您还没有创建任何作品，快去为您的爱宠制作专属纹身贴吧！
              </p>
              <Button 
                onClick={() => window.location.href = '/create'}
                className="bg-pet-pink text-white px-6 py-2 rounded-full hover:bg-pet-pink/90"
              >
                开始创作
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {generations.map((generation) => {
                const uploadedImage = generation.uploaded_images;
                const style = generation.styles;
                
                return (
                  <div key={generation.id} className="rounded-[2rem] overflow-hidden shadow-lg hover:shadow-xl transition-all border-2 border-pet-yellow/20 hover:border-pet-yellow transform hover:-translate-y-2 bg-white">
                    <div className="p-6">
                      {/* 标题和状态区域 */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <PawPrint className="h-5 w-5 mr-2 text-pet-pink" />
                          <h3 className="font-display font-bold text-lg truncate">
                            {generation.title || style?.name || '纹身贴作品'}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {getStatusIcon(generation.status)}
                          <span className="text-sm text-gray-600">{getStatusText(generation.status)}</span>
                        </div>
                      </div>

                      {/* 生成图片区域 */}
                      <div className="mb-4">
                        <div className="aspect-square rounded-2xl overflow-hidden relative group border-2 border-pet-pink/30">
                          {generation.status === 'completed' && generation.generation_results && generation.generation_results.length > 0 ? (
                            <>
                              <img 
                                src={generation.generation_results[0].result_url} 
                                alt="生成的纹身贴图案"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-gradient-pet opacity-0 group-hover:opacity-70 transition-opacity flex items-center justify-center">
                                <div className="text-white text-center translate-y-4 group-hover:translate-y-0 transition-transform">
                                  <Heart className="h-8 w-8 mx-auto fill-white" />
                                  <p className="font-bold mt-1 text-sm">查看详情</p>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                              {generation.status === 'processing' ? (
                                <div className="text-center">
                                  <Loader2 className="h-8 w-8 animate-spin text-pet-pink mx-auto mb-2" />
                                  <p className="text-sm text-gray-500">生成中...</p>
                                </div>
                              ) : generation.status === 'failed' ? (
                                <div className="text-center">
                                  <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                                  <p className="text-sm text-gray-500">生成失败</p>
                                </div>
                              ) : (
                                <div className="text-center">
                                  <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                                  <p className="text-sm text-gray-500">等待生成</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 创建时间 */}
                      <div className="text-center">
                        <p className="text-gray-500 text-sm">
                          创建于 {new Date(generation.created_at).toLocaleDateString('zh-CN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 加载更多按钮 */}
            {hasMore && (
              <div className="flex justify-center mt-12">
                <Button 
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="pet-button px-8 py-3 mx-auto rounded-full"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      加载中...
                    </>
                  ) : (
                    <>
                      加载更多作品
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                        <path d="m6 9 6 6 6-6"/>
                      </svg>
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default MyWorksPage; 