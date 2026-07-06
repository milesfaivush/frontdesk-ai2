'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bell,
  Star,
  Calendar,
  Phone,
  AlertCircle,
  MessageSquare,
  Check,
  Trash2,
  Settings,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/lib/auth-provider';
import { supabase } from '@/lib/supabase/client';
import type { Notification } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const notificationIcons = {
  high_value_lead: Star,
  appointment_booked: Calendar,
  voicemail: Phone,
  ai_needs_help: AlertCircle,
  new_message: MessageSquare,
};

const notificationColors = {
  high_value_lead: 'bg-yellow-500/10 text-yellow-500',
  appointment_booked: 'bg-green-500/10 text-green-500',
  voicemail: 'bg-blue-500/10 text-blue-500',
  ai_needs_help: 'bg-red-500/10 text-red-500',
  new_message: 'bg-purple-500/10 text-purple-500',
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;

      setNotifications(
        notifications.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user!.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNotifications(notifications.filter((n) => n.id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const unreadNotifications = notifications.filter((n) => !n.is_read);
  const readNotifications = notifications.filter((n) => n.is_read);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadNotifications.length} unread notifications
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadNotifications.length > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <Check className="mr-2 h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      {/* Notifications Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            All ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread ({unreadNotifications.length})
          </TabsTrigger>
          <TabsTrigger value="read">
            Read ({readNotifications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <Card>
            <CardContent className="p-0 divide-y">
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={markAsRead}
                    onDelete={deleteNotification}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unread" className="mt-6">
          <Card>
            <CardContent className="p-0 divide-y">
              {unreadNotifications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Check className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>All caught up!</p>
                </div>
              ) : (
                unreadNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={markAsRead}
                    onDelete={deleteNotification}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="read" className="mt-6">
          <Card>
            <CardContent className="p-0 divide-y">
              {readNotifications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No read notifications</p>
                </div>
              ) : (
                readNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={markAsRead}
                    onDelete={deleteNotification}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const Icon = notificationIcons[notification.type];

  return (
    <div
      className={cn(
        'p-4 hover:bg-secondary/50 transition-colors',
        !notification.is_read && 'bg-primary/5'
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', notificationColors[notification.type])}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <p className="font-medium">{notification.title}</p>
              {!notification.is_read && (
                <Badge variant="secondary" className="text-xs">New</Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground shrink-0">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </span>
          </div>
          {notification.body && (
            <p className="text-sm text-muted-foreground mt-1">{notification.body}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            {!notification.is_read && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMarkRead(notification.id)}
              >
                <Check className="mr-1 h-3 w-3" />
                Mark as read
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(notification.id)}
            >
              <Trash2 className="mr-1 h-3 w-3" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
