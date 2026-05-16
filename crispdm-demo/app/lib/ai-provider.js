import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

function extractJSON(text) {
  let jsonStr = text;
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1];
  }
  return JSON.parse(jsonStr.trim());
}

async function callClaude(apiKey, systemPrompt, userPrompt) {
  const client = new Anthropic({
    apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
  });

  const message = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    messages: [{ role: "user", content: userPrompt }],
    system: systemPrompt,
  });

  return extractJSON(message.content[0].text);
}

async function callOpenAI(apiKey, systemPrompt, userPrompt) {
  const client = new OpenAI({
    apiKey: apiKey || process.env.OPENAI_API_KEY,
  });

  const response = await client.responses.create({
    model: "gpt-5.4",
    instructions: systemPrompt,
    input: userPrompt,
  });

  return extractJSON(response.output_text);
}

export async function callAI(provider, apiKey, systemPrompt, userPrompt) {
  if (provider === "openai") {
    return callOpenAI(apiKey, systemPrompt, userPrompt);
  }
  return callClaude(apiKey, systemPrompt, userPrompt);
}
