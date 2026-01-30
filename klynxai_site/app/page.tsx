import Image from "next/image";

const navItems = [
  { label: "Platform", href: "#platform" },
  { label: "Governance", href: "#governance" },
  { label: "DevSecOps", href: "#devsecops" },
  { label: "Agentic AI", href: "#agentic" },
  { label: "Use Cases", href: "#use-cases" },
  { label: "Contact", href: "#contact" },
];

const platformHighlights = [
  {
    title: "Decision Control Plane",
    description:
      "A unified authority layer that brokers every AI action across infrastructure, apps, and operations.",
  },
  {
    title: "Policy Studio",
    description:
      "Design and enforce governance rules with approval thresholds, escalation logic, and evidence capture.",
  },
  {
    title: "Operational Intelligence",
    description:
      "Live telemetry fused into decision context for risk-scored, high-confidence approvals.",
  },
  {
    title: "Execution Orchestration",
    description:
      "Route vetted actions to cloud, security, and ops tools with full traceability.",
  },
];

const governancePillars = [
  {
    title: "Human-in-Command Approval",
    description:
      "Every critical action is reviewed by accountable owners before execution.",
  },
  {
    title: "Evidence & Audit Trail",
    description:
      "Immutable decision records with context, rationale, and artifacts attached.",
  },
  {
    title: "Policy Enforcement",
    description:
      "Rules-based gating ensures every decision aligns with enterprise guardrails.",
  },
  {
    title: "Regulatory Readiness",
    description:
      "Decision logging and controls mapped to regulated operating standards.",
  },
];

const devsecopsItems = [
  {
    title: "Secure Change Management",
    description:
      "Pipeline changes and releases flow through policy checks and governed approvals.",
  },
  {
    title: "Incident Command Automation",
    description:
      "Coordinate response playbooks with risk gating and live evidence capture.",
  },
  {
    title: "Access & Secrets Governance",
    description:
      "Protect credentials, privilege boundaries, and policy inheritance across toolchains.",
  },
];

const agenticItems = [
  {
    title: "Role-Bound Agents",
    description:
      "Agents are scoped to approved tools, data, and operating boundaries.",
  },
  {
    title: "Runbook Enforcement",
    description:
      "Agent workflows execute against approved procedures and escalation rules.",
  },
  {
    title: "Continuous Evaluation",
    description:
      "Monitor agent decisions, drift, and risk posture in real time.",
  },
];

const useCases = [
  {
    title: "Critical Infrastructure",
    description:
      "Govern restoration actions, dispatch priorities, and safety protocols for grid and utility teams.",
  },
  {
    title: "Financial Risk Operations",
    description:
      "Enforce approval gates for trading controls, fraud response, and regulatory reporting.",
  },
  {
    title: "Public Sector Command",
    description:
      "Coordinate interagency decisions with transparent oversight and policy alignment.",
  },
  {
    title: "Healthcare Operations",
    description:
      "Secure automation for staffing, resource allocation, and compliance-sensitive workflows.",
  },
  {
    title: "Manufacturing Resilience",
    description:
      "Orchestrate quality actions, predictive maintenance, and supply chain interventions.",
  },
  {
    title: "Enterprise IT",
    description:
      "Operate large-scale infrastructure with governed automation and audit-ready evidence.",
  },
];

const metrics = [
  {
    label: "Decision Coverage",
    value: "Enterprise-wide policy enforcement across AI and automation.",
  },
  {
    label: "Audit Integrity",
    value: "Evidence bundles linked to every approval and execution path.",
  },
  {
    label: "Operational Control",
    value: "Real-time guardrails across cloud, security, and infrastructure actions.",
  },
];

const quickLinks = ["Platform", "Governance", "DevSecOps", "Agentic AI", "Use Cases"];

