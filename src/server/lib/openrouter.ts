import type { LanguageModelV3 } from "@openrouter/ai-sdk-provider";
import {
  getDualProviderChatModel,
  buildDualProviderChatModelSync,
} from "@/server/lib/llm-provider";

/**
 * Returns the AI SDK LanguageModel for the chat agents (Onboarding + Nion).
 * Primary: MiniMax API key (`MINIMAX_API_KEY`)
 * Secondary: Kimi / Moonshot API key (`KIMI_API_KEY`)
 * Fallback: OpenRouter API key (`OPENROUTER_API_KEY`)
 */
export async function getChatAgentModel(): Promise<LanguageModelV3> {
  return getDualProviderChatModel();
}

/**
 * Synchronous variant for callers holding env values (e.g. Durable Objects).
 */
export function buildChatAgentModel(
  apiKey?: string,
  modelId?: string,
  env?: object,
): LanguageModelV3 {
  const envObj = env || (apiKey ? { OPENROUTER_API_KEY: apiKey, OPENROUTER_MODEL: modelId } : {});
  return buildDualProviderChatModelSync(envObj);
}
