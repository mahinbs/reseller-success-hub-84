
import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChatWindow } from './ChatWindow';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useChatWidget } from '@/hooks/useChatWidget';

export const ChatWidget: React.FC = () => {
  const { isOpen, setIsOpen } = useChatWidget();
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Subscribe to new messages for unread count
    const channel = supabase
      .channel('chat-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `sender_id=neq.${user.id}`,
        },
        (payload) => {
          // Check if this message is in user's conversation
          supabase
            .from('chat_conversations')
            .select('id')
            .eq('id', payload.new.conversation_id)
            .eq('user_id', user.id)
            .single()
            .then(({ data }) => {
              if (data && !isOpen) {
                setUnreadCount(prev => prev + 1);
              }
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isOpen]);

  const handleToggle = () => {
    if (!isOpen) {
      setUnreadCount(0);
    }
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  if (!user) return null;

  return (
    <>
      {/* Chat Widget Button */}
      {!isOpen && (
        <Button
          onClick={handleToggle}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className={`fixed bottom-6 right-6 z-50 w-96 transition-all duration-300 shadow-xl ${
          isMinimized ? 'h-14' : 'h-[500px]'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
            <h3 className="font-semibold">Live Chat Support</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleMinimize}
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <div className="h-[calc(100%-4rem)]">
              <ChatWindow />
            </div>
          )}
        </Card>
      )}
    </>
  );
};
