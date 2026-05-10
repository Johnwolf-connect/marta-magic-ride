import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Headphones, Share2, Vibrate, Wifi } from "lucide-react";
import { getPredictedNext, LINE_META } from "@/lib/marta";
import { LineBadge } from "@/components/LineBadge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/ride")({ component: RidePage });

function RidePage() {
  const [now, setNow] = useState(() => new Date());
  const [share, setShare] = useState(false);
  const [whisper, setWhisper] = useState(false);
  const arrival = getPredictedNext(now);
  const meta = LINE_META[arrival.line];

  // Live ticker
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Approaching haptic heartbeat
  useEffect(() => {
    if (arrival.minutes <= 2 && "vibrate" in navigator) navigator.vibrate?.([60, 80, 60]);
  }, [arrival.minutes]);

  const occupancyColor = arrival.occupancy === "low" ? "var(--marta-green)" : arrival.occupancy === "medium" ? "var(--marta-gold)" : "var(--marta-red)";

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="gradient-pulse absolute inset-0 -z-10 opacity-60" />

      <header className="flex items-center justify-between px-5 pt-12">
        <div className="flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs backdrop-blur">
          <Wifi className="h-3.5 w-3.5" style={{ color: "var(--marta-green)" }} />
          MARTA Wi-Fi · Vehicle <span className="font-semibold">{arrival.vehicleId}</span>
        </div>
        <button
          onClick={() => { setShare(s => !s); toast.success(share ? "Live share off" : "Live share on · auto-expires on arrival"); }}
          className={cn("tap-target flex h-10 items-center gap-2 rounded-full border border-border px-3 text-xs transition-all",
            share ? "bg-foreground text-background" : "bg-card/70")}
        >
          <Share2 className="h-3.5 w-3.5" /> Share
        </button>
      </header>

      {/* Map placeholder — stylized live tracking */}
      <section className="mx-5 mt-5 h-56 overflow-hidden rounded-3xl border border-border bg-card pulse-card">
        <div className="relative h-full w-full" style={{
          background: `radial-gradient(circle at 50% 50%, ${meta.token}25, transparent 70%), repeating-linear-gradient(45deg, var(--secondary) 0 1px, transparent 1px 22px)`
        }}>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse-ring rounded-full" style={{ background: meta.token, opacity: 0.5 }} />
              <div className="relative h-12 w-12 rounded-full" style={{ background: meta.token, boxShadow: `0 0 32px ${meta.token}` }} />
            </div>
          </div>
          {/* Route line */}
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 60" preserveAspectRatio="none">
            <path d="M5 50 Q 30 10 50 30 T 95 10" fill="none" stroke={meta.token} strokeWidth="0.6" strokeLinecap="round" strokeDasharray="2 1.5" />
          </svg>
        </div>
      </section>

      {/* Countdown */}
      <section className="px-5 pt-6 text-center">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Arriving at {arrival.station}</p>
        <div className="mt-2 flex items-baseline justify-center gap-3">
          <span className="text-[120px] font-bold leading-none tabular-nums tracking-tighter">{arrival.minutes}</span>
          <span className="text-2xl font-medium text-muted-foreground">min</span>
        </div>
        <div className="mt-2 flex items-center justify-center gap-2 text-sm text-foreground/80">
          <LineBadge line={arrival.line} size="sm" />
          <span>{meta.name} → {arrival.destination}</span>
        </div>
      </section>

      {/* Stats row */}
      <section className="mx-5 mt-7 grid grid-cols-3 gap-3">
        <Stat label="Capacity" value={arrival.occupancy} color={occupancyColor} ring />
        <Stat label="Door side" value={arrival.doorSide} />
        <Stat label="Status" value={arrival.delayed ? "+2 min" : "On time"} color={arrival.delayed ? "var(--warning)" : "var(--marta-green)"} />
      </section>

      {/* Toggles */}
      <section className="mx-5 mt-5 space-y-2.5">
        <Toggle
          Icon={Headphones}
          label="Whisper mode"
          desc="Spoken updates only on stop approach"
          on={whisper}
          onChange={() => setWhisper(w => !w)}
        />
        <Toggle
          Icon={Vibrate}
          label="Haptic heartbeat"
          desc="Pulses 2 minutes before your stop"
          on
        />
      </section>

      {arrival.delayed && (
        <section className="mx-5 mt-5 rounded-2xl border border-border bg-card p-5 pulse-card animate-slide-up">
          <p className="text-sm font-semibold">Tiny delay. Coffee's on us.</p>
          <p className="mt-1 text-xs text-muted-foreground">Tap to claim a Breeze voucher — because the train is on Atlanta time.</p>
          <button className="mt-3 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background">Claim voucher</button>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value, color, ring }: { label: string; value: string; color?: string; ring?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 text-center">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="mt-1.5 flex items-center justify-center gap-1.5">
        {ring && <span className="h-2 w-2 rounded-full" style={{ background: color }} />}
        <p className="text-sm font-semibold capitalize" style={color && !ring ? { color } : undefined}>{value}</p>
      </div>
    </div>
  );
}

function Toggle({ Icon, label, desc, on, onChange }: { Icon: typeof Headphones; label: string; desc: string; on: boolean; onChange?: () => void }) {
  return (
    <button
      onClick={onChange}
      className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left transition-all active:scale-[0.99]"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <div className={cn("h-6 w-10 rounded-full p-0.5 transition-colors", on ? "bg-foreground" : "bg-secondary")}>
        <div className={cn("h-5 w-5 rounded-full bg-background transition-transform", on && "translate-x-4")} />
      </div>
    </button>
  );
}
