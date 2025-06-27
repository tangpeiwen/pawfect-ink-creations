import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { ArrowRight, Cat, PawPrint, Heart, UserPlus, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import PixelTransition from "@/components/PixelTransition";
import { useAuth } from "@/hooks/useAuth";

// 认证状态相关的CTA按钮组件
const AuthAwareCTA = ({ 
  className = "", 
  variant = "primary" 
}: { 
  className?: string; 
  variant?: "primary" | "secondary" 
}) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Button 
        disabled 
        className={`${variant === "primary" 
          ? "bg-pet-pink/50" 
          : "bg-black/50"} text-white font-bold px-8 py-6 rounded-full text-lg border-[3px] border-black ${className}`}
      >
        加载中...
      </Button>
    );
  }

  if (isAuthenticated) {
    return (
      <Link to="/create">
        <Button className={`${variant === "primary" 
          ? "bg-pet-pink hover:bg-pet-pink/90" 
          : "bg-black hover:bg-gray-800"} text-white font-bold px-8 py-6 rounded-full text-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] transition-all ${className}`}>
          立即开始设计
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </Link>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <Link to="/register">
        <Button className={`${variant === "primary" 
          ? "bg-pet-pink hover:bg-pet-pink/90" 
          : "bg-black hover:bg-gray-800"} text-white font-bold px-8 py-6 rounded-full text-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] transition-all ${className}`}>
          立即注册开始
          <UserPlus className="ml-2 h-5 w-5" />
        </Button>
      </Link>
      <p className="text-sm text-gray-600">
        已有账号？
        <Link to="/sign-in" className="text-pet-pink hover:underline ml-1 font-medium">
          直接登录
        </Link>
      </p>
    </div>
  );
};

