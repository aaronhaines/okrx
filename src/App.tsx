import { useState } from "react";
import { FeedbackDisplay } from "./components/FeedbackDisplay";
import { KeyResultInput } from "./components/KeyResultInput";
import { InitiativeInput } from "./components/InitiativeInput";
import { OKRReview } from "./components/OKRReview";
import { getObjectiveFeedback } from "./services/aiService";
import { OKRList } from "./components/OKRList";
import "./App.css";

type Stage = "list" | "objective" | "key-results" | "initiatives" | "review";

type Feedback = {
  quality: "good" | "needs-improvement" | "poor";
  message: string;
  suggestions: string[];
} | null;

interface Initiative {
  text: string;
  description: string;
  jiraLink: string;
  feedback: {
    quality: "good" | "needs-improvement" | "poor";
    message: string;
    suggestions: string[];
    improvements?: string[];
  } | null;
}

interface OKR {
  objective: string;
  keyResults: Array<{ text: string }>;
  initiatives: Array<Initiative>;
  createdAt: string;
}

function App() {
  const [objective, setObjective] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [stage, setStage] = useState<Stage>("list");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keyResults, setKeyResults] = useState<Array<{ text: string }>>([]);
  const [initiatives, setInitiatives] = useState<Array<Initiative>>([]);
  const [okrs, setOkrs] = useState<OKR[]>(() => {
    const stored = localStorage.getItem("okrs");
    return stored ? JSON.parse(stored) : [];
  });

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

  const moveToInitiatives = (results: Array<{ text: string }>) => {
    setKeyResults(results);
    setStage("initiatives");
  };

  const backToInitiatives = () => {
    setStage("initiatives");
  };

  const handleFinalize = () => {
    const finalOKR = {
      objective,
      keyResults,
      initiatives,
      createdAt: new Date().toISOString(),
    };

    const updatedOkrs = [...okrs, finalOKR];
    setOkrs(updatedOkrs);
    localStorage.setItem("okrs", JSON.stringify(updatedOkrs));

    // Reset the form
    setObjective("");
    setFeedback(null);
    setKeyResults([]);
    setInitiatives([]);
    setStage("list");
  };

  const backToKeyResults = () => {
    setStage("key-results");
  };

  const startNewOKR = () => {
    setStage("objective");
  };

  return (
    <div className="container">
      {stage === "list" ? (
        <OKRList okrs={okrs} onCreateNew={startNewOKR} />
      ) : stage === "objective" ? (
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
      ) : stage === "key-results" ? (
        <KeyResultInput
          objective={objective}
          onBack={backToObjective}
          onComplete={moveToInitiatives}
        />
      ) : stage === "initiatives" ? (
        <InitiativeInput
          objective={objective}
          keyResults={keyResults}
          onBack={backToKeyResults}
          onComplete={(initiatives) => {
            setInitiatives(initiatives);
            setStage("review");
          }}
        />
      ) : (
        <OKRReview
          objective={objective}
          keyResults={keyResults}
          initiatives={initiatives}
          onBack={backToInitiatives}
          onSubmit={handleFinalize}
        />
      )}
    </div>
  );
}

export default App;
