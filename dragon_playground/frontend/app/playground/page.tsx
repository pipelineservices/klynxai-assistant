'use client';

import { useState, useEffect } from 'react';
import ScenarioSelector from '../../components/ScenarioSelector';
import DecisionForm from '../../components/DecisionForm';
import RiskVisualization from '../../components/RiskVisualization';
import '../../styles/playground.css';

interface Scenario {
  id: string;
  title: string;
  icon: string;
  difficulty: string;
  expected_risk: string;
  data: {
    title: string;
    action: string;
    rationale: string;
    impact: string;
    risk?: Record<string, any>;
  };
}

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

export default function DragonPlayground() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [customMode, setCustomMode] = useState(false);
  const [decisionResult, setDecisionResult] = useState<DecisionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  // Load scenarios on mount
  useEffect(() => {
    fetchScenarios();
    fetchStats();
  }, []);

  const fetchScenarios = async () => {
    try {
      const response = await fetch('/api/playground/scenarios');
      const data = await response.json();
      if (data.success) {
        setScenarios(data.scenarios);
      }
    } catch (error) {
      console.error('Failed to load scenarios:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/playground/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleScenarioSelect = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setCustomMode(false);
    setDecisionResult(null);
  };

  const handleCustomMode = () => {
    setCustomMode(true);
    setSelectedScenario(null);
    setDecisionResult(null);
  };

  const handleSubmitDecision = async (decisionData: any) => {
    setLoading(true);
    setDecisionResult(null);

    try {
      const response = await fetch('/api/playground/submit-decision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...decisionData,
          scenario_id: selectedScenario?.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setDecisionResult(data);
        // Refresh stats
        fetchStats();
      } else {
        alert('Failed to analyze decision: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error submitting decision:', error);
      alert('Failed to submit decision. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="playground-page">
      <div className="playground-container">
        {/* Header */}
        <header className="playground-header">
          <div className="header-content">
            <div className="dragon-logo">🐉</div>
            <div>
              <h1 className="playground-title">Dragon AI Governance Playground</h1>
              <p className="playground-subtitle">
                See how Dragon catches dangerous decisions before they happen.
                Test real scenarios in a safe sandbox.
              </p>
            </div>
          </div>

          {/* Stats Banner */}
          {stats && (
            <div className="stats-banner">
              <div className="stat-item">
                <div className="stat-value">{stats.total_decisions_analyzed.toLocaleString()}</div>
                <div className="stat-label">Decisions Analyzed</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.high_risk_caught.toLocaleString()}</div>
                <div className="stat-label">High Risks Caught</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.critical_incidents_prevented}</div>
                <div className="stat-label">Incidents Prevented</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.estimated_cost_saved}</div>
                <div className="stat-label">Cost Saved</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.avg_response_time_ms}ms</div>
                <div className="stat-label">Avg Response Time</div>
              </div>
            </div>
          )}
        </header>

        {/* Main Content */}
        <div className="playground-content">
          {!selectedScenario && !customMode && (
            <>
              <div className="section-header">
                <h2>Choose a Scenario to Test</h2>
                <p>Select from pre-built scenarios or create your own custom decision</p>
              </div>
              <ScenarioSelector
                scenarios={scenarios}
                onSelect={handleScenarioSelect}
                onCustom={handleCustomMode}
              />
            </>
          )}

          {(selectedScenario || customMode) && !decisionResult && (
            <div className="decision-section">
              <button
                className="back-button"
                onClick={() => {
                  setSelectedScenario(null);
                  setCustomMode(false);
                }}
              >
                ← Back to Scenarios
              </button>

              {selectedScenario && (
                <div className="scenario-badge">
                  <span className="scenario-icon">{selectedScenario.icon}</span>
                  <span className="scenario-title">{selectedScenario.title}</span>
                  <span className={`difficulty-badge difficulty-${selectedScenario.difficulty}`}>
                    {selectedScenario.difficulty}
                  </span>
                </div>
              )}

              <DecisionForm
                initialData={selectedScenario?.data}
                onSubmit={handleSubmitDecision}
                loading={loading}
              />
            </div>
          )}

          {decisionResult && (
            <div className="result-section">
              <button
                className="back-button"
                onClick={() => {
                  setDecisionResult(null);
                }}
              >
                ← Try Another Scenario
              </button>

              <RiskVisualization
                decisionResult={decisionResult}
                scenarioTitle={selectedScenario?.title}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="playground-footer">
          <div className="footer-content">
            <p>
              <strong>This is a demo environment.</strong> All decisions are analyzed but not executed.
              Dragon evaluates risks using the same governance engine that protects production systems.
            </p>
            <div className="footer-links">
              <a href="https://klynxai.com" target="_blank" rel="noopener">
                Learn More
              </a>
              <a href="mailto:contact@klynxai.com">
                Request Full Demo
              </a>
              <a href="https://github.com/klynxai/dragon" target="_blank" rel="noopener">
                GitHub
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
