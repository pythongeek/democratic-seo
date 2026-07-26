import { createFileRoute } from "@tanstack/react-router";
import { runScheduledRankChecks } from "@/server/features/rank-tracking/services/scheduledRankChecks";
import { getOptionalEnvValue } from "@/server/lib/runtime-env";
import { withPgClient } from "@/db";

async function handleCronRequest(request: Request) {
  const cronSecret = await getOptionalEnvValue("CRON_SECRET");
  const url = new URL(request.url);
  const authHeader = request.headers.get("Authorization");
  const secretParam = url.searchParams.get("secret");

  // Validate CRON_SECRET if configured (recommended for production)
  if (cronSecret) {
    const isBearerValid = authHeader === `Bearer ${cronSecret}`;
    const isParamValid = secretParam === cronSecret;

    if (!isBearerValid && !isParamValid) {
      return new Response(
        JSON.stringify({ error: "Unauthorized cron trigger: Invalid secret" }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  try {
    // Run scheduled rank tracking checks
    await withPgClient(() =>
      runScheduledRankChecks((typeof process !== "undefined" ? process.env : {}) as Env),
    );

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        message: "Scheduled rank checks triggered successfully",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("[api/cron] Error executing cron task:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Internal Cron Error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

export const Route = createFileRoute("/api/cron")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        return handleCronRequest(request);
      },
      POST: async ({ request }: { request: Request }) => {
        return handleCronRequest(request);
      },
    },
  },
});
