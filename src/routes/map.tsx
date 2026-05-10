import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Bus, Crosshair, Layers, Search, Train } from "lucide-react";
import { getNearbyVehicles, LINE_META, type NearbyVehicle } from "@/lib/marta";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/map")({ component: MapPage });

type Filter = "all" | "bus" | "rail";

const TABS: { key: Filter; label: string }[] = [
  { key: "all", label: "Everything" },
  { key: "bus", label: "Buses" },
  { key: "rail", label: "Transit" },
];

function MapPage() {
  const [now, setNow] = useState(() => new Date());
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<NearbyVehicle | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 4000);
    return () => clearInterval(id);
  }, []);

  const vehicles = useMemo(() => getNearbyVehicles(now, query), [now, query]);
  const filtered = vehicles.filter((v) => filter === "all" || v.kind === filter);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Map canvas */}
      <div className="fixed inset-0 max-w-md mx-auto">
        <div
          className="relative h-full w-full"
          style={{
            background: `
              radial-gradient(circle at 50% 40%, color-mix(in oklab, #0092D0 8%, transparent), transparent 60%),
              repeating-linear-gradient(0deg,   #f3f6fa 0 1px, transparent 1px 36px),
              repeating-linear-gradient(90deg,  #f3f6fa 0 1px, transparent 1px 36px),
              #ffffff
            `,
          }}
        >
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M10 90 Q 40 60 50 50 T 92 8" fill="none" stroke="var(--marta-blue)" strokeWidth="0.7" strokeLinecap="round" opacity="0.55" />
            <path d="M5 30 Q 30 35 55 50 T 95 70" fill="none" stroke="var(--marta-orange)" strokeWidth="0.7" strokeLinecap="round" opacity="0.55" />
            <path d="M8 60 Q 35 55 55 50 T 95 40" fill="none" stroke="var(--marta-yellow)" strokeWidth="0.7" strokeLinecap="round" opacity="0.55" />
            <path d="M15 15 Q 45 45 55 50 T 88 88" fill="none" stroke="var(--marta-green)" strokeWidth="0.7" strokeLinecap="round" opacity="0.55" />
          </svg>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse-ring rounded-full" style={{ background: "var(--marta-blue)", opacity: 0.5 }} />
              <div className="relative h-4 w-4 rounded-full ring-4 ring-white" style={{ background: "var(--marta-blue)", boxShadow: "0 0 24px rgba(0,146,208,0.6)" }} />
            </div>
          </div>

          {filtered.map((v) => {
            const color = v.kind === "rail" && v.line ? LINE_META[v.line].token : "var(--marta-orange)";
            return (
              <button
                key={v.id}
                onClick={() => setSelected(v)}
                className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform active:scale-95"
                style={{ left: `${v.x * 100}%`, top: `${v.y * 100}%` }}
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-white shadow-lg ring-2 ring-white"
                  style={{ background: color, boxShadow: `0 4px 16px -2px ${color}` }}
                >
                  {v.kind === "rail" ? <Train className="h-4 w-4" /> : <Bus className="h-4 w-4" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Top search bar */}
      <header className="relative z-10 px-5 pt-12">
        <div className="flex items-center gap-3 rounded-full border border-border bg-card/95 px-4 py-3 pulse-card backdrop-blur-xl">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Search stops, lines, places…"
          />
          <Layers className="h-4 w-4 text-muted-foreground" />
        </div>

        <div className="mt-3 flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={cn(
                "tap-target rounded-full border px-4 py-2 text-xs font-semibold transition-all",
                filter === t.key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* Recenter FAB */}
      <button
        onClick={() => toast.success("Centered on you")}
        className="fixed bottom-[42vh] right-5 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-card pulse-card border border-border active:scale-95 transition-transform"
      >
        <Crosshair className="h-5 w-5 text-primary" />
      </button>

      {/* Bottom sheet: vehicle list with live times */}
      <div className="fixed bottom-20 left-0 right-0 z-10 mx-auto max-w-md">
        <div className="mx-3 rounded-3xl border border-border bg-card/95 backdrop-blur-xl pulse-card overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {filter === "all" ? "All routes nearby" : filter === "bus" ? "Buses nearby" : "Trains nearby"}
            </p>
            <span className="text-[11px] text-muted-foreground">{filtered.length} live</span>
          </div>
          <div className="max-h-[34vh] overflow-y-auto px-3 py-2 space-y-2">
            {filtered.length === 0 && (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">No matches. Try a different search.</p>
            )}
            {filtered.map((v) => (
              <VehicleRow key={v.id} v={v} onPick={() => setSelected(v)} />
            ))}
          </div>
        </div>
      </div>

      {/* Selected vehicle sheet */}
      {selected && (
        <div className="fixed bottom-24 left-0 right-0 z-20 mx-auto max-w-md px-4 animate-slide-up">
          <div className="rounded-3xl border border-border bg-card p-5 pulse-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-full text-white"
                  style={{ background: selected.kind === "rail" && selected.line ? LINE_META[selected.line].token : "var(--marta-orange)" }}
                >
                  {selected.kind === "rail" ? <Train className="h-5 w-5" /> : <Bus className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-base font-semibold">{selected.routeName}</p>
                  <p className="text-xs text-muted-foreground">→ {selected.headsign} · #{selected.id}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-full px-3 py-1 text-xs text-muted-foreground">Close</button>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <Pill label="Take off" value={selected.takeoffAt} color="var(--marta-blue)" />
              <Pill label="Arrival" value={selected.arrivalAt} color="var(--marta-orange)" />
              <Pill label="ETA" value={`${selected.etaMinutes} min`} />
            </div>

            <button
              onClick={() => {
                toast.success(`Riding vehicle ${selected.id}`);
                navigate({ to: "/ride" });
              }}
              className="mt-4 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground active:scale-[0.98] transition-transform"
            >
              Track this vehicle
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function VehicleRow({ v, onPick }: { v: NearbyVehicle; onPick: () => void }) {
  const color = v.kind === "rail" && v.line ? LINE_META[v.line].token : "var(--marta-orange)";
  return (
    <button
      onClick={onPick}
      className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left transition-all active:scale-[0.99]"
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white font-bold"
        style={{ background: color, boxShadow: `0 4px 14px -4px ${color}` }}
      >
        {v.kind === "rail" ? <Train className="h-5 w-5" /> : <span className="text-sm">{v.routeNumber}</span>}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{v.routeName}</p>
        <p className="truncate text-[11px] text-muted-foreground">→ {v.headsign} · {v.stop}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          <span style={{ color: "var(--marta-blue)" }} className="font-semibold">Take off {v.takeoffAt}</span>
          <span className="mx-1.5">·</span>
          <span style={{ color: "var(--marta-orange)" }} className="font-semibold">Arr {v.arrivalAt}</span>
        </p>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-base font-bold tabular-nums" style={{ color: "var(--marta-blue)" }}>{v.etaMinutes}</span>
        <span className="text-[9px] uppercase tracking-wider text-muted-foreground">min</span>
      </div>
    </button>
  );
}

function Pill({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-secondary/50 p-2.5">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums" style={color ? { color } : undefined}>{value}</p>
    </div>
  );
}
