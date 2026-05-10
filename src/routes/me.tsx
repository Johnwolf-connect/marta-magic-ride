import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, ChevronRight, CreditCard, GripVertical, Home, LogOut, Plane, Trophy } from "lucide-react";
import { useAuth } from "@/lib/use-auth";
import { AuthGate } from "@/components/AuthGate";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/me")({ component: MePage });

const MOCK_FAVS = [
  { label: "Home",    address: "Inman Park",  Icon: Home },
  { label: "Work",    address: "Midtown",     Icon: Briefcase },
  { label: "Airport", address: "ATL Airport", Icon: Plane },
];

function MePage() {
  const { user, isAuthed, loading } = useAuth();

  if (loading) return <div className="px-5 pt-12"><div className="h-32 rounded-3xl bg-card shimmer" /></div>;

  return (
    <div className="min-h-screen px-5 pt-12">
      <h1 className="text-3xl font-semibold tracking-tight">Me</h1>

      {!isAuthed ? (
        <div className="mt-6"><AuthGate feature="favorites, history & live share" /></div>
      ) : (
        <>
          {/* Profile card */}
          <section className="mt-5 rounded-3xl border border-border bg-card p-5 pulse-card">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-lg font-semibold">
                {(user?.email?.[0] || "U").toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-base font-semibold">{user?.user_metadata?.display_name || user?.email}</p>
                <p className="text-xs text-muted-foreground">Pulse member</p>
              </div>
              <Trophy className="h-5 w-5" style={{ color: "var(--marta-gold)" }} />
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4">
              <Stat label="Streak" value="7" suffix="days" />
              <Stat label="CO₂" value="14" suffix="kg" color="var(--marta-green)" />
              <Stat label="Trips" value="42" />
            </div>
          </section>

          {/* Breeze */}
          <section className="mt-4 flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "var(--marta-blue)20", color: "var(--marta-blue)" }}>
              <CreditCard className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Breeze balance</p>
              <p className="text-lg font-semibold">$12.50</p>
            </div>
            <button className="rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background">Top up</button>
          </section>

          {/* Favorites */}
          <section className="mt-6">
            <h2 className="px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Favorites</h2>
            <ul className="mt-2 space-y-2">
              {MOCK_FAVS.map(({ label, address, Icon }) => (
                <li key={label} className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <Icon className="h-4 w-4" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{address}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </li>
              ))}
            </ul>
          </section>

          {/* Trip history teaser */}
          <section className="mt-6">
            <h2 className="px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Recent trips</h2>
            <ul className="mt-2 space-y-2">
              {["Yesterday · Inman Park → Midtown", "Mon · Home → Airport", "Sun · Decatur → Five Points"].map((t) => (
                <li key={t} className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-sm">
                  <span>{t}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </li>
              ))}
            </ul>
          </section>

          <button
            onClick={async () => { await supabase.auth.signOut(); toast.success("Signed out"); }}
            className="tap-target mt-8 mb-4 flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card py-3 text-sm font-medium text-muted-foreground"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, suffix, color }: { label: string; value: string; suffix?: string; color?: string }) {
  return (
    <div className="text-center">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums" style={color ? { color } : undefined}>
        {value}{suffix && <span className="ml-0.5 text-xs font-normal text-muted-foreground">{suffix}</span>}
      </p>
    </div>
  );
}
