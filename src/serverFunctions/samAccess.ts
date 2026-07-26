import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  getOptionalEnvValue,
  isHostedServerAuthMode,
} from "@/server/lib/runtime-env";
import { requireProjectContext } from "@/serverFunctions/middleware";

const AI_KEY_MISSING_MESSAGE =
  "No LLM API key configured yet. Set MINIMAX_API_KEY (primary), KIMI_API_KEY (secondary), or OPENROUTER_API_KEY in your environment, restart Democratic SEO, then confirm here.";

const projectScopedSchema = z.object({ projectId: z.string().min(1) });

type SamAccessStatus = {
  enabled: boolean;
  errorMessage: string | null;
};

// Gates the in-app AI agent (Nion) on an API key being configured.
export const getSamAccessSetupStatus = createServerFn({ method: "GET" })
  .middleware(requireProjectContext)
  .validator(projectScopedSchema)
  .handler(async (): Promise<SamAccessStatus> => {
    if (await isHostedServerAuthMode()) {
      return { enabled: true, errorMessage: null };
    }

    const minimaxKey = await getOptionalEnvValue("MINIMAX_API_KEY");
    const kimiKey =
      (await getOptionalEnvValue("KIMI_API_KEY")) ||
      (await getOptionalEnvValue("MOONSHOT_API_KEY"));
    const openrouterKey = await getOptionalEnvValue("OPENROUTER_API_KEY");

    const enabled = Boolean(minimaxKey || kimiKey || openrouterKey);
    return {
      enabled,
      errorMessage: enabled ? null : AI_KEY_MISSING_MESSAGE,
    };
  });
