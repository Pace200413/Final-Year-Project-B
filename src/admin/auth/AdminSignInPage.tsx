"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminSignInPage() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [show, setShow] = useState(false);
  const [caps, setCaps] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canSubmit = email.trim() !== "" && pwd.trim() !== "" && !loading;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => setCaps(e.getModifierState?.("CapsLock") ?? false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setErr(null);
    try {
      // TODO: call Spring /auth/login and store JWT
      await new Promise((r) => setTimeout(r, 500));
      const ok = email.toLowerCase().endsWith("@example.com") && pwd === "admin123";
      if (!ok) throw new Error("Invalid admin credentials.");
      window.location.assign("/admin");
    } catch (e: unknown) {
      setErr((e as Error)?.message ?? "Sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto my-8 max-w-md px-4">
      <section className="rounded-3xl border border-slate-200 bg-white p-6">
        <header className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Admin Sign In</h1>
            <p className="mt-1 text-sm text-slate-600">
              Use your admin work email to access the console.
            </p>
          </div>
          <span className="rounded-md bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700 ring-1 ring-rose-200">
            ADMIN
          </span>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <label className="grid gap-1">
            <span className="text-xs font-medium text-slate-700">Work email</span>
            <input
              type="email"
              required
              autoComplete="username"
              inputMode="email"
              className="input"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!err}
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-medium text-slate-700">Password</span>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                required
                autoComplete="current-password"
                className="input pr-20"
                placeholder="••••••••"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                aria-invalid={!!err}
                aria-describedby={caps ? "caps-hint" : undefined}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-2 my-auto rounded-lg px-2 text-xs underline"
                onClick={() => setShow((s) => !s)}
                aria-pressed={show}
                aria-label={show ? "Hide password" : "Show password"}
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>
            {caps && (
              <div id="caps-hint" className="mt-1 text-xs text-amber-700">
                Caps Lock is on
              </div>
            )}
            <div className="mt-1 text-right">
              <Link href="/forgot" className="text-xs underline">
                Forgot password?
              </Link>
            </div>
          </label>

          {err && (
            <div
              role="alert"
              className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
            >
              {err}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className={`btn w-full ${canSubmit ? "btn-primary" : "btn-ghost cursor-not-allowed"}`}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="mt-6 text-sm">
          <Link href="/profile" className="underline">
            Return to Profile
          </Link>
        </div>
        <hr className="my-6" />
        <p className="text-xs text-slate-500">
          All admin actions are logged for security auditing.
        </p>
      </section>
    </main>
  );
}
