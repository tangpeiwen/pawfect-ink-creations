
import Layout from "@/components/Layout";
import { PawPrint, Heart } from "lucide-react";

const GalleryPage = () => {
  const galleryItems = [
    { id: 1, name: "小白", style: "简约线条风", image: "/placeholder.svg" },
    { id: 2, name: "贝贝", style: "水彩淡染风", image: "/placeholder.svg" },
    { id: 3, name: "汤圆", style: "可爱卡通风", image: "/placeholder.svg" },
    { id: 4, name: "小橙", style: "几何创意风", image: "/placeholder.svg" },
    { id: 5, name: "奶茶", style: "简约线条风", image: "/placeholder.svg" },
    { id: 6, name: "豆豆", style: "水彩淡染风", image: "/placeholder.svg" },
    { id: 7, name: "花生", style: "可爱卡通风", image: "/placeholder.svg" },
    { id: 8, name: "牛奶", style: "几何创意风", image: "/placeholder.svg" },
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {galleryItems.map((item) => (
            <div key={item.id} className="rounded-[1.5rem] overflow-hidden shadow-md hover:shadow-lg transition-all border-2 border-pet-yellow/20 hover:border-pet-yellow transform hover:-translate-y-1">
              <div className="aspect-square p-2">
                <div className="w-full h-full rounded-2xl overflow-hidden relative group">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-pet opacity-0 group-hover:opacity-70 transition-opacity flex items-center justify-center">
                    <div className="text-white text-center translate-y-4 group-hover:translate-y-0 transition-transform">
                      <Heart className="h-8 w-8 mx-auto fill-white" />
                      <p className="font-bold mt-1">查看详情</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <PawPrint className="h-4 w-4 mr-1 text-pet-pink" />
                    <h3 className="font-display font-bold">{item.name}</h3>
                  </div>
                  <div className="bg-pet-yellow/20 rounded-full px-3 py-1">
                    <p className="text-xs text-gray-700">{item.style}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-12">
          <button className="pet-button px-8 py-3 mx-auto rounded-full">
            加载更多作品
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="m6 9 6 6 6-6"/></svg>
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default GalleryPage;
