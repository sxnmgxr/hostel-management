"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || data.message || "Login failed. Please try again.");
        setLoading(false);
        return;
      }

      router.push(data.role === "parent" ? "/parent" : data.role === "admin" ? "/" : "/attendance");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center overflow-hidden bg-slate-100 px-4 py-8 sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(37,99,235,0.16),transparent_32%),linear-gradient(135deg,#f8fafc_0%,#e7eef9_100%)]" />
      <main className="relative mx-auto grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.14)] lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-[28px] border-blue-500/20" />
          <div className="absolute -bottom-28 -left-24 h-80 w-80 rounded-full border-[32px] border-cyan-400/10" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-950/40">
                <ShieldCheck className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-wide">Believers</p>
                <p className="text-xs text-slate-400">Hostel Management</p>
              </div>
            </div>
            <div className="mt-24 max-w-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-300">Operations workspace</p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em]">A clearer view of hostel operations.</h1>
              <p className="mt-5 text-sm leading-6 text-slate-400">Manage residents, rooms, fees, attendance, and communication from one secure workspace.</p>
            </div>
          </div>
          <div className="relative flex items-center gap-2 text-xs text-slate-400"><LockKeyhole className="h-4 w-4 text-emerald-400" aria-hidden="true" /> Secure role-based access</div>
        </section>

        <section className="p-7 sm:p-10 lg:p-14">
          <div className="mx-auto max-w-md">
            <div className="mb-10 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white"><ShieldCheck className="h-5 w-5" aria-hidden="true" /></div>
                <div><p className="text-sm font-semibold text-slate-900">Believers</p><p className="text-xs text-slate-500">Hostel Management</p></div>
              </div>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">Welcome back</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950">Sign in to your workspace</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">Use your authorized account to continue to the right workspace.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">Work email</label>
                <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" placeholder="you@example.com" />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between"><label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label><span className="text-xs text-slate-400">Secure sign-in</span></div>
                <div className="relative">
                  <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-3 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" placeholder="Enter your password" />
                  <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 transition hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}</button>
                </div>
              </div>

              {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700" role="alert">{error}</p>}

              <button type="submit" disabled={loading} className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Signing in..." : "Continue to workspace"}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></button>
            </form>

            <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-slate-400"><LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" /> Your session is protected with secure authentication.</p>
          </div>
        </section>
      </main>
    </div>
  );
}