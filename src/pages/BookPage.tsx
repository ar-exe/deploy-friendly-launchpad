import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarDays, Clock, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00",
];

const BookPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const preselectedService = searchParams.get("service") || "";
  const [selectedService, setSelectedService] = useState(preselectedService);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [booked, setBooked] = useState(false);

  const { data: services } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const bookMutation = useMutation({
    mutationFn: async () => {
      if (!user || !selectedService || !selectedDate || !selectedTime) throw new Error("Missing fields");
      const { error } = await supabase.from("bookings").insert({
        user_id: user.id,
        service_id: selectedService,
        booking_date: format(selectedDate, "yyyy-MM-dd"),
        booking_time: selectedTime,
        notes: notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setBooked(true);
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  if (!user) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <CalendarDays className="h-12 w-12 text-primary" />
        <h2 className="font-display text-2xl font-bold">Sign in to book</h2>
        <p className="text-muted-foreground">You need an account to make a booking.</p>
        <Link to="/auth">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  if (booked) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center animate-fade-in">
        <CheckCircle className="h-16 w-16 text-success" />
        <h2 className="font-display text-2xl font-bold">Booking Confirmed!</h2>
        <p className="text-muted-foreground">
          {selectedDate && format(selectedDate, "EEEE, MMMM d")} at {selectedTime}
        </p>
        <div className="mt-4 flex gap-3">
          <Button onClick={() => navigate("/my-bookings")}>View My Bookings</Button>
          <Button variant="outline" onClick={() => { setBooked(false); setSelectedTime(""); setNotes(""); }}>
            Book Another
          </Button>
        </div>
      </div>
    );
  }

  const isComplete = selectedService && selectedDate && selectedTime;

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">Book an Appointment</h1>
        <p className="mt-2 text-muted-foreground">Select a service, pick a date, and choose your time.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Service selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-body">1. Choose Service</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger>
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {services?.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} — {Number(s.price) === 0 ? "Free" : `$${Number(s.price)}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedService && services && (
              <p className="mt-3 text-sm text-muted-foreground">
                <Clock className="mr-1 inline h-3.5 w-3.5" />
                {services.find((s) => s.id === selectedService)?.duration_minutes} minutes
              </p>
            )}
          </CardContent>
        </Card>

        {/* Date */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-body">2. Pick a Date</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date() || date.getDay() === 0}
              className={cn("p-3 pointer-events-auto")}
            />
          </CardContent>
        </Card>

        {/* Time + Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-body">3. Choose Time</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {TIME_SLOTS.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                    selectedTime === time
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:border-primary/50"
                  )}
                >
                  {time}
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Any notes? (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
              rows={3}
            />
            <Button
              className="w-full"
              size="lg"
              disabled={!isComplete || bookMutation.isPending}
              onClick={() => bookMutation.mutate()}
            >
              {bookMutation.isPending ? "Booking…" : "Confirm Booking"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookPage;
