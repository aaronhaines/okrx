import React from "react";

interface OKRReviewProps {
  objective: string;
  keyResults: Array<{ text: string }>;
  onBack: () => void;
  onSubmit: () => void;
}

export function OKRReview({
  objective,
  keyResults,
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

      <div className="actions">
        <button type="button" onClick={onBack} className="back-button">
          Back to Key Results
        </button>
        <button type="button" onClick={onSubmit} className="submit-button">
          Finalize OKR
        </button>
      </div>
    </div>
  );
}
