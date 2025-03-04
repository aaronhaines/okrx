import { useState } from "react";
import { FeedbackDisplay } from "./components/FeedbackDisplay";
import { KeyResultInput } from "./components/KeyResultInput";
import { getObjectiveFeedback } from "./services/aiService";
import "./App.css";

type Feedback = {
  quality: "good" | "needs-improvement" | "poor";
  message: string;
  suggestions: string[];
} | null;

function App() {
  const [objective, setObjective] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [stage, setStage] = useState<"objective" | "key-results">("objective");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await getObjectiveFeedback(objective);
      setFeedback(response);
    } catch (err) {
      setError("Failed to get AI feedback. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const moveToKeyResults = () => {
    setStage("key-results");
  };

  const backToObjective = () => {
    setStage("objective");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleImprovedVersionSelect = (improvedVersion: string) => {
    setObjective(improvedVersion);
    // Optionally, you could trigger a new feedback request here
  };

  return (
    <div className="container">
      {stage === "objective" ? (
        <>
          <form className="okr-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="objective">
                What outcome do you want to achieve?
              </label>
              <textarea
                id="objective"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Example: Improve customer onboarding experience"
                rows={3}
                disabled={isLoading}
              />
            </div>
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Getting Feedback..." : "Get Feedback"}
            </button>
          </form>
          {error && <div className="error-message">{error}</div>}
          <FeedbackDisplay
            feedback={feedback}
            onSelectImprovement={handleImprovedVersionSelect}
          />
          {feedback?.quality === "good" && (
            <div className="next-step">
              <button onClick={moveToKeyResults}>
                Continue to Key Results →
              </button>
            </div>
          )}
        </>
      ) : (
        <KeyResultInput objective={objective} onBack={backToObjective} />
      )}
    </div>
  );
}

export default App;
