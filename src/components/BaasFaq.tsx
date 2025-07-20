
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, HelpCircle, Clock, Users, Shield, Zap, Target, Settings, Briefcase, Code, DollarSign, TrendingUp, PiggyBank, Calculator, Handshake, BarChart3, Building, Rocket, CheckCircle } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const faqData = [
  // General BaaS Questions (1-10)
  {
    icon: HelpCircle,
    question: "What is BaaS (Business as a Service)?",
    answer: "BaaS is a complete business infrastructure solution provided by Boostmysites, allowing you to launch your own software or service business with zero technical background."
  },
  {
    icon: Briefcase,
    question: "What does Boostmysites offer under the BaaS subscription?",
    answer: "We offer development, client management systems, sales scripts, quotation tools, MOU/SLA creation, project management tools, branding support, client satisfaction tracking, and full execution teams."
  },
  {
    icon: Users,
    question: "Who is BaaS for?",
    answer: "Entrepreneurs, marketers, influencers, or professionals who want to start their own tech or agency business without hiring developers or designers."
  },
  {
    icon: Code,
    question: "Do I need coding skills to run the business?",
    answer: "No. Boostmysites handles all technical development. You focus on sales and client relationships."
  },
  {
    icon: Clock,
    question: "How quickly can I start?",
    answer: "You can launch your business in 7–14 days with full access to your services, tools, and branding."
  },
  {
    icon: Shield,
    question: "Is this a white-label model?",
    answer: "Yes. Everything is branded under your company name. Clients will never see Boostmysites in the backend."
  },
  {
    icon: Settings,
    question: "What services can I sell to my clients?",
    answer: "Web development, app development, AI solutions, automation tools, digital marketing, and more. All services are fulfilled by Boostmysites teams."
  },
  {
    icon: Target,
    question: "How do I get clients?",
    answer: "We provide proven lead generation methods, ad templates, branding materials, and even done-for-you influencer marketing ideas."
  },
  {
    icon: Building,
    question: "Can I use my own domain and branding?",
    answer: "Yes, you'll get a full website under your brand, with your logo, domain, email, and identity."
  },
  {
    icon: Handshake,
    question: "Do I get help closing deals?",
    answer: "Yes. You can bring in our expert closers to help you on calls and Zoom meetings to convert leads into clients."
  },
  
  // Profit Sharing & Earning Questions (11-20)
  {
    icon: DollarSign,
    question: "How does the 70-30 profit sharing model work?",
    answer: "You keep 70% of the profit from any client project. Boostmysites receives 30% as a service fulfillment partner."
  },
  {
    icon: PiggyBank,
    question: "Who collects the payment from clients?",
    answer: "You collect the full payment from your clients. After deducting your 70%, you pay Boostmysites the 30% for service delivery."
  },
  {
    icon: Calculator,
    question: "Do I need to pay Boostmysites upfront per project?",
    answer: "No. You only pay 30% of the project value once the client has paid you and the work is confirmed."
  },
  {
    icon: TrendingUp,
    question: "Can I set my own pricing for clients?",
    answer: "Yes. You are free to price your services based on your target audience and market. You can sell at any margin."
  },
  {
    icon: BarChart3,
    question: "Is the 70-30 model negotiable?",
    answer: "No. This is a standard model to ensure fair profit for you and consistent service quality from our team."
  },
  {
    icon: Rocket,
    question: "What happens if I don't get clients?",
    answer: "We provide daily support, tasks, mentorship, and guidance. But consistent effort is required from your side to build pipelines."
  },
  {
    icon: Zap,
    question: "Can I earn recurring income?",
    answer: "Yes. You can offer monthly services like SEO, maintenance, automation, or branding with recurring billing. Profit sharing applies."
  },
  {
    icon: Users,
    question: "Is there a limit to how many clients I can take?",
    answer: "No limit. You can scale as big as you want. Boostmysites will support the delivery backend regardless of volume."
  },
  {
    icon: CheckCircle,
    question: "How do I track client satisfaction and project status?",
    answer: "You'll get a client dashboard, ticketing system, project tracker, and SLA reports to monitor all activities."
  },
  {
    icon: Target,
    question: "Can I upsell or bundle services?",
    answer: "Absolutely. You can create bundles, special offers, or premium packages using Boostmysites' ready-to-use resources and upsell frameworks."
  }
];

export const BaasFaq = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const faqRef = useScrollAnimation({ threshold: 0.2 });

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <section 
      id="faq"
      ref={faqRef.ref as any}
      className={`py-20 px-4 bg-gradient-to-r from-primary/3 via-background to-primary-light/3 transition-all duration-1000 ${
        faqRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in-up">
            <span className="gradient-text">BaaS FAQ</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 animate-fade-in-up">
            Everything you need to know about our Business-as-a-Service offering and profit sharing model
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {faqData.map((faq, index) => (
            <Card 
              key={index} 
              className={`group relative overflow-hidden bg-gradient-to-br from-black/20 via-black/10 to-transparent border border-white/20 backdrop-blur-xl hover:border-white/40 transition-all duration-500 hover:scale-[1.01] hover:-translate-y-1 magnetic-hover wave-entrance ${
                faqRef.isVisible ? `animate-stagger-${Math.min((index % 5) + 1, 5)}` : ''
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Collapsible
                open={openItems.includes(index)}
                onOpenChange={() => toggleItem(index)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="relative cursor-pointer hover:bg-gradient-to-r hover:from-primary/5 hover:to-blue-500/5 transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 relative">
                        <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg scale-150 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                        <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-black/40 to-black/20 border border-white/20 group-hover:border-white/40 magnetic-hover backdrop-blur-sm">
                          <faq.icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-300" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg text-left bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent group-hover:from-white group-hover:to-white/90 transition-all duration-300">
                          {faq.question}
                        </CardTitle>
                      </div>
                      <ChevronDown 
                        className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
                          openItems.includes(index) ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="overflow-hidden transition-all duration-300 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                  <CardContent className="pt-0 pb-6 px-6">
                    <div className="pl-16">
                      <p className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>

              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
