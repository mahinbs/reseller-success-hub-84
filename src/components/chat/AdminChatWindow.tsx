import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageBubble } from './MessageBubble';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Message {
  id: string;
  conversation_id: string;
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
}

interface Conversation {
  id: string;
  user_id: string;
  admin_id?: string;
  status: string;
  subject?: string;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  profiles?: {
    full_name?: string;
    email?: string;
  };
}

interface AdminChatWindowProps {
  conversation: Conversation;
  onConversationUpdate: () => void;
}

export const AdminChatWindow: React.FC<AdminChatWindowProps> = ({ 
  conversation, 
  onConversationUpdate 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load messages
  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
      return;
    }

    // Get profile data for each message
    const messagesWithProfiles = await Promise.all(
      (data || []).map(async (message) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', message.sender_id)
          .single();

        return {
          ...message,
          profiles: profile
        };
      })
    );

    setMessages(messagesWithProfiles);
    setLoading(false);
    setTimeout(scrollToBottom, 100);

    // Mark messages as read
    await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('conversation_id', conversation.id)
      .neq('sender_id', user?.id || '');
  };

  useEffect(() => {
    if (conversation) {
      setLoading(true);
      loadMessages();
    }
  }, [conversation.id]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!conversation) return;

    const channel = supabase
      .channel(`admin-conversation-${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        async (payload) => {
          // Fetch the complete message
          const { data: message } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('id', payload.new.id)
            .single();

          if (message) {
            // Get profile data
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, role')
              .eq('id', message.sender_id)
              .single();

            const messageWithProfile = {
              ...message,
              profiles: profile
            };

            setMessages(prev => [...prev, messageWithProfile]);
            setTimeout(scrollToBottom, 100);
            
            // Mark as read if not sent by current user
            if (message.sender_id !== user?.id) {
              await supabase
                .from('chat_messages')
                .update({ is_read: true })
                .eq('id', message.id);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation, user]);

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversation.id,
        sender_id: user!.id,
        message: newMessage.trim(),
        message_type: 'text'
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } else {
      setNewMessage('');
      // Update conversation timestamp
      await supabase
        .from('chat_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversation.id);
      
      onConversationUpdate();
    }
    
    setSending(false);
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading messages...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5" />
            <div>
              <CardTitle className="text-lg">
                {conversation.profiles?.full_name || 'Anonymous User'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {conversation.profiles?.email}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={conversation.status === 'open' ? 'default' : 'secondary'}>
              {conversation.status}
            </Badge>
            <div className="text-xs text-muted-foreground">
              Started {format(new Date(conversation.created_at), 'MMM dd, yyyy HH:mm')}
            </div>
          </div>
        </div>
        
        {conversation.subject && (
          <p className="text-sm text-muted-foreground">
            Subject: {conversation.subject}
          </p>
        )}
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[500px] p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.sender_id === user?.id}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      {/* Message Input */}
      {conversation.status === 'open' && (
        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your response..."
              disabled={sending}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
      
      {conversation.status === 'closed' && (
        <div className="border-t p-4 bg-muted/50">
          <p className="text-center text-muted-foreground text-sm">
            This conversation has been closed.
          </p>
        </div>
      )}
    </Card>
  );
};