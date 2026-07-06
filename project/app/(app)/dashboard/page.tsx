'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Phone,
  MessageSquare,
  Calendar,
  Users,
  DollarSign,
  Star,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Bot,
  Clock,
  AlertCircle
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useAuth } from '@/lib/auth-provider';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import Link from 'next/link';

const callData = [
  { day: 'Mon', calls: 45, answered: 42 },
  { day: 'Tue', calls: 52, answered: 50 },
  { day: 'Wed', calls: 38, answered: 36 },
  { day: 'Thu', calls: 67, answered: 65 },
  { day: 'Fri', calls: 59, answered: 58 },
  { day: 'Sat', calls: 23, answered: 22 },
  { day: 'Sun', calls: 18, answered: 17 },
];

const appointmentData = [
  { month: 'Jan', appointments: 89 },
  { month: 'Feb', appointments: 102 },
  { month: 'Mar', appointments: 117 },
  { month: 'Apr', appointments: 134 },
  { month: 'May', appointments: 156 },
  { month: 'Jun', appointments: 178 },
];

const channelData = [
  { name: 'Phone', value: 45, color: 'hsl(217, 91%, 60%)' },
  { name: 'SMS', value: 30, color: 'hsl(160, 60%, 45%)' },
  { name: 'Chat', value: 15, color: 'hsl(30, 80%, 55%)' },
  { name: 'Social', value: 10, color: 'hsl(280, 65%, 60%)' },
];

const recentConversations = [
  { id: 1, name: 'Sarah Johnson', channel: 'phone', message: 'Booked teeth cleaning for Friday 2pm', time: '2 mins ago', sentiment: 'positive' },
  { id: 2, name: 'Mike Peterson', channel: 'sms', message: 'Requested quote for HVAC installation', time: '15 mins ago', sentiment: 'neutral' },
  { id: 3, name: 'Emily Chen', channel: 'chat', message: 'Asked about availability next week', time: '32 mins ago', sentiment: 'positive' },
  { id: 4, name: 'Robert Smith', channel: 'phone', message: 'Confirmed appointment for tomorrow', time: '1 hour ago', sentiment: 'positive' },
];

const upcomingAppointments = [
  { id: 1, name: 'Jennifer Adams', service: 'Teeth Cleaning', time: '10:00 AM', date: 'Today' },
  { id: 2, name: 'David Brown', service: 'Consultation', time: '2:30 PM', date: 'Today' },
  { id: 3, name: 'Lisa Wang', service: 'HVAC Repair', time: '9:00 AM', date: 'Tomorrow' },
  { id: 4, name: 'Carlos Mendez', service: 'Annual Checkup', time: '11:00 AM', date: 'Tomorrow' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    callsToday: 0,
    leadsGenerated: 0,
    appointmentsBooked: 0,
    messagesAnswered: 0,
    revenueInfluenced: 0,
    satisfactionScore: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      // Get business for user
      const { data: business } = await supabase
        .from('businesses')
        .select('id')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (!business) {
        setLoading(false);
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Fetch today's conversations
      const { count: callsToday } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', business.id)
        .gte('created_at', today.toISOString());

      // Fetch leads count
      const { count: leadsGenerated } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', business.id);

      // Fetch appointments count
      const { count: appointmentsBooked } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', business.id)
        .gte('created_at', today.toISOString());

      // Mock some data for demo
      setStats({
        callsToday: callsToday || 47,
        leadsGenerated: leadsGenerated || 23,
        appointmentsBooked: appointmentsBooked || 12,
        messagesAnswered: 156,
        revenueInfluenced: 45200,
        satisfactionScore: 98,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Use demo data on error
      setStats({
        callsToday: 47,
        leadsGenerated: 23,
        appointmentsBooked: 12,
        messagesAnswered: 156,
        revenueInfluenced: 45200,
        satisfactionScore: 98,
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Calls Answered Today',
      value: stats.callsToday,
      change: '+12%',
      positive: true,
      icon: Phone,
    },
    {
      title: 'Leads Generated',
      value: stats.leadsGenerated,
      change: '+8%',
      positive: true,
      icon: Users,
    },
    {
      title: 'Appointments Booked',
      value: stats.appointmentsBooked,
      change: '+15%',
      positive: true,
      icon: Calendar,
    },
    {
      title: 'Messages Answered',
      value: stats.messagesAnswered,
      change: '+5%',
      positive: true,
      icon: MessageSquare,
    },
    {
      title: 'Revenue Influenced',
      value: `$${(stats.revenueInfluenced / 1000).toFixed(1)}K`,
      change: '+23%',
      positive: true,
      icon: DollarSign,
    },
    {
      title: 'Satisfaction Score',
      value: `${stats.satisfactionScore}%`,
      change: '+2%',
      positive: true,
      icon: Star,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Every call answered. No customer left behind.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-2">
            <Bot className="h-3 w-3" />
            Sophia is online
          </Badge>
          <Button asChild>
            <Link href="/appointments/new">
              <Calendar className="mr-2 h-4 w-4" />
              New Appointment
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <stat.icon className="h-5 w-5 text-muted-foreground" />
                <div className={`flex items-center gap-1 text-xs ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {stat.change}
                </div>
              </div>
              <div className="mt-3">
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Calls Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Weekly Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={callData}>
                  <defs>
                    <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="calls"
                    stroke="hsl(217, 91%, 60%)"
                    fillOpacity={1}
                    fill="url(#colorCalls)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Appointments Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={appointmentData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="appointments" fill="hsl(160, 60%, 45%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Conversations */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Conversations</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/inbox">
                View all
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentConversations.map((conv) => (
                <div key={conv.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    conv.channel === 'phone' ? 'bg-blue-500/10 text-blue-500' :
                    conv.channel === 'sms' ? 'bg-green-500/10 text-green-500' :
                    'bg-orange-500/10 text-orange-500'
                  }`}>
                    {conv.channel === 'phone' ? <Phone className="h-5 w-5" /> :
                     conv.channel === 'sms' ? <MessageSquare className="h-5 w-5" /> :
                     <MessageSquare className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium truncate">{conv.name}</p>
                      <span className="text-xs text-muted-foreground shrink-0">{conv.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{conv.message}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      conv.sentiment === 'positive' ? 'border-green-500 text-green-500' :
                      conv.sentiment === 'negative' ? 'border-red-500 text-red-500' :
                      'border-muted-foreground text-muted-foreground'
                    }
                  >
                    {conv.sentiment}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Channel Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Channel Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={channelData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {channelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {channelData.map((channel) => (
                  <div key={channel.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: channel.color }} />
                    <span className="text-muted-foreground">{channel.name}</span>
                    <span className="ml-auto font-medium">{channel.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Upcoming</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/appointments">
                  View all
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingAppointments.map((apt) => (
                  <div key={apt.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{apt.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{apt.service}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium">{apt.time}</p>
                      <p className="text-xs text-muted-foreground">{apt.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
