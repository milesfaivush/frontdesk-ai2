'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Phone,
  MessageSquare,
  Mail,
  Search,
  MoreVertical,
  Send,
  Bot,
  User,
  Star,
  Filter
} from 'lucide-react';
import { useAuth } from '@/lib/auth-provider';
import { supabase } from '@/lib/supabase/client';
import type { Conversation, Message, Business } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const channelIcons = {
  phone: Phone,
  sms: MessageSquare,
  chat: MessageSquare,
  facebook: MessageSquare,
  instagram: MessageSquare,
};

const sentimentColors = {
  positive: 'text-green-500',
  neutral: 'text-gray-500',
  negative: 'text-red-500',
};

export default function InboxPage() {
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [channelFilter, setChannelFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const fetchData = async () => {
    try {
      const { data: businessData } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (businessData) {
        setBusiness(businessData);

        const { data: conversationsData } = await supabase
          .from('conversations')
          .select('*')
          .eq('business_id', businessData.id)
          .order('last_message_at', { ascending: false });

        setConversations(conversationsData || []);

        if (conversationsData && conversationsData.length > 0) {
          setSelectedConversation(conversationsData[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    setMessages(data || []);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !newMessage.trim()) return;

    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: selectedConversation.id,
        direction: 'outbound',
        content: newMessage,
        is_ai_generated: false,
      });

      if (error) throw error;

      setNewMessage('');
      fetchMessages(selectedConversation.id);

      // Update conversation's last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', selectedConversation.id);

      fetchData();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      conv.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.customer_phone?.includes(searchQuery);
    const matchesChannel = channelFilter === 'all' || conv.channel === channelFilter;
    return matchesSearch && matchesChannel;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
        <div>
          <h1 className="text-3xl font-bold">Inbox</h1>
          <p className="text-muted-foreground">All your customer conversations in one place</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <div className="flex-1 grid lg:grid-cols-3 gap-4 overflow-hidden">
        {/* Conversations List */}
        <Card className="lg:col-span-1 overflow-hidden">
          <CardContent className="p-0 flex flex-col h-full">
            {/* Search */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2 mt-3">
                {['all', 'phone', 'sms', 'chat'].map((channel) => (
                  <Button
                    key={channel}
                    variant={channelFilter === channel ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChannelFilter(channel)}
                    className="capitalize"
                  >
                    {channel}
                  </Button>
                ))}
              </div>
            </div>

            {/* Conversations */}
            <ScrollArea className="flex-1">
              <div className="divide-y">
                {filteredConversations.map((conv) => {
                  const ChannelIcon = channelIcons[conv.channel];
                  const isSelected = selectedConversation?.id === conv.id;

                  return (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={cn(
                        'w-full p-4 text-left hover:bg-secondary/50 transition-colors',
                        isSelected && 'bg-secondary'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {conv.customer_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium truncate">
                              {conv.customer_name || 'Unknown'}
                            </p>
                            <span className="text-xs text-muted-foreground shrink-0">
                              {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <ChannelIcon className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground truncate">
                              {conv.ai_summary || 'No messages yet'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className={cn('text-xs', sentimentColors[conv.sentiment])}>
                              {conv.sentiment}
                            </Badge>
                            {conv.lead_score > 0 && (
                              <Badge variant="outline" className="text-xs">
                                Score: {conv.lead_score}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Messages */}
        <Card className="lg:col-span-2 overflow-hidden">
          <CardContent className="p-0 flex flex-col h-full">
            {selectedConversation ? (
              <>
                {/* Conversation Header */}
                <div className="p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {selectedConversation.customer_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{selectedConversation.customer_name || 'Unknown'}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {channelIcons[selectedConversation.channel] && (
                          <>
                            {(() => {
                              const Icon = channelIcons[selectedConversation.channel];
                              return <Icon className="w-3 h-3" />;
                            })()}
                          </>
                        )}
                        <span className="capitalize">{selectedConversation.channel}</span>
                        {selectedConversation.customer_phone && (
                          <span>• {selectedConversation.customer_phone}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={sentimentColors[selectedConversation.sentiment]}>
                      {selectedConversation.sentiment}
                    </Badge>
                    {selectedConversation.lead_score > 70 && (
                      <Badge className="bg-yellow-500 text-black">
                        <Star className="w-3 h-3 mr-1" />
                        Hot Lead
                      </Badge>
                    )}
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          'flex gap-3',
                          msg.direction === 'outbound' && 'justify-end'
                        )}
                      >
                        {msg.direction === 'inbound' && (
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs">
                              {selectedConversation.customer_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={cn(
                            'rounded-2xl px-4 py-2 max-w-[70%]',
                            msg.direction === 'inbound'
                              ? 'bg-secondary'
                              : msg.is_ai_generated
                              ? 'bg-primary/90 text-primary-foreground'
                              : 'bg-primary text-primary-foreground'
                          )}
                        >
                          {msg.is_ai_generated && msg.direction === 'outbound' && (
                            <div className="flex items-center gap-1 text-xs opacity-80 mb-1">
                              <Bot className="w-3 h-3" />
                              AI Generated
                            </div>
                          )}
                          <p className="text-sm">{msg.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        {msg.direction === 'outbound' && (
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                              {msg.is_ai_generated ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={!newMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to view messages</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
