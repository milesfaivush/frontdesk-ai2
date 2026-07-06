import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  timezone: string;
  subscription_plan: 'starter' | 'growth' | 'enterprise';
  subscription_status: 'active' | 'trialing' | 'canceled' | 'past_due';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Business = {
  id: string;
  user_id: string;
  name: string;
  industry: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  hours: Record<string, { open: string; close: string }>;
  timezone: string;
  logo_url: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type AIEmployee = {
  id: string;
  business_id: string;
  name: string;
  voice: 'professional' | 'friendly' | 'energetic' | 'luxury';
  greeting_message: string | null;
  services: Array<{ name: string; description: string }>;
  faqs: Array<{ question: string; answer: string }>;
  pricing: Array<{ service: string; price: string }>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Conversation = {
  id: string;
  business_id: string;
  channel: 'phone' | 'sms' | 'chat' | 'facebook' | 'instagram';
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  status: 'open' | 'in_progress' | 'resolved' | 'archived';
  ai_summary: string | null;
  sentiment: 'positive' | 'neutral' | 'negative';
  lead_score: number;
  last_message_at: string;
  created_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  direction: 'inbound' | 'outbound';
  content: string;
  is_ai_generated: boolean;
  created_at: string;
};

export type Appointment = {
  id: string;
  business_id: string;
  conversation_id: string | null;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  service: string | null;
  notes: string | null;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'confirmed' | 'canceled' | 'completed' | 'no_show';
  reminder_sent_at: string | null;
  confirmation_sent_at: string | null;
  created_at: string;
};

export type Lead = {
  id: string;
  business_id: string;
  conversation_id: string | null;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  service_needed: string | null;
  budget: string | null;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  location: string | null;
  probability_of_closing: number;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Workflow = {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  trigger: 'missed_call' | 'new_lead' | 'estimate_sent' | 'no_response' | 'appointment_booked';
  trigger_delay_minutes: number;
  action: 'send_sms' | 'send_email' | 'create_task' | 'assign_to_human';
  action_template: Record<string, string>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  type: 'high_value_lead' | 'appointment_booked' | 'voicemail' | 'ai_needs_help' | 'new_message';
  title: string;
  body: string | null;
  is_read: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type KnowledgeBaseDocument = {
  id: string;
  business_id: string;
  user_id: string;
  name: string;
  file_url: string | null;
  file_type: string | null;
  file_size: number | null;
  content_text: string | null;
  status: 'processing' | 'ready' | 'error';
  created_at: string;
};
