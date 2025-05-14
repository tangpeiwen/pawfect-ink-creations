
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { ArrowRight, Cat, PawPrint, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => (
  <section className="py-16 md:py-20 bg-gradient-to-b from-pet-pink/30 to-pet-yellow/30">
    <div className="container px-6 mx-auto">
      <div className="bg-gradient-pet rounded-[2rem] border-[6px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        <div className="p-8 md:p-16 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 text-white drop-shadow-md">
            让您的宠物永远和您在一起
          </h1>
          <p className="text-lg md:text-xl text-white mb-10 max-w-3xl mx-auto">
            上传照片，选择风格，几分钟内获得专属您爱宠的纹身贴设计，轻松纪念与宠物的美好时光
          </p>
          <Link to="/create">
            <Button className="bg-white hover:bg-white/90 text-pet-pink font-bold px-8 py-6 rounded-full text-lg border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
              立即开始设计
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
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
    <section className="py-16 bg-pet-yellow/20">
      <div className="container px-6 mx-auto">
        <div className="bg-pet-yellow rounded-[2rem] border-[6px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden mb-16">
          <div className="p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6">
              简单三步，制作属于您的<span className="text-pet-pink">宠物纹身贴</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-800 max-w-3xl mx-auto">
              我们的AI系统能够将您上传的宠物照片转换为精美的纹身贴设计，操作简单，过程有趣
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
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

        <div className="mt-12 text-center">
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
  return (
    <Layout>
      <Hero />
      <Features />
    </Layout>
  );
};

export default Index;
