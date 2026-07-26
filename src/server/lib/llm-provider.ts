import { createOpenAI } from "@ai-sdk/openai";
import {
  createOpenRouter,
  type LanguageModelV3,
} from "@openrouter/ai-sdk-provider";
import {
  getEnvValueSync,
  getOptionalEnvValue,
} from "@/server/lib/runtime-env";

const DEFAULT_MINIMAX_BASE_URL = "https://api.minimax.chat/v1";
const DEFAULT_MINIMAX_MODEL = "minimax-m3";

const DEFAULT_KIMI_BASE_URL = "https://api.moonshot.cn/v1";
const DEFAULT_KIMI_MODEL = "moonshot-v1-8k";

const DEFAULT_OPENROUTER_MODEL = "minimax/minimax-m3";

/**
 * Builds the primary MiniMax model instance.
 */
export function buildMiniMaxModel(
  apiKey: string,
  modelId?: string,
  baseUrl?: string,
): LanguageModelV3 {
  const provider = createOpenAI({
    name: "minimax",
    apiKey,
    baseURL: baseUrl || DEFAULT_MINIMAX_BASE_URL,
  });
  return provider(modelId || DEFAULT_MINIMAX_MODEL) as unknown as LanguageModelV3;
}

/**
 * Builds the secondary Kimi (Moonshot) model instance.
 */
export function buildKimiModel(
  apiKey: string,
  modelId?: string,
  baseUrl?: string,
): LanguageModelV3 {
  const provider = createOpenAI({
    name: "kimi",
    apiKey,
    baseURL: baseUrl || DEFAULT_KIMI_BASE_URL,
  });
  return provider(modelId || DEFAULT_KIMI_MODEL) as unknown as LanguageModelV3;
}

/**
 * Synchronously constructs the dual-provider LLM chain (MiniMax primary -> Kimi secondary -> OpenRouter fallback).
 */
export function buildDualProviderChatModelSync(
  env: object = {},
): LanguageModelV3 {
  const minimaxKey = getEnvValueSync(env, "MINIMAX_API_KEY");
  const minimaxModel = getEnvValueSync(env, "MINIMAX_MODEL");
  const minimaxBaseUrl = getEnvValueSync(env, "MINIMAX_BASE_URL");

  const kimiKey =
    getEnvValueSync(env, "KIMI_API_KEY") ||
    getEnvValueSync(env, "MOONSHOT_API_KEY");
  const kimiModel = getEnvValueSync(env, "KIMI_MODEL");
  const kimiBaseUrl = getEnvValueSync(env, "KIMI_BASE_URL");

  const openrouterKey = getEnvValueSync(env, "OPENROUTER_API_KEY");
  const openrouterModel = getEnvValueSync(env, "OPENROUTER_MODEL");

  // 1. Primary: MiniMax
  if (minimaxKey) {
    return buildMiniMaxModel(minimaxKey, minimaxModel, minimaxBaseUrl);
  }

  // 2. Secondary: Kimi (Moonshot)
  if (kimiKey) {
    return buildKimiModel(kimiKey, kimiModel, kimiBaseUrl);
  }

  // 3. Fallback: OpenRouter
  if (openrouterKey) {
    const openrouter = createOpenRouter({ apiKey: openrouterKey });
    return openrouter(
      openrouterModel || DEFAULT_OPENROUTER_MODEL,
      {
        usage: { include: true },
        reasoning: { effort: "medium" },
        provider: {
          order: ["together", "atlas-cloud/fp8"],
          zdr: true,
          allow_fallbacks: true,
        },
      },
    ) as unknown as LanguageModelV3;
  }

  throw new Error(
    "No valid LLM API keys found. Please set MINIMAX_API_KEY (primary), KIMI_API_KEY (secondary), or OPENROUTER_API_KEY.",
  );
}

/**
 * Async getter for dual-provider chat model.
 */
export async function getDualProviderChatModel(): Promise<LanguageModelV3> {
  const minimaxKey = await getOptionalEnvValue("MINIMAX_API_KEY");
  const minimaxModel = await getOptionalEnvValue("MINIMAX_MODEL");
  const minimaxBaseUrl = await getOptionalEnvValue("MINIMAX_BASE_URL");

  const kimiKey =
    (await getOptionalEnvValue("KIMI_API_KEY")) ||
    (await getOptionalEnvValue("MOONSHOT_API_KEY"));
  const kimiModel = await getOptionalEnvValue("KIMI_MODEL");
  const kimiBaseUrl = await getOptionalEnvValue("KIMI_BASE_URL");

  const openrouterKey = await getOptionalEnvValue("OPENROUTER_API_KEY");
  const openrouterModel = await getOptionalEnvValue("OPENROUTER_MODEL");

  const envObj: Record<string, string> = {};
  if (minimaxKey) envObj.MINIMAX_API_KEY = minimaxKey;
  if (minimaxModel) envObj.MINIMAX_MODEL = minimaxModel;
  if (minimaxBaseUrl) envObj.MINIMAX_BASE_URL = minimaxBaseUrl;

  if (kimiKey) envObj.KIMI_API_KEY = kimiKey;
  if (kimiModel) envObj.KIMI_MODEL = kimiModel;
  if (kimiBaseUrl) envObj.KIMI_BASE_URL = kimiBaseUrl;

  if (openrouterKey) envObj.OPENROUTER_API_KEY = openrouterKey;
  if (openrouterModel) envObj.OPENROUTER_MODEL = openrouterModel;

  return buildDualProviderChatModelSync(envObj);
}
