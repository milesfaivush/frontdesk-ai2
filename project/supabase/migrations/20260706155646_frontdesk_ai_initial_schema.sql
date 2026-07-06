
/*
# FrontDesk AI - Initial Schema

## Summary
Creates the complete database schema for FrontDesk AI, a SaaS platform that provides AI-powered receptionist and employee services for small businesses.

## New Tables

### profiles
Extends Supabase auth.users with business owner profile information.
- id: links to auth.users
- full_name, avatar_url, phone, timezone
- subscription_plan: starter | growth | enterprise
- subscription_status: active | trialing | canceled | past_due
- stripe_customer_id, stripe_subscription_id

### businesses
Each authenticated user manages one or more business locations.
- id, user_id (owner), name, industry, address, city, state, zip
- phone, email, website
- hours (jsonb): weekly schedule as { "monday": { "open": "09:00", "close": "17:00" }, ... }
- timezone, logo_url, description

### ai_employees
Customizable AI employee persona per business.
- id, business_id
- name: e.g. "Sophia"
- voice: professional | friendly | energetic | luxury
- greeting_message
- services (jsonb): array of service names/descriptions
- faqs (jsonb): array of {question, answer}
- pricing (jsonb): array of {service, price}
- is_active

### knowledge_base_documents
Files and documents uploaded to train the AI.
- id, business_id, user_id
- name, file_url, file_type, file_size
- content_text (extracted text for RAG)
- status: processing | ready | error
- created_at

### conversations
Unified inbox: phone calls, SMS, chat, social messages.
- id, business_id
- channel: phone | sms | chat | facebook | instagram
- customer_name, customer_phone, customer_email
- status: open | in_progress | resolved | archived
- ai_summary, sentiment: positive | neutral | negative
- lead_score (0-100)
- last_message_at, created_at

### messages
Individual messages within a conversation.
- id, conversation_id
- direction: inbound | outbound
- content, is_ai_generated
- created_at

### appointments
Bookings made through the AI system.
- id, business_id, conversation_id
- customer_name, customer_phone, customer_email
- service, notes
- start_time, end_time
- status: scheduled | confirmed | canceled | completed | no_show
- reminder_sent_at, confirmation_sent_at

### leads
Qualified leads captured by the AI.
- id, business_id, conversation_id
- customer_name, customer_phone, customer_email
- service_needed, budget, urgency: low | medium | high | critical
- location, probability_of_closing (0-100)
- status: new | contacted | qualified | proposal | won | lost
- notes, created_at

### workflows
Automation rules for follow-ups.
- id, business_id
- name, description
- trigger: missed_call | new_lead | estimate_sent | no_response | appointment_booked
- trigger_delay_minutes
- action: send_sms | send_email | create_task | assign_to_human
- action_template (jsonb): { subject, body }
- is_active, created_at

### notifications
In-app notification log.
- id, user_id
- type: high_value_lead | appointment_booked | voicemail | ai_needs_help
- title, body
- is_read, created_at
- metadata (jsonb)

## Security
All tables have RLS enabled with authenticated-user ownership policies using auth.uid().
*/

-- =============================================
-- PROFILES
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  phone text,
  timezone text DEFAULT 'America/New_York',
  subscription_plan text NOT NULL DEFAULT 'starter' CHECK (subscription_plan IN ('starter','growth','enterprise')),
  subscription_status text NOT NULL DEFAULT 'trialing' CHECK (subscription_status IN ('active','trialing','canceled','past_due')),
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE TO authenticated USING (auth.uid() = id);

-- =============================================
-- BUSINESSES
-- =============================================
CREATE TABLE IF NOT EXISTS businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  industry text,
  address text,
  city text,
  state text,
  zip text,
  phone text,
  email text,
  website text,
  hours jsonb DEFAULT '{}',
  timezone text DEFAULT 'America/New_York',
  logo_url text,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS businesses_user_id_idx ON businesses(user_id);
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_businesses" ON businesses;
CREATE POLICY "select_own_businesses" ON businesses FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_businesses" ON businesses;
CREATE POLICY "insert_own_businesses" ON businesses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_businesses" ON businesses;
CREATE POLICY "update_own_businesses" ON businesses FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_businesses" ON businesses;
CREATE POLICY "delete_own_businesses" ON businesses FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =============================================
-- AI EMPLOYEES
-- =============================================
CREATE TABLE IF NOT EXISTS ai_employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Sophia',
  voice text NOT NULL DEFAULT 'professional' CHECK (voice IN ('professional','friendly','energetic','luxury')),
  greeting_message text,
  services jsonb DEFAULT '[]',
  faqs jsonb DEFAULT '[]',
  pricing jsonb DEFAULT '[]',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ai_employees_business_id_idx ON ai_employees(business_id);
