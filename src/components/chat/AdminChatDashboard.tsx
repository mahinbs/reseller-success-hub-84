import React, { useState, useEffect } from 'react';
import { MessageCircle, Clock, CheckCircle, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AdminChatWindow } from './AdminChatWindow';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

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
  unread_count?: number;
}

export const AdminChatDashboard: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load conversations
  const loadConversations = async () => {
    const { data, error } = await supabase
      .from('chat_conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive"
      });
      return;
    }

    // Get user profiles and unread counts for each conversation
    const conversationsWithData = await Promise.all(
      (data || []).map(async (conv) => {
        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', conv.user_id)
          .single();

        // Get unread message count
        const { count } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('is_read', false)
          .neq('sender_id', user?.id || '');

        return {
          ...conv,
          profiles: profile,
          unread_count: count || 0
        };
      })
    );

    setConversations(conversationsWithData);
    setLoading(false);
  };

  useEffect(() => {
    loadConversations();
  }, [user, toast]);

  // Subscribe to real-time conversation updates
  useEffect(() => {
    const channel = supabase
      .channel('admin-conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_conversations',
        },
        () => {
          loadConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Assign conversation to admin
  const handleAssignConversation = async (conversationId: string) => {
    const { error } = await supabase
      .from('chat_conversations')
      .update({ 
        admin_id: user?.id,
        status: 'open',
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to assign conversation",
        variant: "destructive"
      });
      return;
    }

    loadConversations();
  };

  // Close conversation
  const handleCloseConversation = async (conversationId: string) => {
    const { error } = await supabase
      .from('chat_conversations')
      .update({ 
        status: 'closed',
        closed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to close conversation",
        variant: "destructive"
      });
      return;
    }

    loadConversations();
    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'closed':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  const openConversations = conversations.filter(c => c.status === 'open');
  const pendingConversations = conversations.filter(c => c.status === 'pending');
  const closedConversations = conversations.filter(c => c.status === 'closed');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading conversations...</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[800px]">
      {/* Conversations List */}
      <div className="lg:col-span-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Live Chat Conversations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[700px]">
              <div className="space-y-4 p-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-muted/50 rounded-lg p-2">
                    <div className="text-2xl font-bold text-green-600">{openConversations.length}</div>
                    <div className="text-xs text-muted-foreground">Open</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <div className="text-2xl font-bold text-yellow-600">{pendingConversations.length}</div>
                    <div className="text-xs text-muted-foreground">Pending</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <div className="text-2xl font-bold text-gray-600">{closedConversations.length}</div>
                    <div className="text-xs text-muted-foreground">Closed</div>
                  </div>
                </div>

                {/* Open/Pending Conversations */}
                {[...pendingConversations, ...openConversations].map((conversation) => (
                  <Card
                    key={conversation.id}
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedConversation?.id === conversation.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-4 w-4" />
                            <span className="font-medium text-sm">
                              {conversation.profiles?.full_name || 'Anonymous User'}
                            </span>
                            {conversation.unread_count! > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {conversation.unread_count}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {conversation.subject || 'General Support'}
                          </p>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(conversation.status)}`}></div>
                            <span className="text-xs text-muted-foreground capitalize">
                              {conversation.status}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(conversation.updated_at), 'MMM dd, HH:mm')}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        {conversation.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAssignConversation(conversation.id);
                            }}
                          >
                            Assign to Me
                          </Button>
                        )}
                        {conversation.status === 'open' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCloseConversation(conversation.id);
                            }}
                          >
                            Close
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {openConversations.length === 0 && pendingConversations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No active conversations</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Chat Window */}
      <div className="lg:col-span-2">
        {selectedConversation ? (
          <AdminChatWindow 
            conversation={selectedConversation}
            onConversationUpdate={loadConversations}
          />
        ) : (
          <Card className="h-full flex items-center justify-center">
            <CardContent>
              <div className="text-center text-muted-foreground">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Select a Conversation</h3>
                <p>Choose a conversation from the list to start chatting with customers.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};