import Image from "next/image";
import klynxLogo from "../public/klynx-logo.png";

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
      { label: "Governance Core", href: "#governance" },
      { label: "DevSecOps", href: "#devsecops" },
      { label: "Agentic AI", href: "#agentic" },
    ],
  },
  {
    label: "Technology",
    href: "#technology",
    children: [
      { label: "Realtime Fabric", href: "#technology" },
      { label: "Policy Engine", href: "#technology" },
      { label: "Audit Evidence", href: "#technology" },
    ],
  },
  {
    label: "Services",
    href: "#services",
    children: [
      { label: "Advisory", href: "#services" },
      { label: "Implementation", href: "#services" },
      { label: "Managed Governance", href: "#services" },
    ],
  },
  { label: "Insights", href: "#insights" },
  { label: "Contact", href: "#contact" },
];

const heroSignals = [
  {
    title: "Policy Enforcement",
    description: "Rules-based gating for every AI decision and automation action.",
  },
  {
    title: "Command Intelligence",
    description: "Live operational telemetry that sharpens approvals in real time.",
  },
  {
    title: "Secure Orchestration",
    description: "Governed execution across cloud, security, and infrastructure tools.",
  },
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

const solutionCards = [
  {
    id: "solution-dragon",
    title: "Klynx Dragon",
    description: "Governed command for AI decisions, approvals, and audit trails.",
  },
  {
    id: "solution-outage",
    title: "Smart Outage Restoration",
    description: "Policy-driven restoration workflows for critical infrastructure.",
  },
  {
    id: "solution-retail",
    title: "Retail Intelligence",
    description: "Governed pricing, inventory, and promotion decisions.",
  },
  {
    id: "solution-finance",
    title: "Banking & Risk",
    description: "Regulated decision governance for financial services.",
  },
  {
    id: "solution-public",
    title: "Public Safety & Government",
    description: "Mission-ready command for civic and national operations.",
  },
  {
    id: "solution-utilities",
    title: "Utilities & Energy",
    description: "Grid intelligence with accountable automation and recovery.",
  },
];

const solutionDetails = [
  {
    id: "solution-dragon",
    title: "Klynx Dragon - Governed Command",
    subtitle: "Policy-gated command and approval for critical AI operations.",
    description:
      "Klynx Dragon provides a governed decision plane for high-stakes actions. It enforces role-based approvals, audit-grade evidence, and decision context across every step of AI-driven operations.",
    benefits: [
      "Decision registry with immutable audit",
      "Policy gating for all actions",
      "Human override with signed approvals",
      "Enterprise-grade risk scoring",
    ],
  },
  {
    id: "solution-outage",
    title: "Smart Outage Restoration",
    subtitle: "Restore services faster with governed automation.",
    description:
      "Transform outage response into a rapid, data-driven workflow. Klynx AI correlates sensor data, incident signals, and operational context to recommend safe restoration paths under human approval.",
    benefits: [
      "Detect faults within minutes, not hours",
      "Prioritize critical infrastructure first",
      "Dispatch crews with verified action plans",
      "Audit-ready evidence for every decision",
    ],
  },
  {
    id: "solution-retail",
    title: "Retail Intelligence",
    subtitle: "Govern pricing, inventory, and promotions with accountability.",
    description:
      "Klynx AI converts retail recommendations into governed decisions. Every price change or inventory action is vetted against policy thresholds and risk constraints.",
    benefits: [
      "Policy checks on margin and risk",
      "Approval routing for high-impact changes",
      "Decision queue and audit history",
      "Executive visibility across retail actions",
    ],
  },
  {
    id: "solution-finance",
    title: "Banking & Risk",
    subtitle: "Regulated decision governance for financial services.",
    description:
      "Secure high-impact financial operations with transparent approvals, risk scoring, and evidence bundles aligned to regulatory oversight.",
    benefits: [
      "Dual approval for high-impact actions",
      "Regulatory evidence bundles on demand",
      "Risk scoring with override escalation",
      "Decision accountability reporting",
    ],
  },
  {
    id: "solution-public",
    title: "Public Safety & Government",
    subtitle: "Mission-ready command for civic and national operations.",
    description:
      "Coordinate interagency decisions with human-in-command enforcement, cross-domain policy alignment, and resilience-ready automation.",
    benefits: [
      "Human-in-command enforcement for sensitive actions",
      "Cross-agency policy coordination and logging",
      "Evidence bundles for oversight and legal review",
      "Resilience-ready automation with fail-safe controls",
    ],
  },
  {
    id: "solution-utilities",
    title: "Utilities & Energy",
    subtitle: "Grid intelligence with accountable automation and recovery.",
    description:
      "Align restoration, maintenance, and safety actions to policy guardrails with real-time evidence capture and approval workflows.",
    benefits: [
      "Policy-driven restoration sequencing",
      "Automated damage assessment support",
      "Crew dispatch with verified playbooks",
      "Audit-ready compliance trails",
    ],
  },
];

const technologyItems = [
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
    title: "Explainability & Audit",
    description:
      "Immutable evidence and traceability across every decision and approval.",
  },
];

