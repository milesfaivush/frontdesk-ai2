'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Settings, Building, Clock, Image, Save, Globe } from 'lucide-react';
import { useAuth } from '@/lib/auth-provider';
import { supabase } from '@/lib/supabase/client';
import type { Business } from '@/lib/supabase/client';
import { toast } from 'sonner';

const timezones = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
];

const industries = [
  'Dentist',
  'Medical Spa',
  'HVAC',
  'Electrician',
  'Plumber',
  'Roofing',
  'Law Firm',
  'Real Estate',
  'Auto Repair',
  'Salon & Barbershop',
  'Other',
];

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function SettingsPage() {
  const { user, profile } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [timezone, setTimezone] = useState('America/New_York');
  const [description, setDescription] = useState('');
  const [hours, setHours] = useState<Record<string, { open: string; close: string }>>({});

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
        setBusinessName(businessData.name);
        setIndustry(businessData.industry || '');
        setAddress(businessData.address || '');
        setCity(businessData.city || '');
        setState(businessData.state || '');
        setZip(businessData.zip || '');
        setPhone(businessData.phone || '');
        setEmail(businessData.email || '');
        setWebsite(businessData.website || '');
        setTimezone(businessData.timezone);
        setDescription(businessData.description || '');
        setHours(businessData.hours as Record<string, { open: string; close: string }> || {});
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      if (business) {
        const { error } = await supabase
          .from('businesses')
          .update({
            name: businessName,
            industry: industry,
            address: address,
            city: city,
            state: state,
            zip: zip,
            phone: phone,
            email: email,
            website: website,
            timezone: timezone,
            description: description,
            hours: hours,
            updated_at: new Date().toISOString(),
          })
          .eq('id', business.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('businesses').insert({
          user_id: user!.id,
          name: businessName,
          industry: industry,
          address: address,
          city: city,
          state: state,
          zip: zip,
          phone: phone,
          email: email,
          website: website,
          timezone: timezone,
          description: description,
          hours: hours,
        });

        if (error) throw error;
      }

      toast.success('Settings saved successfully');
      fetchData();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateHours = (day: string, field: 'open' | 'close', value: string) => {
    setHours((prev) => ({
      ...prev,
      [day]: {
        open: prev[day]?.open || '09:00',
        close: prev[day]?.close || '17:00',
        [field]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your business settings and preferences</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Business Information
          </CardTitle>
          <CardDescription>Basic details about your business</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Business Name</Label>
              <Input
                id="name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Your Business Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((ind) => (
                    <SelectItem key={ind} value={ind.toLowerCase().replace(/\s+/g, '_')}>
                      {ind}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main Street"
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="New York"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="NY"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP Code</Label>
              <Input
                id="zip"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                placeholder="10001"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Business Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Business Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@yourbusiness.com"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourbusiness.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Business Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of your business and services..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Business Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Business Hours
          </CardTitle>
          <CardDescription>Set your operating hours for each day</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {days.map((day) => (
            <div key={day} className="flex items-center gap-4">
              <div className="w-28">
                <Label className="capitalize">{day}</Label>
              </div>
              <div className="flex items-center gap-2 flex-1">
                <Input
                  type="time"
                  value={hours[day]?.open || '09:00'}
                  onChange={(e) => updateHours(day, 'open', e.target.value)}
                  className="w-32"
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="time"
                  value={hours[day]?.close || '17:00'}
                  onChange={(e) => updateHours(day, 'close', e.target.value)}
                  className="w-32"
                />
                <Badge variant="outline" className="capitalize">
                  {hours[day]?.open || '09:00'} - {hours[day]?.close || '17:00'}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Account Information
          </CardTitle>
          <CardDescription>Your account details and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Account ID</Label>
              <p className="font-mono text-sm">{user?.id}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <p className="font-medium">{user?.email}</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Plan</Label>
              <Badge className="mt-1">
                {profile?.subscription_plan?.toUpperCase()}
              </Badge>
            </div>
            <div>
              <Label className="text-muted-foreground">Status</Label>
              <Badge variant={profile?.subscription_status === 'active' ? 'default' : 'secondary'} className="mt-1">
                {profile?.subscription_status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
