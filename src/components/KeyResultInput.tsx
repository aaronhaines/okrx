import React, { useState, FormEvent } from "react";
import { getKeyResultFeedback } from "../services/aiService";

interface KeyResultFeedback {
  quality: "good" | "needs-improvement" | "poor";
  message: string;
  suggestions: string[];
}

interface KeyResult {
  text: string;
  feedback: KeyResultFeedback | null;
}

interface KeyResultInputProps {
  objective: string;
  onBack: () => void;
}

export function KeyResultInput({ objective, onBack }: KeyResultInputProps) {
  const [keyResults, setKeyResults] = useState<KeyResult[]>([
    { text: "", feedback: null },
  ]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (activeIndex === null) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await getKeyResultFeedback(
        keyResults[activeIndex].text,
        objective
      );

      const newKeyResults = [...keyResults];
      newKeyResults[activeIndex].feedback = response;
      setKeyResults(newKeyResults);
    } catch (err) {
      setError("Failed to get AI feedback. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    index: number
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      setActiveIndex(index);
      handleSubmit(e as unknown as FormEvent);
    }
  };

  const addKeyResult = () => {
    setKeyResults([...keyResults, { text: "", feedback: null }]);
  };

  const updateKeyResult = (index: number, value: string) => {
    const newKeyResults = [...keyResults];
    newKeyResults[index] = {
      ...newKeyResults[index],
      text: value,
      feedback: null,
    };
    setKeyResults(newKeyResults);
  };

  return (
    <form className="key-results-section" onSubmit={handleSubmit}>
      <div className="objective-summary">
        <h3>Objective</h3>
        <p>{objective}</p>
      </div>

      <div className="key-results-input">
        <h3>Key Results</h3>
        {keyResults.map((kr, index) => (
          <div key={index} className="key-result-group">
            <div className="input-group">
              <label htmlFor={`kr-${index}`}>Key Result {index + 1}</label>
              <textarea
                id={`kr-${index}`}
                value={kr.text}
                onChange={(e) => updateKeyResult(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                placeholder="Example: Increase user activation rate from 25% to 50% by Q3"
                rows={2}
              />
            </div>
            {kr.feedback && (
              <div
                className={`feedback-display kr-feedback ${kr.feedback.quality}`}
              >
                <p className="feedback-message">{kr.feedback.message}</p>
                {kr.feedback.suggestions.length > 0 && (
                  <div className="feedback-suggestions">
                    <h4>Suggestions:</h4>
                    <ul>
                      {kr.feedback.suggestions.map((suggestion, i) => (
                        <li key={i}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        <button type="button" onClick={addKeyResult} className="add-kr-button">
          + Add Key Result
        </button>
      </div>

      <div className="actions">
        <button type="button" onClick={onBack} className="back-button">
          Back to Objective
        </button>
        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? "Getting Feedback..." : "Review OKR"}
        </button>
      </div>
      {error && <div className="error-message">{error}</div>}
    </form>
  );
}
