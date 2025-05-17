import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { ArrowRight, Cat, PawPrint, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import PixelTransition from "@/components/PixelTransition";

const Hero = () => (
  <section className="py-16 md:py-20 relative">
    <div className="container px-8 md:px-12 lg:px-16 mx-auto max-w-6xl relative">
      <div className="bg-white relative rounded-[2rem] border-[6px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative z-10">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-8 md:p-12 flex flex-col justify-center relative">
            <img
                src="/images/doodle-cat.svg"
                className="right-[80px] top-[180px] w-[70px] z-40"
              />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 text-black">
              和你的宠物永远在一起
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-10">
              上传照片，选择风格，我们把宠物画成线条贴纸，做成你独一无二的纹身。
            </p>
            <img
              src="/images/bikini_cat.svg"
              className="absolute -left-36 -top-[100px] w-36 z-50 animate-slide-down"
              // className="absolute left-[100px] -top-[110px] w-[150px] z-50"
            />
            {/* <img
              src="/images/bikini_cat.svg"
              className="absolute left-[1000px] -top-[150px] w-48 z-50" */}
            {/* />  */}
        
            <div>
              <Link to="/create">
                <Button className="bg-pet-pink hover:bg-pet-pink/90 text-white font-bold px-8 py-6 rounded-full text-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all animate-pulse">
                  立即开始设计
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
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
              简单三步，制作属于您的<span className="text-pet-pink">宠物纹身贴</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-800 max-w-3xl mx-auto">
              我们的AI系统能够将您上传的宠物照片转换为精美的纹身贴设计，操作简单，过程有趣
            </p>
          </div>

          {/* 装饰性图片 - 侧躺猫咪 - 放在黄色方框内 */}
          <img
            src="/images/Wink.svg"
            alt="猫咪线稿"
            className="absolute left-2 top-10 w-24 z-0"
          />


        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 relative z-10">
          <StepCard
            icon={Cat}
            title="上传照片"
            description="上传您宠物的照片，支持各种角度，让我们捕捉您爱宠的神韵"
          />

          <StepCard
            icon={PawPrint}
            title="选择风格"
            description="多种艺术风格可选，打造符合您个人品味的纹身贴设计"
          />

          <StepCard
            icon={Heart}
            title="AI生成"
            description="先进的AI技术将您的宠物照片转化为精美的纹身贴设计"
          />
        </div>

        <div className="mt-12 text-center relative z-10">
          <Link to="/create">
            <Button className="bg-black hover:bg-gray-800 text-white font-bold px-10 py-6 rounded-xl text-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] transition-all">
              立即开始设计
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
    </Layout>
  );
};

export default Index;
