interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-sidebar p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo + heading */}
        <div className="text-center space-y-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
            TS
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        </div>

        {/* Form card */}
        <div className="rounded-xl border border-border bg-background shadow-sm p-6 space-y-4">
          {children}
        </div>

        <p className="text-center text-xs text-muted-foreground/50">
          © {new Date().getFullYear()} TannerySim
        </p>
      </div>
    </div>
  );
}
