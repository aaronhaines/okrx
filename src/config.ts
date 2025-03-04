export const config = {
  openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY as string,
  openaiBaseUrl: import.meta.env.VITE_OPENAI_BASE_URL as string,
  openaiModel: import.meta.env.VITE_OPENAI_MODEL as string,
};

if (!config.openaiApiKey) {
  throw new Error("OpenAI API key is not defined in environment variables");
}

if (!config.openaiBaseUrl) {
  throw new Error("OpenAI base URL is not defined in environment variables");
}

if (!config.openaiModel) {
  throw new Error("OpenAI model is not defined in environment variables");
}
