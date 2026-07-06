'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  Phone,
  MessageSquare,
  Calendar,
  Users,
  Zap,
  Shield,
  Clock,
  TrendingUp,
  Bot,
  ChevronRight,
  Play,
  Check,
  ArrowRight,
  Menu,
  Moon,
  Sun
} from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useState } from 'react';

const industries = [
  'Dentists', 'Medical Spas', 'HVAC Companies', 'Electricians',
  'Plumbers', 'Roofing', 'Law Firms', 'Realtors',
  'Auto Repair', 'Salons & Barbershops'
];

const features = [
  {
    icon: Phone,
    title: '24/7 Call Answering',
    description: 'Every call gets answered. No more voicemails, no more lost customers, no more missed opportunities.'
  },
  {
    icon: MessageSquare,
    title: 'Unified Inbox',
    description: 'All your customer conversations in one place: phone, SMS, chat, Facebook, and Instagram.'
  },
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description: 'AI-powered booking with automatic reminders, confirmations, and rescheduling.'
  },
  {
    icon: Users,
    title: 'Lead Qualification',
    description: 'Automatically score and qualify leads based on budget, urgency, and service needs.'
  },
  {
    icon: Zap,
    title: 'Automated Follow-ups',
    description: 'Set triggers to automatically follow up with leads, send reminders, and re-engage cold contacts.'
  },
  {
    icon: Bot,
    title: 'Customizable AI',
    description: 'Train your AI employee with your business info, FAQs, pricing, and service details.'
  }
];

const howItWorks = [
  {
    step: '01',
    title: 'Never Miss Another Call',
    description: "Every call is answered within seconds, 24 hours a day, 7 days a week. Even when you're on a job, in a meeting, or sleeping."
  },
  {
    step: '02',
    title: 'Turn Callers Into Customers',
    description: 'Your AI books appointments, answers questions, and captures every lead. Lost calls become paying customers.'
  },
  {
    step: '03',
    title: 'Focus on Your Work',
    description: 'Stop interrupting your work to answer the phone. Let AI handle the calls while you do what you do best.'
  },
  {
    step: '04',
    title: 'See the Results',
    description: 'Track every call, booking, and dollar earned. Watch your business grow without lifting a finger.'
  }
];

const outcomes = [
  {
    stat: '80%',
    label: 'of callers who reach voicemail hang up without leaving a message',
    icon: Phone
  },
  {
    stat: '24/7',
    label: 'coverage, including nights, weekends, and holidays',
    icon: Clock
  },
  {
    stat: '<10 sec',
    label: 'average time to answer, every single call',
    icon: Zap
  }
];

const pricingPlans = [
  {
    name: 'Starter',
    price: '129',
    description: 'For solo operators and small crews',
    features: [
      '250 minutes/month included',
      '$0.30/min overage',
      '1 AI employee',
      'Basic appointment booking',
      'SMS responses',
      'Email support'
    ],
    highlighted: false
  },
  {
    name: 'Growth',
    price: '249',
    description: 'For growing shops with steady call volume',
    features: [
      '700 minutes/month included',
      '$0.25/min overage',
      '3 AI employees',
      'Advanced booking system',
      'SMS & Email automation',
      'Calendar integrations',
      'Lead qualification',
      'Priority support'
    ],
    highlighted: true
  },
  {
    name: 'Pro',
    price: '449',
    description: 'For larger shops closing bigger tickets',
    features: [
      '1,200 minutes/month included',
      '$0.28/min overage',
      'Everything in Growth',
      'Customer financing at booking',
      'Unlimited locations',
      'Team accounts',
      'Advanced analytics',
      'API access',
      'Dedicated success manager'
    ],
    highlighted: false
  }
];

