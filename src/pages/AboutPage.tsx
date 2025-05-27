
import Layout from "@/components/Layout";

const AboutPage = () => {
  const team = [
    {
      name: "王小明",
      role: "创始人 & CEO",
      bio: "宠物爱好者，拥有10年互联网产品经验，致力于将AI技术应用于宠物领域",
      avatar: "/placeholder.svg"
    },
    {
      name: "李小红",
      role: "AI技术总监",
      bio: "前谷歌AI工程师，专注于计算机视觉和图像生成技术的研发",
      avatar: "/placeholder.svg"
    },
    {
      name: "张小华",
      role: "产品设计师",
      bio: "拥有8年设计经验，热爱宠物，擅长将情感融入产品设计中",
      avatar: "/placeholder.svg"
    }
  ];

  return (
    <Layout>
      <div className="container py-12">
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
            关于<span className="bg-clip-text text-transparent bg-gradient-pet">萌宠纹身</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            我们致力于为宠物爱好者创造独特的纪念方式，通过AI技术将您珍爱的宠物变成艺术品
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
          <div>
            <h2 className="text-2xl font-display font-bold mb-6">我们的故事</h2>
            <p className="text-gray-600 mb-4">
            Pawfect Ink诞生于2023年，源于创始人王小明与他的猫咪"小橙"的故事。当他想为挚爱的小橙留下永久纪念时，发现传统纹身既永久又痛苦，而普通贴纸又缺乏艺术性和个性化。
            </p>
            <p className="text-gray-600 mb-4">
              作为一名技术爱好者，王小明与志同道合的朋友们开发了AI驱动的宠物纹身贴生成系统，希望能为所有宠物主人提供一种既美观又无痛的方式来表达对宠物的爱。
            </p>
            <p className="text-gray-600">
              如今，Pawfect Ink已帮助数千位宠物主人创造了独特的纪念，我们将继续努力，让每一位宠物主人都能拥有属于自己的艺术品。
            </p>
          </div>
          <div className="aspect-square relative">
            <div className="w-4/5 h-4/5 bg-pet-pink/20 rounded-2xl absolute top-0 left-0"></div>
            <div className="w-4/5 h-4/5 rounded-2xl shadow-lg overflow-hidden absolute bottom-0 right-0">
              <img src="/placeholder.svg" alt="团队合影" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <div className="mb-24">
          <h2 className="text-2xl font-display font-bold text-center mb-12">我们的团队</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-40 h-40 mx-auto rounded-full overflow-hidden mb-4">
                  <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-display font-bold text-xl">{member.name}</h3>
                <p className="text-pet-pink font-medium mb-3">{member.role}</p>
                <p className="text-gray-600">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 p-8 rounded-2xl">
          <h2 className="text-2xl font-display font-bold text-center mb-8">我们的使命</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto bg-pet-pink/20 rounded-full flex items-center justify-center text-pet-pink mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
              </div>
              <h3 className="font-display font-bold mb-2">传递爱与纪念</h3>
              <p className="text-gray-600">帮助宠物主人以艺术方式记录与宠物的美好回忆</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto bg-pet-yellow/20 rounded-full flex items-center justify-center text-pet-yellow mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M12 2v2"/><path d="M12 22v-2"/><path d="m17 20.66-1-1.73"/><path d="M11 10.27 7 3.34"/><path d="m20.66 17-1.73-1"/><path d="m3.34 7 1.73 1"/><path d="M14 12h8"/><path d="M2 12h2"/><path d="m20.66 7-1.73 1"/><path d="m3.34 17 1.73-1"/><path d="m17 3.34-1 1.73"/><path d="m11 13.73-4 6.93"/></svg>
              </div>
              <h3 className="font-display font-bold mb-2">推动技术创新</h3>
              <p className="text-gray-600">将前沿AI技术应用于生活，创造有情感连接的作品</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto bg-pet-purple/20 rounded-full flex items-center justify-center text-purple-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.8 20v-4.1l1.9.2a2.3 2.3 0 0 0 2.164-2.1V8.3c0-.5.5-1.2 1-1.2"/><path d="M17.8 12a2.3 2.3 0 0 0-2.2-2.3h-2l2-2.9A2.3 2.3 0 0 0 13.85 4H9.5a2.3 2.3 0 0 0-2.3 2.3v3.6h-3"/></svg>
              </div>
              <h3 className="font-display font-bold mb-2">倡导温馨文化</h3>
              <p className="text-gray-600">推广对宠物的关爱，建立积极健康的宠物文化</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;
