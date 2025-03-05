import React from "react";

interface OKRReviewProps {
  objective: string;
  keyResults: Array<{ text: string }>;
  initiatives: Array<Initiative>;
  onBack: () => void;
  onSubmit: () => void;
}

export function OKRReview({
  objective,
  keyResults,
  initiatives,
  onBack,
  onSubmit,
}: OKRReviewProps) {
  return (
    <div className="okr-review">
      <h2>Review Your OKR</h2>

      <div className="review-section">
        <h3>Objective</h3>
        <p className="review-text">{objective}</p>
      </div>

      <div className="review-section">
        <h3>Key Results</h3>
        <ol className="key-results-list">
          {keyResults.map((kr, index) => (
            <li key={index} className="review-text">
              {kr.text}
            </li>
          ))}
        </ol>
      </div>

      <div className="review-section">
        <h3>Initiatives</h3>
        <div className="initiatives-list">
          {initiatives.map((initiative, index) => (
            <div key={index} className="initiative-item">
              <h4>{initiative.text}</h4>
              <p>{initiative.description}</p>
              {initiative.jiraLink && (
                <a
                  href={initiative.jiraLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View in Jira →
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="actions">
        <button type="button" onClick={onBack} className="back-button">
          Back to Initiatives
        </button>
        <button type="button" onClick={onSubmit} className="submit-button">
          Finalize OKR
        </button>
      </div>
    </div>
  );
}
