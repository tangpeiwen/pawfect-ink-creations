import Layout from "@/components/Layout";
import { PawPrint, Heart, ArrowRight } from "lucide-react";

const GalleryPage = () => {
  const galleryItems = [
    { 
      id: 1, 
      petName: "小拼", 
      style: "粗线条手绘风", 
      petPhoto: "/images/小拼.png",
      tattooDesign: "/images/小拼2.png",
      description: "小拼是一个胖胖公主，所以着重表现了“身体圆”"
    },
    { 
      id: 2, 
      petName: "二猫", 
      style: "蜡笔插画风", 
      petPhoto: "/images/二猫.png",
      tattooDesign: "/images/二猫2.png",
      description: "二猫有可爱的对眼，所以添加了“猫咪是对眼”的自定义特征"
    },
    { 
      id: 3, 
      petName: "全家福", 
      style: "可爱卡通风", 
      petPhoto: "/images/全家福.png",
      tattooDesign: "/images/全家福2.png",
      description: "为我们一家3只猫生成了不同的头像"
    },
    { 
      id: 4, 
      petName: "王冻梨(Lily)", 
      style: "蜡笔插画风", 
      petPhoto: "/images/芋头.png",
      tattooDesign: "/images/芋头2.png",
      description: "图片很好的展示了Lily美丽的毛发颜色"
    },
    // { 
    //   id: 5, 
    //   petName: "奶茶", 
    //   style: "简约线条风", 
    //   petPhoto: "/images/cat1.png",
    //   tattooDesign: "/images/线条.jpg",
    //   description: "为奶茶设计的简约线条风纹身贴"
    // },
    // { 
    //   id: 6, 
    //   petName: "豆豆", 
    //   style: "水彩淡染风", 
    //   petPhoto: "/images/cat2.png",
    //   tattooDesign: "/images/花纹.jpg",
    //   description: "为豆豆设计的水彩淡染风纹身贴"
    // },
  ];

  return (
    <Layout>
      <div className="container py-12">
        <div className="text-center mb-12">
          <div className="inline-block">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4 relative">
              宠物纹身贴
              <span className="bg-clip-text text-transparent bg-gradient-pet">作品展示</span>
              <div className="absolute -top-6 -right-6">
                <Heart className="h-6 w-6 text-pet-pink fill-pet-pink animate-pulse-soft" />
              </div>
              <div className="absolute -bottom-4 -left-6">
                <PawPrint className="h-5 w-5 text-pet-peach fill-pet-peach/30" />
              </div>
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            浏览我们的用户已经生成的宠物纹身贴作品，获取灵感为您的爱宠创作
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {galleryItems.map((item) => (
            <div key={item.id} className="rounded-[2rem] overflow-hidden shadow-lg hover:shadow-xl transition-all border-2 border-pet-yellow/20 hover:border-pet-yellow transform hover:-translate-y-2 bg-white">
              <div className="p-6">
                {/* 标题区域 */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <PawPrint className="h-5 w-5 mr-2 text-pet-pink" />
                    <h3 className="font-display font-bold text-lg">{item.petName}</h3>
                  </div>
                  <div className="bg-pet-yellow/20 rounded-full px-3 py-1">
                    <p className="text-sm text-gray-700">{item.style}</p>
                  </div>
                </div>

                {/* 图片对比区域 */}
                <div className="flex items-center gap-4 mb-4">
                  {/* 宠物照片 */}
                  <div className="flex-1">
                    <div className="text-center mb-2">
                      <span className="text-sm text-gray-500 font-medium">原始照片</span>
                    </div>
                    <div className="aspect-square rounded-2xl overflow-hidden relative group border-2 border-pet-peach/30">
                      <img 
                        src={item.petPhoto} 
                        alt={`${item.petName}的照片`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                    </div>
                  </div>

                  {/* 箭头 */}
                  <div className="flex-shrink-0">
                    <div className="bg-gradient-pet rounded-full p-3">
                      <ArrowRight className="h-6 w-6 text-white" />
                    </div>
                  </div>

                  {/* 纹身设计 */}
                  <div className="flex-1">
                    <div className="text-center mb-2">
                      <span className="text-sm text-gray-500 font-medium">生成图案</span>
                    </div>
                    <div className="aspect-square rounded-2xl overflow-hidden relative group border-2 border-pet-pink/30">
                      <img 
                        src={item.tattooDesign} 
                        alt={`${item.petName}的纹身设计`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                      <div className="absolute inset-0 bg-gradient-pet opacity-0 group-hover:opacity-70 transition-opacity flex items-center justify-center">
                        <div className="text-white text-center translate-y-4 group-hover:translate-y-0 transition-transform">
                          <Heart className="h-8 w-8 mx-auto fill-white" />
                          <p className="font-bold mt-1 text-sm">查看详情</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 描述区域 */}
                <div className="text-center">
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* <div className="flex justify-center mt-12">
          <button className="pet-button px-8 py-3 mx-auto rounded-full">
            加载更多作品
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="m6 9 6 6 6-6"/></svg>
          </button>
        </div> */}
      </div>
    </Layout>
  );
};

export default GalleryPage;
