import Link from 'next/link';
import { Sparkles, ArrowRight, BrainCircuit, ShieldCheck, Zap, Layers, RefreshCw } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
      {/* Premium Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md px-6 lg:px-12 flex h-16 items-center justify-between">
        <div className="flex items-center space-x-2.5 select-none">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xl">
            C
          </div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Cortex AI
          </span>
        </div>
        <nav className="flex items-center space-x-4">
          <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">
            Sign In
          </Link>
          <Link
            href="/app/dashboard"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors cursor-pointer"
          >
            Start with AI
          </Link>
        </nav>
      </header>

      {/* Hero Showcase Area */}
      <main className="max-w-5xl mx-auto px-6 py-20 lg:py-32 text-center space-y-12">
        {/* Floating AI Accent badge */}
        <div className="inline-flex items-center space-x-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary select-none animate-pulse">
          <Sparkles className="h-4 w-4" />
          <span>Next-Generation AI Productivity Operating System</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-6 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-none text-foreground select-none">
            Transform Your Goals Into Actions Through <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Adaptive AI</span>
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground leading-relaxed">
            Stop manually managing calendars and repetitive to-do lists. Cortex AI is the world's most intelligent personal productivity ecosystem that thinks, plans, and executes with you.
          </p>
        </div>

        {/* Action Button Links */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/app/dashboard"
            className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 text-base font-medium text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors cursor-pointer"
          >
            Get Started Free <ArrowRight className="ml-2 h-5 w-5 shrink-0" />
          </Link>
          <Link
            href="/docs/01-product-overview"
            className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-lg border border-border bg-card px-6 text-base font-medium hover:bg-muted transition-colors cursor-pointer"
          >
            Read Specifications
          </Link>
        </div>

        {/* Grid Highlight Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16">
          <div className="border border-border bg-card rounded-xl p-6 text-left space-y-4 hover:border-primary/20 transition-all select-none">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold">AI Executive Assistant</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Communicate naturally in Arabic or English. The assistant automatically breaks down complex objectives, schedules meetings, and tracks progress.
            </p>
          </div>

          <div className="border border-border bg-card rounded-xl p-6 text-left space-y-4 hover:border-primary/20 transition-all select-none">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold">Autonomous Planner</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              When life gets busy, the planning engine automatically reschedules overdue tasks, protects focus blocks, and resolves calendar conflicts.
            </p>
          </div>

          <div className="border border-border bg-card rounded-xl p-6 text-left space-y-4 hover:border-primary/20 transition-all select-none">
            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold">Multi-Tenant Security</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Engineered with strict Row-Level Security (RLS) on PostgreSQL, guaranteeing absolute user and organization data isolation from day one.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
