'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Bot, Plus, Trash2, Edit, Save, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth-provider';
import { supabase } from '@/lib/supabase/client';
import type { AIEmployee, Business } from '@/lib/supabase/client';
import { toast } from 'sonner';

const voiceOptions = [
  { value: 'professional', label: 'Professional', description: 'Clear and business-like' },
  { value: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
  { value: 'energetic', label: 'Energetic', description: 'Upbeat and enthusiastic' },
  { value: 'luxury', label: 'Luxury', description: 'Sophisticated and refined' },
];

export default function AIEmployeePage() {
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [aiEmployee, setAiEmployee] = useState<AIEmployee | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState('Sophia');
  const [voice, setVoice] = useState<'professional' | 'friendly' | 'energetic' | 'luxury'>('professional');
  const [greetingMessage, setGreetingMessage] = useState('');
  const [services, setServices] = useState<Array<{ name: string; description: string }>>([]);
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>([]);
  const [pricing, setPricing] = useState<Array<{ service: string; price: string }>>([]);
  const [isActive, setIsActive] = useState(true);

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

        const { data: aiData } = await supabase
          .from('ai_employees')
          .select('*')
          .eq('business_id', businessData.id)
          .maybeSingle();

        if (aiData) {
          setAiEmployee(aiData);
          setName(aiData.name);
          setVoice(aiData.voice);
          setGreetingMessage(aiData.greeting_message || '');
          setServices(aiData.services as Array<{ name: string; description: string }> || []);
          setFaqs(aiData.faqs as Array<{ question: string; answer: string }> || []);
          setPricing(aiData.pricing as Array<{ service: string; price: string }> || []);
          setIsActive(aiData.is_active);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!business) return;
    setSaving(true);

    try {
      const employeeData = {
        business_id: business.id,
        name,
        voice,
        greeting_message: greetingMessage,
        services,
        faqs,
        pricing,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      };

      if (aiEmployee) {
        const { error } = await supabase
          .from('ai_employees')
          .update(employeeData)
          .eq('id', aiEmployee.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('ai_employees')
          .insert(employeeData);

        if (error) throw error;
      }

      toast.success('AI Employee saved successfully');
      fetchData();
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save AI Employee');
    } finally {
      setSaving(false);
    }
  };

  const addService = () => {
    setServices([...services, { name: '', description: '' }]);
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const updateService = (index: number, field: 'name' | 'description', value: string) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    setServices(updated);
  };

  const addFaq = () => {
    setFaqs([...faqs, { question: '', answer: '' }]);
  };

  const removeFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const updateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    const updated = [...faqs];
    updated[index] = { ...updated[index], [field]: value };
    setFaqs(updated);
  };

  const addPricing = () => {
    setPricing([...pricing, { service: '', price: '' }]);
  };

  const removePricing = (index: number) => {
    setPricing(pricing.filter((_, i) => i !== index));
  };

  const updatePricing = (index: number, field: 'service' | 'price', value: string) => {
    const updated = [...pricing];
    updated[index] = { ...updated[index], [field]: value };
    setPricing(updated);
  };

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
          <h1 className="text-3xl font-bold">AI Employee</h1>
          <p className="text-muted-foreground">Configure your virtual receptionist</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch checked={isActive} onCheckedChange={setIsActive} />
            <Label>{isActive ? 'Online' : 'Offline'}</Label>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* AI Employee Preview Card */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <Bot className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">{name || 'Your AI Employee'}</h2>
                <Badge variant={isActive ? 'default' : 'secondary'}>
                  {isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-muted-foreground capitalize">Voice: {voice}</p>
              {greetingMessage && (
                <p className="text-sm mt-2 italic">&ldquo;{greetingMessage}&rdquo;</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Tabs */}
      <Tabs defaultValue="basics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none lg:flex">
          <TabsTrigger value="basics">Basics</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>

        {/* Basics Tab */}
        <TabsContent value="basics">
          <Card>
            <CardHeader>
              <CardTitle>Basic Configuration</CardTitle>
              <CardDescription>Set up your AI employee&apos;s identity and behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Employee Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Sophia"
                  />
                  <p className="text-xs text-muted-foreground">The name AI will use when introducing itself</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="voice">Voice Style</Label>
                  <Select value={voice} onValueChange={(v) => setVoice(v as typeof voice)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {voiceOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <span className="font-medium">{option.label}</span>
                            <span className="text-muted-foreground ml-2">- {option.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="greeting">Greeting Message</Label>
                <Textarea
                  id="greeting"
                  value={greetingMessage}
                  onChange={(e) => setGreetingMessage(e.target.value)}
                  placeholder="Hi! Thanks for calling. How can I help you today?"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">The message AI says when answering calls or starting chats</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Services</CardTitle>
                <CardDescription>Add your business services for AI to understand and book</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={addService}>
                <Plus className="mr-2 h-4 w-4" />
                Add Service
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {services.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No services added yet</p>
                  <Button variant="link" onClick={addService}>Add your first service</Button>
                </div>
              ) : (
                services.map((service, index) => (
                  <div key={index} className="flex gap-4 items-start p-4 border rounded-lg">
                    <div className="flex-1 space-y-4">
                      <Input
                        placeholder="Service name"
                        value={service.name}
                        onChange={(e) => updateService(index, 'name', e.target.value)}
                      />
                      <Textarea
                        placeholder="Description (optional)"
                        value={service.description}
                        onChange={(e) => updateService(index, 'description', e.target.value)}
                        rows={2}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeService(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQs Tab */}
        <TabsContent value="faqs">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>Train AI to answer common customer questions</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={addFaq}>
                <Plus className="mr-2 h-4 w-4" />
                Add FAQ
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No FAQs added yet</p>
                  <Button variant="link" onClick={addFaq}>Add your first FAQ</Button>
                </div>
              ) : (
                faqs.map((faq, index) => (
                  <div key={index} className="flex gap-4 items-start p-4 border rounded-lg">
                    <div className="flex-1 space-y-4">
                      <Input
                        placeholder="Question"
                        value={faq.question}
                        onChange={(e) => updateFaq(index, 'question', e.target.value)}
                      />
                      <Textarea
                        placeholder="Answer"
                        value={faq.answer}
                        onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                        rows={2}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeFaq(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Tab */}
        <TabsContent value="pricing">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Pricing Information</CardTitle>
                <CardDescription>Share your pricing so AI can answer cost questions</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={addPricing}>
                <Plus className="mr-2 h-4 w-4" />
                Add Pricing
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {pricing.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No pricing added yet</p>
                  <Button variant="link" onClick={addPricing}>Add your first pricing</Button>
                </div>
              ) : (
                pricing.map((item, index) => (
                  <div key={index} className="flex gap-4 items-center p-4 border rounded-lg">
                    <div className="flex-1 grid sm:grid-cols-2 gap-4">
                      <Input
                        placeholder="Service name"
                        value={item.service}
                        onChange={(e) => updatePricing(index, 'service', e.target.value)}
                      />
                      <Input
                        placeholder="Price (e.g., $150)"
                        value={item.price}
                        onChange={(e) => updatePricing(index, 'price', e.target.value)}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removePricing(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
