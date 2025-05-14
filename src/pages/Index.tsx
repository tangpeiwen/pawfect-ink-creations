
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { ArrowRight, Cat, PawPrint, Heart } from "lucide-react";
import { Link } from "react-router-dom";

// 猫咪背景组件
const CatBackground = () => {
  const cats = [
    '/lovable-uploads/ee9d5cbb-9de5-4b37-b6fa-906c57eb838c.png',
    '/lovable-uploads/c33085e2-f8f7-4d1c-8e25-0f8c910ad5a4.png',
    '/lovable-uploads/7d912bc6-88bd-425e-8985-b76d6d48c3b2.png',
    '/lovable-uploads/21a13c91-60c3-4d86-84a1-1dd0fcdf229c.png',
    '/lovable-uploads/009fb3db-386c-4e61-a39b-2593493bd66d.png',
    '/lovable-uploads/51dec938-eda7-4f18-9bb7-1c91d8f289dd.png',
  ];
  
  return (
    <div className="cat-background">
      {cats.map((cat, index) => (
        <div 
          key={index} 
          className="cat-outline" 
          style={{
            position: 'absolute',
            top: `${Math.random() * 80}%`,
            left: `${Math.random() * 80}%`,
            width: `${100 + Math.random() * 150}px`,
            opacity: 0.15,
            transform: `rotate(${Math.random() * 360}deg)`,
            zIndex: -1
          }}
        >
          <img src={cat} alt="" className="w-full h-full" />
        </div>
      ))}
    </div>
  );
};

const Hero = () => (
  <section className="relative py-24 md:py-32 overflow-hidden">
    <div className="container px-6 mx-auto relative z-10">
      <div className="flex flex-col md:flex-row md:items-center">
        <div className="flex-1 md:pr-8">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 neon-text">
            将您的<span className="text-pet-peach">宠物</span><br />
            <span className="neon-gradient">变成独特的纹身贴</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-xl">
            上传您爱宠的照片，我们的AI将为您生成独一无二的纹身贴设计，简单、快速、安全、有趣！
          </p>
          <div className="flex flex-col sm:flex-row gap-6">
            <Link to="/create">
              <Button className="neon-button px-8 py-6 text-lg">
                开始制作
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/gallery">
              <Button variant="outline" className="neon-outline-button px-8 py-6 text-lg border-2">
                浏览作品集
              </Button>
            </Link>
          </div>
          <div className="mt-12 flex items-center space-x-2">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-gradient-neon border-2 border-white"></div>
              ))}
            </div>
            <p className="text-sm text-gray-300">
              <span className="font-bold text-white">1000+</span> 位用户已体验
            </p>
          </div>
        </div>
        <div className="flex-1 mt-12 md:mt-0 relative">
          <div className="relative w-full aspect-square max-w-md mx-auto">
            <div className="w-full h-full rounded-[2.5rem] overflow-hidden shadow-neon border-4 border-white/30 backdrop-blur-sm bg-black/30">
              <img
                src="/placeholder.svg"
                alt="宠物纹身贴示例"
                className="w-full h-full object-cover opacity-80"
              />
            </div>
            <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-pet-yellow/30 rounded-2xl rotate-6 shadow-neon animate-float border-4 border-white/20 backdrop-blur-sm">
              <img
                src="/placeholder.svg"
                alt="纹身贴样品"
                className="w-full h-full object-cover rounded-xl opacity-80"
              />
            </div>
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-pet-peach/30 rounded-2xl -rotate-12 shadow-neon animate-float border-4 border-white/20 backdrop-blur-sm" style={{ animationDelay: "1s" }}>
              <img
                src="/placeholder.svg"
                alt="纹身贴样品"
                className="w-full h-full object-cover rounded-xl opacity-80"
              />
            </div>
            <div className="absolute bottom-1/3 right-0 transform translate-x-1/2">
              <Heart className="w-12 h-12 text-pet-pink fill-pet-pink glow-pink animate-pulse" style={{ animationDelay: "1.5s" }} />
            </div>
            <div className="absolute top-1/3 left-0 transform -translate-x-1/2">
              <PawPrint className="w-10 h-10 text-pet-peach fill-pet-peach glow-peach animate-pulse-soft" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <CatBackground />
  </section>
);

const Features = () => {
  const features = [
    {
      icon: <Cat className="h-8 w-8" />,
      title: "上传照片",
      description: "上传您宠物的照片，支持各种角度，让我们捕捉您爱宠的神韵"
    },
    {
      icon: <PawPrint className="h-8 w-8" />,
      title: "选择风格",
      description: "多种艺术风格可选，打造符合您个人品味的纹身贴设计"
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "AI生成",
      description: "先进的AI技术将您的宠物照片转化为精美的纹身贴设计，收到纹身贴后随时展示您对宠物的爱"
    }
  ];

  return (
    <section className="py-16 relative">
      <div className="container px-6 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 neon-text">
            简单三步，制作属于您的<span className="neon-gradient">宠物纹身贴</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            我们的AI系统能够将您上传的宠物照片转换为精美的纹身贴设计，操作简单，过程有趣
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-black/30 backdrop-blur-sm p-8 rounded-[2rem] shadow-neon hover:shadow-neon-lg transition-all border-2 border-white/20 transform hover:-translate-y-2 feature-card"
            >
              <div className="w-16 h-16 neon-gradient-bg rounded-full flex items-center justify-center text-white mb-6">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-display font-bold mb-4 text-white">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-16">
          <Link to="/create">
            <Button className="neon-button px-10 py-6 text-xl">
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
    document.body.classList.add('dark-theme');
    return () => {
      document.body.classList.remove('dark-theme');
    };
  }, []);

  return (
    <Layout>
      <div className="neon-background">
        <Hero />
        <Features />
      </div>
    </Layout>
  );
};

export default Index;
