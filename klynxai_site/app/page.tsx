import Image from "next/image";

const navItems = [
  { label: "Home", href: "#home" },
  {
    label: "Solutions",
    href: "#solutions",
    children: [
      { label: "Klynx Dragon", href: "#solution-dragon" },
      { label: "Smart Outage Restoration", href: "#solution-outage" },
      { label: "Retail Intelligence", href: "#solution-retail" },
      { label: "Banking & Risk", href: "#solution-finance" },
      { label: "Public Safety", href: "#solution-public" },
    ],
  },
  {
    label: "Platform",
    href: "#platform",
    children: [
      { label: "Governance Core", href: "#platform" },
      { label: "Execution Control", href: "#platform" },
      { label: "Operational Intelligence", href: "#platform" },
    ],
  },
  {
    label: "Technology",
    href: "#technology",
    children: [
      { label: "Realtime Fabric", href: "#technology" },
      { label: "Policy Engine", href: "#technology" },
      { label: "Audit & Evidence", href: "#technology" },
    ],
  },
  {
    label: "Services",
    href: "#services",
    children: [
      { label: "Enterprise Readiness", href: "#services" },
      { label: "Operational Transformation", href: "#services" },
      { label: "Managed Governance", href: "#services" },
    ],
  },
  {
    label: "Insights",
    href: "#insights",
    children: [
      { label: "Governed AI", href: "#insights" },
      { label: "Operational Risk", href: "#insights" },
      { label: "Human-in-Command", href: "#insights" },
    ],
  },
  { label: "Contact", href: "#contact" },
];

const capabilities = [
  {
    title: "AI Governance and Control",
    description:
      "Policy-first orchestration for AI decisions with human-in-command guardrails and immutable audit trails.",
  },
  {
    title: "Agentic Workflows",
    description:
      "Mission-aligned automation that coordinates multi-agent workflows across cloud, operations, and security.",
  },
  {
    title: "Intelligent Observability",
    description:
      "Real-time intelligence that fuses metrics, logs, traces, and events into actionable decisions.",
  },
  {
    title: "Autonomous DevOps",
    description:
      "Governed remediation where every change is reviewed, approved, and fully traceable.",
  },
  {
    title: "Real-Time Data Infrastructure",
    description:
      "Streaming data fabric that keeps your operational state consistent, verified, and decision-ready.",
  },
  {
    title: "Single Command Center",
    description:
      "One authoritative surface for approvals, auditability, and cross-domain command execution.",
  },
];

const solutions = [
  {
    id: "dragon",
    title: "Klynx Dragon - Governed Command",
    subtitle: "Policy-gated command and approval for critical AI operations.",
    description:
      "Klynx Dragon provides a governed decision plane for high-stakes actions. It enforces role-based approvals, audit-grade evidence, and decision context across every step of AI-driven operations.",
    bullets: [
      "Decision registry with immutable audit",
      "Policy gating for all actions",
      "Human override with signed approvals",
      "Enterprise-grade risk scoring",
    ],
  },
  {
    id: "outage",
    title: "Smart Outage Restoration",
    subtitle: "Restore services faster with governed automation.",
    description:
      "Transform outage response into a rapid, data-driven workflow. Klynx AI correlates sensor data, incident signals, and operational context to recommend safe restoration paths, all under human approval.",
    bullets: [
      "Detect faults within minutes, not hours",
      "Prioritize critical infrastructure first",
      "Dispatch crews with verified action plans",
      "Audit-ready evidence for every decision",
    ],
  },
  {
    id: "retail",
    title: "Retail Intelligence",
    subtitle: "Govern pricing, inventory, and promotions with accountability.",
    description:
      "Klynx AI converts retail recommendations into governed decisions. Every price change or inventory action is vetted against policy thresholds and risk constraints.",
    bullets: [
      "Policy checks on margin and risk",
      "Approval routing for high-impact changes",
      "Decision queue and audit history",
      "Executive visibility across retail actions",
    ],
  },
  {
    id: "public",
    title: "Public Safety and Government",
    subtitle: "Mission-ready command for civic and national operations.",
    description:
      "Enable trusted AI decisioning for public infrastructure and safety operations with strict oversight, compliance, and transparent accountability.",
    bullets: [
      "Human-in-command enforcement",
      "Policy-driven response orchestration",
      "Incident traceability and evidence bundles",
      "Governance-ready reporting",
    ],
  },
];

