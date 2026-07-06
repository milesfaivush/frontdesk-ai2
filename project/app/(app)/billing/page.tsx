'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  CreditCard,
  Download,
  Check,
  ArrowUpRight,
  Zap,
  Building,
  Users,
  Star
} from 'lucide-react';
import { useAuth } from '@/lib/auth-provider';
import { supabase } from '@/lib/supabase/client';
import type { Profile } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 79,
    description: 'Perfect for small businesses getting started',
    features: [
      '100 conversations/month',
      '1 AI employee',
      'Basic appointment booking',
      'SMS responses',
      'Email support'
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 199,
    description: 'For growing businesses that need more',
    features: [
      'Unlimited conversations',
      '3 AI employees',
      'Advanced booking system',
      'SMS & Email automation',
      'Calendar integrations',
      'Lead qualification',
      'Priority support'
    ],
    highlighted: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 499,
    description: 'For multi-location and growing teams',
    features: [
      'Everything in Growth',
      'Unlimited locations',
      'Team accounts',
      'Advanced analytics',
      'API access',
      'Custom integrations',
      'Dedicated success manager',
      'Phone support'
    ],
  },
];

const invoices = [
  { id: 1, date: '2024-01-15', amount: 199, status: 'paid', number: 'INV-001' },
  { id: 2, date: '2023-12-15', amount: 199, status: 'paid', number: 'INV-002' },
  { id: 3, date: '2023-11-15', amount: 79, status: 'paid', number: 'INV-003' },
];

export default function BillingPage() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (planId: string) => {
    if (planId === profile?.subscription_plan) return;

    setLoading(true);
    try {
      // In production, this would create a Stripe checkout session
      // For demo, we'll just update the profile
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_plan: planId,
          subscription_status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', user!.id);

      if (error) throw error;

      toast.success(`Upgraded to ${planId} plan!`);
      window.location.reload();
    } catch (error) {
      console.error('Error upgrading plan:', error);
      toast.error('Failed to upgrade plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground">Manage your subscription and invoices</p>
      </div>

      {/* Current Plan */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Plan</p>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold capitalize">{profile?.subscription_plan}</h2>
                <Badge variant={profile?.subscription_status === 'active' ? 'default' : 'secondary'}>
                  {profile?.subscription_status}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-2">
                ${plans.find(p => p.id === profile?.subscription_plan)?.price || 79}/month
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                Manage Payment Method
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${plan.highlighted ? 'border-2 border-primary shadow-lg' : ''} ${
                profile?.subscription_plan === plan.id ? 'ring-2 ring-primary' : ''
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                </div>
              )}
              {profile?.subscription_plan === plan.id && (
                <div className="absolute -top-3 right-4">
                  <Badge variant="secondary">
                    <Check className="w-3 h-3 mr-1" />
                    Current
                  </Badge>
                </div>
              )}
              <CardContent className="pt-8">
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={profile?.subscription_plan === plan.id ? 'outline' : 'default'}
                  disabled={profile?.subscription_plan === plan.id || loading}
                  onClick={() => handleUpgrade(plan.id)}
                >
                  {profile?.subscription_plan === plan.id
                    ? 'Current Plan'
                    : plan.id === 'starter'
                    ? 'Downgrade'
                    : 'Upgrade'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>View and download your past invoices</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.number}</TableCell>
                  <TableCell>{format(new Date(invoice.date), 'MMM d, yyyy')}</TableCell>
                  <TableCell>${invoice.amount}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
