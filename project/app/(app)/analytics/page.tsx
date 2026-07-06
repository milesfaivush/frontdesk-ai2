'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Phone,
  Calendar,
  DollarSign,
  MessageSquare,
  Star,
  Users,
  Bot,
  Download,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '@/lib/auth-provider';
import { supabase } from '@/lib/supabase/client';
import type { Business } from '@/lib/supabase/client';

const callsData = [
  { day: 'Mon', calls: 45, answered: 42, missed: 3 },
  { day: 'Tue', calls: 52, answered: 50, missed: 2 },
  { day: 'Wed', calls: 38, answered: 36, missed: 2 },
  { day: 'Thu', calls: 67, answered: 65, missed: 2 },
  { day: 'Fri', calls: 59, answered: 58, missed: 1 },
  { day: 'Sat', calls: 23, answered: 22, missed: 1 },
  { day: 'Sun', calls: 18, answered: 17, missed: 1 },
];

const revenueData = [
  { month: 'Jan', revenue: 32000, booked: 89 },
  { month: 'Feb', revenue: 38000, booked: 102 },
  { month: 'Mar', revenue: 42000, booked: 117 },
  { month: 'Apr', revenue: 47000, booked: 134 },
  { month: 'May', revenue: 53000, booked: 156 },
  { month: 'Jun', revenue: 58000, booked: 178 },
];

const topQuestions = [
  { question: 'What are your hours?', count: 234, percentage: 23 },
  { question: 'How much does [service] cost?', count: 198, percentage: 20 },
  { question: 'Do you have availability today?', count: 156, percentage: 15 },
  { question: 'Can I reschedule my appointment?', count: 134, percentage: 13 },
  { question: 'What services do you offer?', count: 112, percentage: 11 },
  { question: 'Where are you located?', count: 89, percentage: 9 },
  { question: 'Do you accept insurance?', count: 67, percentage: 7 },
  { question: 'Other questions', count: 110, percentage: 2 },
];

const conversionData = [
  { name: 'Captured', value: 100, color: 'hsl(217, 91%, 60%)' },
  { name: 'Qualified', value: 78, color: 'hsl(160, 60%, 45%)' },
  { name: 'Booked', value: 56, color: 'hsl(30, 80%, 55%)' },
  { name: 'Completed', value: 45, color: 'hsl(280, 65%, 60%)' },
];

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const { data: businessData } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (businessData) {
        setBusiness(businessData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Calls Saved',
      value: '312',
      change: '+18%',
      positive: true,
      icon: Phone,
      description: 'Calls handled by AI instead of voicemail',
    },
    {
      title: 'Avg Response Time',
      value: '2.4s',
      change: '-45%',
      positive: true,
      icon: Clock,
      description: 'Down from 4.4 seconds last month',
    },
    {
      title: 'Missed Calls Prevented',
      value: '89%',
      change: '+12%',
      positive: true,
      icon: Phone,
      description: 'Of calls answered instead of missed',
    },
    {
      title: 'Booking Conversion',
      value: '34%',
      change: '+8%',
      positive: true,
      icon: Calendar,
      description: 'Conversations that lead to bookings',
    },
    {
      title: 'Revenue Generated',
      value: '$58K',
      change: '+23%',
      positive: true,
      icon: DollarSign,
      description: 'Revenue from AI-booked appointments',
    },
    {
      title: 'Customer Satisfaction',
      value: '4.8',
      change: '+0.2',
      positive: true,
      icon: Star,
      description: 'Average rating from customers',
    },
  ];

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
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track your AI employee&apos;s performance</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="h-5 w-5 text-muted-foreground" />
                <div className={`flex items-center gap-1 text-xs ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {stat.change}
                </div>
              </div>
              <p className="text-3xl font-bold mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Calls Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Call Volume</CardTitle>
            <CardDescription>Calls answered vs missed over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={callsData}>
                  <defs>
                    <linearGradient id="colorAnswered" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorMissed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
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
                  <Legend />
                  <Area type="monotone" dataKey="answered" stroke="hsl(160, 60%, 45%)" fillOpacity={1} fill="url(#colorAnswered)" />
                  <Area type="monotone" dataKey="missed" stroke="hsl(0, 84%, 60%)" fillOpacity={1} fill="url(#colorMissed)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue & Bookings</CardTitle>
            <CardDescription>Monthly revenue generated by your AI employee</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis yAxisId="left" className="text-xs" />
                  <YAxis yAxisId="right" orientation="right" className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" fill="hsl(217, 91%, 60%)" name="Revenue ($)" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="booked" stroke="hsl(30, 80%, 55%)" name="Bookings" strokeWidth={2} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>Lead to customer journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={conversionData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" className="text-xs" width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value) => [`${value}%`, 'Rate']}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {conversionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Questions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Customer Questions</CardTitle>
            <CardDescription>Most frequently asked questions this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topQuestions.map((item, index) => (
                <div key={item.question} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.question}</p>
                    <div className="w-full h-1.5 bg-secondary rounded-full mt-1">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{item.count}</p>
                    <p className="text-xs text-muted-foreground">{item.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Employee Performance
          </CardTitle>
          <CardDescription>How your AI employee performed this period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-green-500/10 rounded-lg">
              <p className="text-4xl font-bold text-green-600">98.2%</p>
              <p className="text-sm text-muted-foreground mt-1">Response Accuracy</p>
            </div>
            <div className="text-center p-4 bg-blue-500/10 rounded-lg">
              <p className="text-4xl font-bold text-blue-600">2,345</p>
              <p className="text-sm text-muted-foreground mt-1">Conversations Handled</p>
            </div>
            <div className="text-center p-4 bg-purple-500/10 rounded-lg">
              <p className="text-4xl font-bold text-purple-600">12</p>
              <p className="text-sm text-muted-foreground mt-1">Escalated to Human</p>
            </div>
            <div className="text-center p-4 bg-cyan-500/10 rounded-lg">
              <p className="text-4xl font-bold text-cyan-600">$45.2K</p>
              <p className="text-sm text-muted-foreground mt-1">Revenue Influenced</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
