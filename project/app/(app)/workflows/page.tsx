'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import { Zap, Plus, Edit, Trash2, Clock, MessageSquare, Mail, User, Play, Pause } from 'lucide-react';
import { useAuth } from '@/lib/auth-provider';
import { supabase } from '@/lib/supabase/client';
import type { Workflow, Business } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const triggerOptions = [
  { value: 'missed_call', label: 'Missed Call', description: 'When a customer call is not answered' },
  { value: 'new_lead', label: 'New Lead', description: 'When a new lead is captured' },
  { value: 'estimate_sent', label: 'Estimate Sent', description: 'When an estimate is sent to a customer' },
  { value: 'no_response', label: 'No Response', description: 'When a customer has not responded' },
  { value: 'appointment_booked', label: 'Appointment Booked', description: 'When an appointment is confirmed' },
];

const actionOptions = [
  { value: 'send_sms', label: 'Send SMS', icon: MessageSquare },
  { value: 'send_email', label: 'Send Email', icon: Mail },
  { value: 'create_task', label: 'Create Task', icon: User },
  { value: 'assign_to_human', label: 'Assign to Human', icon: User },
];

const defaultTemplates = {
  missed_call: {
    subject: '',
    body: 'Hi {name}! Sorry we missed your call. How can we help you today? Reply to this message or call us back.',
  },
  new_lead: {
    subject: 'Thanks for reaching out!',
    body: 'Hi {name}! Thanks for contacting us. We received your inquiry and will get back to you shortly.',
  },
  estimate_sent: {
    subject: 'Your Estimate',
    body: 'Hi {name}, here is the estimate you requested. Let us know if you have any questions!',
  },
  no_response: {
    subject: 'Following up',
    body: 'Hi {name}! Just checking in. Is there anything else we can help you with?',
  },
  appointment_booked: {
    subject: 'Appointment Confirmed',
    body: 'Hi {name}! Your appointment is confirmed for {date}. We look forward to seeing you!',
  },
};

