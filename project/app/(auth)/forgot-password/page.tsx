'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Bot, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSent(true);
      toast.success('Password reset email sent!');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md">
          <Link href="/login" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>

          <Card className="border-2">
            <CardContent className="pt-8 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Check your email</h2>
              <p className="text-muted-foreground mb-6">
                We&apos;ve sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Did&apos;nt receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => setSent(false)}
                  className="text-primary hover:underline"
                >
                  try again
                </button>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <Link href="/login" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        <Card className="border-2">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mb-4">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Reset your password</h1>
            <p className="text-muted-foreground">We&apos;ll send you a link to reset your password</p>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : 'Send reset link'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