const solutionDetails = [
  {
    id: "solution-dragon",
    title: "Klynx Dragon — Governed Decision Command",
    description:
      "A policy-first control plane for AI and automation. Every action is reviewed, approved, and permanently auditable.",
    highlights: [
      "Decision registry with immutable audit chain",
      "Role-based approval workflow and override governance",
      "Risk scoring with escalation triggers",
      "Integrated incident context and evidence bundles",
    ],
  },
  {
    id: "solution-outage",
    title: "Smart Outage Restoration",
    description:
      "Transform outage response into a rapid, data-driven process that prioritizes public safety and infrastructure integrity.",
    highlights: [
      "Automated fault localization with policy gating",
      "Priority restoration sequencing for hospitals and critical assets",
      "Validated crew dispatch and work order automation",
      "Audit-ready restoration timeline for regulators",
    ],
  },
  {
    id: "solution-retail",
    title: "Retail Intelligence",
    description:
      "Governed pricing, inventory, and promotion decisions with clear accountability across every channel.",
    highlights: [
      "Policy thresholds for margin, availability, and brand risk",
      "Approval routing for high-impact changes",
      "Unified command queue for merchandising teams",
      "Governance-ready reporting for leadership",
    ],
  },
  {
    id: "solution-finance",
    title: "Banking & Risk",
    description:
      "Policy-driven decisioning for regulated financial operations with approval chains, risk scoring, and audit-grade accountability.",
    highlights: [
      "Dual approval for high-impact actions",
      "Regulatory evidence bundles on demand",
      "Risk scoring with override escalation",
      "Decision accountability reporting",
    ],
  },
  {
    id: "solution-public",
    title: "Public Safety & Government",
    description:
      "Mission-ready decision governance for public infrastructure, emergency response, and regulatory compliance.",
    highlights: [
      "Human-in-command enforcement for sensitive actions",
      "Cross-agency policy coordination and logging",
      "Evidence bundles for oversight and legal review",
      "Resilience-ready automation with fail-safe controls",
    ],
  },
];

const outageBenefits = [
  "Dramatically reduce restoration time (SAIDI/SAIFI)",
  "Automate damage assessment and crew dispatch",
  "Eliminate unnecessary truck rolls",
  "Improve crew safety and efficiency",
  "Enhance customer satisfaction metrics",
];
const platformPillars = [
  {
    title: "Governance Core",
    description:
      "Policy templates, decision lifecycles, and approval chains that keep humans accountable for AI actions.",
  },
  {
    title: "Operational Intelligence",
    description:
      "Live observability, decision context, and risk analysis across distributed systems.",
  },
  {
    title: "Execution Control",
    description:
      "Command center for safe automation, controlled execution, and audit-grade evidence.",
  },
];

const philosophy = [
  {
    title: "AI with accountability",
    description: "Every recommendation is traceable to policy, evidence, and a named decision owner.",
  },
  {
    title: "Automation with approval",
    description: "Klynx orchestrates autonomous workflows only when humans approve the risk.",
  },
  {
    title: "Decisions with auditability",
    description: "Immutable audit trails and evidence bundles support compliance and oversight.",
  },
];

const stats = [
  { value: "30%", label: "Faster restoration decisions" },
  { value: "95%", label: "Reduction in manual approvals" },
  { value: "99%", label: "Audit completeness coverage" },
  { value: "20%", label: "Reliability gains in ops" },
];

const solutionGrid = [
  {
    title: "Klynx Dragon",
    description: "Governed command for AI decisions, approvals, and audit trails.",
    href: "#solution-dragon",
  },
  {
    title: "Smart Outage Restoration",
    description: "Policy-driven restoration workflows for critical infrastructure.",
    href: "#solution-outage",
  },
  {
    title: "Retail Intelligence",
    description: "Governed pricing, inventory, and promotion decisions.",
    href: "#solution-retail",
  },
  {
    title: "Banking & Risk",
    description: "Regulated decision governance for financial services.",
    href: "#solution-finance",
  },
  {
    title: "Public Safety & Government",
    description: "Mission-ready command for civic and national operations.",
    href: "#solution-public",
  },
  {
    title: "Utilities & Energy",
    description: "Grid intelligence with accountable automation and recovery.",
    href: "#solution-outage",
  },
];

