
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, HelpCircle, Clock, Users, Shield, Zap, Target, Settings } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const faqData = [
  {
    icon: HelpCircle,
    question: "What exactly is included in the BaaS subscription?",
    answer: "Our BaaS subscription includes a complete backend team: dedicated project manager, client management team, tech developers, legal documentation (MOU), branding & marketing support, daily operations team, and transparent weekly reporting. Everything you need to run your business smoothly."
  },
  {
    icon: Clock,
    question: "How quickly can you get started with my business?",
    answer: "We can typically onboard your business within 5-7 working days. This includes initial consultation, team assignment, SLA setup, and beginning work on your first projects. Our streamlined process ensures rapid deployment."
  },
  {
    icon: Users,
    question: "How does the team structure work?",
    answer: "You get a dedicated team including: 1 Project Manager for oversight, 2-3 developers for tech work, 1 client manager for customer relations, 1 operations coordinator, and access to our branding/marketing specialists. All team members work exclusively on your projects during allocated hours."
  },
  {
    icon: Shield,
    question: "What are the SLA guarantees?",
    answer: "We provide clear Service Level Agreements with guaranteed delivery timelines, 99.5% uptime for services, 24-hour response time for urgent issues, and weekly progress reports. All commitments are legally binding through our MOU process."
  },
  {
    icon: Zap,
    question: "Can you handle both technical and non-technical tasks?",
    answer: "Absolutely! We handle website/app development, project management, client communication, lead nurturing, legal documentation, branding, marketing creatives, social media management, and daily business operations. It's a complete business solution."
  },
  {
    icon: Target,
    question: "How do you ensure quality and client satisfaction?",
    answer: "We have a dedicated client satisfaction team that monitors all projects, conducts regular feedback sessions, and resolves issues promptly. Plus, our transparent reporting system keeps you informed about all activities and progress."
  },
  {
    icon: Settings,
    question: "What happens if I need to scale up or down?",
    answer: "Our BaaS service is flexible. You can scale your team size, add new services, or adjust the scope based on your business growth. We accommodate changes with just 7 days notice and adjust pricing accordingly."
  },
  {
    icon: Users,
    question: "Do you provide training for using your systems?",
    answer: "Yes, we provide comprehensive onboarding training for you and your team. This includes training on our project management tools, communication systems, reporting dashboards, and best practices for working with our backend team."
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
            Everything you need to know about our Business-as-a-Service offering
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
