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
                <div className="pattern-card card-one">
                  <div className="pattern-icon" />
                  <div>
                    <h3>Accountability</h3>
                  </div>
                </div>
                <div className="pattern-card card-two">
                  <div className="pattern-icon" />
                  <div>
                    <h3>Approval workflows</h3>
                  </div>
                </div>
                <div className="pattern-card card-three">
                  <div className="pattern-icon" />
                  <div>
                    <h3>Policy enforcement</h3>
                  </div>
                </div>
                <div className="pattern-card card-four">
                  <div className="pattern-icon" />
                  <div>
                    <h3>Audit trails</h3>
                  </div>
                </div>
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

        <section className="section cta" id="cta">
          <div className="container cta-card">
            <div>
              <h2 className="section-title">Dragon by Klynx AI</h2>
              <p className="section-lead">AI that acts — only when allowed.</p>
            </div>
            <div className="cta-actions">
              <a className="btn-primary" href="#cta">Book Enterprise Demo</a>
              <a className="btn-ghost" href="#how-it-works">View Governance Flow</a>
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
            <p className="footer-title">Klynx AI</p>
            <p className="footer-text">
              Dragon is the control plane for governed AI decisions in regulated and high-impact environments.
            </p>
          </div>
          <div>
            <p className="footer-title">Contact</p>
            <p className="footer-text">support@klynxai.com</p>
            <p className="footer-text">+1 (252) 263-7729</p>
          </div>
          <div>
            <p className="footer-title">Actions</p>
            <ul>
              <li>Request a Demo</li>
              <li>See How Governance Works</li>
              <li>Book Enterprise Demo</li>
            </ul>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© 2026 Klynx AI. All rights reserved.</span>
          <span>Privacy Policy | Terms and Conditions</span>
        </div>
      </footer>
    </div>
  );
}
