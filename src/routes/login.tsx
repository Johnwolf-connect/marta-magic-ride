import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) throw error;
        toast.success("Check your email to confirm.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
        navigate({ to: "/" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-6 pt-12">
      <div className="gradient-pulse absolute inset-0 -z-10" />

      <button onClick={() => navigate({ to: "/" })} className="tap-target -ml-2 flex h-10 w-10 items-center justify-center rounded-full">
        <ArrowLeft className="h-5 w-5" />
      </button>

      <div className="mt-8">
        <h1 className="text-3xl font-semibold tracking-tight">{mode === "signin" ? "Welcome back" : "Hop on Pulse"}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {mode === "signin" ? "Live tracking, favorites, share — all yours." : "Predicts your route the second day in."}
        </p>
      </div>

      <form onSubmit={submit} className="mt-8 space-y-3">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 pulse-card">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder="you@atlanta.com" autoComplete="email"
          />
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 pulse-card">
          <input
            type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Password" autoComplete={mode === "signin" ? "current-password" : "new-password"}
          />
        </div>

        <button
          type="submit" disabled={loading}
          className="tap-target mt-2 flex w-full items-center justify-center rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? "…" : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      <button
        onClick={() => setMode(m => m === "signin" ? "signup" : "signin")}
        className="mt-6 w-full text-center text-sm text-muted-foreground"
      >
        {mode === "signin" ? "New here? Create an account" : "Already on Pulse? Sign in"}
      </button>

      <p className="mt-10 text-center text-xs text-muted-foreground">
        Browse without an account from the home screen anytime.
      </p>
    </div>
  );
}
