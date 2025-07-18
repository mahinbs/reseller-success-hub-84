
import { X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export const ResellableBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative bg-gradient-to-r from-green-500/10 via-primary/10 to-blue-500/10 border border-green-500/20 rounded-lg p-6 mb-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5 animate-pulse" />
      
      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🚀</span>
              <h3 className="text-xl font-bold gradient-text">Reseller Hub</h3>
            </div>
            <div className="px-3 py-1 bg-green-500/20 text-green-400 text-sm font-medium rounded-full">
              Buy Once, Resell Forever
            </div>
          </div>
          <p className="text-muted-foreground">
            Set Your Own Prices & Keep 100% Profit → We Handle Fulfillment, You Focus on Sales
          </p>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(false)}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
