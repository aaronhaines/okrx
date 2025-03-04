interface FeedbackDisplayProps {
  feedback: {
    quality: "good" | "needs-improvement" | "poor";
    message: string;
    suggestions: string[];
  } | null;
}

export function FeedbackDisplay({ feedback }: FeedbackDisplayProps) {
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
            {feedback.suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
