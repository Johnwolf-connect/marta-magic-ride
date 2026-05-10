import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { getPredictedNext, LINE_META } from "@/lib/marta";
import { LineBadge } from "@/components/LineBadge";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/")({ component: HomePage });

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function HomePage() {
  const now = useNow();
  const next = getPredictedNext(now);
  const navigate = useNavigate();
  const { user, isAuthed } = useAuth();
  const meta = LINE_META[next.line];

  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 18 ? "Good afternoon" : "Good evening";
  const name = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "rider";

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="gradient-pulse absolute inset-0 -z-10" />

      <header className="px-6 pt-12">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Pulse</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              {greeting}{isAuthed ? `, ${name}` : ""}.
            </h1>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/60 backdrop-blur">
            <Sparkles className="h-4 w-4 text-marta-gold" style={{ color: "var(--marta-gold)" }} />
          </div>
        </div>
      </header>

      {/* Hero lock-screen card */}
      <section className="px-5 pt-8">
        <button
          onClick={() => navigate({ to: "/ride" })}
          className="group relative w-full overflow-hidden rounded-[2rem] border border-border bg-card p-6 text-left pulse-card transition-all duration-500 active:scale-[0.99]"
        >
          <div
            className="absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-30 blur-3xl transition-all duration-700 group-hover:opacity-60"
            style={{ background: meta.token }}
          />

          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Next departure</p>
              <p className="mt-1 text-sm text-foreground/80">{meta.name} → {next.destination}</p>
            </div>
            <LineBadge line={next.line} size="md" />
          </div>

          <div className="mt-8 flex items-baseline gap-2">
            <span className="text-7xl font-bold tabular-nums tracking-tighter">{next.minutes}</span>
            <span className="text-2xl font-medium text-muted-foreground">min</span>
            {next.delayed && (
              <span className="ml-auto rounded-full bg-warning/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--warning)" }}>
                +2 delay
              </span>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-5">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">From</p>
              <p className="text-sm font-medium">{next.station}</p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium transition-all group-hover:translate-x-1 group-hover:bg-foreground group-hover:text-background">
              Track live <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </button>
      </section>

      {/* Quick suggestion */}
      <section className="px-5 pt-6">
        <Link
          to="/plan"
          className="flex items-center justify-between rounded-2xl border border-border bg-card/60 px-5 py-4 backdrop-blur transition-all active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">Plan a trip</p>
              <p className="text-xs text-muted-foreground">Where to from here?</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </section>

      {/* Streak / carbon teaser */}
      <section className="px-5 pt-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Streak</p>
            <p className="mt-1 text-2xl font-semibold">7<span className="text-sm font-normal text-muted-foreground"> days</span></p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">CO₂ saved</p>
            <p className="mt-1 text-2xl font-semibold" style={{ color: "var(--marta-green)" }}>14<span className="text-sm font-normal text-muted-foreground">kg</span></p>
          </div>
        </div>
      </section>
    </div>
  );
}
