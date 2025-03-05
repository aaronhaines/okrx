import React, { useState, FormEvent } from "react";
import { getInitiativeFeedback } from "../services/aiService";

interface InitiativeFeedback {
  quality: "good" | "needs-improvement" | "poor";
  message: string;
  suggestions: string[];
  improvements?: string[];
}

interface Initiative {
  text: string;
  description: string;
  jiraLink: string;
  feedback: InitiativeFeedback | null;
}

interface InitiativeInputProps {
  objective: string;
  keyResults: Array<{ text: string }>;
  onBack: () => void;
  onComplete: (initiatives: Array<Initiative>) => void;
}

export function InitiativeInput({
  objective,
  keyResults,
  onBack,
  onComplete,
}: InitiativeInputProps) {
  const [initiatives, setInitiatives] = useState<Initiative[]>([
    { text: "", description: "", jiraLink: "", feedback: null },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (initiatives.every((init) => !init.text.trim())) return;

    const validInitiatives = initiatives.filter(
      (init) => init.text.trim() && init.description.trim()
    );
    onComplete(validInitiatives);
  };

  const getFeedback = async (index: number) => {
    if (
      !initiatives[index].text.trim() ||
      !initiatives[index].description.trim()
    )
      return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await getInitiativeFeedback(
        initiatives[index].text,
        initiatives[index].description,
        objective,
        keyResults
      );

      const newInitiatives = [...initiatives];
      newInitiatives[index].feedback = response;
      setInitiatives(newInitiatives);
    } catch (err) {
      setError("Failed to get AI feedback. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const addInitiative = () => {
    setInitiatives([
      ...initiatives,
      { text: "", description: "", jiraLink: "", feedback: null },
    ]);
  };

  const updateInitiative = (
    index: number,
    field: keyof Initiative,
    value: string
  ) => {
    const newInitiatives = [...initiatives];
    newInitiatives[index] = {
      ...newInitiatives[index],
      [field]: value,
      feedback: null,
    };
    setInitiatives(newInitiatives);
  };

  const handleImprovedVersionSelect = (index: number, improvement: string) => {
    const newInitiatives = [...initiatives];
    newInitiatives[index] = {
      ...newInitiatives[index],
      text: improvement,
      feedback: null,
    };
    setInitiatives(newInitiatives);
  };

  const canProceed = initiatives.some(
    (init) => init.feedback?.quality === "good"
  );

  return (
    <div className="initiatives-section">
      <div className="objective-summary">
        <h3>Objective</h3>
        <p>{objective}</p>
      </div>

      <div className="key-results-summary">
        <h3>Key Results</h3>
        <ol>
          {keyResults.map((kr, index) => (
            <li key={index}>{kr.text}</li>
          ))}
        </ol>
      </div>

      <div className="initiatives-input">
        <h3>Initiatives</h3>
        {initiatives.map((initiative, index) => (
          <div key={index} className="initiative-group">
            <div className="input-group">
              <label htmlFor={`initiative-${index}`}>
                Initiative {index + 1}
              </label>
              <input
                type="text"
                id={`initiative-${index}`}
                value={initiative.text}
                onChange={(e) =>
                  updateInitiative(index, "text", e.target.value)
                }
                placeholder="Name your initiative"
                disabled={isLoading}
              />
            </div>

            <div className="input-group">
              <label htmlFor={`description-${index}`}>Description</label>
              <textarea
                id={`description-${index}`}
                value={initiative.description}
                onChange={(e) =>
                  updateInitiative(index, "description", e.target.value)
                }
                placeholder="Describe the initiative in detail"
                rows={3}
                disabled={isLoading}
              />
            </div>

            <div className="input-group">
              <label htmlFor={`jira-${index}`}>Jira Link</label>
              <input
                type="url"
                id={`jira-${index}`}
                value={initiative.jiraLink}
                onChange={(e) =>
                  updateInitiative(index, "jiraLink", e.target.value)
                }
                placeholder="https://your-jira-instance.com/browse/PROJ-123"
                disabled={isLoading}
              />
            </div>

            <button
              type="button"
              onClick={() => getFeedback(index)}
              disabled={
                isLoading ||
                !initiative.text.trim() ||
                !initiative.description.trim()
              }
              className="feedback-button"
            >
              {isLoading ? "Getting Feedback..." : "Get Feedback"}
            </button>

            {initiative.feedback && (
              <div
                className={`feedback-display initiative-feedback ${initiative.feedback.quality}`}
              >
                <p className="feedback-message">
                  {initiative.feedback.message}
                </p>
                {initiative.feedback.suggestions.length > 0 && (
                  <div className="feedback-suggestions">
                    <h4>Suggestions:</h4>
                    <ul>
                      {initiative.feedback.suggestions.map((suggestion, i) => (
                        <li key={i}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {initiative.feedback.improvements &&
                  initiative.feedback.improvements.length > 0 && (
                    <div className="feedback-improvements">
                      <h4>Try these improved versions:</h4>
                      <div className="improvement-options">
                        {initiative.feedback.improvements.map(
                          (improvement, i) => (
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
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addInitiative}
          className="add-initiative-button"
        >
          + Add Initiative
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="actions">
        <button type="button" onClick={onBack} className="back-button">
          Back to Key Results
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="submit-button"
          disabled={!canProceed}
        >
          Review OKR
        </button>
      </div>
    </div>
  );
}