const Hero = () => (
  <section className="py-16 md:py-20 relative">
    <div className="container px-8 md:px-12 lg:px-16 mx-auto max-w-6xl relative">
      <div className="bg-white relative rounded-[2rem] border-[6px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative z-10">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-8 md:p-12 flex flex-col justify-center relative">
            {/* <img
              src="/images/doodle-cat.svg"
              alt="装饰猫咪"
              className="absolute right-[80px] top-[180px] w-[70px] z-40"
            /> */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 text-black">
              🐾 和你的宠物，一起贴在心上
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-10">
              上传照片，选择风格，一键生成专属宠物贴纸和纹身贴。<br />
              用另一种方式，把“它”带在身边。
            </p>
            {/* <p className="text-lg md:text-xl text-gray-700 mb-10">
              用另一种方式，把"它"带在身边。
            </p> */}
            <img
              src="/images/bikini_cat.svg"
              className="absolute -left-36 -top-[100px] w-36 z-50 animate-slide-down"
              // className="absolute left-[100px] -top-[110px] w-[150px] z-50"
            />
            {/* <img
              src="/images/bikini_cat.svg"
              className="absolute left-[1000px] -top-[150px] w-48 z-50"
            /> */}
        
            <div>
              <AuthAwareCTA variant="primary" className="animate-pulse" />
            </div>
          </div>
          <div className="relative md:block hidden aspect-square">
            <div className="absolute inset-0 p-8 md:p-12">
              <AspectRatio ratio={1} className="w-full h-full">
                <PixelTransition
                  firstContent={
                    <div className="w-full h-full flex items-center justify-center overflow-hidden">
                      <img
                        src="/images/cat1.png"
                        alt="Cat photo 1"
                        className="h-[90%] w-auto object-contain"
                      />
                    </div>
                  }
                  secondContent={
                    <div className="w-full h-full flex items-center justify-center overflow-hidden">
                      <img
                        src="/images/cat2.png"
                        alt="Cat photo 2"
                        className="h-[90%] w-auto object-contain"
                      />
                    </div>
                  }
                  gridSize={12}
                  pixelColor="#ffffff"
                  animationStepDuration={0.4}
                  className="w-full h-full"
                />
              </AspectRatio>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const StepCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <div className="bg-white p-8 rounded-2xl border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all">
    <div className="w-20 h-20 bg-white rounded-full border-[3px] border-black flex items-center justify-center mx-auto mb-6">
      <Icon className="h-10 w-10 text-black" />
    </div>
    <h3 className="text-2xl font-display font-bold mb-3 text-center">{title}</h3>
    <p className="text-gray-700 text-center">
      {description}
    </p>
  </div>
);

const Features = () => {
  return (
    <section className="py-16 bg-pet-yellow/20 relative">
      <div className="container px-8 md:px-12 lg:px-16 mx-auto max-w-6xl relative">
        <img 
          src="/images/dogs.svg" 
          alt="dogs" 
          className="absolute -left-72 -bottom-16 w-80 z-0" 
        />
        <img 
          src="/images/dog2.svg" 
          alt="dog2" 
          className="absolute left-[1200px] -bottom-16 w-48 z-0" 
        />
         {/* <img
              src="/images/bikini_cat.svg"
              className="absolute -right-[300px] -bottom-16 w-48 z-50 transform scale-x-[-1]"
            />  */}

        <img
          src="/images/bird.svg"
          className="absolute left-0 -top-[120px] w-[120px] z-50 animate-slide-lr"
        />

        <div className="bg-pet-yellow rounded-[2rem] border-[6px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-16 relative z-0">
          {/* <img
            src="/images/bikini_cat.svg"
            // alt="蝴蝶结"
            className="absolute -right-36 bottom-7 w-40 z-50"
          /> */}
          <div className="p-8 md:p-12 text-center relative">
            <h2 className="text-4xl font-display font-bold mb-6 relative z-10">
              简单三步，<span className="text-pet-pink">宠物也能做主角！</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-800 max-w-3xl mx-auto">
            一张照片，一点魔法🧚‍♀️，你的宠物就能变身专属贴纸！
            </p>
          </div>

          {/* 装饰性图片 - 侧躺猫咪 - 放在黄色方框内 */}
          <img
            src="/images/Wink.svg"
            alt="猫咪线稿"
            className="absolute left-2 top-10 w-24 z-0"
          />


        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6 relative z-10">
          <StepCard
            icon={Cat}
            title="上传照片"
            description="拍一张毛孩子的萌照，支持多角度，我们会捕捉它最可爱的瞬间！"
          />

          <StepCard
            icon={PawPrint}
            title="选择风格"
            description="想要简约线稿？还是俏皮涂鸦？多种艺术风格任你选，打造只属于你们的贴纸风格。"
          />

          <StepCard
            icon={Heart}
            title="AI生成魔法"
            description="AI将照片转化为卡通贴纸，不用会画画，也能拥有专属的宠物形象！"
          />

          <StepCard
            icon={Package}
            title="一站到家"
            description="生成的设计图可一键下单制作贴纸或纹身贴，几天后，它就会出现在你生活的每个角落。"
          />
        </div>

        <div className="mt-12 text-center relative z-10">
          <AuthAwareCTA variant="secondary" />
        </div>
      </div>
    </section>
  );
};

const GalleryItem = ({ item }: { item: any }) => (
  <div className="rounded-[2rem] overflow-hidden shadow-lg hover:shadow-xl transition-all border-2 border-pet-yellow/20 hover:border-pet-yellow transform hover:-translate-y-2 bg-white">
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
);

const Gallery = () => {
  const featuredItems = [
    { 
      id: 1, 
      petName: "小拼", 
      style: "粗线条手绘风", 
      petPhoto: "/images/小拼.png",
      tattooDesign: "/images/小拼2.png",
      description: "小拼是一个胖胖公主，所以着重表现了\"身体圆\""
    },
    { 
      id: 2, 
      petName: "二猫", 
      style: "蜡笔插画风", 
      petPhoto: "/images/二猫.png",
      tattooDesign: "/images/二猫2.png",
      description: "二猫有可爱的对眼，所以添加了\"猫咪是对眼\"的自定义特征"
    }
  ];

  return (
    <section className="py-16 bg-white relative">
      <div className="container px-8 md:px-12 lg:px-16 mx-auto max-w-6xl relative">
        <div className="text-center mb-12">
          <div className="inline-block">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 relative">
              精选
              <span className="bg-clip-text text-transparent bg-gradient-pet">作品展示</span>
              <div className="absolute -top-6 -right-6">
                <Heart className="h-6 w-6 text-pet-pink fill-pet-pink animate-pulse-soft" />
              </div>
            </h2>
          </div>
          <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto">
            看看其他用户为他们的爱宠制作的精美纹身贴设计
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {featuredItems.map((item) => (
            <GalleryItem key={item.id} item={item} />
          ))}
        </div>

        <div className="text-center">
          <Link to="/gallery">
            <Button className="bg-black hover:bg-gray-800 text-white font-bold px-8 py-6 rounded-full text-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] transition-all">
              查看更多作品
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

const Index = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .animation-delay-300 { animation-delay: 300ms; }
      .animation-delay-500 { animation-delay: 500ms; }
      .animation-delay-600 { animation-delay: 600ms; }
      .animation-delay-900 { animation-delay: 900ms; }
      @keyframes slideRight {
        0% { 
          transform: translateX(0) translateY(0) scaleX(1);
        }
        49% {
          transform: translateX(1000px) translateY(0) scaleX(1);
        }
        50% {
          transform: translateX(1000px) translateY(0) scaleX(-1);
        }
        100% { 
          transform: translateX(0) translateY(0) scaleX(-1);
        }
      }
      .animate-slide-lr {
        animation: slideRight 16s ease-in-out infinite;
      }
      @keyframes slideDown {
        0% { 
          transform: translateY(-100vh);
        }
        100% { 
          transform: translateY(100vh);
        }
      }
      .animate-slide-down {
        animation: slideDown 20s linear infinite;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <Layout>
      <Hero />
      <Features />
      <Gallery />
    </Layout>
  );
};

export default Index;
