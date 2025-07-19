
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Zap, ArrowRight } from 'lucide-react';

interface Bundle {
  id: string;
  name: string;
  description: string;
  discount_percentage: number;
  total_price: number;
  image_url: string;
}

interface BundlesSectionProps {
  bundles: Bundle[];
  loading: boolean;
}

export const BundlesSection = ({ bundles, loading }: BundlesSectionProps) => {
  return (
    <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-muted/10 to-primary/5">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">Featured Bundles</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Save more with our carefully curated service bundles. Get everything you need 
            to grow your business at an unbeatable price.
          </p>
        </div>
        
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse glass">
                <CardContent className="p-8">
                  <div className="h-4 bg-muted rounded mb-4"></div>
                  <div className="h-20 bg-muted rounded mb-4"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bundles.map((bundle, index) => (
              <Card 
                key={bundle.id} 
                className={`glass hover:scale-105 transition-all-smooth group relative overflow-hidden ${index === 1 ? 'ring-2 ring-primary' : ''}`}
                style={{
                  backgroundImage: bundle.image_url ? `url(${bundle.image_url})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                {/* Dark overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60 backdrop-blur-[2px]"></div>
                
                {index === 1 && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                    <Badge className="gradient-primary text-white px-4 py-1 flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="pb-4 relative z-10">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-2xl font-bold text-white">{bundle.name}</CardTitle>
                    <Badge className="gradient-primary text-white flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      -{bundle.discount_percentage}%
                    </Badge>
                  </div>
                  <CardDescription className="text-base leading-relaxed text-gray-200">
                    {bundle.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="relative z-10">
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-4xl font-bold text-primary">₹{bundle.total_price}</span>
                      <span className="text-gray-300">/month</span>
                    </div>
                    <div className="text-sm text-gray-300">
                      Save ₹{Math.round((bundle.total_price * bundle.discount_percentage) / (100 - bundle.discount_percentage))} per month
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-200">Multiple premium services included</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-200">Priority support & faster delivery</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-200">Flexible scaling options</span>
                    </div>
                  </div>
                  
                  <Button className={`w-full group-hover:scale-105 transition-all-smooth ${index === 1 ? 'gradient-primary' : ''}`}>
                    Choose Bundle <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {bundles.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground mb-4">No bundles available at the moment.</p>
            <Button variant="outline" asChild>
              <a href="/services">Browse Individual Services</a>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};
