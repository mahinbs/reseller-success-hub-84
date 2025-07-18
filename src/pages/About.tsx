import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code, Smartphone, Cloud, Brain, BarChart3, Radio, View, Blocks, Gamepad2, MessageSquare, Mic, FolderKanban, Users, Chrome } from "lucide-react";
import { Link } from "react-router-dom";

const services = [
  { name: "UX/UI Design", icon: Code, category: "Design" },
  { name: "Mobile App Development", icon: Smartphone, category: "Development" },
  { name: "Web Full-stack Development", icon: Code, category: "Development" },
  { name: "Cloud Computing Services", icon: Cloud, category: "Infrastructure" },
  { name: "Artificial Intelligence Development", icon: Brain, category: "AI & ML" },
  { name: "Data Analytics & Business Intelligence", icon: BarChart3, category: "Analytics" },
  { name: "IoT Development", icon: Radio, category: "IoT" },
  { name: "VR/AR Development", icon: View, category: "Immersive Tech" },
  { name: "Blockchain Development", icon: Blocks, category: "Blockchain" },
  { name: "Game Development", icon: Gamepad2, category: "Gaming" },
  { name: "Chatbot Development", icon: MessageSquare, category: "AI & ML" },
];

const saasProducts = [
  { name: "Speaksify", icon: Mic, description: "Advanced text-to-speech platform" },
  { name: "Projectsy.ai", icon: FolderKanban, description: "AI-powered project management" },
  { name: "VirtuTeams", icon: Users, description: "Virtual team collaboration platform" },
  { name: "ChromeBot.ai", icon: Chrome, description: "Intelligent Chrome automation" },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            About Our Company
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We are a cutting-edge technology company specializing in innovative software development services 
            and SaaS products. Our mission is to transform businesses through advanced technology solutions.
          </p>
        </div>

        {/* Services Overview */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Our Development Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Card key={service.name} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {service.category}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>

        {/* SaaS Products */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Our SaaS Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {saasProducts.map((product) => {
              const Icon = product.icon;
              return (
                <Card key={product.name} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <div className="mx-auto p-3 rounded-full bg-primary/10 w-fit mb-3">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{product.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center">{product.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="p-8 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="space-y-6">
              <h2 className="text-3xl font-bold">Ready to Transform Your Business?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Explore our comprehensive services and SaaS products to find the perfect solution for your needs.
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild size="lg">
                  <Link to="/services">
                    View All Services
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/auth">Get Started</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}