import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
}

export const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load or create conversation
  useEffect(() => {
    if (!user) return;

    const loadConversation = async () => {
      // Try to find existing open conversation
      const { data: existingConversation } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingConversation) {
        setConversation(existingConversation);
        await loadMessages(existingConversation.id);
      } else {
        // Create new conversation
        const { data: newConversation, error } = await supabase
          .from('chat_conversations')
          .insert({
            user_id: user.id,
            subject: 'General Support'
          })
          .select()
          .single();

        if (error) {
          toast({
            title: "Error",
            description: "Failed to start chat conversation",
            variant: "destructive"
          });
          return;
        }

        setConversation(newConversation);
        
        // Send welcome message
        await supabase
          .from('chat_messages')
          .insert({
            conversation_id: newConversation.id,
            sender_id: user.id,
            message: "Hello! I need help with my account.",
            message_type: 'text'
          });
      }
      
      setLoading(false);
    };

    loadConversation();
  }, [user, toast]);

  // Load messages for conversation
  const loadMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
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
    setTimeout(scrollToBottom, 100);
  };

  // Subscribe to real-time messages
  useEffect(() => {
    if (!conversation) return;

    const channel = supabase
      .channel(`conversation-${conversation.id}`)
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
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation]);

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversation || sending) return;

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
    }
    
    setSending(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Start a conversation with our support team!</p>
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
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={sending}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};