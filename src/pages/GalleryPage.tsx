
import Layout from "@/components/Layout";

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
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
            宠物纹身贴<span className="bg-clip-text text-transparent bg-gradient-pet">作品展示</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            浏览我们的用户已经生成的宠物纹身贴作品，获取灵感为您的爱宠创作
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {galleryItems.map((item) => (
            <div key={item.id} className="rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all">
              <div className="aspect-square">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <h3 className="font-display font-bold">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.style}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-12">
          <button className="pet-button px-8 py-3 mx-auto">
            加载更多作品
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2"><path d="m6 9 6 6 6-6"/></svg>
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default GalleryPage;
