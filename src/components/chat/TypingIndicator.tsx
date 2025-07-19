import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8 mt-1">
        <AvatarFallback className="bg-primary text-primary-foreground">
          S
        </AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground font-medium mb-1">
          Support is typing...
        </span>
        
        <div className="bg-muted rounded-lg rounded-bl-sm px-3 py-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};