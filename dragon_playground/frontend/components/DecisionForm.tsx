'use client';

import React, { useState, useEffect } from 'react';

interface DecisionFormProps {
  initialData?: {
    title: string;
    action: string;
    rationale: string;
    impact: string;
    risk?: Record<string, any>;
  };
  onSubmit: (data: any) => void;
  loading: boolean;
}

export default function DecisionForm({ initialData, onSubmit, loading }: DecisionFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    action: initialData?.action || '',
    rationale: initialData?.rationale || '',
    impact: initialData?.impact || '',
    risk: initialData?.risk || {},
  });

  const [isEditing, setIsEditing] = useState(!initialData);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        action: initialData.action,
        rationale: initialData.rationale,
        impact: initialData.impact,
        risk: initialData.risk || {},
      });
    }
  }, [initialData]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className="decision-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h2>Decision Details</h2>
        {initialData && !isEditing && (
          <button
            type="button"
            className="edit-button"
            onClick={() => setIsEditing(true)}
          >
            ✏️ Edit
          </button>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="title">
          <span className="label-text">Title</span>
          <span className="label-hint">What decision needs to be made?</span>
        </label>
        <input
          id="title"
          type="text"
          className="form-input"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          disabled={!isEditing}
          required
          placeholder="e.g., Deploy v2.0 to Production"
        />
      </div>

      <div className="form-group">
        <label htmlFor="action">
          <span className="label-text">Action / Command</span>
          <span className="label-hint">The actual command or action to execute</span>
        </label>
        <textarea
          id="action"
          className="form-textarea code-input"
          value={formData.action}
          onChange={(e) => handleChange('action', e.target.value)}
          disabled={!isEditing}
          required
          rows={3}
          placeholder="e.g., terraform apply -target=production"
        />
      </div>

      <div className="form-group">
        <label htmlFor="rationale">
          <span className="label-text">Rationale</span>
          <span className="label-hint">Why is this action necessary?</span>
        </label>
        <textarea
          id="rationale"
          className="form-textarea"
          value={formData.rationale}
          onChange={(e) => handleChange('rationale', e.target.value)}
          disabled={!isEditing}
          required
          rows={3}
          placeholder="e.g., New feature release with database schema changes"
        />
      </div>

      <div className="form-group">
        <label htmlFor="impact">
          <span className="label-text">Impact</span>
          <span className="label-hint">Who/what will be affected?</span>
        </label>
        <textarea
          id="impact"
          className="form-textarea"
          value={formData.impact}
          onChange={(e) => handleChange('impact', e.target.value)}
          disabled={!isEditing}
          required
          rows={2}
          placeholder="e.g., All users, 50K+ transactions/day"
        />
      </div>

      {isEditing && (
        <div className="form-actions">
          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Analyzing...
              </>
            ) : (
              <>
                🐉 Submit to Dragon
              </>
            )}
          </button>

          {initialData && (
            <button
              type="button"
              className="cancel-button"
              onClick={() => {
                setFormData({
                  title: initialData.title,
                  action: initialData.action,
                  rationale: initialData.rationale,
                  impact: initialData.impact,
                  risk: initialData.risk || {},
                });
                setIsEditing(false);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {!isEditing && (
        <div className="form-actions">
          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Analyzing...
              </>
            ) : (
              <>
                🐉 Submit to Dragon
              </>
            )}
          </button>
        </div>
      )}

      <div className="form-note">
        <span className="note-icon">ℹ️</span>
        <span>
          This is a demo environment. Your decision will be analyzed but not executed.
          Dragon uses the same governance engine that protects production systems.
        </span>
      </div>
    </form>
  );
}
