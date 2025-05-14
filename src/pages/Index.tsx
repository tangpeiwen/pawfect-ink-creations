
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
            width: `${70 + Math.random() * 100}px`,
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
  <section className="relative py-20 md:py-24 overflow-hidden">
    <div className="container px-6 mx-auto relative z-10">
      <div className="flex flex-col md:flex-row md:items-center gap-12">
        <div className="flex-1 md:pr-8 neo-container p-8 bg-white">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-6 text-black">
            将您的<span className="text-neobrutalism-pink">宠物</span><br />
            <span className="text-neobrutalism-blue">变成独特的纹身贴</span>
          </h1>
          <p className="text-xl md:text-2xl text-black mb-10 max-w-xl border-l-4 border-black pl-4">
            上传您爱宠的照片，我们的AI将为您生成独一无二的纹身贴设计，简单、快速、安全、有趣！
          </p>
          <div className="flex flex-col sm:flex-row gap-6">
            <Link to="/create">
              <button className="neo-button-primary">
                开始制作
                <ArrowRight className="ml-2 h-5 w-5 inline" />
              </button>
            </Link>
            <Link to="/gallery">
              <button className="neo-button-secondary">
                浏览作品集
              </button>
            </Link>
          </div>
          <div className="mt-12 flex items-center space-x-2">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-neobrutalism-pink border-2 border-black"></div>
              ))}
            </div>
            <p className="text-sm text-black">
              <span className="font-bold text-black">1000+</span> 位用户已体验
            </p>
          </div>
        </div>
        <div className="flex-1 relative">
          <div className="relative w-full aspect-square max-w-md mx-auto neo-container bg-white p-4">
            <div className="w-full h-full overflow-hidden border-4 border-black">
              <img
                src="/placeholder.svg"
                alt="宠物纹身贴示例"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-neobrutalism-yellow border-4 border-black rotate-6 animate-float">
              <img
                src="/placeholder.svg"
                alt="纹身贴样品"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-neobrutalism-pink border-4 border-black -rotate-12 animate-float" style={{ animationDelay: "1s" }}>
              <img
                src="/placeholder.svg"
                alt="纹身贴样品"
                className="w-full h-full object-cover"
              />
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
        <div className="text-center mb-16 neo-container p-8 bg-neobrutalism-yellow">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-black">
            简单三步，制作属于您的<span className="text-neobrutalism-pink">宠物纹身贴</span>
          </h2>
          <p className="text-xl text-black max-w-2xl mx-auto">
            我们的AI系统能够将您上传的宠物照片转换为精美的纹身贴设计，操作简单，过程有趣
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="feature-card p-8"
            >
              <div className="w-16 h-16 border-4 border-black bg-white rounded-full flex items-center justify-center text-black mb-6">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-display font-bold mb-4 text-black">{feature.title}</h3>
              <p className="text-black">{feature.description}</p>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-16">
          <Link to="/create">
            <button className="neo-button-primary">
              立即开始设计
              <ArrowRight className="ml-2 h-5 w-5 inline" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

const Index = () => {
  return (
    <Layout>
      <div className="bg-white">
        <Hero />
        <Features />
      </div>
    </Layout>
  );
};

export default Index;