ALTER TABLE ai_employees ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_ai_employees" ON ai_employees;
CREATE POLICY "select_own_ai_employees" ON ai_employees FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM businesses WHERE businesses.id = ai_employees.business_id AND businesses.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_own_ai_employees" ON ai_employees;
CREATE POLICY "insert_own_ai_employees" ON ai_employees FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM businesses WHERE businesses.id = ai_employees.business_id AND businesses.user_id = auth.uid()));
DROP POLICY IF EXISTS "update_own_ai_employees" ON ai_employees;
CREATE POLICY "update_own_ai_employees" ON ai_employees FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM businesses WHERE businesses.id = ai_employees.business_id AND businesses.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM businesses WHERE businesses.id = ai_employees.business_id AND businesses.user_id = auth.uid()));
DROP POLICY IF EXISTS "delete_own_ai_employees" ON ai_employees;
CREATE POLICY "delete_own_ai_employees" ON ai_employees FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM businesses WHERE businesses.id = ai_employees.business_id AND businesses.user_id = auth.uid()));

-- =============================================
-- KNOWLEDGE BASE DOCUMENTS
-- =============================================
CREATE TABLE IF NOT EXISTS knowledge_base_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  file_url text,
  file_type text,
  file_size bigint,
  content_text text,
  status text NOT NULL DEFAULT 'processing' CHECK (status IN ('processing','ready','error')),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS kb_docs_business_id_idx ON knowledge_base_documents(business_id);
ALTER TABLE knowledge_base_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_kb_docs" ON knowledge_base_documents;
CREATE POLICY "select_own_kb_docs" ON knowledge_base_documents FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_kb_docs" ON knowledge_base_documents;
CREATE POLICY "insert_own_kb_docs" ON knowledge_base_documents FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_kb_docs" ON knowledge_base_documents;
CREATE POLICY "update_own_kb_docs" ON knowledge_base_documents FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_kb_docs" ON knowledge_base_documents;
CREATE POLICY "delete_own_kb_docs" ON knowledge_base_documents FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- =============================================
-- CONVERSATIONS
-- =============================================
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  channel text NOT NULL DEFAULT 'phone' CHECK (channel IN ('phone','sms','chat','facebook','instagram')),
  customer_name text,
  customer_phone text,
  customer_email text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','archived')),
  ai_summary text,
  sentiment text DEFAULT 'neutral' CHECK (sentiment IN ('positive','neutral','negative')),
  lead_score integer DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS conversations_business_id_idx ON conversations(business_id);
CREATE INDEX IF NOT EXISTS conversations_status_idx ON conversations(status);
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_conversations" ON conversations;
CREATE POLICY "select_own_conversations" ON conversations FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM businesses WHERE businesses.id = conversations.business_id AND businesses.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_own_conversations" ON conversations;
CREATE POLICY "insert_own_conversations" ON conversations FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM businesses WHERE businesses.id = conversations.business_id AND businesses.user_id = auth.uid()));
DROP POLICY IF EXISTS "update_own_conversations" ON conversations;
CREATE POLICY "update_own_conversations" ON conversations FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM businesses WHERE businesses.id = conversations.business_id AND businesses.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM businesses WHERE businesses.id = conversations.business_id AND businesses.user_id = auth.uid()));
DROP POLICY IF EXISTS "delete_own_conversations" ON conversations;
CREATE POLICY "delete_own_conversations" ON conversations FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM businesses WHERE businesses.id = conversations.business_id AND businesses.user_id = auth.uid()));

-- =============================================
-- MESSAGES
-- =============================================
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  direction text NOT NULL DEFAULT 'inbound' CHECK (direction IN ('inbound','outbound')),
  content text NOT NULL,
  is_ai_generated boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON messages(conversation_id);
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_messages" ON messages;
CREATE POLICY "select_own_messages" ON messages FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM conversations
    JOIN businesses ON businesses.id = conversations.business_id
    WHERE conversations.id = messages.conversation_id AND businesses.user_id = auth.uid()
  ));
DROP POLICY IF EXISTS "insert_own_messages" ON messages;
CREATE POLICY "insert_own_messages" ON messages FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM conversations
    JOIN businesses ON businesses.id = conversations.business_id
    WHERE conversations.id = messages.conversation_id AND businesses.user_id = auth.uid()
  ));
DROP POLICY IF EXISTS "update_own_messages" ON messages;
CREATE POLICY "update_own_messages" ON messages FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM conversations
    JOIN businesses ON businesses.id = conversations.business_id
    WHERE conversations.id = messages.conversation_id AND businesses.user_id = auth.uid()
  ));
