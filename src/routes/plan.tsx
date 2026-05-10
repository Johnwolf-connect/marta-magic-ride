import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Briefcase, Bus, Home, Leaf, MapPin, Plane, Search, Share2, Train, Wallet, Zap } from "lucide-react";
import { getNearbyRoutes, LINE_META, planRoutes, type NearbyRoute, type RouteOption } from "@/lib/marta";
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

      <NearbySection from={from} to={to} onPick={(r) => {
        toast.success(`Selected ${r.kind === "rail" ? r.name : "Bus " + r.routeNumber}`);
        navigate({ to: "/ride" });
      }} />
    </div>
  );
}

function NearbySection({ from, to, onPick }: { from: string; to: string; onPick: (r: NearbyRoute) => void }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 5000);
    return () => clearInterval(id);
  }, []);
  const nearby = useMemo(() => getNearbyRoutes(from, to || "Anywhere", now), [from, to, now]);
  return (
    <div className="mt-8">
      <div className="mb-3 flex items-end justify-between px-1">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Live nearby</p>
          <h2 className="mt-0.5 text-lg font-semibold tracking-tight">Nearby & Direct Options</h2>
        </div>
        <span className="text-xs text-muted-foreground">{nearby.length} live</span>
      </div>

      <div className="space-y-2.5">
        {nearby.slice(0, 8).map((r) => (
          <NearbyRow key={r.id} route={r} onPick={() => onPick(r)} />
        ))}
      </div>
    </div>
  );
}

function NearbyRow({ route, onPick }: { route: NearbyRoute; onPick: () => void }) {
  const color = route.kind === "rail" && route.line ? LINE_META[route.line].token : "var(--marta-orange)";
  const occColor = route.occupancy === "low" ? "var(--marta-green)" : route.occupancy === "medium" ? "var(--marta-yellow)" : "var(--marta-orange)";
  return (
    <button
      onClick={onPick}
      className="group flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3.5 text-left transition-all active:scale-[0.99] pulse-card"
    >
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white font-bold"
        style={{ background: color, boxShadow: `0 6px 18px -6px ${color}` }}
      >
        {route.kind === "rail" ? <Train className="h-5 w-5" /> : <span className="text-sm">{route.routeNumber}</span>}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold">{route.name}</p>
          {route.direct && (
            <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                  style={{ background: "color-mix(in oklab, var(--marta-blue) 14%, transparent)", color: "var(--marta-blue)" }}>
              Direct
            </span>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">→ {route.headsign} · {route.stop}</p>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: occColor }} />
            {route.occupancy}
          </span>
          <span>·</span>
          <span>{route.walkMinutes}m walk</span>
          <span>·</span>
          <span className="font-medium text-foreground/80">{route.totalMinutes}m total</span>
        </div>
      </div>

      <div className="flex flex-col items-end">
        <span className="text-lg font-bold tabular-nums" style={{ color: "var(--marta-blue)" }}>{route.arrivesInMinutes}</span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">min</span>
      </div>
    </button>
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
