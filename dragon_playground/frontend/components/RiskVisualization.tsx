'use client';

import React, { useState, useEffect } from 'react';

interface DecisionResult {
  decision_id: string;
  risk_assessment: {
    risk_level: string;
    risk_score: number;
    blast_radius: string;
    data_risk: string;
    rollback_complexity: string;
    reversibility: number;
    policy_triggers?: string[];
  };
  decision_gate: {
    required: boolean;
    approvers: string[];
    estimated_time: string;
    auto_approved: boolean;
  };
  status: string;
}

interface RiskVisualizationProps {
  decisionResult: DecisionResult;
  scenarioTitle?: string;
}

type AnalysisStage = 'receiving' | 'analyzing' | 'evaluating' | 'complete';

export default function RiskVisualization({ decisionResult, scenarioTitle }: RiskVisualizationProps) {
  const [stage, setStage] = useState<AnalysisStage>('receiving');
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    // Simulate real-time analysis progress
    const timeline = [
      { stage: 'receiving' as AnalysisStage, delay: 100 },
      { stage: 'analyzing' as AnalysisStage, delay: 500 },
      { stage: 'evaluating' as AnalysisStage, delay: 700 },
      { stage: 'complete' as AnalysisStage, delay: 400 },
    ];

    let currentDelay = 0;
    timeline.forEach(({ stage, delay }) => {
      currentDelay += delay;
      setTimeout(() => setStage(stage), currentDelay);
    });

    // Show final result
    setTimeout(() => setShowResult(true), currentDelay + 200);
  }, []);

  const { risk_assessment, decision_gate } = decisionResult;

  const getRiskColor = (level: string) => {
    switch (level.toUpperCase()) {
      case 'CRITICAL':
        return '#ef4444';
      case 'HIGH':
        return '#f59e0b';
      case 'MEDIUM':
        return '#eab308';
      case 'LOW':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getRiskEmoji = (level: string) => {
    switch (level.toUpperCase()) {
      case 'CRITICAL':
        return '💣';
      case 'HIGH':
        return '🔴';
      case 'MEDIUM':
        return '🟡';
      case 'LOW':
        return '🟢';
      default:
        return '⚪';
    }
  };

  const getValueScore = (value: string | number): number => {
    if (typeof value === 'number') return value;

    const lowerValue = value.toLowerCase();
    if (lowerValue.includes('critical') || lowerValue.includes('high')) return 85;
    if (lowerValue.includes('medium') || lowerValue.includes('moderate')) return 60;
    if (lowerValue.includes('low') || lowerValue.includes('minimal')) return 30;
    return 50;
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/playground/results/${decisionResult.decision_id}`;
    const shareText = `🐉 Dragon AI caught this: ${scenarioTitle || 'Decision'} - Risk Score: ${risk_assessment.risk_score}/100 ${getRiskEmoji(risk_assessment.risk_level)}`;

    if (navigator.share) {
      navigator.share({
        title: 'Dragon AI Governance Result',
        text: shareText,
        url: shareUrl,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      alert('Result link copied to clipboard!');
    }
  };

  return (
    <div className="risk-visualization">
      <h2 className="visualization-title">
        🐉 Dragon is analyzing your decision...
      </h2>

      {/* Analysis Timeline */}
      <div className="analysis-timeline">
        <div className={`timeline-step ${stage !== 'receiving' ? 'complete' : 'active'}`}>
          <div className="step-icon">
            {stage !== 'receiving' ? '✓' : '⏳'}
          </div>
          <div className="step-content">
            <div className="step-label">Request received</div>
            <div className="step-time">0.1s</div>
          </div>
        </div>

        <div className={`timeline-step ${stage === 'complete' || stage === 'evaluating' ? 'complete' : stage === 'analyzing' ? 'active' : ''}`}>
          <div className="step-icon">
            {stage === 'complete' || stage === 'evaluating' ? '✓' : stage === 'analyzing' ? '⏳' : '○'}
          </div>
          <div className="step-content">
            <div className="step-label">Risk assessment</div>
            <div className="step-time">0.5s</div>
          </div>
        </div>

        <div className={`timeline-step ${stage === 'complete' ? 'complete' : stage === 'evaluating' ? 'active' : ''}`}>
          <div className="step-icon">
            {stage === 'complete' ? '✓' : stage === 'evaluating' ? '⏳' : '○'}
          </div>
          <div className="step-content">
            <div className="step-label">Policy evaluation</div>
            <div className="step-time">0.7s</div>
          </div>
        </div>
      </div>

      {/* Risk Assessment Results */}
      {showResult && (
        <div className="risk-results fadeIn">
          {/* Risk Score Gauge */}
          <div className="risk-gauge-container">
            <div className="gauge-header">
              <h3>Risk Score</h3>
              <div
                className="risk-score-badge"
                style={{ backgroundColor: getRiskColor(risk_assessment.risk_level) }}
              >
                {getRiskEmoji(risk_assessment.risk_level)} {risk_assessment.risk_level}
              </div>
            </div>

            <div className="gauge-display">
              <div className="gauge-value">{risk_assessment.risk_score}/100</div>
              <div className="gauge-bar-container">
                <div
                  className="gauge-bar-fill"
                  style={{
                    width: `${risk_assessment.risk_score}%`,
                    backgroundColor: getRiskColor(risk_assessment.risk_level),
                  }}
                />
              </div>
            </div>
          </div>

          {/* Risk Breakdown */}
          <div className="risk-breakdown">
            <h3>Risk Breakdown</h3>
            <div className="breakdown-bars">
              <RiskBar
                label="Blast Radius"
                value={getValueScore(risk_assessment.blast_radius)}
                icon="💥"
              />
              <RiskBar
                label="Data Risk"
                value={getValueScore(risk_assessment.data_risk)}
                icon="🗄️"
              />
              <RiskBar
                label="Rollback Complexity"
                value={getValueScore(risk_assessment.rollback_complexity)}
                icon="↩️"
              />
              <RiskBar
                label="Reversibility"
                value={100 - risk_assessment.reversibility}
                icon="🔄"
              />
            </div>
          </div>

          {/* Policy Triggers */}
          {risk_assessment.policy_triggers && risk_assessment.policy_triggers.length > 0 && (
            <div className="policy-triggers">
              <h3>Policy Triggers Detected</h3>
              <div className="triggers-list">
                {risk_assessment.policy_triggers.map((trigger, index) => (
                  <div key={index} className="trigger-item">
                    <span className="trigger-icon">⚠️</span>
                    <span>{trigger}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Decision Gate */}
          <div className={`decision-gate ${decision_gate.required ? 'blocked' : 'approved'}`}>
            <div className="gate-header">
              <span className="gate-icon">
                {decision_gate.required ? '🔴' : '🟢'}
              </span>
              <div className="gate-content">
                <h3>
                  {decision_gate.required ? 'DECISION GATE: APPROVAL REQUIRED' : 'AUTO-APPROVED'}
                </h3>
                {decision_gate.required ? (
                  <>
                    <p>
                      <strong>Required Approvers:</strong> {decision_gate.approvers.join(', ')}
                    </p>
                    <p>
                      <strong>Estimated Approval Time:</strong> {decision_gate.estimated_time}
                    </p>
                    <p className="gate-message">
                      🛡️ Dragon prevented this action from executing automatically, requiring human review.
                    </p>
                  </>
                ) : (
                  <p className="gate-message">
                    ✅ Low risk detected - this action is safe to execute automatically.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Similar Incidents */}
          <div className="similar-incidents">
            <h3>Dragon's Track Record</h3>
            <div className="incidents-stats">
              <div className="incident-stat">
                <div className="incident-stat-value">23</div>
                <div className="incident-stat-label">
                  Similar decisions paused for review
                </div>
              </div>
              <div className="incident-stat">
                <div className="incident-stat-value">8</div>
                <div className="incident-stat-label">
                  Incidents prevented in last 30 days
                </div>
              </div>
              <div className="incident-stat">
                <div className="incident-stat-value">$2.3M</div>
                <div className="incident-stat-label">
                  Estimated cost of prevented outages
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="result-actions">
            <button className="share-button" onClick={handleShare}>
              🔗 Share Result
            </button>
            <button className="analysis-button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              📊 Try Another Scenario
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// RiskBar Component
function RiskBar({ label, value, icon }: { label: string; value: number; icon: string }) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  const getBarColor = (val: number) => {
    if (val >= 80) return '#ef4444';
    if (val >= 60) return '#f59e0b';
    if (val >= 40) return '#eab308';
    return '#10b981';
  };

  return (
    <div className="risk-bar">
      <div className="risk-bar-header">
        <span className="risk-bar-icon">{icon}</span>
        <span className="risk-bar-label">{label}</span>
        <span className="risk-bar-value">{value}%</span>
      </div>
      <div className="risk-bar-container">
        <div
          className="risk-bar-fill"
          style={{
            width: `${animatedValue}%`,
            backgroundColor: getBarColor(value),
            transition: 'width 0.8s ease-out',
          }}
        />
      </div>
    </div>
  );
}
