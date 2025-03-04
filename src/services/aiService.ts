import OpenAI from "openai";
import { config } from "../config";

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
  baseURL: config.openaiBaseUrl,
  dangerouslyAllowBrowser: true, // Note: In production, you should proxy through your backend
});

interface AIResponse {
  quality: "good" | "needs-improvement" | "poor";
  message: string;
  suggestions: string[];
  improvements?: string[]; // Add improved versions
}

export async function getObjectiveFeedback(
  objective: string
): Promise<AIResponse> {
  const completion = await openai.chat.completions.create({
    model: config.openaiModel,
    messages: [
      {
        role: "system",
        content: `You are an expert in OKRs (Objectives and Key Results). 
          A great objective should be:
          - Outcome-focused (not activity-based)
          - Inspiring and ambitious
          - Clear and easy to understand
          - Qualitative rather than quantitative
          - Actionable by the team

          Analyze the given objective and provide feedback in JSON format with the following structure:
          {
            "quality": "good" | "needs-improvement" | "poor",
            "message": "brief feedback message",
            "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
            "improvements": ["improved version 1", "improved version 2", "improved version 3"]
          }

          If the objective needs improvement, provide 3 alternative versions that:
          1. Maintain the core intent but are more effective
          2. Follow all the criteria for great objectives
          3. Would each receive a "good" quality rating
          4. Are distinctly different approaches to the same goal`,
      },
      {
        role: "user",
        content: objective,
      },
    ],
    response_format: { type: "json_object" },
  });

  const response = completion.choices[0]?.message?.content;
  if (!response) {
    throw new Error("No response from OpenAI");
  }

  return JSON.parse(response);
}

export async function getKeyResultFeedback(
  keyResult: string,
  objective: string
): Promise<AIResponse> {
  const completion = await openai.chat.completions.create({
    model: config.openaiModel,
    messages: [
      {
        role: "system",
        content: `You are an expert in OKRs (Objectives and Key Results). 
          Analyze the given key result in the context of its objective and provide feedback in JSON format with the following structure:
          {
            "quality": "good" | "needs-improvement" | "poor",
            "message": "brief feedback message",
            "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
          }
          Focus on whether the key result is specific, measurable, time-bound, and aligned with the objective.`,
      },
      {
        role: "user",
        content: `Objective: ${objective}\nKey Result: ${keyResult}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const response = completion.choices[0]?.message?.content;
  if (!response) {
    throw new Error("No response from OpenAI");
  }

  return JSON.parse(response);
}
