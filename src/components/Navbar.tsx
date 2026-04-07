import { CalendarDays, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { AppLink, useAppRouter } from "@/hooks/useAppRouter";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { user, signOut } = useAuth();
  const { path } = useAppRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: "/", label: "Home" },
    { to: "/book", label: "Book Now" },
    ...(user ? [{ to: "/my-bookings", label: "My Bookings" }] : []),
  ];

  const isActive = (href: string) => path === href;

  const linkClasses = (href: string) =>
    `rounded-md px-4 py-2 text-sm font-medium transition-colors ${
      isActive(href) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <AppLink to="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight">
          <CalendarDays className="h-6 w-6 text-primary" />
          <span>BookEase</span>
        </AppLink>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <AppLink key={link.to} to={link.to} className={linkClasses(link.to)}>
              {link.label}
            </AppLink>
          ))}
          {user ? (
            <Button variant="ghost" size="sm" onClick={() => void signOut()} className="ml-2 text-muted-foreground">
              <LogOut className="mr-1 h-4 w-4" /> Sign Out
            </Button>
          ) : (
            <AppLink to="/auth" className="ml-2 inline-flex">
              <Button size="sm">Sign In</Button>
            </AppLink>
          )}
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen((open) => !open)} aria-label="Toggle navigation">
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t bg-card px-4 pb-4 md:hidden">
          {links.map((link) => (
            <AppLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`block rounded-md px-4 py-3 text-sm font-medium ${
                isActive(link.to) ? "bg-primary/10 text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </AppLink>
          ))}
          {user ? (
            <button
              onClick={() => {
                void signOut();
                setMobileOpen(false);
              }}
              className="block w-full rounded-md px-4 py-3 text-left text-sm font-medium text-muted-foreground"
            >
              Sign Out
            </button>
          ) : (
            <AppLink to="/auth" onClick={() => setMobileOpen(false)} className="block rounded-md px-4 py-3 text-sm font-medium text-primary">
              Sign In
            </AppLink>
          )}
        </div>
      )}
    </nav>
  );
}