const servicesItems = [
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

const insightsItems = [
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

const quickLinks = [
  "Home",
  "Solutions",
  "Platform",
  "Technology",
  "Services",
  "Insights",
];

const footerInsights = ["Governed AI in Production", "Operational Risk Intelligence", "Human-in-Command Design"];
const footerTechnology = ["AI & Machine Learning", "Data Analytics", "IoT + Edge"];
const footerContact = {
  phone: "+1 252 263 7729",
  email: "support@klynxai.com",
};

export default function Home() {
  return (
    <div className="bg-surface text-slate-900">
      <div className="hero-glow" id="home" />
      <div className="motion-grid" aria-hidden="true" />
      <header className="site-header">
        <div className="container flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="logo-frame">
              <div className="logo-core">
                <Image src={klynxLogo} alt="Klynx AI" width={42} height={42} priority />
              </div>
            </div>
            <div>
              <p className="brand-name">
                <span className="brand-gradient">Klynx AI</span>
              </p>
              <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Governed AI Systems</p>
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
          <div className="container hero-grid">
            <div className="space-y-6">
              <div className="pill">Enterprise Control Plane</div>
              <h1 className="hero-title">
                The control plane for governed AI and autonomous operations
              </h1>
              <p className="hero-subtitle">
                Klynx AI unifies policy governance, agentic workflows, and real-time intelligence
                across mission-critical systems. Every recommendation is explainable, approved,
                and auditable.
              </p>
              <div className="flex flex-wrap gap-4">
                <a className="btn-primary" href="#solutions">Discover Solutions</a>
                <a className="btn-outline" href="#contact">Book a Demo</a>
              </div>
              <div className="hero-trust">
                <span>Trusted</span>
                <span>Auditable</span>
                <span>Mission-Ready</span>
              </div>
            </div>
            <div className="hero-panel">
              <div className="hero-panel-grid">
                {heroSignals.map((signal) => (
                  <div key={signal.title} className="hero-panel-card">
                    <div className="hero-panel-icon" />
                    <div>
                      <h3>{signal.title}</h3>
                      <p>{signal.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="hero-panel-summary">
                <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Governance Cockpit</p>
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
              <p>Combine policy, intelligence, and execution in a single control plane.</p>
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

        <section className="section" id="solutions">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">Solutions</p>
              <h2>Mission-specific solutions for regulated environments</h2>
              <p>Each solution is governed, policy-first, and fully auditable.</p>
            </div>
            <div className="solution-grid">
              {solutionCards.map((item) => (
                <div key={item.id} id={item.id} className="solution-card">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <a className="solution-link" href={`#detail-${item.id}`}>
                    Learn more -&gt;
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-contrast" id="solution-detail">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">Solution Detail</p>
              <h2>Built for real-world governance requirements</h2>
              <p>Each solution is tailored to industry-specific risk, compliance, and oversight needs.</p>
            </div>
            <div className="detail-stack">
              {solutionDetails.map((item) => (
                <div key={item.id} id={`detail-${item.id}`} className="detail-card">
                  <div className="detail-grid">
                    <div>
                      <h3>{item.title}</h3>
                      <p className="detail-subtitle">{item.subtitle}</p>
                      <p className="detail-description">{item.description}</p>
                    </div>
                    <div className="detail-panel">
                      <h4>Key Benefits</h4>
                      <ul>
                        {item.benefits.map((benefit) => (
                          <li key={benefit}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
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

        <section className="section section-contrast" id="technology">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">Technology</p>
              <h2>Built on trusted systems engineering</h2>
              <p>Secure, resilient, and designed for enterprise governance.</p>
            </div>
            <div className="card-grid">
              {technologyItems.map((item) => (
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
            <div className="card-grid">
              {servicesItems.map((item) => (
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
              {insightsItems.map((item) => (
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
              <form className="contact-form" action="mailto:support@klynxai.com" method="post" encType="text/plain">
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
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="logo-core">
                <Image src={klynxLogo} alt="Klynx AI" width={48} height={48} />
              </div>
            </div>
            <p className="footer-title">
              <span className="brand-gradient">Klynx AI</span>
            </p>
            <p className="footer-text">
              Governed AI systems delivering policy-first control for critical infrastructure and regulated
              enterprises. Every decision stays accountable, auditable, and mission-ready.
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
            <p className="footer-title">Insights</p>
            <ul>
              {footerInsights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="footer-title">Technology</p>
            <ul>
              {footerTechnology.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="footer-title">Contact Us</p>
            <p className="footer-text">{footerContact.phone}</p>
            <p className="footer-text">{footerContact.email}</p>
            <div className="footer-socials">
              <span className="social-chip">in</span>
              <span className="social-chip">f</span>
              <span className="social-chip">x</span>
            </div>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>(c) 2026 Klynx AI. All rights reserved.</span>
          <span>Privacy Policy | Terms and Conditions</span>
        </div>
      </footer>
    </div>
  );
}
