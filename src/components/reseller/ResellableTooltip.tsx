
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ReactNode } from 'react';

interface ResellableTooltipProps {
  children: ReactNode;
  content: string;
  type?: 'price' | 'badge' | 'profit' | 'general';
}

export const ResellableTooltip = ({ children, content, type = 'general' }: ResellableTooltipProps) => {
  const getTooltipStyle = () => {
    switch (type) {
      case 'price':
        return 'bg-green-500/10 border-green-500/20 text-green-400';
      case 'badge':
        return 'bg-primary/10 border-primary/20 text-primary';
      case 'profit':
        return 'bg-purple-500/10 border-purple-500/20 text-purple-400';
      default:
        return 'bg-muted border-muted-foreground/20';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent className={`max-w-xs ${getTooltipStyle()}`}>
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