const faqs = [
  {
    question: 'How does the AI know about my business?',
    answer: 'You provide information about your services, hours, pricing, FAQs, and any other details. The AI uses this to answer customer questions accurately and book the right appointments.'
  },
  {
    question: 'Can the AI handle complex customer inquiries?',
    answer: 'Yes. The AI is trained on your specific business information and can handle nuanced questions. If it encounters something it can\'t answer, it seamlessly transfers to a human or takes a message.'
  },
  {
    question: 'What happens after the free trial?',
    answer: 'Your 14-day trial includes all Growth features. After that, you can choose any plan. If you don\'t subscribe, your account is paused until you\'re ready.'
  },
  {
    question: 'Can I customize how the AI sounds and behaves?',
    answer: 'Absolutely. Choose from different voice styles (professional, friendly, energetic, luxury), set a custom name, and define exactly how it should interact with customers.'
  },
  {
    question: 'How quickly can I get set up?',
    answer: 'Most businesses are running within 15 minutes. Enter your business info, customize your AI employee, and start receiving calls and messages right away.'
  },
  {
    question: 'What channels does FrontDesk AI support?',
    answer: 'Phone calls, SMS text messages, website chat widgets, Facebook Messenger, and Instagram direct messages all feed into one unified inbox.'
  }
];

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-lg">FrontDesk AI</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button>Start Free Trial</Button>
              </Link>
            </div>

            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background p-4">
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-muted-foreground">Features</a>
              <a href="#pricing" className="text-muted-foreground">Pricing</a>
              <a href="#faq" className="text-muted-foreground">FAQ</a>
              <Link href="/login">
                <Button variant="ghost" className="w-full">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button className="w-full">Start Free Trial</Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />

        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-secondary/50 mb-8">
            <Badge variant="secondary" className="rounded-full">24/7</Badge>
            <span className="text-sm text-muted-foreground">Every call answered. Every opportunity captured.</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Never Lose Another Customer
            <br />
            <span className="text-gradient">Because You Missed Their Call</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Your AI employee answers every call, 24/7. Book appointments, qualify leads, and grow your business while you focus on the work.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/signup">
              <Button size="lg" className="gap-2 text-lg px-8">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="gap-2 text-lg px-8">
              <Play className="w-5 h-5" />
              Watch Demo
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground mb-12">
            <span>Trusted by:</span>
            {industries.slice(0, 5).map((industry) => (
              <Badge key={industry} variant="outline" className="font-normal">
                {industry}
              </Badge>
            ))}
            <span>and more</span>
          </div>

          {/* Hero Visual */}
          <div className="relative mx-auto max-w-5xl">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
            <Card className="overflow-hidden border-2 shadow-2xl">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-1 space-y-3">
                      {['Dashboard', 'Appointments', 'Inbox', 'Leads', 'Analytics', 'Settings'].map((item) => (
                        <div
                          key={item}
                          className={`px-3 py-2 rounded text-sm ${item === 'Dashboard' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400'}`}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                    <div className="col-span-3 bg-slate-800/50 rounded p-4">
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        {[
                          { label: 'Calls Today', value: '47', change: '+12%' },
                          { label: 'Leads Generated', value: '23', change: '+8%' },
                          { label: 'Appointments', value: '31', change: '+15%' },
                        ].map((stat) => (
                          <div key={stat.label} className="bg-slate-700/50 rounded p-4">
                            <p className="text-slate-400 text-sm">{stat.label}</p>
                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                            <p className="text-green-400 text-sm">{stat.change}</p>
                          </div>
                        ))}
                      </div>
                      <div className="bg-slate-700/30 rounded p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                            <Bot className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-medium">Sophia - AI Assistant</p>
                            <p className="text-slate-400 text-sm">Online - Answering calls</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {[
                            'New appointment booked with Dr. Smith at 2:00 PM',
                            'Lead qualified: $5,000 HVAC installation inquiry',
                            'Follow-up sent to 3 customers',
                          ].map((msg, i) => (
                            <div key={i} className="bg-slate-800/50 rounded p-3 text-sm text-slate-300">
                              {msg}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Features</Badge>
            <h2 className="text-4xl font-bold mb-4">Everything you need to automate your front desk</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful AI automation tools designed specifically for service-based businesses.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">How It Works</Badge>
            <h2 className="text-4xl font-bold mb-4">Get started in minutes, not months</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              No technical skills required. Set up your AI employee and start seeing results immediately.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((step, index) => (
              <div key={step.step} className="relative">
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-border" />
                )}
                <div className="flex flex-col items-start">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="py-24 px-4 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Why It Matters</Badge>
            <h2 className="text-4xl font-bold mb-4">Every missed call is a missed customer</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We&apos;re a new company, so instead of made-up reviews, here&apos;s the real problem we built FrontDesk AI to solve.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {outcomes.map((outcome) => (
              <Card key={outcome.label} className="bg-background">
                <CardContent className="p-6 text-center">
                  <outcome.icon className="w-8 h-8 text-primary mx-auto mb-4" />
                  <p className="text-4xl font-bold mb-2">{outcome.stat}</p>
                  <p className="text-sm text-muted-foreground">{outcome.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Pricing</Badge>
            <h2 className="text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start with a 14-day free trial. No credit card required.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative ${plan.highlighted ? 'border-2 border-primary shadow-lg scale-105' : ''}`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                <CardContent className="p-8 text-center">
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-5xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>
                  <ul className="text-left space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup">
                    <Button className="w-full" variant={plan.highlighted ? 'default' : 'outline'}>
                      Start Free Trial
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-4 bg-secondary/30">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">FAQ</Badge>
            <h2 className="text-4xl font-bold mb-4">Frequently asked questions</h2>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Stop Missing Calls. Start Growing.</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Your customers deserve an answer every time they call. Give them one.
          </p>
          <Link href="/signup">
            <Button size="lg" className="gap-2 text-lg px-8">
              Start Your Free Trial
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-lg">FrontDesk AI</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Never miss a call. Never lose a customer. Your AI employee handles it all, 24/7.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {new Date().getFullYear()} FrontDesk AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
