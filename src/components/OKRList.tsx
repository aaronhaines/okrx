import React from "react";

interface OKR {
  objective: string;
  keyResults: Array<{ text: string }>;
  initiatives: Array<{
    text: string;
    description: string;
    jiraLink: string;
  }>;
  createdAt: string;
}

interface OKRListProps {
  okrs: OKR[];
  onCreateNew: () => void;
}

export function OKRList({ okrs, onCreateNew }: OKRListProps) {
  return (
    <div className="okr-list">
      <div className="okr-list-header">
        <h2>Your OKRs</h2>
        <button onClick={onCreateNew} className="create-button">
          Create New OKR
        </button>
      </div>

      {okrs.length === 0 ? (
        <div className="empty-state">
          <p>No OKRs created yet. Start by creating your first one!</p>
        </div>
      ) : (
        <div className="okr-cards">
          {okrs.map((okr, index) => (
            <div key={index} className="okr-card">
              <div className="okr-card-header">
                <h3>{okr.objective}</h3>
                <span className="date">
                  {new Date(okr.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="okr-card-section">
                <h4>Key Results</h4>
                <ol>
                  {okr.keyResults.map((kr, i) => (
                    <li key={i}>{kr.text}</li>
                  ))}
                </ol>
              </div>

              <div className="okr-card-section">
                <h4>Initiatives</h4>
                <ul>
                  {okr.initiatives.map((initiative, i) => (
                    <li key={i}>
                      <strong>{initiative.text}</strong>
                      <p>{initiative.description}</p>
                      {initiative.jiraLink && (
                        <a
                          href={initiative.jiraLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="jira-link"
                        >
                          View in Jira →
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
