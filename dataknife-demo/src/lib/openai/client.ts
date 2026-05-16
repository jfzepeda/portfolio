import OpenAI from "openai";

let client: OpenAI | null = null;

export function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Configura OPENAI_API_KEY en .env.local.");
  }

  client ??= new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  return client;
}

export function getVectorStoreId() {
  const vectorStoreId = process.env.OPENAI_VECTOR_STORE_ID;

  if (!vectorStoreId) {
    throw new Error("Configura OPENAI_VECTOR_STORE_ID en .env.local.");
  }

  return vectorStoreId;
}

export function getChatKitWorkflowId() {
  const workflowId = process.env.OPENAI_CHATKIT_WORKFLOW_ID;

  if (!workflowId) {
    throw new Error("Configura OPENAI_CHATKIT_WORKFLOW_ID en .env.local.");
  }

  return workflowId;
}
