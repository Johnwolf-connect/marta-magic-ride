import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";

export function AuthGate({ feature }: { feature: string }) {
  return (
    <div className="animate-slide-up rounded-3xl border border-border bg-card p-6 pulse-card text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
        <Lock className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">Sign in to unlock {feature}</h3>
      <p className="mt-1 text-sm text-muted-foreground">One tap. No password if you don't want it.</p>
      <Link
        to="/login"
        className="tap-target mt-5 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform active:scale-95"
      >
        Continue
      </Link>
    </div>
  );
}
