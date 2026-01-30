import Image from "next/image";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "Platform", href: "#platform" },
  { label: "Governance", href: "#governance" },
  { label: "DevSecOps", href: "#devsecops" },
  { label: "Agentic AI", href: "#agentic" },
  { label: "Use Cases", href: "#use-cases" },
  { label: "Contact", href: "#contact" },
];

const platformItems = [
  {
    title: "Unified Control Plane",
    description:
      "Centralize AI decisioning, approvals, and execution under one governed authority layer.",
  },
  {
    title: "Policy Studio",
    description:
      "Design guardrails, escalation paths, and approval thresholds mapped to enterprise policy.",
  },
  {
    title: "Operational Intelligence",
    description:
      "Fuse telemetry, events, and context to guide risk-scored recommendations.",
  },
  {
    title: "Execution Orchestration",
    description:
      "Route approved actions to cloud, security, and operations tools with full traceability.",
  },
];

const governanceItems = [
  {
    title: "Human-in-Command Approval",
    description:
      "Critical decisions stay accountable with named approvers and enforced sign-off.",
  },
  {
    title: "Audit Evidence Bundles",
    description:
      "Every recommendation and action is packaged with rationale, data, and approvals.",
  },
  {
    title: "Policy Enforcement",
    description:
      "Governed actions stay aligned to enterprise and regulatory requirements.",
  },
  {
    title: "Regulatory Readiness",
    description:
      "Compliance artifacts generated automatically for internal and external review.",
  },
];

const devsecopsItems = [
  {
    title: "Governed Change Control",
    description:
      "Infrastructure and release changes flow through policy gating and approval sequencing.",
  },
  {
    title: "Incident Command",
    description:
      "Coordinate response playbooks with evidence capture and risk-aware routing.",
  },
  {
    title: "Secure Access Operations",
    description:
      "Protect credentials, privileges, and tool access with policy-driven boundaries.",
  },
];

const agenticItems = [
  {
    title: "Bounded Agent Roles",
    description:
      "Agents operate only within approved tools, data, and authority scopes.",
  },
  {
    title: "Runbook Execution",
    description:
      "Agent workflows execute against approved procedures and escalation policies.",
  },
  {
    title: "Continuous Oversight",
    description:
      "Monitor agent decisions and risk posture with real-time governance telemetry.",
  },
];

const useCases = [
  {
    title: "Critical Infrastructure",
    description:
      "Govern restoration actions, dispatch priorities, and safety protocols for utility teams.",
  },
  {
    title: "Financial Risk Operations",
    description:
      "Enforce approval gates for fraud response, trading controls, and regulatory reporting.",
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

const heroCards = [
  {
    title: "Policy Enforcement",
    description: "Rules-based gating across every AI decision and automation action.",
  },
  {
    title: "Command Intelligence",
    description: "Live operational telemetry for confident, risk-scored approvals.",
  },
  {
    title: "Secure Orchestration",
    description: "Approved execution across cloud, security, and infrastructure tools.",
  },
];

const quickLinks = [
  "Platform",
  "Governance",
  "DevSecOps",
  "Agentic AI",
  "Use Cases",
];

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
              <div className="pill">Governed AI for Mission-Critical Operations</div>
              <h1 className="hero-title">
                Enterprise control for every autonomous decision
              </h1>
              <p className="hero-subtitle">
                Klynx AI delivers a policy-first platform that governs AI, agentic workflows, and
                automated execution across critical infrastructure and regulated industries.
              </p>
              <div className="flex flex-wrap gap-4">
                <a className="btn-primary" href="#platform">Discover the Platform</a>
                <a className="btn-outline" href="#contact">Book an Executive Briefing</a>
              </div>
              <div className="hero-trust">
                <span>Policy-First</span>
                <span>Human-Approved</span>
                <span>Audit-Ready</span>
              </div>
            </div>
            <div className="hero-panel">
              <div className="hero-panel-grid">
                {heroCards.map((card) => (
                  <div key={card.title} className="hero-panel-card">
                    <div className="hero-panel-icon" />
                    <div>
                      <h3>{card.title}</h3>
                      <p>{card.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="hero-panel-summary">
                <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Governance Cockpit</p>
                <h3>Live decision oversight with full evidence traceability.</h3>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="platform">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">Platform</p>
              <h2>One platform. Every decision governed.</h2>
              <p>
                Unify intelligence, policy, and execution to keep autonomous operations accountable.
              </p>
            </div>
            <div className="card-grid">
              {platformItems.map((item) => (
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
                Klynx aligns AI actions to policy, approval, and evidence so every decision remains
                accountable to human leaders.
              </p>
              <a className="btn-primary" href="#contact">Request Governance Brief</a>
            </div>
            <div className="stack-cards">
              {governanceItems.map((item) => (
                <div key={item.title} className="glass-card">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
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
                Embed governance into pipelines, incident response, and infrastructure change
                management with policy enforcement.
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
                Klynx binds agents to approved roles, runbooks, and oversight to make autonomous
                execution safe and trusted.
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
                From utilities to financial services, Klynx keeps autonomous action accountable.
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
              <form className="contact-form" action="mailto:support@klynxai.com" method="post" encType="text/plain">
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
                    <span className="font-semibold"> support@klynxai.com</span>.
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
            <p className="footer-text">support@klynxai.com</p>
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
