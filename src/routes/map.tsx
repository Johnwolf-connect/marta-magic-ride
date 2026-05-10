import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bus, Crosshair, Layers, Search, Train, ChevronUp } from "lucide-react";
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

const BUS_COLOR = "#0092D0";
const RAIL_COLOR = "#FF7500";

// Sheet snap heights (px from bottom). 0 = hidden.
const SNAPS = { hidden: 0, peek: 96, half: 360, full: 560 };
type Snap = keyof typeof SNAPS;

function MapPage() {
  const [now, setNow] = useState(() => new Date());
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<NearbyVehicle | null>(null);
  const [snap, setSnap] = useState<Snap>("half");
  const navigate = useNavigate();

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 4000);
    return () => clearInterval(id);
  }, []);

  const vehicles = useMemo(() => getNearbyVehicles(now, query), [now, query]);
  const filtered = vehicles.filter((v) => filter === "all" || v.kind === filter);

  const onPickVehicle = (v: NearbyVehicle) => {
    setSelected(v);
    setSnap("half");
  };

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
            <path d="M10 90 Q 40 60 50 50 T 92 8" fill="none" stroke={RAIL_COLOR} strokeWidth="0.7" strokeLinecap="round" opacity="0.45" />
            <path d="M5 30 Q 30 35 55 50 T 95 70" fill="none" stroke={BUS_COLOR} strokeWidth="0.7" strokeLinecap="round" opacity="0.45" />
            <path d="M8 60 Q 35 55 55 50 T 95 40" fill="none" stroke={RAIL_COLOR} strokeWidth="0.7" strokeLinecap="round" opacity="0.35" />
            <path d="M15 15 Q 45 45 55 50 T 88 88" fill="none" stroke={BUS_COLOR} strokeWidth="0.7" strokeLinecap="round" opacity="0.35" />
          </svg>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse-ring rounded-full" style={{ background: BUS_COLOR, opacity: 0.5 }} />
              <div className="relative h-4 w-4 rounded-full ring-4 ring-white" style={{ background: BUS_COLOR, boxShadow: `0 0 24px ${BUS_COLOR}99` }} />
            </div>
          </div>

          {filtered.map((v) => {
            const color = v.kind === "rail" ? RAIL_COLOR : BUS_COLOR;
            const isSelected = selected?.id === v.id;
            return (
              <button
                key={v.id}
                onClick={() => onPickVehicle(v)}
                className={cn("absolute -translate-x-1/2 -translate-y-1/2 transition-transform active:scale-95", isSelected && "scale-110")}
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

      {/* Top search + tabs */}
      <header className="relative z-10 px-5 pt-12">
        <div className="flex items-center gap-3 rounded-full border border-border bg-card/95 px-4 py-3 pulse-card backdrop-blur-xl">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Search route #, station, line…"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-xs text-muted-foreground">Clear</button>
          )}
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
        className="fixed right-5 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-card pulse-card border border-border active:scale-95 transition-transform"
        style={{ bottom: `calc(${SNAPS[snap]}px + 96px)` }}
      >
        <Crosshair className="h-5 w-5" style={{ color: BUS_COLOR }} />
      </button>

      {/* Swipeable bottom sheet */}
      <SwipeSheet
        snap={snap}
        setSnap={setSnap}
        title={selected ? selected.routeName ?? "Vehicle" : (filter === "all" ? "All routes nearby" : filter === "bus" ? "Buses nearby" : "Trains nearby")}
        subtitle={selected ? `→ ${selected.headsign} · #${selected.id}` : `${filtered.length} live`}
      >
        {selected ? (
          <SelectedVehicle
            v={selected}
            onClose={() => { setSelected(null); setSnap("half"); }}
            onStartRide={() => navigate({ to: "/vehicle/$id", params: { id: selected.id } })}
          />
        ) : (
          <div className="px-3 pb-6 space-y-2">
            {filtered.length === 0 && (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">No matches. Try "Red Line", "Route 16", or a station name.</p>
            )}
            {filtered.map((v) => (
              <VehicleRow key={v.id} v={v} onPick={() => onPickVehicle(v)} />
            ))}
          </div>
        )}
      </SwipeSheet>
    </div>
  );
}

