import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, Briefcase, Home, Leaf, MapPin, Plane, Search, Share2, Wallet, Zap } from "lucide-react";
import { LINE_META, planRoutes, type RouteOption } from "@/lib/marta";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/plan")({ component: PlanPage });

const FAVS = [
  { label: "Home",    Icon: Home,      address: "Inman Park" },
  { label: "Work",    Icon: Briefcase, address: "Midtown" },
  { label: "Airport", Icon: Plane,     address: "ATL Airport" },
];

function PlanPage() {
  const [from, setFrom] = useState("Current location");
  const [to, setTo] = useState("");
  const [active, setActive] = useState(0);
  const navigate = useNavigate();

  const routes = useMemo(() => planRoutes(from, to || "Anywhere"), [from, to]);

  return (
    <div className="min-h-screen px-5 pt-12 pb-6">
      <h1 className="text-3xl font-semibold tracking-tight">Plan</h1>
      <p className="mt-1 text-sm text-muted-foreground">Tell Pulse where you're headed.</p>

      <div className="mt-5 space-y-3">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 pulse-card">
          <div className="h-2 w-2 rounded-full bg-marta-blue" style={{ background: "var(--marta-blue)" }} />
          <input
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder="From"
          />
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 pulse-card">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Where to from here?"
            autoFocus
          />
        </div>
      </div>

      {/* Favs */}
      <div className="mt-5 flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5">
        {FAVS.map(({ label, Icon, address }) => (
          <button
            key={label}
            onClick={() => setTo(address)}
            className="tap-target flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium transition-all active:scale-95"
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
        <button className="tap-target flex shrink-0 items-center gap-2 rounded-full border border-dashed border-border px-4 py-2.5 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" /> Add
        </button>
      </div>

      {/* Route cards */}
      <div className="mt-7">
        <div className="mb-3 flex items-center justify-between px-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">3 ways to go</p>
          <p className="text-xs text-muted-foreground">{active + 1} / {routes.length}</p>
        </div>
        <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto no-scrollbar px-5 pb-2"
             onScroll={(e) => {
               const el = e.currentTarget;
               const w = el.clientWidth - 24;
               setActive(Math.round(el.scrollLeft / w));
             }}>
          {routes.map((r) => (
            <RouteCard key={r.id} route={r} onStart={() => { toast.success(`Starting ${r.title} ride`); navigate({ to: "/ride" }); }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function RouteCard({ route, onStart }: { route: RouteOption; onStart: () => void }) {
  const Icon = route.id === "fastest" ? Zap : route.id === "cheapest" ? Wallet : Leaf;
  const glow = route.id === "fastest" ? "glow-red" : route.id === "cheapest" ? "glow-gold" : "glow-green";
  return (
    <div className={cn("relative w-[88%] shrink-0 snap-center overflow-hidden rounded-3xl border border-border bg-card p-5", glow)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          <h3 className="text-lg font-semibold">{route.title}</h3>
        </div>
        <span className="text-xs text-muted-foreground">{route.subtitle}</span>
      </div>

      <div className="mt-5 flex items-baseline gap-2">
        <span className="text-5xl font-bold tabular-nums tracking-tighter">{route.totalMinutes}</span>
        <span className="text-base text-muted-foreground">min</span>
        <span className="ml-auto text-sm font-medium">${(route.fareCents / 100).toFixed(2)}</span>
      </div>

      <div className="mt-5 space-y-2.5">
        {route.legs.map((leg, i) => (
          <div key={i} className="flex items-center gap-3 text-sm">
            {leg.kind === "rail" && leg.line ? (
              <div className="h-6 w-6 rounded-full text-center text-[11px] font-bold leading-6 text-white" style={{ background: LINE_META[leg.line].token }}>
                {leg.line[0]}
              </div>
            ) : (
              <div className="h-6 w-6 rounded-full bg-secondary text-center text-[11px] font-bold leading-6">
                {leg.kind === "walk" ? "🚶" : "🚌"}
              </div>
            )}
            <span className="flex-1 truncate text-foreground/90">{leg.from} → {leg.to}</span>
            <span className="tabular-nums text-muted-foreground">{leg.minutes}m</span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
        <Leaf className="h-3.5 w-3.5" style={{ color: "var(--marta-green)" }} />
        Saves {route.carbonSavedKg}kg CO₂
      </div>

      <div className="mt-5 flex gap-2">
        <button
          onClick={onStart}
          className="tap-target flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-transform active:scale-95"
        >
          Start ride <ArrowRight className="h-4 w-4" />
        </button>
        <button
          onClick={() => toast.success("Live share toggled")}
          className="tap-target flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card transition-transform active:scale-95"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
