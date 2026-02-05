'use client';

import Image from "next/image";
import { useState } from "react";
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
  {
    feature: "Decision Authority",
    traditional: "Suggests only",
    traditionIcon: "💭",
    dragon: "Decides with permission",
    dragonIcon: "✅",
    benefit: "80% faster decisions"
  },
  {
    feature: "Policy Control",
    traditional: "No guardrails",
    traditionIcon: "❌",
    dragon: "Policy-first enforcement",
    dragonIcon: "🛡️",
    benefit: "100% compliance"
  },
  {
    feature: "Transparency",
    traditional: "Black box",
    traditionIcon: "🔒",
    dragon: "Fully explainable",
    dragonIcon: "📖",
    benefit: "Complete visibility"
  },
  {
    feature: "Audit Trail",
    traditional: "No audit logs",
    traditionIcon: "📄",
    dragon: "Enterprise-grade audit",
    dragonIcon: "📋",
    benefit: "Regulatory ready"
  },
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

const useCases = [
  {
    industry: "Financial Services",
    icon: "💰",
    challenge: "SEC compliance for AI trading decisions",
    solution: "Automated approval chains with full audit logs",
    result: "100% regulatory compliance",
    metrics: "Zero violations in 2+ years"
  },
  {
    industry: "Healthcare",
    icon: "🏥",
    challenge: "HIPAA-compliant AI patient recommendations",
    solution: "Policy enforcement with explainable AI",
    result: "Zero compliance violations",
    metrics: "45% faster diagnosis approval"
  },
  {
    industry: "Manufacturing",
    icon: "🏭",
    challenge: "Quality control AI decisions impact production",
    solution: "Multi-stakeholder approval before line changes",
    result: "80% reduction in recalls",
    metrics: "$2.4M saved annually"
  },
];

const testimonials = [
  {
    quote: "Dragon reduced our AI governance overhead by 80% while improving compliance.",
    author: "Sarah Chen",
    role: "CTO",
    company: "Fortune 500 Financial Services",
    avatar: "👩‍💼"
  },
  {
    quote: "We couldn't deploy AI in production without Dragon. The audit trail alone is worth it.",
    author: "Michael Rodriguez",
    role: "VP of Engineering",
    company: "Healthcare Tech Leader",
    avatar: "👨‍💻"
  },
  {
    quote: "Dragon paid for itself in 3 months by preventing one major compliance issue.",
    author: "Emily Watson",
    role: "Chief Risk Officer",
    company: "Global Manufacturing Corp",
    avatar: "👩‍💼"
  },
];

const securityBadges = [
  { name: "SOC 2 Type II", icon: "🔒", description: "Security certified" },
  { name: "ISO 27001", icon: "🛡️", description: "Information security" },
  { name: "GDPR", icon: "🇪🇺", description: "EU compliant" },
  { name: "HIPAA", icon: "🏥", description: "Healthcare ready" },
];

