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
          Analyze the given objective and provide feedback in JSON format with the following structure:
          {
            "quality": "good" | "needs-improvement" | "poor",
            "message": "brief feedback message",
            "suggestions": ["suggestion1", "suggestion2", "suggestion3"]
          }
          Focus on whether the objective is outcome-focused, inspiring, and qualitative.`,
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
