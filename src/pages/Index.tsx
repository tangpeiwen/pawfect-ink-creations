
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => (
  <section className="py-16 md:py-24">
    <div className="container px-6 mx-auto">
      <div className="flex flex-col md:flex-row md:items-center">
        <div className="flex-1 md:pr-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
            将您的宠物<br />
            <span className="bg-clip-text text-transparent bg-gradient-pet">变成独特的纹身贴</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8">
            上传您爱宠的照片，我们的AI将为您生成独一无二的纹身贴设计，简单、快速、安全、有趣！
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/create">
              <Button className="pet-button px-8 py-6 text-lg">
                开始制作
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/gallery">
              <Button variant="outline" className="px-8 py-6 text-lg border-2">
                浏览作品集
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex items-center space-x-2">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-pet-peach border-2 border-white"></div>
              ))}
            </div>
            <p className="text-sm text-gray-500">
              <span className="font-bold text-gray-700">1000+</span> 位用户已体验
            </p>
          </div>
        </div>
        <div className="flex-1 mt-12 md:mt-0 relative">
          <div className="relative w-full aspect-square max-w-md mx-auto">
            <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/placeholder.svg"
                alt="宠物纹身贴示例"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-5 -left-5 w-32 h-32 bg-pet-yellow rounded-xl rotate-6 shadow-lg animate-float">
              <img
                src="/placeholder.svg"
                alt="纹身贴样品"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -top-8 -right-8 w-28 h-28 bg-pet-pink rounded-xl -rotate-12 shadow-lg animate-float" style={{ animationDelay: "1s" }}>
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
  </section>
);

const Features = () => {
  const features = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/><line x1="16" x2="22" y1="5" y2="5"/><line x1="19" x2="19" y1="2" y2="8"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
      ),
      title: "上传照片",
      description: "上传您宠物的照片，支持各种角度，让我们捕捉您爱宠的神韵"
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M12 2v2"/><path d="M12 22v-2"/><path d="m17 20.66-1-1.73"/><path d="M11 10.27 7 3.34"/><path d="m20.66 17-1.73-1"/><path d="m3.34 7 1.73 1"/><path d="M14 12h8"/><path d="M2 12h2"/><path d="m20.66 7-1.73 1"/><path d="m3.34 17 1.73-1"/><path d="m17 3.34-1 1.73"/><path d="m11 13.73-4 6.93"/></svg>
      ),
      title: "选择风格",
      description: "多种艺术风格可选，打造符合您个人品味的纹身贴设计"
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9 12h6"/><path d="M12 9v6"/></svg>
      ),
      title: "个性定制",
      description: "选择您希望突出的宠物特征，我们会精心设计以彰显您爱宠的独特之处"
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
      ),
      title: "AI生成",
      description: "先进的AI技术将您的宠物照片转化为精美的纹身贴设计"
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8"/><path d="M23 8H1"/><path d="m8 8-.32-4.8A1 1 0 0 1 8.67 2h6.66a1 1 0 0 1 .99 1.2L16 8"/></svg>
      ),
      title: "收到纹身贴",
      description: "设计完成后我们将为您制作并邮寄高质量纹身贴，让您随时展示您对宠物的爱"
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
      ),
      title: "珍藏回忆",
      description: "为您和您的爱宠留下一份独特的回忆，无论是作为礼物还是珍藏品"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container px-6 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            简单三步，制作属于您的<span className="bg-clip-text text-transparent bg-gradient-pet">宠物纹身贴</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            我们的AI系统能够将您上传的宠物照片转换为精美的纹身贴设计，操作简单，过程有趣
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-pet-pink/20 rounded-xl flex items-center justify-center text-pet-pink mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-display font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Examples = () => {
  const examples = [
    {
      before: "/placeholder.svg",
      after: "/placeholder.svg",
      name: "小橙",
      style: "简约线条风"
    },
    {
      before: "/placeholder.svg",
      after: "/placeholder.svg",
      name: "贝贝",
      style: "水彩淡染风"
    },
    {
      before: "/placeholder.svg",
      after: "/placeholder.svg",
      name: "汤圆",
      style: "可爱卡通风"
    }
  ];

  return (
    <section className="py-16">
      <div className="container px-6 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-pet">真实案例</span> 展示
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            看看我们的AI如何将普通的宠物照片转化为精美的纹身贴设计
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {examples.map((example, index) => (
            <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all">
              <div className="grid grid-cols-2">
                <div className="aspect-square">
                  <img src={example.before} alt={`${example.name}照片`} className="w-full h-full object-cover" />
                </div>
                <div className="aspect-square">
                  <img src={example.after} alt={`${example.name}纹身贴`} className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-display font-bold">{example.name}</h3>
                <p className="text-sm text-gray-500">{example.style}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-10">
          <Link to="/gallery">
            <Button variant="outline" className="border-2">
              查看更多作品
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

const Pricing = () => {
  const plans = [
    {
      name: "免费体验",
      price: "0",
      description: "尝试我们的AI纹身贴生成技术",
      features: ["5次AI生成机会", "基础风格选择", "无实体纹身贴邮寄"],
      buttonText: "免费开始",
      buttonVariant: "outline"
    },
    {
      name: "单次购买",
      price: "39",
      description: "一次性购买，获得真实纹身贴",
      features: ["1次AI生成机会", "所有艺术风格", "包含1张实体纹身贴", "顺丰快递配送"],
      buttonText: "立即购买",
      buttonVariant: "primary",
      recommended: true
    },
    {
      name: "月度会员",
      price: "99",
      description: "每月享受多次生成与纹身贴",
      features: ["每月10次AI生成机会", "所有艺术风格", "每月2张实体纹身贴", "优先客户支持"],
      buttonText: "成为会员",
      buttonVariant: "outline"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container px-6 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            简单透明的<span className="bg-clip-text text-transparent bg-gradient-pet">价格方案</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            无论您是想尝试体验还是定期使用，我们都有适合您的方案
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`rounded-2xl overflow-hidden border-2 ${
                plan.recommended
                  ? 'border-pet-pink shadow-lg relative' 
                  : 'border-gray-200'
              }`}
            >
              {plan.recommended && (
                <div className="bg-pet-pink text-white text-center py-1 font-medium">
                  最受欢迎
                </div>
              )}
              <div className="p-6">
                <h3 className="text-2xl font-display font-bold">{plan.name}</h3>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-display font-bold">¥{plan.price}</span>
                  {plan.price !== "0" && <span className="text-gray-500">/起</span>}
                </div>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pet-pink mr-2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={plan.buttonVariant === "primary" ? "pet-button w-full" : "w-full border-2"}
                  variant={plan.buttonVariant === "primary" ? "default" : "outline"}
                >
                  {plan.buttonText}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CTA = () => (
  <section className="py-16">
    <div className="container px-6 mx-auto">
      <div className="bg-gradient-pet rounded-3xl p-8 md:p-12 text-white text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
          让您的宠物永远和您在一起
        </h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto">
          上传照片，选择风格，几分钟内获得专属您爱宠的纹身贴设计，轻松纪念与宠物的美好时光
        </p>
        <Link to="/create">
          <Button className="bg-white text-pet-pink hover:bg-gray-100 px-8 py-6 text-lg">
            立即开始设计
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

const Index = () => {
  return (
    <Layout>
      <Hero />
      <Features />
      <Examples />
      <Pricing />
      <CTA />
    </Layout>
  );
};

export default Index;