export default function Home() {
  const [aiDecisions, setAiDecisions] = useState(100);
  const [reviewTime, setReviewTime] = useState(2);
  const [hourlyRate, setHourlyRate] = useState(150);

  // Calculate ROI
  const decisionsPerYear = aiDecisions * 365;
  const hoursPerYear = (reviewTime * decisionsPerYear) / 60;
  const currentCost = hoursPerYear * hourlyRate;
  const dragonCost = 50000; // Annual Dragon cost (example)
  const timeSavings = 0.8; // 80% time reduction
  const savings = currentCost * timeSavings - dragonCost;
  const roi = ((savings / dragonCost) * 100).toFixed(0);

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

        <section className="section" id="use-cases">
          <div className="container">
            <p className="eyebrow">Customer Success Stories</p>
            <h2 className="section-title">See Dragon in Action</h2>
            <p className="section-lead">Real results from enterprises using Dragon to govern their AI</p>
            <div className="use-cases-grid">
              {useCases.map((useCase) => (
                <div key={useCase.industry} className="use-case-card">
                  <div className="use-case-icon">{useCase.icon}</div>
                  <h3 className="use-case-industry">{useCase.industry}</h3>
                  <div className="use-case-content">
                    <div className="use-case-item">
                      <strong>Challenge:</strong> {useCase.challenge}
                    </div>
                    <div className="use-case-item">
                      <strong>Solution:</strong> {useCase.solution}
                    </div>
                    <div className="use-case-result">
                      <span className="result-badge">{useCase.result}</span>
                      <p className="result-metric">{useCase.metrics}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-contrast" id="testimonials">
          <div className="container">
            <p className="eyebrow">What Our Customers Say</p>
            <h2 className="section-title">Trusted by Industry Leaders</h2>
            <div className="testimonials-grid">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="testimonial-card">
                  <div className="testimonial-quote">"{testimonial.quote}"</div>
                  <div className="testimonial-author">
                    <div className="testimonial-avatar">{testimonial.avatar}</div>
                    <div>
                      <div className="testimonial-name">{testimonial.author}</div>
                      <div className="testimonial-role">{testimonial.role}</div>
                      <div className="testimonial-company">{testimonial.company}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
            <div className="comparison-table-enhanced">
              <div className="comparison-header">
                <div className="comparison-col-header">Feature</div>
                <div className="comparison-col-header">Traditional AI</div>
                <div className="comparison-col-header highlight">Dragon</div>
                <div className="comparison-col-header">Benefit</div>
              </div>
              {differentiationRows.map((row, index) => (
                <div key={index} className="comparison-row-enhanced">
                  <div className="comparison-feature">{row.feature}</div>
                  <div className="comparison-cell">
                    <span className="comparison-icon">{row.traditionIcon}</span>
                    <span>{row.traditional}</span>
                  </div>
                  <div className="comparison-cell highlight">
                    <span className="comparison-icon">{row.dragonIcon}</span>
                    <span>{row.dragon}</span>
                  </div>
                  <div className="comparison-benefit">{row.benefit}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-contrast" id="roi-calculator">
          <div className="container">
            <p className="eyebrow">ROI Calculator</p>
            <h2 className="section-title">Calculate Your Savings</h2>
            <p className="section-lead">See how much Dragon can save your organization</p>

            <div className="roi-calculator">
              <div className="roi-inputs">
                <div className="roi-input-group">
                  <label htmlFor="aiDecisions">AI Decisions Per Day</label>
                  <input
                    id="aiDecisions"
                    type="number"
                    value={aiDecisions}
                    onChange={(e) => setAiDecisions(Number(e.target.value))}
                    min="1"
                    max="10000"
                  />
                </div>
                <div className="roi-input-group">
                  <label htmlFor="reviewTime">Manual Review Time (minutes)</label>
                  <input
                    id="reviewTime"
                    type="number"
                    value={reviewTime}
                    onChange={(e) => setReviewTime(Number(e.target.value))}
                    min="1"
                    max="60"
                  />
                </div>
                <div className="roi-input-group">
                  <label htmlFor="hourlyRate">Average Hourly Rate ($)</label>
                  <input
                    id="hourlyRate"
                    type="number"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    min="50"
                    max="500"
                  />
                </div>
              </div>

              <div className="roi-results">
                <div className="roi-result-card">
                  <div className="roi-result-label">Annual Cost Without Dragon</div>
                  <div className="roi-result-value">${currentCost.toLocaleString('en-US', {maximumFractionDigits: 0})}</div>
                </div>
                <div className="roi-result-card highlight">
                  <div className="roi-result-label">Annual Savings With Dragon</div>
                  <div className="roi-result-value">${Math.max(0, savings).toLocaleString('en-US', {maximumFractionDigits: 0})}</div>
                </div>
                <div className="roi-result-card">
                  <div className="roi-result-label">ROI</div>
                  <div className="roi-result-value">{Math.max(0, Number(roi))}%</div>
                </div>
                <div className="roi-result-card">
                  <div className="roi-result-label">Time Saved Per Year</div>
                  <div className="roi-result-value">{(hoursPerYear * timeSavings).toLocaleString('en-US', {maximumFractionDigits: 0})} hours</div>
                </div>
              </div>

              <div className="roi-cta">
                <p>💡 Based on 80% reduction in manual review time</p>
                <a href="#cta" className="btn-primary">Start Your Free Trial</a>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="security">
          <div className="container">
            <p className="eyebrow">Security & Compliance</p>
            <h2 className="section-title">Enterprise-Grade Security</h2>
            <p className="section-lead">Trusted by regulated industries worldwide</p>

            <div className="security-badges-grid">
              {securityBadges.map((badge) => (
                <div key={badge.name} className="security-badge">
                  <div className="security-badge-icon">{badge.icon}</div>
                  <div className="security-badge-name">{badge.name}</div>
                  <div className="security-badge-desc">{badge.description}</div>
                </div>
              ))}
            </div>

            <div className="security-features">
              <div className="security-feature">
                <h3>🔐 Data Encryption</h3>
                <p>End-to-end encryption for all data in transit and at rest</p>
              </div>
              <div className="security-feature">
                <h3>🏢 On-Premise Option</h3>
                <p>Deploy Dragon in your own infrastructure for maximum control</p>
              </div>
              <div className="security-feature">
                <h3>📊 Regular Audits</h3>
                <p>Third-party security audits and penetration testing</p>
              </div>
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
