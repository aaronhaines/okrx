interface FeedbackDisplayProps {
  feedback: {
    quality: "good" | "needs-improvement" | "poor";
    message: string;
    suggestions: string[];
    improvements?: string[];
  } | null;
  onSelectImprovement: (improvement: string) => void;
}

export function FeedbackDisplay({
  feedback,
  onSelectImprovement,
}: FeedbackDisplayProps) {
  if (!feedback) return null;

  const qualityColors = {
    good: "var(--color-success)",
    "needs-improvement": "var(--color-warning)",
    poor: "var(--color-error)",
  };

  return (
    <div className="feedback-display">
      <div
        className="feedback-header"
        style={{ color: qualityColors[feedback.quality] }}
      >
        <h3>Feedback</h3>
      </div>
      <p className="feedback-message">{feedback.message}</p>
      {feedback.suggestions.length > 0 && (
        <div className="feedback-suggestions">
          <h4>Suggestions:</h4>
          <ul>
            {feedback.suggestions.map((suggestion, i) => (
              <li key={i}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
      {feedback.improvements && feedback.improvements.length > 0 && (
        <div className="feedback-improvements">
          <h4>Try these improved versions:</h4>
          <div className="improvement-options">
            {feedback.improvements.map((improvement, i) => (
              <button
                key={i}
                className="improvement-option"
                onClick={() => onSelectImprovement(improvement)}
              >
                {improvement}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
