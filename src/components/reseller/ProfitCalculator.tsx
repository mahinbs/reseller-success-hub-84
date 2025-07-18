
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, TrendingUp } from 'lucide-react';

interface ProfitCalculatorProps {
  baseCost: number;
  serviceName: string;
}

export const ProfitCalculator = ({ baseCost, serviceName }: ProfitCalculatorProps) => {
  const [resellPrice, setResellPrice] = useState(baseCost * 2.5);
  const [clientsPerMonth, setClientsPerMonth] = useState(5);

  const profitPerSale = resellPrice - baseCost;
  const monthlyProfit = profitPerSale * clientsPerMonth;
  const yearlyProfit = monthlyProfit * 12;
  const profitMargin = ((profitPerSale / resellPrice) * 100).toFixed(1);

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-green-500" />
          Profit Calculator for {serviceName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="resell-price">Your Resell Price (₹)</Label>
            <Input
              id="resell-price"
              type="number"
              value={resellPrice}
              onChange={(e) => setResellPrice(Number(e.target.value))}
              className="glass-input"
            />
          </div>
          <div>
            <Label htmlFor="clients-month">Clients per Month</Label>
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
            <div className="text-2xl font-bold text-green-500">₹{profitPerSale.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Profit per Sale</div>
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

        <div className="flex items-center justify-center gap-2 pt-2">
          <TrendingUp className="h-4 w-4 text-green-500" />
          <span className="text-sm text-green-500 font-medium">
            {profitMargin}% Profit Margin
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
