
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MessageSquare, Users, Clock } from 'lucide-react';

interface ConsultationFormProps {
  serviceName: string;
}

export const ConsultationForm = ({ serviceName }: ConsultationFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    budget: '',
    timeline: '',
    requirements: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Consultation request:', formData);
    // Handle form submission
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-r from-primary/5 to-primary-light/5">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Get a Free Consultation</h2>
          <p className="text-lg text-muted-foreground">
            Let's discuss your {serviceName.toLowerCase()} project requirements
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Request Consultation
              </CardTitle>
              <CardDescription>
                Fill out the form and we'll get back to you within 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@company.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    placeholder="Your Company Name"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget Range</Label>
                    <Select onValueChange={(value) => handleInputChange('budget', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select budget" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5k-10k">₹5,000 - ₹10,000</SelectItem>
                        <SelectItem value="10k-25k">₹10,000 - ₹25,000</SelectItem>
                        <SelectItem value="25k-50k">₹25,000 - ₹50,000</SelectItem>
                        <SelectItem value="50k+">₹50,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timeline">Timeline</Label>
                    <Select onValueChange={(value) => handleInputChange('timeline', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timeline" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asap">ASAP</SelectItem>
                        <SelectItem value="1-2weeks">1-2 weeks</SelectItem>
                        <SelectItem value="1month">1 month</SelectItem>
                        <SelectItem value="3months">3+ months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Project Requirements</Label>
                  <Textarea
                    id="requirements"
                    placeholder="Tell us about your project requirements..."
                    value={formData.requirements}
                    onChange={(e) => handleInputChange('requirements', e.target.value)}
                    rows={4}
                  />
                </div>

                <Button type="submit" className="w-full gradient-primary">
                  Request Free Consultation
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="glass-subtle">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Free 30-min Consultation</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Get expert advice on your project requirements and timeline.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-subtle">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Dedicated Team</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Work with experienced professionals who understand your industry.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-subtle">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Quick Response</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Get a detailed proposal within 24-48 hours of consultation.
                </p>
              </CardContent>
            </Card>

            <div className="p-6 bg-gradient-to-br from-primary/10 to-primary-light/10 rounded-lg">
              <h4 className="font-semibold mb-2">What happens next?</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• We'll review your requirements</li>
                <li>• Schedule a consultation call</li>
                <li>• Provide a detailed proposal</li>
                <li>• Start your project within days</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