export default function Home() {
  return (
    <div className="bg-surface text-slate-900">
      <div className="hero-glow" id="home" />
      <header className="site-header">
        <div className="container flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="logo-frame">
              <Image src="/klynx-logo.png" alt="Klynx AI" width={46} height={46} />
            </div>
            <div>
              <p className="text-lg font-semibold">Klynx AI</p>
              <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Governed AI Systems</p>
            </div>
          </div>
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="nav-link">
                {item.label}
              </a>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <a className="btn-outline" href="#platform">
              Explore Platform
            </a>
            <a className="btn-primary" href="#contact">
              Request Demo
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="section hero" id="home">
          <div className="container hero-grid">
            <div className="space-y-6">
              <div className="pill">Enterprise Control Plane</div>
              <h1 className="hero-title">
                The governed AI platform for mission-critical operations
              </h1>
              <p className="hero-subtitle">
                Klynx AI delivers policy-first control for agentic systems. Every decision is
                accountable, auditable, and aligned to your operating authority.
              </p>
              <div className="flex flex-wrap gap-4">
                <a className="btn-primary" href="#contact">Schedule Executive Briefing</a>
                <a className="btn-outline" href="#use-cases">View Use Cases</a>
              </div>
              <div className="hero-trust">
                <span>Policy-First</span>
                <span>Human-Approved</span>
                <span>Audit-Ready</span>
              </div>
            </div>
            <div className="hero-card">
              <div className="hero-card-header">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Governance Cockpit</p>
                <h3>Live Decision Oversight</h3>
              </div>
              <div className="hero-card-grid">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Policy</p>
                  <p className="mt-2 text-sm text-slate-200">
                    Every action is mapped to approved control policies.
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Approvals</p>
                  <p className="mt-2 text-sm text-slate-200">
                    Human checkpoints confirm risk before execution.
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Evidence</p>
                  <p className="mt-2 text-sm text-slate-200">
                    Immutable decision records with telemetry and rationale.
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Execution</p>
                  <p className="mt-2 text-sm text-slate-200">
                    Governed orchestration across cloud, security, and ops.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section metrics" id="metrics">
          <div className="container metric-grid">
            {metrics.map((metric) => (
              <div key={metric.label} className="metric-card">
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">{metric.label}</p>
                <p className="mt-3 text-base text-slate-700">{metric.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section" id="platform">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">Platform</p>
              <h2>Unified control across AI, operations, and infrastructure</h2>
              <p>
                Build a single authority layer that governs how intelligence moves from insight to
                approved action.
              </p>
            </div>
            <div className="card-grid">
              {platformHighlights.map((item) => (
                <div key={item.title} className="card">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-contrast" id="governance">
          <div className="container two-column">
            <div className="space-y-4">
              <p className="eyebrow">Governance</p>
              <h2>Governance designed for enterprise authority</h2>
              <p className="hero-subtitle">
                Klynx connects policies, approvals, and evidence across every autonomous workflow,
                keeping humans accountable and regulators confident.
              </p>
              <a className="btn-primary" href="#contact">See Governance Brief</a>
            </div>
            <div className="stack-cards">
              {governancePillars.map((pillar) => (
                <div key={pillar.title} className="glass-card">
                  <h3>{pillar.title}</h3>
                  <p>{pillar.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="devsecops">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">DevSecOps</p>
              <h2>Secure automation for regulated operations</h2>
              <p>
                Embed governance into pipelines, incident response, and infrastructure changes with
                enforced policy checkpoints.
              </p>
            </div>
            <div className="card-grid">
              {devsecopsItems.map((item) => (
                <div key={item.title} className="card">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-contrast" id="agentic">
          <div className="container two-column">
            <div className="space-y-4">
              <p className="eyebrow">Agentic AI</p>
              <h2>Agents that operate under authority, not assumption</h2>
              <p className="hero-subtitle">
                Klynx turns agents into trusted operators by binding them to policies, approved tools,
                and continuous oversight.
              </p>
            </div>
            <div className="stack-cards">
              {agenticItems.map((item) => (
                <div key={item.title} className="glass-card">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="use-cases">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">Use Cases</p>
              <h2>Governed AI for the world&apos;s most sensitive missions</h2>
              <p>
                From utilities to financial services, Klynx ensures automation moves with authority.
              </p>
            </div>
            <div className="card-grid">
              {useCases.map((item) => (
                <div key={item.title} className="card">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="contact">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">Contact</p>
              <h2>Connect with Klynx AI</h2>
              <p>Share your mission and governance requirements. We will respond within 24 hours.</p>
            </div>
            <div className="contact-card">
              <form className="contact-form" action="mailto:jkmohancrm@gmail.com" method="post" encType="text/plain">
                <div className="grid gap-4 md:grid-cols-2">
                  <input name="name" placeholder="Your name" required />
                  <input name="email" type="email" placeholder="Your email" required />
                </div>
                <input name="subject" placeholder="Subject" required />
                <textarea name="message" placeholder="Describe your governance goals" rows={4} required />
                <div className="flex flex-wrap items-center gap-3">
                  <button className="btn-primary" type="submit">Send Message</button>
                  <p className="text-xs text-slate-500">
                    This form opens your email client. You can also email us directly at
                    <span className="font-semibold"> jkmohancrm@gmail.com</span>.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <p className="footer-title">Klynx AI</p>
            <p className="footer-text">
              Enterprise governance for autonomous systems, AI decisioning, and regulated operations.
            </p>
          </div>
          <div>
            <p className="footer-title">Quick Links</p>
            <ul>
              {quickLinks.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="footer-title">Contact</p>
            <p className="footer-text">jkmohancrm@gmail.com</p>
            <p className="footer-text">Book a demo or governance briefing.</p>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© 2026 Klynx AI. All rights reserved.</span>
          <span>Governed AI. Human authority. Trusted autonomy.</span>
        </div>
      </footer>
    </div>
  );
}
