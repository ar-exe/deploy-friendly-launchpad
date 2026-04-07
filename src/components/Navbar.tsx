import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { CalendarDays, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: "/", label: "Home" },
    { to: "/book", label: "Book Now" },
    ...(user ? [{ to: "/my-bookings", label: "My Bookings" }] : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight">
          <CalendarDays className="h-6 w-6 text-primary" />
          <span>BookEase</span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                isActive(link.to)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <Button variant="ghost" size="sm" onClick={signOut} className="ml-2 text-muted-foreground">
              <LogOut className="mr-1 h-4 w-4" /> Sign Out
            </Button>
          ) : (
            <Link to="/auth">
              <Button size="sm" className="ml-2">Sign In</Button>
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t bg-card px-4 pb-4 md:hidden">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`block rounded-md px-4 py-3 text-sm font-medium ${
                isActive(link.to) ? "bg-primary/10 text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {user ? (
            <button onClick={() => { signOut(); setMobileOpen(false); }} className="block w-full rounded-md px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Sign Out
            </button>
          ) : (
            <Link to="/auth" onClick={() => setMobileOpen(false)} className="block rounded-md px-4 py-3 text-sm font-medium text-primary">
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
