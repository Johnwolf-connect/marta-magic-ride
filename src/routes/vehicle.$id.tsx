import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Bus, MapPin, Share2, Train, Wifi } from "lucide-react";
import { getNearbyVehicles, LINE_META, type NearbyVehicle } from "@/lib/marta";
import { toast } from "sonner";

export const Route = createFileRoute("/vehicle/$id")({ component: VehiclePage });

function VehiclePage() {
  const { id } = Route.useParams();
  const [now, setNow] = useState(() => new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 2000);
    return () => clearInterval(t);
  }, []);

  const vehicle = useMemo<NearbyVehicle | undefined>(
    () => getNearbyVehicles(now).find((v) => v.id === id),
    [now, id]
  );

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Link to="/map" className="text-sm text-primary">← Back to map</Link>
        <p className="mt-8 text-center text-muted-foreground">Vehicle no longer in service area.</p>
      </div>
    );
  }

  const isRail = vehicle.kind === "rail";
  const accent = isRail ? "#FF7500" : "#0092D0";
  const stops = makeUpcomingStops(vehicle, now);

  return (
    <div className="min-h-screen bg-background pb-10">
      {/* thin blue border frame */}
      <div className="pointer-events-none fixed inset-0 z-50 border-2" style={{ borderColor: "#0092D0" }} />

      <header className="sticky top-0 z-10 flex items-center gap-3 bg-background/95 px-5 pt-12 pb-4 backdrop-blur-xl">
        <button onClick={() => navigate({ to: "/map" })} className="flex h-10 w-10 items-center justify-center rounded-full border border-border active:scale-95">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold">{vehicle.routeName}</p>
          <p className="truncate text-xs text-muted-foreground">→ {vehicle.headsign} · #{vehicle.id}</p>
        </div>
        <button
          onClick={() => { navigator.share?.({ title: "Track me on Pulse", text: `On ${vehicle.routeName}`, url: window.location.href }).catch(() => toast.success("Live share link copied")); }}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border active:scale-95"
        >
          <Share2 className="h-5 w-5" />
        </button>
      </header>

      <div className="px-5">
        {/* Mini map */}
        <div className="relative h-56 overflow-hidden rounded-3xl border border-border" style={{
          background: `radial-gradient(circle at 50% 50%, color-mix(in oklab, ${accent} 10%, transparent), transparent 60%), repeating-linear-gradient(0deg,#f3f6fa 0 1px,transparent 1px 32px), repeating-linear-gradient(90deg,#f3f6fa 0 1px,transparent 1px 32px), #fff`
        }}>
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M5 80 Q 35 50 50 50 T 95 15" fill="none" stroke={accent} strokeWidth="1" strokeLinecap="round" opacity="0.7" />
          </svg>
          <div className="absolute" style={{ left: `${vehicle.x * 100}%`, top: `${vehicle.y * 100}%`, transform: "translate(-50%,-50%)" }}>
            <div className="absolute inset-0 animate-pulse-ring rounded-full" style={{ background: accent, opacity: 0.5 }} />
            <div className="relative flex h-11 w-11 items-center justify-center rounded-full text-white ring-4 ring-white" style={{ background: accent, boxShadow: `0 6px 20px -4px ${accent}` }}>
              {isRail ? <Train className="h-5 w-5" /> : <Bus className="h-5 w-5" />}
            </div>
          </div>
        </div>

        {/* Live stats */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Stat label="Take off" value={vehicle.takeoffAt} color="#0092D0" />
          <Stat label="Arrival" value={vehicle.arrivalAt} color="#FF7500" />
          <Stat label="Capacity" value={vehicle.occupancy.toUpperCase()} />
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-2xl border border-border bg-card p-3">
          <MapPin className="h-4 w-4" style={{ color: accent }} />
          <p className="text-sm">Next stop: <span className="font-semibold">{vehicle.stop}</span></p>
        </div>

        {/* Upcoming stops */}
        <h2 className="mt-6 mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Upcoming stops</h2>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {stops.map((s, i) => (
            <div key={s.name} className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
              <div className="relative flex h-7 w-7 items-center justify-center">
                <span className="absolute inset-0 rounded-full" style={{ background: i === 0 ? accent : "transparent", border: i === 0 ? "none" : `2px solid ${accent}`, opacity: i === 0 ? 1 : 0.6 }} />
                {i < stops.length - 1 && <span className="absolute left-1/2 top-7 h-6 w-0.5 -translate-x-1/2" style={{ background: `${accent}55` }} />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{s.name}</p>
                {i === 0 && <p className="text-[11px] text-muted-foreground">Next · live</p>}
              </div>
              <p className="text-sm font-semibold tabular-nums" style={{ color: accent }}>{s.time}</p>
            </div>
          ))}
        </div>

        {/* Track this vehicle CTA */}
        <button
          onClick={() => {
            toast.success(`Auto-claiming via Wi-Fi · ${vehicle.id}`);
            navigate({ to: "/ride" });
          }}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full py-4 text-sm font-bold text-white active:scale-[0.98] transition-transform"
          style={{ background: "#0092D0", boxShadow: "0 8px 24px -8px #0092D0" }}
        >
          <Wifi className="h-4 w-4" /> Track this vehicle
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-bold tabular-nums" style={color ? { color } : undefined}>{value}</p>
    </div>
  );
}

function makeUpcomingStops(v: NearbyVehicle, now: Date) {
  const POOL = ["Five Points","Peachtree Center","Civic Center","North Avenue","Midtown","Arts Center","Lindbergh Center","Buckhead","Lenox","Brookhaven"];
  const startIdx = Math.abs(v.id.charCodeAt(0) + v.id.length) % POOL.length;
  const out: { name: string; time: string }[] = [];
  let t = new Date(now.getTime() + v.etaMinutes * 60_000);
  out.push({ name: v.stop, time: fmt(t) });
  for (let i = 1; i < 6; i++) {
    t = new Date(t.getTime() + (3 + (i * 2)) * 60_000);
    out.push({ name: POOL[(startIdx + i) % POOL.length], time: fmt(t) });
  }
  return out;
}
function fmt(d: Date) { return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }); }
