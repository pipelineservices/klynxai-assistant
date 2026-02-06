'use client';

import React from 'react';

interface Scenario {
  id: string;
  title: string;
  icon: string;
  difficulty: string;
  expected_risk: string;
  data: any;
}

interface ScenarioSelectorProps {
  scenarios: Scenario[];
  onSelect: (scenario: Scenario) => void;
  onCustom: () => void;
}

export default function ScenarioSelector({ scenarios, onSelect, onCustom }: ScenarioSelectorProps) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'critical':
        return '#ef4444';
      case 'high':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="scenario-grid">
      {scenarios.map((scenario) => (
        <button
          key={scenario.id}
          className="scenario-card"
          onClick={() => onSelect(scenario)}
          style={{
            borderColor: `${getRiskColor(scenario.expected_risk)}40`,
          }}
        >
          <div className="scenario-card-header">
            <span className="scenario-icon-large">{scenario.icon}</span>
            <div
              className="risk-indicator"
              style={{ backgroundColor: getRiskColor(scenario.expected_risk) }}
            >
              {scenario.expected_risk}
            </div>
          </div>

          <h3 className="scenario-card-title">{scenario.title}</h3>

          <p className="scenario-card-description">{scenario.data.title}</p>

          <div className="scenario-card-footer">
            <span
              className="difficulty-tag"
              style={{
                color: getDifficultyColor(scenario.difficulty),
                borderColor: `${getDifficultyColor(scenario.difficulty)}60`,
              }}
            >
              {scenario.difficulty.toUpperCase()}
            </span>
            <span className="try-label">Try it →</span>
          </div>
        </button>
      ))}

      {/* Custom Scenario Card */}
      <button className="scenario-card custom-card" onClick={onCustom}>
        <div className="scenario-card-header">
          <span className="scenario-icon-large">✍️</span>
        </div>

        <h3 className="scenario-card-title">Custom Scenario</h3>

        <p className="scenario-card-description">
          Create your own decision and test Dragon's response
        </p>

        <div className="scenario-card-footer">
          <span className="try-label">Create →</span>
        </div>
      </button>
    </div>
  );
}
