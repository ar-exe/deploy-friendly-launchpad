import { Clock, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppRouter } from "@/hooks/useAppRouter";
import type { Tables } from "@/integrations/supabase/types";

interface ServiceCardProps {
  service: Tables<"services">;
  index: number;
}

export function ServiceCard({ service, index }: ServiceCardProps) {
  const { navigate } = useAppRouter();

  return (
    <Card
      className="group overflow-hidden border shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardContent className="flex flex-col gap-4 p-6">
        <div>
          <h3 className="font-display text-lg font-semibold">{service.name}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{service.description}</p>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" /> {service.duration_minutes} min
          </span>
          <span className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            {Number(service.price) === 0 ? "Free" : `$${Number(service.price).toFixed(0)}`}
          </span>
        </div>
        <Button className="mt-auto w-full" size="sm" onClick={() => navigate(`/book?service=${service.id}`)}>
          Book This
        </Button>
      </CardContent>
    </Card>
  );
}
