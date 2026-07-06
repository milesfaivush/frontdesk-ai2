'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Building, Bot, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useAuth } from '@/lib/auth-provider';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

const steps = [
  { id: 1, title: 'Business Info', description: 'Tell us about your business' },
  { id: 2, title: 'AI Employee', description: 'Customize who answers your calls' },
  { id: 3, title: 'Services', description: 'What services do you offer?' },
];

const industries = [
  'Dentist', 'Medical Spa', 'HVAC', 'Electrician', 'Plumber',
  'Roofing', 'Law Firm', 'Real Estate', 'Auto Repair', 'Salon & Barbershop', 'Other'
];

const voiceOptions = [
  { value: 'professional', label: 'Professional', description: 'Clear and business-like' },
  { value: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
  { value: 'energetic', label: 'Energetic', description: 'Upbeat and enthusiastic' },
  { value: 'luxury', label: 'Luxury', description: 'Sophisticated and refined' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Business
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Step 2: AI Employee
  const [aiName, setAiName] = useState('Sophia');
  const [voice, setVoice] = useState('professional');
  const [greeting, setGreeting] = useState('Hi! Thanks for calling. How can I help you today?');

  // Step 3: Services
  const [services, setServices] = useState<string[]>(['']);
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>([]);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Create business
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .insert({
          user_id: user.id,
          name: businessName,
          industry: industry.toLowerCase(),
          phone,
          address,
        })
        .select()
        .single();

      if (businessError) throw businessError;

      // Create AI Employee
      const { error: aiError } = await supabase.from('ai_employees').insert({
        business_id: businessData.id,
        name: aiName,
        voice: voice as 'professional' | 'friendly' | 'energetic' | 'luxury',
        greeting_message: greeting,
        services: services.filter(s => s.trim()).map(s => ({ name: s, description: '' })),
        faqs,
        pricing: [],
      });

      if (aiError) throw aiError;

      toast.success('Setup complete! Welcome to FrontDesk AI.');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to complete setup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addService = () => {
    setServices([...services, '']);
  };

  const updateService = (index: number, value: string) => {
    const updated = [...services];
    updated[index] = value;
    setServices(updated);
  };

  const addFaq = () => {
    setFaqs([...faqs, { question: '', answer: '' }]);
  };

  const updateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    const updated = [...faqs];
    updated[index] = { ...updated[index], [field]: value };
    setFaqs(updated);
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center gap-2 ${
                  step.id <= currentStep ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.id < currentStep
                      ? 'bg-primary text-primary-foreground'
                      : step.id === currentStep
                      ? 'bg-primary/10 border-2 border-primary'
                      : 'bg-secondary'
                  }`}
                >
                  {step.id < currentStep ? <Check className="w-4 h-4" /> : step.id}
                </div>
                <span className="hidden sm:inline text-sm font-medium">{step.title}</span>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Business Information
              </CardTitle>
              <CardDescription>Tell us about your business</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Business Name *</Label>
                <Input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g., Smith Dental Clinic"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select industry</option>
                    {industries.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main Street, City, State 12345"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Employee Setup
              </CardTitle>
              <CardDescription>Customize the voice that answers every call</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>AI Name</Label>
                  <Input
                    value={aiName}
                    onChange={(e) => setAiName(e.target.value)}
                    placeholder="e.g., Sophia"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Voice Style</Label>
                  <select
                    value={voice}
                    onChange={(e) => setVoice(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {voiceOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Greeting Message</Label>
                <Input
                  value={greeting}
                  onChange={(e) => setGreeting(e.target.value)}
                  placeholder="Hi! Thanks for calling..."
                />
                <p className="text-xs text-muted-foreground">This is what callers hear when they ring your business</p>
              </div>
              <div className="flex items-center gap-4 p-4 bg-secondary rounded-lg">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-medium">{aiName || 'Your AI'}</p>
                  <p className="text-sm text-muted-foreground capitalize">{voice} voice</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Services & FAQs</CardTitle>
              <CardDescription>Help your AI understand what you offer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Services Offered</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addService}>
                    Add Service
                  </Button>
                </div>
                <div className="space-y-2">
                  {services.map((service, index) => (
                    <Input
                      key={index}
                      value={service}
                      onChange={(e) => updateService(index, e.target.value)}
                      placeholder="e.g., Teeth Cleaning, HVAC Repair"
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Common FAQs (Optional)</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addFaq}>
                    Add FAQ
                  </Button>
                </div>
                <div className="space-y-3">
                  {faqs.map((faq, index) => (
                    <div key={index} className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Question"
                        value={faq.question}
                        onChange={(e) => updateFaq(index, 'question', e.target.value)}
                      />
                      <Input
                        placeholder="Answer"
                        value={faq.answer}
                        onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          {currentStep < steps.length ? (
            <Button onClick={handleNext}>
              Continue
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleFinish} disabled={loading}>
              {loading ? 'Setting up...' : 'Complete Setup'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
