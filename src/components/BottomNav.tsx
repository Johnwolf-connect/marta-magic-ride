import { Link, useLocation } from "@tanstack/react-router";
import { Map, Train, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/plan", label: "Plan", Icon: Map },
  { to: "/ride", label: "Ride", Icon: Train },
  { to: "/me",   label: "Me",   Icon: User },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  if (pathname === "/login") return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-md px-4 pb-3">
        <div className="flex items-center justify-around rounded-3xl border border-border/50 bg-card/90 px-2 py-2 pulse-card backdrop-blur-xl">
          {items.map(({ to, label, Icon }) => {
            const active = pathname === to || (to === "/plan" && pathname === "/");
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "tap-target flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-3 py-2 transition-all duration-300",
                  active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5 transition-transform", active && "scale-110")} strokeWidth={active ? 2.4 : 2} />
                <span className="text-[10px] font-medium tracking-wide">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
