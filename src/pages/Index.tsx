
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { ArrowRight, Cat, PawPrint, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => (
  <section className="py-16 md:py-24 bg-gradient-to-b from-white to-pet-purple/5">
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
              <Button className="pet-button px-8 py-6 text-lg rounded-full">
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
  return (
    <section className="py-16 bg-white">
      <div className="container px-6 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-all border-2 border-gray-100 hover:border-pet-pink/20">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 border-2 border-gray-200">
              <Cat className="h-8 w-8 text-gray-800" />
            </div>
            <h3 className="text-2xl font-display font-bold mb-3">上传照片</h3>
            <p className="text-gray-600">
              上传您宠物的照片，支持各种角度，让我们捕捉您爱宠的神韵
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-all border-2 border-gray-100 hover:border-pet-pink/20">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 border-2 border-gray-200">
              <PawPrint className="h-8 w-8 text-gray-800" />
            </div>
            <h3 className="text-2xl font-display font-bold mb-3">选择风格</h3>
            <p className="text-gray-600">
              多种艺术风格可选，打造符合您个人品味的纹身贴设计
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-all border-2 border-gray-100 hover:border-pet-pink/20">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 border-2 border-gray-200">
              <Heart className="h-8 w-8 text-gray-800" />
            </div>
            <h3 className="text-2xl font-display font-bold mb-3">AI生成</h3>
            <p className="text-gray-600">
              先进的AI技术将您的宠物照片转化为精美的纹身贴设计
            </p>
          </div>
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
