import React, { useState, FormEvent } from "react";
import { getKeyResultFeedback } from "../services/aiService";

interface KeyResultFeedback {
  quality: "good" | "needs-improvement" | "poor";
  message: string;
  suggestions: string[];
  improvements?: string[];
}

interface KeyResult {
  text: string;
  feedback: KeyResultFeedback | null;
}

interface KeyResultInputProps {
  objective: string;
  onBack: () => void;
  onComplete: (results: Array<{ text: string }>) => void;
}

export function KeyResultInput({
  objective,
  onBack,
  onComplete,
}: KeyResultInputProps) {
  const [keyResults, setKeyResults] = useState<KeyResult[]>([
    { text: "", feedback: null },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (keyResults.every((kr) => !kr.text.trim())) return;

    // Filter out empty key results and only include the text
    const validResults = keyResults
      .filter((kr) => kr.text.trim())
      .map((kr) => ({ text: kr.text }));

    onComplete(validResults);
  };

  const getFeedback = async (index: number) => {
    if (!keyResults[index].text.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await getKeyResultFeedback(
        keyResults[index].text,
        objective
      );

      const newKeyResults = [...keyResults];
      newKeyResults[index].feedback = response;
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
      getFeedback(index);
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

  const handleImprovedVersionSelect = (index: number, improvement: string) => {
    const newKeyResults = [...keyResults];
    newKeyResults[index] = {
      ...newKeyResults[index],
      text: improvement,
      feedback: null,
    };
    setKeyResults(newKeyResults);
  };

  const canProceed = keyResults.some((kr) => kr.feedback?.quality === "good");

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
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => getFeedback(index)}
                disabled={isLoading || !kr.text.trim()}
              >
                {isLoading ? "Getting Feedback..." : "Get Feedback"}
              </button>
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
                {kr.feedback.improvements &&
                  kr.feedback.improvements.length > 0 && (
                    <div className="feedback-improvements">
                      <h4>Try these improved versions:</h4>
                      <div className="improvement-options">
                        {kr.feedback.improvements.map((improvement, i) => (
                          <button
                            key={i}
                            type="button"
                            className="improvement-option"
                            onClick={() =>
                              handleImprovedVersionSelect(index, improvement)
                            }
                          >
                            {improvement}
                          </button>
                        ))}
                      </div>
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

      {error && <div className="error-message">{error}</div>}

      <div className="actions">
        <button type="button" onClick={onBack} className="back-button">
          Back to Objective
        </button>
        <button type="submit" className="submit-button" disabled={!canProceed}>
          Review OKR
        </button>
      </div>
    </form>
  );
}
