import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { CalendarDays, Clock, Plus } from "lucide-react";
import { apiGetBookings, apiCancelBooking, type BookingWithService } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useAppRouter } from "@/hooks/useAppRouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const statusVariant = (status: string) => {
  switch (status) {
    case "confirmed": return "default" as const;
    case "cancelled": return "destructive" as const;
    case "completed": return "secondary" as const;
    default: return "outline" as const;
  }
};

const MyBookings = () => {
  const { user } = useAuth();
  const { navigate } = useAppRouter();
  const [bookings, setBookings] = useState<BookingWithService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [cancellingId, setCancellingId] = useState("");

  useEffect(() => {
    let mounted = true;
    if (!user) { setIsLoading(false); return; }

    apiGetBookings()
      .then((data) => { if (mounted) setBookings(data); })
      .catch((err) => { if (mounted) setErrorMessage(err.message); })
      .finally(() => { if (mounted) setIsLoading(false); });

    return () => { mounted = false; };
  }, [user]);

  const cancelBooking = async (id: string) => {
    setCancellingId(id);
    setErrorMessage("");
    try {
      await apiCancelBooking(id);
      setBookings((cur) => cur.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)));
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Cancel failed");
    } finally {
      setCancellingId("");
    }
  };

  if (!user) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <CalendarDays className="h-12 w-12 text-primary" />
        <h2 className="font-display text-2xl font-bold">Sign in to view bookings</h2>
        <Button onClick={() => navigate("/auth")}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">My Bookings</h1>
          <p className="mt-2 text-muted-foreground">Manage your upcoming and past appointments.</p>
        </div>
        <Button onClick={() => navigate("/book")}><Plus className="mr-1 h-4 w-4" /> New Booking</Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />)}</div>
      ) : !bookings.length ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <CalendarDays className="h-12 w-12 text-muted-foreground" />
            <h3 className="font-display text-lg font-semibold">No bookings yet</h3>
            <p className="text-sm text-muted-foreground">Start by booking your first appointment.</p>
            <Button onClick={() => navigate("/book")}>Book Now</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking, index) => (
            <Card key={booking.id} className="animate-fade-in" style={{ animationDelay: `${index * 60}ms` }}>
              <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-semibold">{booking.services?.name ?? "Service"}</h3>
                    <Badge variant={statusVariant(booking.status)}>{booking.status}</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{format(parseISO(booking.booking_date), "EEE, MMM d, yyyy")}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{booking.booking_time.slice(0, 5)}</span>
                  </div>
                  {booking.notes && <p className="text-sm text-muted-foreground">{booking.notes}</p>}
                </div>
                {booking.status === "confirmed" && (
                  <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => void cancelBooking(booking.id)} disabled={cancellingId === booking.id}>
                    {cancellingId === booking.id ? "Cancelling…" : "Cancel"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {errorMessage && <p className="mt-4 text-sm text-destructive">{errorMessage}</p>}
    </div>
  );
};

export default MyBookings;