/* ---------- Swipeable Sheet ---------- */
function SwipeSheet({
  snap, setSnap, title, subtitle, children,
}: {
  snap: Snap;
  setSnap: (s: Snap) => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const startY = useRef(0);
  const startH = useRef(SNAPS[snap]);
  const [dragH, setDragH] = useState<number | null>(null);
  const dragging = useRef(false);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    startY.current = e.clientY;
    startH.current = dragH ?? SNAPS[snap];
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dy = startY.current - e.clientY;
    const next = Math.max(0, Math.min(SNAPS.full + 60, startH.current + dy));
    setDragH(next);
  };
  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    const h = dragH ?? SNAPS[snap];
    // snap to nearest
    const order: Snap[] = ["hidden", "peek", "half", "full"];
    let best: Snap = "half";
    let bestDist = Infinity;
    for (const k of order) {
      const d = Math.abs(SNAPS[k] - h);
      if (d < bestDist) { bestDist = d; best = k; }
    }
    setDragH(null);
    setSnap(best);
  };

  const height = dragH ?? SNAPS[snap];

  return (
    <div
      className="fixed bottom-20 left-0 right-0 z-10 mx-auto max-w-md px-3"
      style={{
        height: `${height}px`,
        transition: dragH === null ? "height 280ms cubic-bezier(0.22, 1, 0.36, 1)" : "none",
        pointerEvents: height < 8 ? "none" : "auto",
      }}
    >
      <div className="h-full rounded-3xl border border-border bg-card/95 backdrop-blur-xl pulse-card overflow-hidden flex flex-col">
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="cursor-grab active:cursor-grabbing select-none touch-none px-4 pt-2 pb-1"
        >
          <div className="mx-auto h-1.5 w-12 rounded-full bg-muted-foreground/30" />
          <div className="mt-2 flex items-center justify-between">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{title}</p>
              {subtitle && <p className="truncate text-[11px] text-muted-foreground">{subtitle}</p>}
            </div>
            <button
              onClick={() => setSnap(snap === "full" ? "peek" : "full")}
              className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground"
            >
              <ChevronUp className={cn("h-4 w-4 transition-transform", snap === "full" && "rotate-180")} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ---------- Selected vehicle content ---------- */
function SelectedVehicle({ v, onClose, onStartRide }: { v: NearbyVehicle; onClose: () => void; onStartRide: () => void }) {
  const color = v.kind === "rail" ? RAIL_COLOR : BUS_COLOR;
  const occColor = v.occupancy === "low" ? "var(--marta-green)" : v.occupancy === "medium" ? "#FDBE43" : "#FF7500";
  return (
    <div className="px-5 pb-6 animate-slide-up">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-white" style={{ background: color, boxShadow: `0 6px 18px -4px ${color}` }}>
          {v.kind === "rail" ? <Train className="h-6 w-6" /> : <span className="font-bold">{v.routeNumber}</span>}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold">{v.routeName}</p>
          <p className="truncate text-xs text-muted-foreground">→ {v.headsign}</p>
        </div>
        <button onClick={onClose} className="rounded-full px-3 py-1 text-xs text-muted-foreground">Close</button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Pill label="Take off" value={v.takeoffAt} color={BUS_COLOR} />
        <Pill label="Arrival" value={v.arrivalAt} color={RAIL_COLOR} />
        <Pill label="ETA" value={`${v.etaMinutes} min`} />
      </div>

      <div className="mt-3 rounded-2xl border border-border bg-secondary/30 p-3">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Next stop</p>
        <p className="mt-0.5 text-sm font-semibold">{v.stop}</p>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-2xl border border-border p-3">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: occColor }} />
        <p className="text-xs">Capacity · <span className="font-semibold uppercase">{v.occupancy}</span></p>
      </div>

      <button
        onClick={onStartRide}
        className="mt-5 w-full rounded-full py-4 text-sm font-bold text-white active:scale-[0.98] transition-transform"
        style={{ background: BUS_COLOR, boxShadow: `0 8px 24px -8px ${BUS_COLOR}` }}
      >
        Start Ride
      </button>
    </div>
  );
}

/* ---------- Row + Pill ---------- */
function VehicleRow({ v, onPick }: { v: NearbyVehicle; onPick: () => void }) {
  const color = v.kind === "rail" ? RAIL_COLOR : BUS_COLOR;
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
          <span style={{ color: BUS_COLOR }} className="font-semibold">Take off {v.takeoffAt}</span>
          <span className="mx-1.5">·</span>
          <span style={{ color: RAIL_COLOR }} className="font-semibold">Arr {v.arrivalAt}</span>
        </p>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-base font-bold tabular-nums" style={{ color: BUS_COLOR }}>{v.etaMinutes}</span>
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

// keep LINE_META import live for tree-shake friendliness
void LINE_META;
