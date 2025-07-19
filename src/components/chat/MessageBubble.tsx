import React from 'react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface MessageBubbleProps {
  message: {
    id: string;
    sender_id: string;
    message: string;
    message_type: string;
    file_url?: string;
    is_read: boolean;
    created_at: string;
    profiles?: {
      full_name?: string;
      role?: string;
    };
  };
  isOwn: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  const senderName = message.profiles?.full_name || 'User';
  const isAdmin = message.profiles?.role === 'admin';
  
  return (
    <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <Avatar className="h-8 w-8 mt-1">
        <AvatarFallback className={isAdmin ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
          {senderName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div className={`flex flex-col max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Sender Info */}
        <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-xs text-muted-foreground font-medium">
            {isOwn ? 'You' : senderName}
          </span>
          {isAdmin && (
            <Badge variant="secondary" className="text-xs">
              Support
            </Badge>
          )}
        </div>

        {/* Message Bubble */}
        <div
          className={`rounded-lg px-3 py-2 max-w-full break-words ${
            isOwn
              ? 'bg-primary text-primary-foreground rounded-br-sm'
              : 'bg-muted rounded-bl-sm'
          }`}
        >
          {message.message_type === 'text' ? (
            <p className="text-sm">{message.message}</p>
          ) : (
            <div>
              <p className="text-sm">{message.message}</p>
              {message.file_url && (
                <a
                  href={message.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline mt-2 block"
                >
                  View attachment
                </a>
              )}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-xs text-muted-foreground mt-1">
          {format(new Date(message.created_at), 'HH:mm')}
        </span>
      </div>
    </div>
  );
};