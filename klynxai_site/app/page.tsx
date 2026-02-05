import Image from "next/image";
import klynxLogo from "../public/klynx-logo.png";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "Problem", href: "#problem" },
  { label: "Solution", href: "#solution" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Core Capabilities", href: "#capabilities" },
  { label: "Industry domain packs", href: "#industries" },
  { label: "Trust & Differentiation", href: "#trust" },
  { label: "CTA", href: "#cta" },
];

const problemItems = [
  "Accountability",
  "Approval workflows",
  "Policy enforcement",
  "Audit trails",
];

const heroCards = [
  {
    title: "Accountability",
    description: "Track every AI decision back to its source",
    icon: "👤"
  },
  {
    title: "Approval workflows",
    description: "Multi-level review before execution",
    icon: "✓"
  },
  {
    title: "Policy enforcement",
    description: "Automated compliance with your rules",
    icon: "🛡️"
  },
  {
    title: "Audit trails",
    description: "Complete chain of custody for every action",
    icon: "📋"
  },
];

const solutionSteps = [
  "Every AI decision is evaluated against policy",
  "Risk is scored before action",
  "Approvals are enforced automatically",
  "Every decision is logged, explainable, and auditable",
];

const governedItems = [
  "AI recommendations",
  "Production changes",
  "Incident actions",
  "CI/CD fixes",
  "Financial or pricing decisions",
  "Data access & model behavior",
];

const differentiationRows = [
  { left: "Suggests", right: "Decides with permission" },
  { left: "No guardrails", right: "Policy-first" },
  { left: "Black box", right: "Fully explainable" },
  { left: "No audit", right: "Enterprise-grade audit" },
];

const metrics = [
  { value: "99.9%", label: "Compliance Rate", sublabel: "Across all governed actions" },
  { value: "< 2min", label: "Avg Approval Time", sublabel: "From request to decision" },
  { value: "100%", label: "Audit Coverage", sublabel: "Every decision tracked" },
  { value: "80%", label: "Risk Reduction", sublabel: "In AI-related incidents" },
];

const trustedCompanies = [
  "Fortune 500 Enterprises",
  "Financial Services Leaders",
  "Healthcare Innovators",
  "Manufacturing Giants",
];

const faqs = [
  {
    question: "How long does implementation take?",
    answer: "Most enterprises are live within 2 weeks with our guided setup and dedicated support team."
  },
  {
    question: "Does this slow down our AI systems?",
    answer: "No. Dragon adds <50ms latency with parallel processing and intelligent caching."
  },
  {
    question: "What if we already have governance tools?",
    answer: "Dragon integrates seamlessly with existing tools like ServiceNow, Jira, Slack, and your custom workflows."
  },
  {
    question: "How do you ensure data security?",
    answer: "We're SOC 2 Type II certified, GDPR compliant, and support on-premise deployment for sensitive environments."
  },
  {
    question: "Can we customize approval workflows?",
    answer: "Yes. Dragon offers a no-code workflow builder with unlimited customization for your specific policies."
  },
];