export default function WorkflowsPage() {
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [trigger, setTrigger] = useState<Workflow['trigger']>('missed_call');
  const [triggerDelay, setTriggerDelay] = useState(0);
  const [action, setAction] = useState<Workflow['action']>('send_sms');
  const [actionSubject, setActionSubject] = useState('');
  const [actionBody, setActionBody] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    if (trigger) {
      const template = defaultTemplates[trigger];
      setActionSubject(template.subject);
      setActionBody(template.body);
    }
  }, [trigger]);

  const fetchData = async () => {
    try {
      const { data: businessData } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (businessData) {
        setBusiness(businessData);

        const { data: workflowsData } = await supabase
          .from('workflows')
          .select('*')
          .eq('business_id', businessData.id)
          .order('created_at', { ascending: false });

        setWorkflows(workflowsData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setTrigger('missed_call');
    setTriggerDelay(0);
    setAction('send_sms');
    setActionSubject('');
    setActionBody('');
    setIsActive(true);
    setEditingWorkflow(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business) return;

    try {
      const workflowData = {
        business_id: business.id,
        name,
        description,
        trigger,
        trigger_delay_minutes: triggerDelay,
        action,
        action_template: {
          subject: actionSubject,
          body: actionBody,
        },
        is_active: isActive,
      };

      if (editingWorkflow) {
        const { error } = await supabase
          .from('workflows')
          .update({ ...workflowData, updated_at: new Date().toISOString() })
          .eq('id', editingWorkflow.id);

        if (error) throw error;
        toast.success('Workflow updated');
      } else {
        const { error } = await supabase.from('workflows').insert(workflowData);

        if (error) throw error;
        toast.success('Workflow created');
      }

      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast.error('Failed to save workflow');
    }
  };

  const toggleWorkflow = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('workflows')
        .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Workflow ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchData();
    } catch (error) {
      console.error('Error toggling workflow:', error);
      toast.error('Failed to update workflow');
    }
  };

  const deleteWorkflow = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;

    try {
      const { error } = await supabase.from('workflows').delete().eq('id', id);

      if (error) throw error;

      toast.success('Workflow deleted');
      fetchData();
    } catch (error) {
      console.error('Error deleting workflow:', error);
      toast.error('Failed to delete workflow');
    }
  };

  const editWorkflow = (workflow: Workflow) => {
    setEditingWorkflow(workflow);
    setName(workflow.name);
    setDescription(workflow.description || '');
    setTrigger(workflow.trigger);
    setTriggerDelay(workflow.trigger_delay_minutes);
    setAction(workflow.action);
    const template = workflow.action_template as { subject?: string; body?: string };
    setActionSubject(template.subject || '');
    setActionBody(template.body || '');
    setIsActive(workflow.is_active);
    setDialogOpen(true);
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
          <h1 className="text-3xl font-bold">Workflows</h1>
          <p className="text-muted-foreground">Automate your follow-ups and responses</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Workflow
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingWorkflow ? 'Edit Workflow' : 'Create Workflow'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Workflow Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Missed Call Follow-up"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this workflow does..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Trigger</Label>
                  <Select value={trigger} onValueChange={(v) => setTrigger(v as typeof trigger)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {triggerOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Delay (minutes)</Label>
                  <Input
                    type="number"
                    value={triggerDelay}
                    onChange={(e) => setTriggerDelay(parseInt(e.target.value) || 0)}
                    min={0}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Action</Label>
                <Select value={action} onValueChange={(v) => setAction(v as typeof action)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {actionOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(action === 'send_email' || action === 'send_sms') && (
                <>
                  {action === 'send_email' && (
                    <div className="space-y-2">
                      <Label>Subject</Label>
                      <Input
                        value={actionSubject}
                        onChange={(e) => setActionSubject(e.target.value)}
                        placeholder="Email subject..."
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Message Body</Label>
                    <Textarea
                      value={actionBody}
                      onChange={(e) => setActionBody(e.target.value)}
                      placeholder="Hi {name}! ..."
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground">
                      Use {'{name}'} and {'{date}'} for personalization
                    </p>
                  </div>
                </>
              )}

              <div className="flex items-center gap-2">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <Label>Active</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingWorkflow ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Workflows Grid */}
      {workflows.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Zap className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No workflows yet</h3>
            <p className="text-muted-foreground mb-4">Create your first automation to save time</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Workflow
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflows.map((workflow) => (
            <Card key={workflow.id} className={!workflow.is_active ? 'opacity-60' : ''}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{workflow.name}</CardTitle>
                    {workflow.description && (
                      <p className="text-sm text-muted-foreground mt-1">{workflow.description}</p>
                    )}
                  </div>
                  <Badge variant={workflow.is_active ? 'default' : 'secondary'}>
                    {workflow.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Trigger */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {triggerOptions.find((t) => t.value === workflow.trigger)?.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {workflow.trigger_delay_minutes > 0
                          ? `After ${workflow.trigger_delay_minutes} minutes`
                          : 'Immediately'}
                      </p>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex justify-center">
                    <div className="w-0.5 h-6 bg-border" />
                  </div>

                  {/* Action */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                      {(() => {
                        const Icon = actionOptions.find((a) => a.value === workflow.action)?.icon || MessageSquare;
                        return <Icon className="w-4 h-4 text-green-500" />;
                      })()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {actionOptions.find((a) => a.value === workflow.action)?.label}
                      </p>
                      <p className="text-xs text-muted-foreground truncate max-w-48">
                        {(workflow.action_template as { body?: string })?.body?.slice(0, 50)}...
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleWorkflow(workflow.id, workflow.is_active)}
                    >
                      {workflow.is_active ? (
                        <>
                          <Pause className="mr-2 h-3 w-3" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-3 w-3" />
                          Activate
                        </>
                      )}
                    </Button>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => editWorkflow(workflow)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteWorkflow(workflow.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