DROP POLICY IF EXISTS "delete_own_messages" ON messages;
CREATE POLICY "delete_own_messages" ON messages FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM conversations
    JOIN businesses ON businesses.id = conversations.business_id
    WHERE conversations.id = messages.conversation_id AND businesses.user_id = auth.uid()
  ));

-- =============================================
-- APPOINTMENTS
-- =============================================
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_phone text,
  customer_email text,
  service text,
  notes text,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','confirmed','canceled','completed','no_show')),
  reminder_sent_at timestamptz,
  confirmation_sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS appointments_business_id_idx ON appointments(business_id);
CREATE INDEX IF NOT EXISTS appointments_start_time_idx ON appointments(start_time);
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_appointments" ON appointments;
CREATE POLICY "select_own_appointments" ON appointments FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM businesses WHERE businesses.id = appointments.business_id AND businesses.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_own_appointments" ON appointments;
CREATE POLICY "insert_own_appointments" ON appointments FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM businesses WHERE businesses.id = appointments.business_id AND businesses.user_id = auth.uid()));
DROP POLICY IF EXISTS "update_own_appointments" ON appointments;
CREATE POLICY "update_own_appointments" ON appointments FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM businesses WHERE businesses.id = appointments.business_id AND businesses.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM businesses WHERE businesses.id = appointments.business_id AND businesses.user_id = auth.uid()));
DROP POLICY IF EXISTS "delete_own_appointments" ON appointments;
CREATE POLICY "delete_own_appointments" ON appointments FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM businesses WHERE businesses.id = appointments.business_id AND businesses.user_id = auth.uid()));

-- =============================================
-- LEADS
-- =============================================
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_phone text,
  customer_email text,
  service_needed text,
  budget text,
  urgency text DEFAULT 'medium' CHECK (urgency IN ('low','medium','high','critical')),
  location text,
  probability_of_closing integer DEFAULT 50 CHECK (probability_of_closing >= 0 AND probability_of_closing <= 100),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','qualified','proposal','won','lost')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS leads_business_id_idx ON leads(business_id);
CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_leads" ON leads;
CREATE POLICY "select_own_leads" ON leads FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM businesses WHERE businesses.id = leads.business_id AND businesses.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_own_leads" ON leads;
CREATE POLICY "insert_own_leads" ON leads FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM businesses WHERE businesses.id = leads.business_id AND businesses.user_id = auth.uid()));
DROP POLICY IF EXISTS "update_own_leads" ON leads;
CREATE POLICY "update_own_leads" ON leads FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM businesses WHERE businesses.id = leads.business_id AND businesses.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM businesses WHERE businesses.id = leads.business_id AND businesses.user_id = auth.uid()));
DROP POLICY IF EXISTS "delete_own_leads" ON leads;
CREATE POLICY "delete_own_leads" ON leads FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM businesses WHERE businesses.id = leads.business_id AND businesses.user_id = auth.uid()));

-- =============================================
-- WORKFLOWS
-- =============================================
CREATE TABLE IF NOT EXISTS workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  trigger text NOT NULL CHECK (trigger IN ('missed_call','new_lead','estimate_sent','no_response','appointment_booked')),
  trigger_delay_minutes integer NOT NULL DEFAULT 0,
  action text NOT NULL CHECK (action IN ('send_sms','send_email','create_task','assign_to_human')),
  action_template jsonb DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS workflows_business_id_idx ON workflows(business_id);
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_workflows" ON workflows;
CREATE POLICY "select_own_workflows" ON workflows FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM businesses WHERE businesses.id = workflows.business_id AND businesses.user_id = auth.uid()));
DROP POLICY IF EXISTS "insert_own_workflows" ON workflows;
CREATE POLICY "insert_own_workflows" ON workflows FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM businesses WHERE businesses.id = workflows.business_id AND businesses.user_id = auth.uid()));
DROP POLICY IF EXISTS "update_own_workflows" ON workflows;
CREATE POLICY "update_own_workflows" ON workflows FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM businesses WHERE businesses.id = workflows.business_id AND businesses.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM businesses WHERE businesses.id = workflows.business_id AND businesses.user_id = auth.uid()));
DROP POLICY IF EXISTS "delete_own_workflows" ON workflows;
CREATE POLICY "delete_own_workflows" ON workflows FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM businesses WHERE businesses.id = workflows.business_id AND businesses.user_id = auth.uid()));

-- =============================================
-- NOTIFICATIONS
-- =============================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('high_value_lead','appointment_booked','voicemail','ai_needs_help','new_message')),
  title text NOT NULL,
  body text,
  is_read boolean NOT NULL DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON notifications(is_read);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =============================================
-- TRIGGER: auto-create profile on sign-up
-- =============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
