import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { CalendarDays, Clock, Plus } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

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
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["bookings"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*, services(name, duration_minutes, price)")
        .order("booking_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Booking cancelled");
    },
    onError: () => toast.error("Failed to cancel"),
  });

  if (!user) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <CalendarDays className="h-12 w-12 text-primary" />
        <h2 className="font-display text-2xl font-bold">Sign in to view bookings</h2>
        <Link to="/auth"><Button>Sign In</Button></Link>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">My Bookings</h1>
          <p className="mt-2 text-muted-foreground">Manage your upcoming and past appointments.</p>
        </div>
        <Link to="/book">
          <Button><Plus className="mr-1 h-4 w-4" /> New Booking</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />)}
        </div>
      ) : !bookings?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <CalendarDays className="h-12 w-12 text-muted-foreground" />
            <h3 className="font-display text-lg font-semibold">No bookings yet</h3>
            <p className="text-sm text-muted-foreground">Start by booking your first appointment.</p>
            <Link to="/book"><Button>Book Now</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking, i) => (
            <Card key={booking.id} className="animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
              <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-semibold">{(booking as any).services?.name}</h3>
                    <Badge variant={statusVariant(booking.status)}>{booking.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {format(parseISO(booking.booking_date), "EEE, MMM d, yyyy")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {booking.booking_time.slice(0, 5)}
                    </span>
                  </div>
                  {booking.notes && <p className="text-sm text-muted-foreground">{booking.notes}</p>}
                </div>
                {booking.status === "confirmed" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => cancelMutation.mutate(booking.id)}
                    disabled={cancelMutation.isPending}
                  >
                    Cancel
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
