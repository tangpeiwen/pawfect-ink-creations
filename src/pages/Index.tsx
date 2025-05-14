
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { PawPrint, Star, Circle } from "lucide-react";
import { Link } from "react-router-dom";
import SketchDecorations from "@/components/SketchDecorations";

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
        <div className="flex-1 md:pr-8 sketch-container p-8">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-sketch font-bold mb-6 text-sketch-ink">
            将您的<span className="text-sketch-primary">宠物</span><br />
            <span className="text-sketch-secondary">变成独特的纹身贴</span>
          </h1>
          <p className="text-xl md:text-2xl text-sketch-ink mb-10 max-w-xl border-l-4 border-sketch-primary pl-4 font-handwriting">
            上传您爱宠的照片，我们的AI将为您生成独一无二的纹身贴设计，简单、快速、安全、有趣！
          </p>
          <div className="flex flex-col sm:flex-row gap-6">
            <Link to="/create">
              <button className="sketch-button-primary">
                开始制作
                <Star className="ml-2 h-5 w-5 inline" fill="#F9C784" />
              </button>
            </Link>
            <Link to="/gallery">
              <button className="sketch-button">
                浏览作品集
              </button>
            </Link>
          </div>
          <div className="mt-12 flex items-center space-x-2">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-sketch-primary border-2 border-sketch-ink"></div>
              ))}
            </div>
            <p className="text-sm text-sketch-ink font-handwriting">
              <span className="font-bold text-sketch-primary">1000+</span> 位用户已体验
            </p>
          </div>
          
          <SketchDecorations type="mixed" count={6} />
        </div>
        <div className="flex-1 relative">
          <div className="relative w-full aspect-square max-w-md mx-auto sketch-container p-4">
            <div className="w-full h-full overflow-hidden border-2 border-sketch-ink">
              <img
                src="/placeholder.svg"
                alt="宠物纹身贴示例"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-sketch-accent border-2 border-sketch-ink rounded-full rotate-6 animate-float">
              <img
                src="/placeholder.svg"
                alt="纹身贴样品"
                className="w-full h-full object-cover rounded-full"
              />
              <PawPrint className="absolute -top-2 -right-2 w-6 h-6 text-sketch-primary" strokeWidth={2} fill="#F47C7C" />
            </div>
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-sketch-primary border-2 border-sketch-ink rounded-full -rotate-12 animate-float" style={{ animationDelay: "1s" }}>
              <img
                src="/placeholder.svg"
                alt="纹身贴样品"
                className="w-full h-full object-cover rounded-full"
              />
              <Star className="absolute -bottom-2 -left-2 w-6 h-6 text-sketch-accent" strokeWidth={2} fill="#F9C784" />
            </div>
            
            <svg className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none" width="180" height="180" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20,50 C20,35 35,20 50,20 C65,20 80,35 80,50 C80,65 65,80 50,80 C35,80 20,65 20,50 Z" stroke="#393535" strokeWidth="1" strokeDasharray="5,5" className="animate-draw" />
            </svg>
          </div>
          
          <SketchDecorations count={12} type="stars" />
        </div>
      </div>
    </div>
    <CatBackground />
  </section>
);

const Features = () => {
  const features = [
    {
      icon: <Circle className="h-8 w-8" fill="#70AE98" stroke="#393535" strokeWidth={2} />,
      title: "上传照片",
      description: "上传您宠物的照片，支持各种角度，让我们捕捉您爱宠的神韵"
    },
    {
      icon: <Star className="h-8 w-8" fill="#F9C784" stroke="#393535" strokeWidth={2} />,
      title: "选择风格",
      description: "多种艺术风格可选，打造符合您个人品味的纹身贴设计"
    },
    {
      icon: <PawPrint className="h-8 w-8" fill="#F47C7C" stroke="#393535" strokeWidth={2} />,
      title: "AI生成",
      description: "先进的AI技术将您的宠物照片转化为精美的纹身贴设计，收到纹身贴后随时展示您对宠物的爱"
    }
  ];

  return (
    <section className="py-16 relative">
      <div className="container px-6 mx-auto">
        <div className="text-center mb-16 sketch-container p-8">
          <h2 className="text-4xl md:text-5xl font-sketch font-bold mb-6 text-sketch-ink">
            简单三步，制作属于您的<span className="text-sketch-primary">宠物纹身贴</span>
          </h2>
          <p className="text-xl text-sketch-ink max-w-2xl mx-auto font-handwriting">
            我们的AI系统能够将您上传的宠物照片转换为精美的纹身贴设计，操作简单，过程有趣
          </p>
          <SketchDecorations count={6} type="squiggles" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="feature-card p-8 animate-sketch-appear"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="w-16 h-16 border-2 border-sketch-ink bg-sketch-paper rounded-full flex items-center justify-center text-sketch-ink mb-6">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-sketch font-bold mb-4 text-sketch-ink">{feature.title}</h3>
              <p className="text-sketch-ink font-handwriting text-lg">{feature.description}</p>
              
              {index === 0 && (
                <Circle 
                  className="absolute -top-4 -left-4 text-sketch-blue"
                  size={24}
                  fill="#A7C5EB"
                  stroke="#393535"
                  strokeWidth={1}
                />
              )}
              
              {index === 1 && (
                <Star 
                  className="absolute -top-4 -right-4 text-sketch-accent"
                  size={24}
                  fill="#F9C784"
                  stroke="#393535"
                  strokeWidth={1}
                />
              )}
              
              {index === 2 && (
                <PawPrint 
                  className="absolute -bottom-4 -right-4 text-sketch-primary"
                  size={24}
                  fill="#F47C7C"
                  stroke="#393535"
                  strokeWidth={1}
                />
              )}
            </div>
          ))}
        </div>
        
        <div className="text-center mt-16">
          <Link to="/create">
            <button className="sketch-button-primary">
              立即开始设计
              <Star className="ml-2 h-5 w-5 inline" fill="#F9C784" />
            </button>
          </Link>
        </div>
        <SketchDecorations count={8} type="lines" />
      </div>
    </section>
  );
};

const Index = () => {
  return (
    <Layout>
      <div className="bg-sketch-paper">
        <Hero />
        <Features />
      </div>
    </Layout>
  );
};

export default Index;
