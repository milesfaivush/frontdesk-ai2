'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  Search,
  Filter,
  TrendingUp,
  DollarSign,
  Clock,
  MapPin,
  Plus,
  MoreVertical,
  Phone,
  Mail,
  ExternalLink,
  Flame,
  Target
} from 'lucide-react';
import { useAuth } from '@/lib/auth-provider';
import { supabase } from '@/lib/supabase/client';
import type { Lead, Business } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const statusColors = {
  new: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  contacted: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  qualified: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  proposal: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  won: 'bg-green-500/10 text-green-500 border-green-500/20',
  lost: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const urgencyColors = {
  low: 'bg-gray-500/10 text-gray-500',
  medium: 'bg-blue-500/10 text-blue-500',
  high: 'bg-orange-500/10 text-orange-500',
  critical: 'bg-red-500/10 text-red-500',
};

export default function LeadsPage() {
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

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

        const { data: leadsData } = await supabase
          .from('leads')
          .select('*')
          .eq('business_id', businessData.id)
          .order('created_at', { ascending: false });

        setLeads(leadsData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (id: string, status: Lead['status']) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      toast.success('Lead status updated');
      fetchData();
    } catch (error) {
      console.error('Error updating lead:', error);
      toast.error('Failed to update lead');
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.service_needed?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'all' || lead.urgency === urgencyFilter;
    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const stats = {
    total: leads.length,
    new: leads.filter((l) => l.status === 'new').length,
    hot: leads.filter((l) => l.probability_of_closing >= 70).length,
    won: leads.filter((l) => l.status === 'won').length,
    avgProbability: Math.round(leads.reduce((sum, l) => sum + l.probability_of_closing, 0) / (leads.length || 1)),
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
          <h1 className="text-3xl font-bold">Leads</h1>
          <p className="text-muted-foreground">Track and qualify potential customers</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold mt-3">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Leads</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Target className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold mt-3">{stats.new}</p>
            <p className="text-sm text-muted-foreground">New Leads</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Flame className="h-5 w-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold mt-3">{stats.hot}</p>
            <p className="text-sm text-muted-foreground">Hot Leads ({">"}70%)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold mt-3">{stats.won}</p>
            <p className="text-sm text-muted-foreground">Won Leads</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="proposal">Proposal</SelectItem>
                <SelectItem value="won">Won</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Urgency</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lead</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Urgency</TableHead>
                <TableHead>Probability</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    No leads found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead) => (
                  <TableRow key={lead.id} className="cursor-pointer hover:bg-secondary/50">
                    <TableCell>
                      <div>
                        <p className="font-medium">{lead.customer_name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {lead.customer_phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {lead.customer_phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="truncate max-w-32">{lead.service_needed || '-'}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{lead.budget || '-'}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={urgencyColors[lead.urgency]}>
                        {lead.urgency}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={lead.probability_of_closing} className="w-16 h-2" />
                        <span className={cn(
                          'text-sm font-medium',
                          lead.probability_of_closing >= 70 ? 'text-green-500' :
                          lead.probability_of_closing >= 40 ? 'text-yellow-500' :
                          'text-gray-500'
                        )}>
                          {lead.probability_of_closing}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={lead.status}
                        onValueChange={(value) => updateLeadStatus(lead.id, value as Lead['status'])}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="qualified">Qualified</SelectItem>
                          <SelectItem value="proposal">Proposal</SelectItem>
                          <SelectItem value="won">Won</SelectItem>
                          <SelectItem value="lost">Lost</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(lead.created_at), 'MMM d, yyyy')}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedLead(lead);
                          setDetailsOpen(true);
                        }}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Lead Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="font-medium">{selectedLead.customer_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge variant="outline" className={statusColors[selectedLead.status]}>
                    {selectedLead.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {selectedLead.customer_phone && (
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <p className="font-medium">{selectedLead.customer_phone}</p>
                  </div>
                )}
                {selectedLead.customer_email && (
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">{selectedLead.customer_email}</p>
                  </div>
                )}
              </div>

              <div>
                <Label className="text-muted-foreground">Service Needed</Label>
                <p className="font-medium">{selectedLead.service_needed || 'Not specified'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Budget</Label>
                  <p className="font-medium">{selectedLead.budget || 'Not specified'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Location</Label>
                  <p className="font-medium">{selectedLead.location || 'Not specified'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Urgency</Label>
                  <Badge variant="outline" className={urgencyColors[selectedLead.urgency]}>
                    {selectedLead.urgency}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Probability</Label>
                  <div className="flex items-center gap-2">
                    <Progress value={selectedLead.probability_of_closing} className="h-2" />
                    <span className="font-medium">{selectedLead.probability_of_closing}%</span>
                  </div>
                </div>
              </div>

              {selectedLead.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="text-sm">{selectedLead.notes}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button className="flex-1" asChild>
                  <a href={`tel:${selectedLead.customer_phone}`}>
                    <Phone className="mr-2 h-4 w-4" />
                    Call
                  </a>
                </Button>
                <Button variant="outline" className="flex-1" asChild>
                  <a href={`mailto:${selectedLead.customer_email}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    Email
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
