# Democratic SEO

> Open-source, AI-native alternative to Semrush and Ahrefs

Democratic SEO is an SEO research and intelligence tool for *the people*. If tools like Semrush or Ahrefs are too expensive or bloated, Democratic SEO is a pay-as-you-go, self-hostable alternative that you actually control.

> All-in-one SEO tool for you and your AI agent.

Connect with any AI agent like Claude Code, Cursor, Windsurf, or Hermes via the Model Context Protocol (MCP). Use our pre-built agent skills or build your own to tailor Democratic SEO to your needs.

---

## Key Features

- **Nion In-App SEO Agent**: Interactive AI assistant with access to every research tool. Powered by **MiniMax API** (Primary) and **Kimi / Moonshot API** (Secondary / Fallback).
- **Keyword Research & Intent Clustering**: Uncover search volume, CPC, keyword difficulty, and AI-driven semantic intent clusters.
- **Domain Overview & Footprint**: Organic traffic estimates, domain rank, top ranking terms, and side-by-side competitor gap analysis.
- **Backlinks & Link Prospecting**: Active backlinks, referring domains, DoFollow ratios, toxicity flags, and link intersection prospecting.
- **Rank Tracking & Monitoring**: Track search positions on Google Desktop and Mobile across geographic locations on customizable schedules.
- **Site Audit & Technical Web Crawler**: 100% free, self-hosted web crawler (Cheerio parser) for technical SEO issues, broken links, status codes, and issue severity reports.
- **Search Performance (Google Search Console)**: Direct Google Search Console integration for real impressions, clicks, CTR, and positions.
- **OpenSEO / Democratic SEO MCP Server & Agent Skills**: 19+ live SEO tools exposed via MCP to external AI agents.

---

## Deployment & Hosting Options

Democratic SEO can be deployed for **free** on multiple cloud platforms:

1. **Vercel Free Hobby Tier**:
   - Deploys as a modern TanStack Start serverless web application.
   - Use **Neon PostgreSQL Free Tier** or Supabase for zero-cost database hosting.
   - Automated rank tracking runs for free via **cron-jobs.org** HTTP cron webhook (`/api/cron`).
   - See [`vercel_cronjobs_org_deployment_guide.md`](./C:/Users/Administrator/.gemini/antigravity-ide/brain/7920ad76-03c4-49d5-9711-ec4ba4188670/vercel_cronjobs_org_deployment_guide.md) or [`vercel.json`](./vercel.json).

2. **Cloudflare Workers / Pages**:
   - Runs 100% on Cloudflare's Free Tier (Workers, D1 SQLite Database, R2 File Bucket, KV Namespace, and Native Scheduled Crons).
   - See [`cloudflare_deployment_guide.md`](./C:/Users/Administrator/.gemini/antigravity-ide/brain/7920ad76-03c4-49d5-9711-ec4ba4188670/cloudflare_deployment_guide.md) or [`wrangler.jsonc`](./wrangler.jsonc).

3. **Docker Self-Hosting**:
   - Run locally or on your own VPS with Docker Compose. See [`docs/SELF_HOSTING_DOCKER.md`](./docs/SELF_HOSTING_DOCKER.md).

---

## Environment Variables Setup

Copy `.env.vercel.example` or `.env.example` to `.env.local` and set your credentials:

```env
# AI Models (Primary: MiniMax, Secondary: Kimi / Moonshot)
MINIMAX_API_KEY=your_minimax_api_key_here
MINIMAX_BASE_URL=https://api.minimax.chat/v1
KIMI_API_KEY=your_kimi_api_key_here
KIMI_BASE_URL=https://api.moonshot.cn/v1

# SEO Data Provider
DATAFORSEO_API_KEY=your_base64_dataforseo_credentials

# Database (Postgres for Vercel / D1 for Cloudflare)
DATABASE_PROVIDER=postgres
DATABASE_URL=your_postgres_connection_string

# Cron Security Token
CRON_SECRET=your_random_secret_token
```

---

## Local Development

```bash
pnpm install
pnpm dev
```

See [`docs/LOCAL_DEVELOPMENT.md`](./docs/LOCAL_DEVELOPMENT.md) for full instructions.

---

## License & Contributing

Contributions are welcome! See [`docs/CONTRIBUTING.md`](./docs/CONTRIBUTING.md).
