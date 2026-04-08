import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarDays, CheckCircle, Clock } from "lucide-react";
import { apiGetServices, apiCreateBooking, type Service } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useAppRouter } from "@/hooks/useAppRouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00",
];

const BookPage = () => {
  const { user } = useAuth();
  const { navigate, search } = useAppRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [booked, setBooked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    const params = new URLSearchParams(search);
    const serviceFromUrl = params.get("service");
    if (serviceFromUrl) setSelectedService(serviceFromUrl);

    apiGetServices()
      .then((data) => { if (mounted) setServices(data); })
      .catch((err) => { if (mounted) setErrorMessage(err.message); })
      .finally(() => { if (mounted) setServicesLoading(false); });

    return () => { mounted = false; };
  }, [search]);

  const selectedServiceDetails = useMemo(
    () => services.find((service) => service.id === selectedService),
    [services, selectedService],
  );

  const isComplete = Boolean(selectedService && selectedDate && selectedTime);

  const handleBooking = async () => {
    if (!user || !isComplete) return;
    setSubmitting(true);
    setErrorMessage("");

    try {
      await apiCreateBooking({
        service_id: selectedService,
        booking_date: selectedDate,
        booking_time: `${selectedTime}:00`,
        notes: notes.trim() || null,
      });
      setBooked(true);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <CalendarDays className="h-12 w-12 text-primary" />
        <h2 className="font-display text-2xl font-bold">Sign in to book</h2>
        <p className="text-muted-foreground">You need an account to make a booking.</p>
        <Button onClick={() => navigate("/auth")}>Sign In</Button>
      </div>
    );
  }

  if (booked) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center animate-fade-in">
        <CheckCircle className="h-16 w-16 text-success" />
        <h2 className="font-display text-2xl font-bold">Booking Confirmed!</h2>
        <p className="text-muted-foreground">
          {selectedDate ? format(new Date(`${selectedDate}T00:00:00`), "EEEE, MMMM d") : "Selected day"} at {selectedTime}
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

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">Book an Appointment</h1>
        <p className="mt-2 text-muted-foreground">Select a service, pick a date, and choose your time.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="font-body text-base">1. Choose Service</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">Select a service</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name} — {Number(s.price) === 0 ? "Free" : `$${Number(s.price)}`}</option>
              ))}
            </select>
            {selectedServiceDetails && (
              <p className="text-sm text-muted-foreground"><Clock className="mr-1 inline h-3.5 w-3.5" />{selectedServiceDetails.duration_minutes} minutes</p>
            )}
            {servicesLoading && <p className="text-sm text-muted-foreground">Loading services…</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-body text-base">2. Pick a Date</CardTitle></CardHeader>
          <CardContent>
            <input type="date" value={selectedDate} min={new Date().toISOString().split("T")[0]} onChange={(e) => setSelectedDate(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <p className="mt-3 text-sm text-muted-foreground">Bookings are available from today onward.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="font-body text-base">3. Choose Time</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {TIME_SLOTS.map((time) => (
                <button key={time} onClick={() => setSelectedTime(time)} className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${selectedTime === time ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:border-primary/50"}`}>
                  {time}
                </button>
              ))}
            </div>
            <Textarea placeholder="Any notes? (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} className="resize-none" rows={3} />
            {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
            <Button className="w-full" size="lg" disabled={!isComplete || submitting} onClick={() => void handleBooking()}>
              {submitting ? "Booking…" : "Confirm Booking"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookPage;