export default function Home() {
  return (
    <div className="bg-surface">
      <div className="hero-glow" id="home" />
      <header className="site-header">
        <div className="container header-grid">
          <div className="brand-lockup">
            <div className="logo-frame">
              <Image src={klynxLogo} alt="Klynx AI" width={52} height={52} priority />
            </div>
            <div>
              <p className="brand-name">Klynx AI</p>
              <p className="brand-tagline">Governed AI Systems</p>
            </div>
          </div>
          <nav className="site-nav">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="nav-link">
                {item.label}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            <a className="btn-ghost" href="#cta">Request a Demo</a>
            <a className="btn-primary" href="#how-it-works">See How Governance Works</a>
          </div>
        </div>
      </header>

      <main>
        <section className="section hero" id="home">
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="hero-kicker">Dragon by Klynx AI</p>
              <h1 className="hero-title">Governed AI Decision-Making for the Real World</h1>
              <p className="hero-subtitle">
                Dragon is the control plane for AI-powered decisions — enforcing policy, approvals,
                auditability, and accountability across every AI action before it impacts real systems.
              </p>
              <p className="hero-callout">AI that acts — only when allowed.</p>
              <div className="hero-actions">
                <a className="btn-primary" href="#cta">Request a Demo</a>
                <a className="btn-ghost" href="#how-it-works">See How Governance Works</a>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-visual-shell nsmart-panel">
                <div className="pattern-grid" aria-hidden="true" />
                <div className="pattern-node node-top" aria-hidden="true" />
                <div className="pattern-node node-bottom" aria-hidden="true" />
                {heroCards.map((card, index) => (
                  <div key={card.title} className={`pattern-card card-${['one', 'two', 'three', 'four'][index]}`}>
                    <div className="pattern-icon">
                      <span className="pattern-icon-emoji">{card.icon}</span>
                    </div>
                    <div>
                      <h3>{card.title}</h3>
                      <p className="pattern-card-desc">{card.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="metrics-section">
          <div className="container">
            <p className="metrics-kicker">Trusted by enterprises worldwide</p>
            <div className="metrics-grid">
              {metrics.map((metric) => (
                <div key={metric.label} className="metric-card">
                  <div className="metric-value">{metric.value}</div>
                  <div className="metric-label">{metric.label}</div>
                  <div className="metric-sublabel">{metric.sublabel}</div>
                </div>
              ))}
            </div>
            <div className="trusted-by">
              <p className="trusted-label">Trusted by:</p>
              <div className="trusted-companies">
                {trustedCompanies.map((company) => (
                  <span key={company} className="trusted-company">{company}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="problem">
          <div className="container section-grid">
            <div>
              <p className="eyebrow">The Problem</p>
              <h2 className="section-title">The Problem</h2>
              <p className="section-lead">
                AI systems today can recommend actions, but they lack:
              </p>
              <ul className="bullet-list">
                {problemItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="section-lead">
                This creates risk in regulated, enterprise, and high-impact environments.
              </p>
              <p className="section-lead">Uncontrolled AI decisions break trust.</p>
            </div>
            <div className="info-card">
              <p className="section-lead">
                AI systems today can recommend actions, but they lack:
              </p>
              <ul className="bullet-list">
                {problemItems.map((item) => (
                  <li key={`${item}-repeat`}>{item}</li>
                ))}
              </ul>
              <p className="section-lead">
                This creates risk in regulated, enterprise, and high-impact environments.
              </p>
              <p className="section-lead">Uncontrolled AI decisions break trust.</p>
            </div>
          </div>
        </section>

        <section className="section section-contrast" id="solution">
          <div className="container section-grid">
            <div>
              <p className="eyebrow">The Klynx Solution</p>
              <h2 className="section-title">The Klynx Solution</h2>
              <p className="section-lead">Dragon introduces human-in-the-loop AI governance:</p>
              <ul className="bullet-list">
                {solutionSteps.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="section-lead">Dragon doesn’t replace humans — it protects them.</p>
            </div>
            <div className="info-card">
              <p className="section-lead">Dragon introduces human-in-the-loop AI governance:</p>
              <ul className="bullet-list">
                {solutionSteps.map((item) => (
                  <li key={`${item}-repeat`}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="section" id="how-it-works">
          <div className="container">
            <p className="eyebrow">How It Works</p>
            <h2 className="section-title">How It Works</h2>
            <p className="section-lead">Dragon introduces human-in-the-loop AI governance:</p>
            <ul className="bullet-list grid-list">
              {solutionSteps.map((item) => (
                <li key={`${item}-how`}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section section-contrast" id="capabilities">
          <div className="container">
            <p className="eyebrow">Core Capabilities</p>
            <h2 className="section-title">What Dragon Governs</h2>
            <ul className="bullet-list grid-list">
              {governedItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section" id="industries">
          <div className="container">
            <p className="eyebrow">Industry domain packs</p>
            <h2 className="section-title">Industry domain packs</h2>
            <ul className="bullet-list grid-list">
              {governedItems.map((item) => (
                <li key={`${item}-industry`}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section section-contrast" id="trust">
          <div className="container">
            <p className="eyebrow">Trust & Differentiation</p>
            <h2 className="section-title">Why Dragon Is Different</h2>
            <div className="comparison-table">
              <div className="comparison-row comparison-head">
                <span>Traditional AI</span>
                <span>Dragon</span>
              </div>
              {differentiationRows.map((row) => (
                <div key={row.left} className="comparison-row">
                  <span>{row.left}</span>
                  <span>{row.right}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="faq">
          <div className="container">
            <p className="eyebrow">Frequently Asked Questions</p>
            <h2 className="section-title">Got Questions? We Have Answers</h2>
            <div className="faq-grid">
              {faqs.map((faq, index) => (
                <div key={index} className="faq-item">
                  <h3 className="faq-question">{faq.question}</h3>
                  <p className="faq-answer">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section cta" id="cta">
          <div className="container cta-card">
            <div>
              <h2 className="section-title">Ready to Govern Your AI?</h2>
              <p className="section-lead">Join 500+ enterprises using Dragon to ensure AI accountability.</p>
              <p className="cta-urgency">🎯 Limited time: Free governance assessment for first 50 sign-ups</p>
            </div>
            <div className="cta-actions">
              <a className="btn-primary btn-large" href="#cta">Start Free 30-Day Trial</a>
              <a className="btn-ghost" href="#how-it-works">See Dragon in 2 Minutes</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <Image src={klynxLogo} alt="Klynx AI" width={54} height={54} />
            </div>
            <p className="footer-brand-name">Klynx AI</p>
            <p className="footer-text">
              Dragon is the control plane for governed AI decisions in regulated and high-impact environments.
            </p>
          </div>
          <div className="footer-column">
            <p className="footer-title">Quick Links</p>
            <ul>
              <li><a href="#home">Home</a></li>
              <li><a href="#solution">Solution</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <p className="footer-title">Resources</p>
            <ul>
              <li><a href="#capabilities">Core Capabilities</a></li>
              <li><a href="#industries">Industry Packs</a></li>
              <li><a href="#trust">Trust & Security</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <p className="footer-title">Actions</p>
            <ul>
              <li><a href="#cta">Request a Demo</a></li>
              <li><a href="#how-it-works">See How Governance Works</a></li>
              <li><a href="#cta">Book Enterprise Demo</a></li>
            </ul>
          </div>
          <div className="footer-column footer-contact">
            <p className="footer-title">Contact Us</p>
            <p className="footer-text">support@klynxai.com</p>
            <p className="footer-text">+1 (252) 263-7729</p>
            <div className="footer-socials">
              <a href="#" className="social-icon" aria-label="LinkedIn">
                <span>in</span>
              </a>
              <a href="#" className="social-icon" aria-label="Facebook">
                <span>f</span>
              </a>
              <a href="#" className="social-icon" aria-label="X (Twitter)">
                <span>𝕏</span>
              </a>
            </div>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© 2026 Klynx AI. All rights reserved.</span>
          <span><a href="#privacy">Privacy Policy</a> | <a href="#terms">Terms and Conditions</a></span>
        </div>
      </footer>
    </div>
  );
}
