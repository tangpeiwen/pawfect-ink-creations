import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Pattern {
  id: string;
  url: string;
  source: 'current' | 'history';
  title?: string;
  createdAt?: string;
  isSubPattern?: boolean;
  parentImageUrl?: string;
  cropArea?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface PatternSelectorProps {
  currentPatterns: string[];
  historyPatterns: any[];
  onPatternsSelected: (patterns: string[]) => void;
  onGenerateFinalSticker: (selectedPatterns: string[]) => void;
  isGenerating?: boolean;
}

const PatternSelector = ({
  currentPatterns,
  historyPatterns,
  onPatternsSelected,
  onGenerateFinalSticker,
  isGenerating = false
}: PatternSelectorProps) => {
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);
  const [expandedImages, setExpandedImages] = useState<Set<string>>(new Set());

  const MAX_SELECTIONS = 6;

  // 合并当前生成的图案和历史图案，并支持子图案切割
  const allPatterns: Pattern[] = [
    ...currentPatterns.flatMap((url, index) => {
      const mainPattern: Pattern = {
        id: `current-${index}`,
        url,
        source: 'current' as const,
        title: `当前生成 ${index + 1}`
      };
      
      // 如果图片被展开，添加4个子图案
      if (expandedImages.has(url)) {
        const subPatterns: Pattern[] = [
          {
            id: `current-${index}-sub-0`,
            url,
            source: 'current' as const,
            title: `图案 ${index + 1}-A`,
            isSubPattern: true,
            parentImageUrl: url,
            cropArea: { x: 0, y: 0, width: 50, height: 50 }
          },
          {
            id: `current-${index}-sub-1`,
            url,
            source: 'current' as const,
            title: `图案 ${index + 1}-B`,
            isSubPattern: true,
            parentImageUrl: url,
            cropArea: { x: 50, y: 0, width: 50, height: 50 }
          },
          {
            id: `current-${index}-sub-2`,
            url,
            source: 'current' as const,
            title: `图案 ${index + 1}-C`,
            isSubPattern: true,
            parentImageUrl: url,
            cropArea: { x: 0, y: 50, width: 50, height: 50 }
          },
          {
            id: `current-${index}-sub-3`,
            url,
            source: 'current' as const,
            title: `图案 ${index + 1}-D`,
            isSubPattern: true,
            parentImageUrl: url,
            cropArea: { x: 50, y: 50, width: 50, height: 50 }
          }
        ];
        return [mainPattern, ...subPatterns];
      }
      
      return [mainPattern];
    }),
    ...historyPatterns.map((item, index) => ({
      id: `history-${item.id || index}`,
      url: item.resultUrl,
      source: 'history' as const,
      title: item.title || `历史作品 ${index + 1}`,
      createdAt: item.createdAt
    }))
  ];

  // 切换图片展开状态
  const toggleImageExpansion = (imageUrl: string) => {
    const newExpanded = new Set(expandedImages);
    if (newExpanded.has(imageUrl)) {
      newExpanded.delete(imageUrl);
      toast.info("收起图案选择");
    } else {
      newExpanded.add(imageUrl);
      toast.info("展开图案选择，您可以选择单个图案");
    }
    setExpandedImages(newExpanded);
  };

  // 切换选择模式
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (!isSelectionMode) {
      setSelectedPatterns([]);
      toast.info("进入选择模式，点击图案添加到您的选择中");
    } else {
      toast.info("退出选择模式");
    }
  };

  // 处理图案选择
  const handlePatternClick = (pattern: Pattern) => {
    if (!isSelectionMode) {
      // 如果不是选择模式且是主图案，切换展开状态
      if (!pattern.isSubPattern) {
        toggleImageExpansion(pattern.url);
      }
      return;
    }

    // 获取实际的选择URL - 如果是子图案，需要生成特殊的标识符
    const selectionUrl = pattern.isSubPattern 
      ? `${pattern.url}#crop=${pattern.cropArea?.x},${pattern.cropArea?.y},${pattern.cropArea?.width},${pattern.cropArea?.height}`
      : pattern.url;

    const isSelected = selectedPatterns.includes(selectionUrl);
    
    if (isSelected) {
      // 取消选择
      const newSelected = selectedPatterns.filter(url => url !== selectionUrl);
      setSelectedPatterns(newSelected);
      onPatternsSelected(newSelected);
      toast.success("已移除图案");
    } else {
      // 添加选择
      if (selectedPatterns.length >= MAX_SELECTIONS) {
        toast.warning(`最多只能选择${MAX_SELECTIONS}个图案`);
        return;
      }
      
      const newSelected = [...selectedPatterns, selectionUrl];
      setSelectedPatterns(newSelected);
      onPatternsSelected(newSelected);
      toast.success(`已添加图案 (${newSelected.length}/${MAX_SELECTIONS})`);
    }
  };

  // 移除选中的图案
  const removeSelectedPattern = (url: string) => {
    const newSelected = selectedPatterns.filter(selectedUrl => selectedUrl !== url);
    setSelectedPatterns(newSelected);
    onPatternsSelected(newSelected);
    toast.success("已移除图案");
  };

  // 生成最终贴纸
  const handleGenerateFinalSticker = () => {
    if (selectedPatterns.length === 0) {
      toast.error("请至少选择一个图案");
      return;
    }
    
    onGenerateFinalSticker(selectedPatterns);
    toast.info(`正在生成包含${selectedPatterns.length}个图案的最终贴纸...`);
  };

  return (
    <div className="space-y-6">
      {/* 选择模式控制 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={toggleSelectionMode}
            variant={isSelectionMode ? "default" : "outline"}
            className={isSelectionMode ? "pet-button" : ""}
          >
            {isSelectionMode ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                选择模式
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M9 12l2 2 4-4"></path>
                  <path d="M21 12c.552 0 1-.448 1-1V5c0-.552-.448-1-1-1H3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1h18z"></path>
                </svg>
                进入选择模式
              </>
            )}
          </Button>
          
          {isSelectionMode && (
            <Badge variant="secondary" className="text-sm">
              已选择 {selectedPatterns.length}/{MAX_SELECTIONS}
            </Badge>
          )}
        </div>

        {selectedPatterns.length > 0 && (
          <Button
            onClick={handleGenerateFinalSticker}
            disabled={isGenerating}
            className="pet-button"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                生成中...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-15a2 2 0 0 1 2-2h4"></path>
                  <path d="M7 10l5 5L22 5"></path>
                </svg>
                生成最终贴纸 ({selectedPatterns.length})
              </>
            )}
          </Button>
        )}
      </div>

      {/* 使用说明 */}
      {(isSelectionMode || expandedImages.size > 0) && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 mt-0.5 flex-shrink-0">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 16v-4"></path>
                <path d="M12 8h.01"></path>
              </svg>
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">使用说明：</p>
                <ul className="space-y-1 text-blue-600">
                  {!isSelectionMode && <li>• 点击图片可以展开查看单个图案</li>}
                  {isSelectionMode && (
                    <>
                      <li>• 点击任何图案将其添加到您的选择中</li>
                      <li>• 最多可选择{MAX_SELECTIONS}个图案</li>
                      <li>• 再次点击已选择的图案可以取消选择</li>
                      <li>• 选择完成后点击"生成最终贴纸"</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 我的选择区域 */}
      {selectedPatterns.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pet-pink">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                </svg>
                我的选择
              </h4>
              <Badge className="bg-pet-pink text-white">
                {selectedPatterns.length}/{MAX_SELECTIONS}
              </Badge>
            </div>
            
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {selectedPatterns.map((selectionUrl, index) => {
                // 解析选择URL以获取原始URL和裁剪信息
                const [baseUrl, cropInfo] = selectionUrl.split('#crop=');
                const isSubPattern = !!cropInfo;
                
                return (
                  <div key={selectionUrl} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden border-2 border-pet-pink">
                      {isSubPattern ? (
                        <SubPatternImage 
                          imageUrl={baseUrl}
                          cropInfo={cropInfo}
                          alt={`选择的图案 ${index + 1}`}
                        />
                      ) : (
                        <img
                          src={baseUrl}
                          alt={`选择的图案 ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <button
                      onClick={() => removeSelectedPattern(selectionUrl)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      ×
                    </button>
                    <div className="absolute bottom-1 left-1 bg-pet-pink text-white text-xs rounded px-1">
                      {index + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 所有图案展示 */}
      <div className="space-y-4">
        {/* 当前生成的图案 */}
        {currentPatterns.length > 0 && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
              </svg>
              当前生成的图案
              {!isSelectionMode && (
                <span className="text-sm text-gray-500">（点击图片可展开选择单个图案）</span>
              )}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {allPatterns
                .filter(pattern => pattern.source === 'current')
                .map((pattern) => {
                  const selectionUrl = pattern.isSubPattern 
                    ? `${pattern.url}#crop=${pattern.cropArea?.x},${pattern.cropArea?.y},${pattern.cropArea?.width},${pattern.cropArea?.height}`
                    : pattern.url;
                  
                  return (
                    <PatternCard
                      key={pattern.id}
                      pattern={pattern}
                      isSelected={selectedPatterns.includes(selectionUrl)}
                      isSelectionMode={isSelectionMode}
                      onClick={() => handlePatternClick(pattern)}
                      isExpanded={!pattern.isSubPattern && expandedImages.has(pattern.url)}
                    />
                  );
                })}
            </div>
          </div>
        )}

        {/* 历史图案 */}
        {historyPatterns.length > 0 && (
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                <path d="M21 3v5h-5"></path>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                <path d="M3 21v-5h5"></path>
              </svg>
              历史作品
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {allPatterns
                .filter(pattern => pattern.source === 'history')
                .map((pattern) => (
                  <PatternCard
                    key={pattern.id}
                    pattern={pattern}
                    isSelected={selectedPatterns.includes(pattern.url)}
                    isSelectionMode={isSelectionMode}
                    onClick={() => handlePatternClick(pattern)}
                  />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 子图案图片组件
interface SubPatternImageProps {
  imageUrl: string;
  cropInfo: string;
  alt: string;
}

const SubPatternImage = ({ imageUrl, cropInfo, alt }: SubPatternImageProps) => {
  const [x, y, width, height] = cropInfo.split(',').map(Number);
  
  return (
    <div className="w-full h-full overflow-hidden relative">
      <img
        src={imageUrl}
        alt={alt}
        className="w-full h-full object-cover"
        style={{
          transform: `scale(${200 / width}) translate(-${x * 2}%, -${y * 2}%)`,
          transformOrigin: 'top left'
        }}
      />
    </div>
  );
};

// 图案卡片组件
interface PatternCardProps {
  pattern: Pattern;
  isSelected: boolean;
  isSelectionMode: boolean;
  onClick: () => void;
  isExpanded?: boolean;
}

const PatternCard = ({ pattern, isSelected, isSelectionMode, onClick, isExpanded }: PatternCardProps) => {
  return (
    <div
      className={`relative cursor-pointer transition-all duration-200 ${
        isSelectionMode ? 'hover:scale-105' : ''
      } ${
        isSelected ? 'ring-4 ring-pet-pink ring-opacity-50' : ''
      } ${
        pattern.isSubPattern ? 'ml-4 mt-2' : ''
      }`}
      onClick={onClick}
    >
      <div className={`aspect-square rounded-lg overflow-hidden border-2 ${
        isSelected ? 'border-pet-pink' : 'border-transparent hover:border-gray-300'
      } ${
        pattern.isSubPattern ? 'border-dashed' : ''
      }`}>
        {pattern.isSubPattern && pattern.cropArea ? (
          <SubPatternImage 
            imageUrl={pattern.url}
            cropInfo={`${pattern.cropArea.x},${pattern.cropArea.y},${pattern.cropArea.width},${pattern.cropArea.height}`}
            alt={pattern.title || ''}
          />
        ) : (
          <img
            src={pattern.url}
            alt={pattern.title}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      
      {/* 展开指示器 */}
      {!pattern.isSubPattern && !isSelectionMode && (
        <div className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          isExpanded 
            ? 'bg-pet-pink border-pet-pink text-white' 
            : 'bg-white border-gray-300 hover:border-pet-pink'
        }`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${isExpanded ? 'rotate-45' : ''}`}>
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </div>
      )}
      
      {/* 选择状态指示器 */}
      {isSelectionMode && (
        <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          isSelected 
            ? 'bg-pet-pink border-pet-pink text-white' 
            : 'bg-white border-gray-300 hover:border-pet-pink'
        }`}>
          {isSelected && (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          )}
        </div>
      )}
      
      {/* 子图案标识 */}
      {pattern.isSubPattern && (
        <div className="absolute bottom-1 right-1 bg-blue-500 text-white text-xs rounded px-1">
          {pattern.title?.split('-')[1] || 'SUB'}
        </div>
      )}
      
      {/* 图案信息 */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 hover:opacity-100 transition-opacity">
        <p className="text-white text-xs truncate">{pattern.title}</p>
        {pattern.createdAt && (
          <p className="text-white/80 text-xs">
            {new Date(pattern.createdAt).toLocaleDateString('zh-CN')}
          </p>
        )}
      </div>
    </div>
  );
};

export default PatternSelector; 