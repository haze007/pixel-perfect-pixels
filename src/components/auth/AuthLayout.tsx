

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center bg-surface-1">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/3 h-72 w-72 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 h-56 w-56 rounded-full bg-purple-accent/15 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 rounded-full bg-primary/10 blur-[80px]" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Branding content */}
        <div className="relative z-10 max-w-md px-12 text-center space-y-6">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground shadow-lg shadow-primary/25">
            TS
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            TannerySim
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Predict colour, texture &amp; material behaviour of leather finishing
            recipes with real-time 3D simulation.
          </p>
          <div className="flex items-center justify-center gap-6 pt-4 text-xs text-muted-foreground/60">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Colour Science
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              3D Preview
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-warning" />
              AI Assist
            </span>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-12">
        {/* Mobile logo */}
        <div className="mb-8 lg:hidden">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
            TS
          </div>
        </div>

        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>

          {children}

          <p className="text-center text-xs text-muted-foreground/50">
            © {new Date().getFullYear()} TannerySim. Leather chemistry simulation.
          </p>
        </div>
      </div>
    </div>
  );
}
