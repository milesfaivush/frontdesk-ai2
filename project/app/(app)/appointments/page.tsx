'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Clock, Plus, ChevronLeft, ChevronRight, User, Phone, Mail, MoreVertical, Check, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-provider';
import { supabase } from '@/lib/supabase/client';
import type { Appointment, Business } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, startOfDay, addHours } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const statusColors = {
  scheduled: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  confirmed: 'bg-green-500/10 text-green-500 border-green-500/20',
  canceled: 'bg-red-500/10 text-red-500 border-red-500/20',
  completed: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  no_show: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
};

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [service, setService] = useState('');
  const [notes, setNotes] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('60');

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

        const { data: appointmentsData } = await supabase
          .from('appointments')
          .select('*')
          .eq('business_id', businessData.id)
          .order('start_time', { ascending: true });

        setAppointments(appointmentsData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!business || !selectedDate || !startTime) return;

    try {
      const startDate = new Date(selectedDate);
      const [hours, minutes] = startTime.split(':');
      startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + parseInt(duration));

      const { error } = await supabase.from('appointments').insert({
        business_id: business.id,
        customer_name: customerName,
        customer_phone: customerPhone || null,
        customer_email: customerEmail || null,
        service: service || null,
        notes: notes || null,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        status: 'scheduled',
      });

      if (error) throw error;

      toast.success('Appointment created successfully');
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Failed to create appointment');
    }
  };

  const updateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast.success('Appointment updated');
      fetchData();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment');
    }
  };

  const resetForm = () => {
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setService('');
    setNotes('');
    setStartTime('');
    setDuration('60');
  };

  const daysInMonth = selectedDate
    ? eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
      })
    : [];

  const appointmentsForSelectedDate = selectedDate
    ? appointments.filter((apt) => isSameDay(new Date(apt.start_time), selectedDate))
    : [];

  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter((apt) => isSameDay(new Date(apt.start_time), day));
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
          <h1 className="text-3xl font-bold">Appointments</h1>
          <p className="text-muted-foreground">Manage your bookings and schedule</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Appointment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateAppointment} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          setSelectedDate(date);
                          if (date && !isSameMonth(date, currentMonth)) {
                            setCurrentMonth(date);
                          }
                        }}
                        disabled={(date) => date < startOfDay(new Date())}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Duration</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Customer Name *</Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="John Smith"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Service</Label>
                <Input
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  placeholder="e.g., Teeth Cleaning"
                />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes..."
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Appointment</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {format(currentMonth, 'MMMM yyyy')}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before start of month */}
              {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="h-24" />
              ))}
              {/* Days of the month */}
              {daysInMonth.map((day) => {
                const dayAppointments = getAppointmentsForDay(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const hasAppointments = dayAppointments.length > 0;

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      'h-24 p-1 border rounded-lg text-left transition-colors hover:bg-secondary',
                      isToday(day) && 'border-primary',
                      isSelected && 'bg-primary/10 border-primary',
                      !isSameMonth(day, currentMonth) && 'text-muted-foreground opacity-50'
                    )}
                  >
                    <div className={cn(
                      'text-sm font-medium mb-1',
                      isToday(day) && 'text-primary'
                    )}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-0.5 overflow-hidden">
                      {dayAppointments.slice(0, 3).map((apt) => (
                        <div
                          key={apt.id}
                          className="text-xs px-1 py-0.5 rounded truncate bg-primary/20 text-primary"
                        >
                          {format(new Date(apt.start_time), 'h:mm a')} {apt.customer_name}
                        </div>
                      ))}
                      {dayAppointments.length > 3 && (
                        <div className="text-xs text-muted-foreground px-1">
                          +{dayAppointments.length - 3} more
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Day Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : 'Select a day'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {appointmentsForSelectedDate.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No appointments scheduled</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointmentsForSelectedDate
                  .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                  .map((apt) => (
                    <div
                      key={apt.id}
                      className="p-4 border rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">
                            {format(new Date(apt.start_time), 'h:mm a')}
                          </span>
                        </div>
                        <Badge variant="outline" className={statusColors[apt.status]}>
                          {apt.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">{apt.customer_name}</p>
                        {apt.service && (
                          <p className="text-sm text-muted-foreground">{apt.service}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                          {apt.customer_phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {apt.customer_phone}
                            </span>
                          )}
                          {apt.customer_email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {apt.customer_email}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        {apt.status === 'scheduled' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 text-green-600 hover:text-green-600"
                              onClick={() => updateAppointmentStatus(apt.id, 'confirmed')}
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 text-red-600 hover:text-red-600"
                              onClick={() => updateAppointmentStatus(apt.id, 'canceled')}
                            >
                              <X className="w-3 h-3 mr-1" />
                              Cancel
                            </Button>
                          </>
                        )}
                        {apt.status === 'confirmed' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                            >
                              Mark Complete
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-600"
                              onClick={() => updateAppointmentStatus(apt.id, 'canceled')}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
