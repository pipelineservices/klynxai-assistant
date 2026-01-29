import Badge from "@/components/Badge";
import GlowCard from "@/components/GlowCard";
import Section from "@/components/Section";

const capabilities = [
  {
    title: "AI Governance & Control",
    description: "Define what AI can do, when it can act, and who must approve. Built for policy-first automation.",
  },
  {
    title: "Agentic Workflows",
    description: "Coordinate multi-agent execution across cloud, security, and operations without losing human authority.",
  },
  {
    title: "Intelligent Observability (AIOps)",
    description: "Fuse telemetry, logs, and signals into real-time operational intelligence and guided responses.",
  },
  {
    title: "Autonomous DevOps",
    description: "Governed auto-remediation that never merges or deploys without a formal decision trail.",
  },
  {
    title: "Real-Time Data Infrastructure",
    description: "Stream-first infrastructure that keeps decisions current, verifiable, and action-ready.",
  },
  {
    title: "Single Command Center",
    description: "One authoritative surface for audit, approvals, and mission-critical orchestration.",
  },
];

const philosophy = [
  {
    title: "AI with accountability",
    description: "Every recommendation is grounded in policy, traceable evidence, and explicit approvals.",
  },
  {
    title: "Automation with approval",
    description: "No irreversible action happens without the right human authority in the loop.",
  },
  {
    title: "Decisions with auditability",
    description: "Immutable event trails align AI operations with enterprise and government standards.",
  },
];

const domains = [
  {
    title: "DevOps & Cloud Operations",
    description: "Governed remediation, deployment control, and operational resilience at scale.",
  },
  {
    title: "Energy & Utilities",
    description: "Critical infrastructure decisions with safety constraints and audit-grade oversight.",
  },
  {
    title: "Retail Intelligence",
    description: "Policy-guarded pricing, inventory, and promotion decisions with executive controls.",
  },
  {
    title: "Banking & Risk",
    description: "Regulatory-grade AI operations for fraud, compliance, and financial integrity.",
  },
  {
    title: "Public Safety & Government",
    description: "Mission-ready command for emergency response, security operations, and civic infrastructure.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-ink dark:text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-radial opacity-70" />
        <div className="absolute inset-0 bg-grid-lines [background-size:80px_80px] opacity-40" />
        <header className="relative z-10">
          <div className="max-w-6xl mx-auto px-6 pt-10 pb-16">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-400 via-aurora to-emerald-400 text-slate-900 font-bold flex items-center justify-center">
                  K
                </div>
                <div>
                  <p className="text-lg font-semibold tracking-wide">Klynx AI</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Governed AI Systems</p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-3">
                <button className="rounded-full border border-slate-300/40 px-4 py-2 text-sm text-slate-700 transition hover:border-cyan-400/60 hover:text-cyan-600 dark:border-white/10 dark:text-slate-200">
                  Explore Platform
                </button>
                <button className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-cyan-500/30 transition hover:bg-cyan-400">
                  Request Demo
                </button>
              </div>
            </div>

            <div className="mt-16 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-6">
                <Badge text="Enterprise Control Plane" />
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight">
                  The Control Plane for Governed AI & Autonomous Operations
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-300">
                  Klynx AI orchestrates policy-bound automation, agentic workflows, and real-time intelligence
                  across mission-critical systems. Every action is explainable, auditable, and approved.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/30 transition hover:bg-slate-800 dark:bg-white dark:text-slate-900">
                    Request Demo
                  </button>
                  <button className="rounded-full border border-slate-300/50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-400/70 hover:text-cyan-600 dark:border-white/15 dark:text-slate-200">
                    Explore Platform
                  </button>
                </div>
                <div className="flex flex-wrap gap-6 text-xs uppercase tracking-[0.3em] text-slate-400">
                  <span>Trusted</span>
                  <span>Auditable</span>
                  <span>Mission-Ready</span>
                </div>
              </div>

              <div className="relative">
                <div className="animate-fadeUp rounded-3xl border border-cyan-400/20 bg-white/60 p-6 shadow-glow backdrop-blur dark:bg-slate-900/60">
                  <p className="text-xs uppercase tracking-[0.35em] text-cyan-500">Command Snapshot</p>
                  <div className="mt-6 space-y-4">
                    {[
                      "Decision pipeline with policy gating",
                      "Live ops intelligence and anomaly routing",
                      "Approval ledger with immutable audit",
                      "Cross-domain orchestration surfaces",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute -bottom-8 -right-8 hidden h-28 w-28 rounded-full bg-amber-400/20 blur-2xl lg:block" />
              </div>
            </div>
          </div>
        </header>
      </div>

      <Section
        eyebrow="Capabilities"
        title="Built for enterprise-grade autonomy"
        subtitle="Unified governance for AI, operations, and critical decisions."
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((card, index) => (
            <GlowCard
              key={card.title}
              title={card.title}
              description={card.description}
              icon={<span className="text-cyan-400">◆</span>}
              accent={
                index % 2 === 0
                  ? "radial-gradient(circle at top left, rgba(56,189,248,0.25), transparent 60%)"
                  : "radial-gradient(circle at top right, rgba(249,115,22,0.2), transparent 60%)"
              }
            />
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Platform Philosophy"
        title="Governance that scales with autonomy"
        subtitle="Klynx AI is built to keep humans in command, regardless of system complexity."
      >
        <div className="grid gap-6 md:grid-cols-3">
          {philosophy.map((item) => (
            <GlowCard
              key={item.title}
              title={item.title}
              description={item.description}
              icon={<span className="text-amber-400">●</span>}
              accent="radial-gradient(circle at top left, rgba(251,191,36,0.2), transparent 55%)"
            />
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Domain Solutions"
        title="AI governance for the world’s most critical systems"
        subtitle="Deploy Klynx AI across industries with tailored guardrails and mission context."
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {domains.map((domain) => (
            <GlowCard
              key={domain.title}
              title={domain.title}
              description={domain.description}
              icon={<span className="text-emerald-400">▲</span>}
              accent="radial-gradient(circle at top left, rgba(16,185,129,0.2), transparent 55%)"
            />
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Call to Action"
        title="Put Klynx AI to work in your control plane"
        subtitle="Lead with accountable AI. Protect every decision. Scale with confidence."
      >
        <div className="rounded-3xl border border-slate-200/40 bg-slate-900 p-10 text-white shadow-glow dark:border-white/10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-2xl font-semibold">Book a demo or partner with Klynx</p>
              <p className="mt-2 text-slate-300">
                Build your governed AI command center with enterprise-grade assurances.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <button className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300">
                Book a Demo
              </button>
              <button className="rounded-full border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:border-cyan-300 hover:text-cyan-200">
                Partner with Klynx
              </button>
            </div>
          </div>
        </div>
      </Section>

      <footer className="border-t border-slate-200/60 py-10 text-sm text-slate-500 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <span>© 2026 Klynx AI. All rights reserved.</span>
          <span>Built for governed autonomy.</span>
        </div>
      </footer>
    </div>
  );
}
