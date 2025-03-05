import OpenAI from "openai";
import { config } from "../config";
import { objectivePrompt } from "../prompts/objective";
import { keyResultPrompt } from "../prompts/keyResult";
import { initiativePrompt } from "../prompts/initiative";

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
        content: objectivePrompt,
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
        content: keyResultPrompt,
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

export async function getInitiativeFeedback(
  initiative: string,
  description: string,
  objective: string,
  keyResults: Array<{ text: string }>
): Promise<AIResponse> {
  const completion = await openai.chat.completions.create({
    model: config.openaiModel,
    messages: [
      {
        role: "system",
        content: initiativePrompt,
      },
      {
        role: "user",
        content: `
          Objective: ${objective}
          
          Key Results:
          ${keyResults.map((kr, i) => `${i + 1}. ${kr.text}`).join("\n")}
          
          Initiative: ${initiative}
          Description: ${description}
        `,
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