const technology = [
  {
    title: "Realtime Event Fabric",
    description:
      "Streaming telemetry pipeline for logs, metrics, alerts, and compliance signals.",
  },
  {
    title: "Policy Decision Engine",
    description:
      "Deterministic policy evaluation layered above AI recommendations.",
  },
  {
    title: "Explainability and Audit",
    description:
      "Immutable evidence and traceability across every decision and approval.",
  },
];

const services = [
  {
    title: "Enterprise AI Readiness",
    description:
      "Architecture, policy design, and governance onboarding for regulated AI deployments.",
  },
  {
    title: "Operational Transformation",
    description:
      "Governed automation programs for DevOps, infrastructure, and security teams.",
  },
  {
    title: "Managed Governance",
    description:
      "Continuous policy tuning, audits, and compliance reporting for critical environments.",
  },
];

const insights = [
  {
    title: "Governed AI in Production",
    description: "Why policy-first AI is the only scalable path for autonomous operations.",
  },
  {
    title: "Operational Risk Intelligence",
    description: "How to convert observability into trusted decision workflows.",
  },
  {
    title: "Human-in-Command Design",
    description: "Designing approval chains that preserve accountability at scale.",
  },
];

const quickLinks = [
  "Home",
  "Solutions",
  "Platform",
  "Technology",
  "Services",
  "Insights",
];

const platformTabs = [
  "Governance Core",
  "Command & Control",
  "Observability Fabric",
  "Risk & Compliance",
];

const technologyTabs = [
  "IoT + Edge",
  "AI & ML",
  "Data Analytics",
];

const servicesTabs = [
  "Advisory",
  "Implementation",
  "Managed Governance",
];

