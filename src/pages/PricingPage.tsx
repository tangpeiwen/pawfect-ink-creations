
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const PricingPage = () => {
  const plans = [
    {
      name: "免费体验",
      price: "0",
      period: "",
      description: "尝试我们的AI纹身贴生成技术",
      features: [
        "5次AI生成机会",
        "基础风格选择",
        "下载数字版设计",
        "标准在线支持",
        "无实体纹身贴邮寄"
      ],
      buttonText: "免费开始",
      buttonVariant: "outline"
    },
    {
      name: "单次购买",
      price: "39",
      period: "起",
      description: "一次性购买，获得真实纹身贴",
      features: [
        "1次AI生成机会",
        "所有艺术风格",
        "下载高清数字版设计",
        "二次编辑功能",
        "包含1张实体纹身贴",
        "顺丰快递配送"
      ],
      buttonText: "立即购买",
      buttonVariant: "primary",
      recommended: true
    },
    {
      name: "月度会员",
      price: "99",
      period: "/月",
      description: "每月享受多次生成与纹身贴",
      features: [
        "每月10次AI生成机会",
        "所有艺术风格",
        "下载高清数字版设计",
        "高级二次编辑功能",
        "每月2张实体纹身贴",
        "顺丰快递配送",
        "优先客户支持",
        "收藏设计功能"
      ],
      buttonText: "成为会员",
      buttonVariant: "outline"
    }
  ];

  const faqs = [
    {
      question: "纹身贴的材质是什么？",
      answer: "我们的纹身贴使用高品质、防水、可持续30天的医用级安全材料，无毒无刺激，对皮肤友好。"
    },
    {
      question: "如何使用纹身贴？",
      answer: "将纹身贴贴在清洁的皮肤上，用湿毛巾按压30秒，轻轻揭开背纸即可。如需去除，可用肥皂水或酒精轻轻擦拭。"
    },
    {
      question: "纹身贴能持续多久？",
      answer: "根据皮肤类型和使用部位，我们的纹身贴通常可以持续3-7天。避免频繁摩擦和长时间泡水可以延长使用寿命。"
    },
    {
      question: "如果我对生成结果不满意可以怎么做？",
      answer: "在确认订单前，您可以使用免费的重新生成功能。如果您是付费会员，可以无限次尝试不同风格和效果，直到满意为止。"
    },
    {
      question: "实体纹身贴多久能收到？",
      answer: "我们会在确认订单后1-2个工作日内发货，全国大部分地区通常3天内可收到。会员订单享受优先处理。"
    },
    {
      question: "会员订阅如何取消？",
      answer: "您可以随时在个人账户中心取消订阅。取消后，您仍然可以享受当月的会员权益直到订阅期结束。"
    }
  ];

  return (
    <Layout>
      <div className="container py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
            选择适合您的<span className="bg-clip-text text-transparent bg-gradient-pet">价格方案</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            无论您是想尝试体验还是定期使用，我们都有适合您的方案。所有方案均包含AI生成技术和高品质纹身贴。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`rounded-2xl overflow-hidden border-2 ${
                plan.recommended
                  ? 'border-pet-pink shadow-xl relative z-10 scale-105 my-4 md:my-0 bg-white' 
                  : 'border-gray-200 bg-white'
              }`}
            >
              {plan.recommended && (
                <div className="bg-pet-pink text-white text-center py-1 font-medium">
                  最受欢迎
                </div>
              )}
              <div className="p-6">
                <h3 className="text-2xl font-display font-bold">{plan.name}</h3>
                <div className="mt-4 mb-6 flex items-end">
                  <span className="text-4xl font-display font-bold">¥{plan.price}</span>
                  <span className="text-gray-500 ml-1">{plan.period}</span>
                </div>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <Check className="h-5 w-5 text-pet-pink mr-2" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={plan.buttonVariant === "primary" ? "pet-button w-full py-6" : "w-full border-2 py-6"}
                  variant={plan.buttonVariant === "primary" ? "default" : "outline"}
                >
                  {plan.buttonText}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-24">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-center mb-8">常见问题</h2>
          <div className="max-w-3xl mx-auto">
            <div className="divide-y">
              {faqs.map((faq, index) => (
                <div key={index} className="py-6">
                  <h3 className="text-lg font-display font-bold mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-display font-bold mb-4">还有其他问题？</h2>
          <p className="text-gray-600 mb-6">我们的客服团队随时为您提供帮助</p>
          <Button className="pet-button px-8 py-6 text-lg">
            联系我们
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default PricingPage;
