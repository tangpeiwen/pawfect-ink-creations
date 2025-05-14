
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { ArrowRight, Cat, PawPrint, Heart, Gift, Fish } from "lucide-react";
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
              <Button variant="outline" className="px-8 py-6 text-lg border-2 rounded-full border-pet-pink/30 hover:border-pet-pink hover:bg-pet-pink/10">
                浏览作品集
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex items-center space-x-2">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-pet border-2 border-white"></div>
              ))}
            </div>
            <p className="text-sm text-gray-500">
              <span className="font-bold text-gray-700">1000+</span> 位用户已体验
            </p>
          </div>
        </div>
        <div className="flex-1 mt-12 md:mt-0 relative">
          <div className="relative w-full aspect-square max-w-md mx-auto">
            <div className="w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="/placeholder.svg"
                alt="宠物纹身贴示例"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-5 -left-5 w-32 h-32 bg-pet-yellow rounded-2xl rotate-6 shadow-lg animate-float border-4 border-white">
              <img
                src="/placeholder.svg"
                alt="纹身贴样品"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div className="absolute -top-8 -right-8 w-28 h-28 bg-pet-pink rounded-2xl -rotate-12 shadow-lg animate-float border-4 border-white" style={{ animationDelay: "1s" }}>
              <img
                src="/placeholder.svg"
                alt="纹身贴样品"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div className="absolute bottom-1/3 right-0 transform translate-x-1/2">
              <Heart className="w-10 h-10 text-pet-pink fill-pet-pink animate-bounce" style={{ animationDelay: "1.5s" }} />
            </div>
            <div className="absolute top-1/3 left-0 transform -translate-x-1/2">
              <PawPrint className="w-8 h-8 text-pet-peach fill-pet-peach animate-pulse-soft" />
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
      icon: <Cat className="h-6 w-6" />,
      title: "上传照片",
      description: "上传您宠物的照片，支持各种角度，让我们捕捉您爱宠的神韵"
    },
    {
      icon: <PawPrint className="h-6 w-6" />,
      title: "选择风格",
      description: "多种艺术风格可选，打造符合您个人品味的纹身贴设计"
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "个性定制",
      description: "选择您希望突出的宠物特征，我们会精心设计以彰显您爱宠的独特之处"
    },
    {
      icon: <Gift className="h-6 w-6" />,
      title: "AI生成",
      description: "先进的AI技术将您的宠物照片转化为精美的纹身贴设计"
    },
    {
      icon: <Fish className="h-6 w-6" />,
      title: "收到纹身贴",
      description: "设计完成后我们将为您制作并邮寄高质量纹身贴，让您随时展示您对宠物的爱"
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "珍藏回忆",
      description: "为您和您的爱宠留下一份独特的回忆，无论是作为礼物还是珍藏品"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-white to-pet-purple/10">
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
            <div key={index} className="bg-white p-6 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all border-2 border-pet-pink/10 hover:border-pet-pink/30 transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-pet rounded-full flex items-center justify-center text-white mb-4">
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
            <div key={index} className="bg-white rounded-[1.5rem] overflow-hidden shadow-md hover:shadow-lg transition-all border-2 border-pet-yellow/20 hover:border-pet-yellow transform hover:-translate-y-1">
              <div className="grid grid-cols-2">
                <div className="aspect-square p-2">
                  <div className="w-full h-full rounded-2xl overflow-hidden">
                    <img src={example.before} alt={`${example.name}照片`} className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="aspect-square p-2">
                  <div className="w-full h-full rounded-2xl overflow-hidden">
                    <img src={example.after} alt={`${example.name}纹身贴`} className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-lg">{example.name}</h3>
                  <div className="bg-pet-yellow/20 rounded-full px-3 py-1">
                    <p className="text-xs text-gray-700">{example.style}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-10">
          <Link to="/gallery">
            <Button variant="outline" className="border-2 rounded-full border-pet-pink/30 hover:border-pet-pink hover:bg-pet-pink/10">
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
    <section className="py-16 bg-gradient-to-b from-pet-purple/10 to-white">
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
              className={`rounded-[1.5rem] overflow-hidden border-2 transform hover:-translate-y-1 transition-all ${
                plan.recommended
                  ? 'border-pet-pink shadow-lg relative' 
                  : 'border-gray-200'
              }`}
            >
              {plan.recommended && (
                <div className="bg-gradient-pet text-white text-center py-2 font-medium">
                  <div className="flex items-center justify-center">
                    <Heart className="h-4 w-4 mr-1 fill-white" />
                    最受欢迎
                    <Heart className="h-4 w-4 ml-1 fill-white" />
                  </div>
                </div>
              )}
              <div className="p-6">
                <h3 className="text-2xl font-display font-bold">{plan.name}</h3>
                <div className="mt-4 mb-6">
                  <span className="text-4xl font-display font-bold bg-clip-text text-transparent bg-gradient-pet">¥{plan.price}</span>
                  {plan.price !== "0" && <span className="text-gray-500">/起</span>}
                </div>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <div className="w-5 h-5 rounded-full bg-pet-pink/20 flex items-center justify-center mr-2">
                        <PawPrint className="h-3 w-3 text-pet-pink" />
                      </div>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={plan.buttonVariant === "primary" ? "pet-button w-full rounded-full" : "w-full border-2 rounded-full border-pet-pink/30 hover:border-pet-pink hover:bg-pet-pink/10"}
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
      <div className="bg-gradient-pet rounded-[2rem] p-8 md:p-12 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute -top-5 -left-5 w-20 h-20 bg-white/20 rounded-full"></div>
          <div className="absolute top-1/4 right-10 w-12 h-12 bg-white/20 rounded-full"></div>
          <div className="absolute bottom-10 left-10 w-16 h-16 bg-white/10 rounded-full"></div>
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            让您的宠物永远和您在一起
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            上传照片，选择风格，几分钟内获得专属您爱宠的纹身贴设计，轻松纪念与宠物的美好时光
          </p>
          <Link to="/create">
            <Button className="bg-white text-pet-pink hover:bg-white/90 px-8 py-6 text-lg rounded-full">
              立即开始设计
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
        <div className="absolute -bottom-8 -right-8 w-24 h-24">
          <PawPrint className="w-full h-full text-white/10" />
        </div>
        <div className="absolute -bottom-5 left-1/3 w-16 h-16">
          <PawPrint className="w-full h-full text-white/10" />
        </div>
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