export default function Home() {
  return (
    <div className="bg-surface text-slate-900">
      <div className="hero-glow" id="home" />
      <header className="site-header">
        <div className="container flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="logo-frame">
              <Image src="/klynx-logo.png" alt="Klynx AI" width={44} height={44} />
            </div>
            <div>
              <p className="text-lg font-semibold">Klynx AI</p>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Governed AI Systems</p>
            </div>
          </div>
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            {navItems.map((item) => (
              <div key={item.href} className="nav-item">
                <a href={item.href} className="nav-link">
                  {item.label}
                </a>
                {item.children && (
                  <div className="nav-dropdown">
                    {item.children.map((child) => (
                      <a key={child.href} href={child.href} className="nav-dropdown-link">
                        {child.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
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
          <div className="container grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <div className="pill">Enterprise Control Plane</div>
              <h1 className="hero-title">
                The Control Plane for Governed AI and Autonomous Operations
              </h1>
              <p className="hero-subtitle">
                Klynx AI unifies policy governance, agentic workflows, and real-time intelligence across mission-critical systems.
                Every recommendation is explainable, approved, and auditable.
              </p>
              <div className="flex flex-wrap gap-4">
                <a className="btn-primary" href="#contact">Request Demo</a>
                <a className="btn-outline" href="#platform">Explore Platform</a>
              </div>
              <div className="hero-trust">
                <span>Trusted</span>
                <span>Auditable</span>
                <span>Mission-Ready</span>
              </div>
            </div>
            <div className="info-card">
              <h3>Command Snapshot</h3>
              <ul>
                <li>Policy gating on every decision</li>
                <li>Live ops intelligence and anomaly routing</li>
                <li>Approval ledger with immutable audit</li>
                <li>Cross-domain orchestration surfaces</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="section stats-strip" id="stats">
          <div className="container stats-grid">
            {stats.map((stat) => (
              <div key={stat.label} className="stat-card">
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section" id="capabilities">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">Capabilities</p>
              <h2>Enterprise-grade autonomy without losing control</h2>
              <p>Built for governments, utilities, and mission-critical enterprises.</p>
            </div>
            <div className="card-grid">
              {capabilities.map((item) => (
                <div key={item.title} className="card">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="philosophy">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">Platform Philosophy</p>
              <h2>Governed intelligence, trusted execution</h2>
              <p>We build the control systems that let AI operate safely at scale.</p>
            </div>
            <div className="card-grid">
              {philosophy.map((item) => (
                <div key={item.title} className="card">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="solutions">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">Solutions</p>
              <h2>Mission-specific solutions for regulated environments</h2>
              <p>Each solution is governed, policy-first, and fully auditable.</p>
            </div>
            <div className="solution-grid">
              {solutionGrid.map((item) => (
                <a key={item.title} className="solution-tile" href={item.href}>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <span className="solution-link">Learn more →</span>
                </a>
              ))}
            </div>
            <div className="solution-stack">
              {solutions.map((item) => (
                <div key={item.id} className="solution-card">
                  <div>
                    <h3>{item.title}</h3>
                    <p className="solution-subtitle">{item.subtitle}</p>
                    <p>{item.description}</p>
                  </div>
                  <ul>
                    {item.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="solutions-details">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">Solution Detail</p>
              <h2>Built for real-world governance requirements</h2>
              <p>Each solution is tailored to industry-specific risk, compliance, and oversight needs.</p>
            </div>
            <div className="detail-grid">
              {solutionDetails.map((item) => (
                <div key={item.id} id={item.id} className="detail-card">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <ul>
                    {item.highlights.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="smart-outage">
          <div className="container outage-panel">
            <div>
              <p className="eyebrow">Smart Outage Restoration</p>
              <h2>Rapid, policy-governed restoration for critical infrastructure</h2>
              <p className="hero-subtitle">
                Klynx AI transforms outage response from manual workflows into real-time, policy-driven decisioning.
                We correlate sensor telemetry, OMS/DMS signals, and incident context to propose restoration actions,
                then route them through governed approvals before execution.
              </p>
              <p className="hero-subtitle">
                Every action is audit-ready, traceable, and optimized for safety, compliance, and customer impact.
              </p>
            </div>
            <div className="info-card">
              <h3>Key Benefits</h3>
              <ul>
                {outageBenefits.map((benefit) => (
                  <li key={benefit}>{benefit}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="section" id="platform">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">Platform</p>
              <h2>One platform. Every decision governed.</h2>
              <p>Combine policy, intelligence, and execution in a single control plane.</p>
            </div>
            <div className="tab-row">
              {platformTabs.map((item) => (
                <span key={item} className="tab-pill">{item}</span>
              ))}
            </div>
            <div className="card-grid">
              {platformPillars.map((item) => (
                <div key={item.title} className="card">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="technology">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">Technology</p>
              <h2>Built on trusted systems engineering</h2>
              <p>Secure, resilient, and designed for enterprise governance.</p>
            </div>
            <div className="tab-row">
              {technologyTabs.map((item) => (
                <span key={item} className="tab-pill">{item}</span>
              ))}
            </div>
            <div className="card-grid">
              {technology.map((item) => (
                <div key={item.title} className="card">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="services">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">Services</p>
              <h2>Partner with Klynx for transformation</h2>
              <p>Strategy, implementation, and managed governance support.</p>
            </div>
            <div className="tab-row">
              {servicesTabs.map((item) => (
                <span key={item} className="tab-pill">{item}</span>
              ))}
            </div>
            <div className="card-grid">
              {services.map((item) => (
                <div key={item.title} className="card">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="insights">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">Insights</p>
              <h2>Leadership for governed AI operations</h2>
              <p>Thought leadership on policy-first autonomy and accountable AI.</p>
            </div>
            <div className="card-grid">
              {insights.map((item) => (
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
              <p>Tell us about your program and we will respond within 24 hours.</p>
            </div>
            <div className="contact-card">
              <form className="contact-form" action="mailto:jkmohancrm@gmail.com" method="post" encType="text/plain">
                <div className="grid gap-4 md:grid-cols-2">
                  <input name="name" placeholder="Your name" required />
                  <input name="email" type="email" placeholder="Your email" required />
                </div>
                <input name="subject" placeholder="Subject" required />
                <textarea name="message" placeholder="Tell us about your needs" rows={4} required />
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
              Governed AI systems for critical infrastructure, enterprises, and public-sector leaders.
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
            <p className="footer-text">Book a demo or partnership call.</p>
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
