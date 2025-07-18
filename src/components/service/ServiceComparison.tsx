
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X } from 'lucide-react';

interface ComparisonFeature {
  feature: string;
  us: boolean;
  competitor: boolean;
}

interface ServiceComparisonProps {
  serviceName: string;
}

export const ServiceComparison = ({ serviceName }: ServiceComparisonProps) => {
  const getComparisonFeatures = (service: string): ComparisonFeature[] => {
    const features: Record<string, ComparisonFeature[]> = {
      'UX/UI Design': [
        { feature: 'User Research & Testing', us: true, competitor: false },
        { feature: 'Custom Design System', us: true, competitor: true },
        { feature: 'Responsive Design', us: true, competitor: true },
        { feature: 'Accessibility Compliance', us: true, competitor: false },
        { feature: 'Interactive Prototypes', us: true, competitor: true },
        { feature: 'Post-Launch Support', us: true, competitor: false },
        { feature: 'Unlimited Revisions', us: true, competitor: false },
        { feature: '24/7 Support', us: true, competitor: false }
      ],
      'Web Development': [
        { feature: 'Custom Development', us: true, competitor: true },
        { feature: 'Performance Optimization', us: true, competitor: false },
        { feature: 'SEO Implementation', us: true, competitor: true },
        { feature: 'Security Best Practices', us: true, competitor: false },
        { feature: 'Cloud Deployment', us: true, competitor: true },
        { feature: 'Maintenance & Updates', us: true, competitor: false },
        { feature: 'Load Testing', us: true, competitor: false },
        { feature: 'Documentation', us: true, competitor: false }
      ],
      default: [
        { feature: 'Professional Service', us: true, competitor: true },
        { feature: 'Dedicated Support', us: true, competitor: false },
        { feature: 'Custom Solutions', us: true, competitor: true },
        { feature: 'Quality Guarantee', us: true, competitor: false },
        { feature: 'Ongoing Maintenance', us: true, competitor: false },
        { feature: 'Expert Consultation', us: true, competitor: false }
      ]
    };

    return features[service] || features.default;
  };

  const comparisonFeatures = getComparisonFeatures(serviceName);

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose Us</h2>
          <p className="text-lg text-muted-foreground">
            See how our {serviceName.toLowerCase()} service compares to others
          </p>
        </div>

        <Card className="glass overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary-light/10">
            <div className="grid grid-cols-3 gap-4">
              <div></div>
              <CardTitle className="text-center text-primary">Our Service</CardTitle>
              <CardTitle className="text-center text-muted-foreground">Others</CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {comparisonFeatures.map((item, index) => (
              <div 
                key={index} 
                className={`grid grid-cols-3 gap-4 p-4 ${
                  index % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                }`}
              >
                <div className="font-medium">{item.feature}</div>
                <div className="text-center">
                  {item.us ? (
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  ) : (
                    <X className="h-5 w-5 text-red-500 mx-auto" />
                  )}
                </div>
                <div className="text-center">
                  {item.competitor ? (
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  ) : (
                    <X className="h-5 w-5 text-red-500 mx-auto" />
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
