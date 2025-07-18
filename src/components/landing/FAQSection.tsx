
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search, MessageCircle } from 'lucide-react';

export const FAQSection = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const faqData = [
    {
      question: "What is Business as a Service (BaaS)?",
      answer: "BaaS is a comprehensive service model where we provide end-to-end business solutions including AI tools, development services, design, and technical support. Instead of hiring multiple specialists, you get access to our entire suite of professional services through flexible subscription plans."
    },
    {
      question: "How does pricing work?",
      answer: "We offer transparent, subscription-based pricing in INR (₹). Each service has its own pricing tier, and you can also choose from our bundled packages for better savings. All prices are clearly displayed with no hidden fees."
    },
    {
      question: "What kind of support do you provide?",
      answer: "We provide 24/7 technical support, dedicated account managers for enterprise clients, comprehensive documentation, and regular training sessions. Our support team consists of experts in AI, development, design, and business strategy."
    },
    {
      question: "Can I customize services according to my needs?",
      answer: "Absolutely! While we offer standardized packages, we also provide custom solutions tailored to your specific business requirements. Our team works closely with you to understand your needs and deliver personalized solutions."
    },
    {
      question: "What industries do you serve?",
      answer: "We serve businesses across all industries including e-commerce, healthcare, finance, education, manufacturing, and startups. Our solutions are designed to be industry-agnostic while being customizable for specific sector needs."
    },
    {
      question: "How quickly can I get started?",
      answer: "Most of our services can be activated within 24-48 hours of subscription. For custom solutions, the timeline varies based on complexity, but we always provide clear delivery schedules upfront."
    },
    {
      question: "Is there a free trial available?",
      answer: "Yes! We offer free trials for most of our services so you can experience the quality and value before committing. Trial periods vary by service, typically ranging from 7-14 days."
    },
    {
      question: "What makes you different from other service providers?",
      answer: "Our BaaS model combines AI-powered efficiency with human expertise, offering enterprise-grade solutions at competitive prices. We focus on long-term partnerships, providing scalable solutions that grow with your business."
    },
    {
      question: "How do you ensure data security and privacy?",
      answer: "We implement enterprise-grade security measures including data encryption, secure cloud infrastructure, regular security audits, and compliance with international data protection standards like GDPR and SOC 2."
    },
    {
      question: "Can I scale my services up or down?",
      answer: "Yes, our services are designed to be completely scalable. You can upgrade, downgrade, or modify your services anytime based on your changing business needs without any penalties."
    }
  ];

  const filteredFAQs = faqData.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-muted/20 to-background">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">Frequently Asked Questions</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Got questions? We've got answers. Find everything you need to know about our BaaS platform.
          </p>
          
          <div className="max-w-lg mx-auto relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search FAQ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass-input"
            />
          </div>
        </div>

        {filteredFAQs.length > 0 ? (
          <div className="glass-subtle rounded-lg p-6">
            <Accordion type="single" collapsible className="space-y-4">
              {filteredFAQs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="border border-border/50 rounded-lg px-4 hover:bg-muted/20 transition-colors"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="font-medium">{faq.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 pl-8 text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ) : (
          <div className="text-center py-12 glass-subtle rounded-lg">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground mb-2">No FAQs found</p>
            <p className="text-muted-foreground">Try adjusting your search terms</p>
          </div>
        )}
      </div>
    </section>
  );
};
