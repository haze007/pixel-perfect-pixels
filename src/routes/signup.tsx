import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { signUp } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthLayout } from "@/components/auth/AuthLayout";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [{ title: "Sign Up — TannerySim" }],
  }),
  component: SignupPage,
});

function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [tanneryName, setTanneryName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signUp(email, password, fullName, tanneryName);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout title="Check your email">
        <div className="text-center space-y-2 py-2">
          <p className="text-sm text-muted-foreground">
            We sent a confirmation link to{" "}
            <span className="font-medium text-foreground">{email}</span>.
            Click it to activate your account.
          </p>
          <Link to="/login" className="inline-block text-sm text-primary font-medium hover:underline mt-2">
            Back to sign in →
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create account" subtitle="Start simulating leather chemistry">
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <p className="rounded-lg bg-destructive/8 border border-destructive/15 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Full name</label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" required />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Tannery</label>
            <Input value={tanneryName} onChange={(e) => setTanneryName(e.target.value)} placeholder="Acme Leather" required />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Email</label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Password</label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} autoComplete="new-password" />
        </div>
        <Button type="submit" className="w-full mt-1" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        Have an account?{" "}
        <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
