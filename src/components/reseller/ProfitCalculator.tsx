
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, TrendingUp } from 'lucide-react';
import { getServicePricing, calculateProfitShare } from '@/lib/servicePricing';

interface ProfitCalculatorProps {
  baseCost: number;
  serviceName: string;
}

export const ProfitCalculator = ({ baseCost, serviceName }: ProfitCalculatorProps) => {
  const servicePricing = getServicePricing(serviceName);
  const [projectPrice, setProjectPrice] = useState(servicePricing.defaultPrice);
  const [clientsPerMonth, setClientsPerMonth] = useState(5);

  const profitPerProject = calculateProfitShare(projectPrice, 70);
  const monthlyProfit = profitPerProject * clientsPerMonth;
  const yearlyProfit = monthlyProfit * 12;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-green-500" />
          Your Monthly & Yearly Earnings Calculator (Based on Project Sales)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="project-price">Average Project Price You Charge (₹)</Label>
            <Input
              id="project-price"
              type="number"
              value={projectPrice}
              onChange={(e) => setProjectPrice(Number(e.target.value))}
              className="glass-input"
            />
          </div>
          <div>
            <Label htmlFor="clients-month">Number of Clients You Expect per Month</Label>
            <Input
              id="clients-month"
              type="number"
              value={clientsPerMonth}
              onChange={(e) => setClientsPerMonth(Number(e.target.value))}
              className="glass-input"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">₹{profitPerProject.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Your Profit per Project (70%)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">₹{monthlyProfit.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Monthly Profit</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-500">₹{yearlyProfit.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Yearly Profit</div>
          </div>
        </div>

        <div className="space-y-2 pt-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-500 font-medium">
              Your Take-Home: 70% of Every Project Sale
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            We Handle Fulfillment for the Remaining 30%
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
