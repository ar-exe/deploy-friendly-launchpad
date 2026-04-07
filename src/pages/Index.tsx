import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ServiceCard } from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Clock, Shield } from "lucide-react";

const Index = () => {
  const { data: services, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").order("price", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3" />
        <div className="container relative">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="animate-fade-in font-display text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Book Your Next{" "}
              <span className="text-gradient">Appointment</span>
            </h1>
            <p className="mt-6 animate-fade-in text-lg text-muted-foreground leading-relaxed" style={{ animationDelay: "100ms" }}>
              Effortless scheduling for the services you love. Pick a time, confirm, and you're all set.
            </p>
            <div className="mt-8 flex animate-fade-in justify-center gap-4" style={{ animationDelay: "200ms" }}>
              <Link to="/book">
                <Button size="lg">
                  Book Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y bg-card py-16">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: CalendarDays, title: "Easy Scheduling", desc: "Pick your date and time in seconds" },
              { icon: Clock, title: "Instant Confirmation", desc: "Get confirmed immediately after booking" },
              { icon: Shield, title: "Secure & Private", desc: "Your data is safe and only visible to you" },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-4 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="rounded-lg bg-primary/10 p-3">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold">Our Services</h2>
            <p className="mt-3 text-muted-foreground">Choose from our curated selection</p>
          </div>
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services?.map((service, i) => (
                <ServiceCard key={service.id} service={service} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} BookEase. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Index;
