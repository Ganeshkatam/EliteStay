<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Security Rule

The service_role key must never exist outside trusted server infrastructure.

## EliteStay V1 Security Policy

- RLS enabled on every table
- Default deny
- Least privilege
- Publishable key only in the app
- Server uses authenticated user context, not elevated credentials
- No service_role key in the application
- No RLS bypass
- No admin backdoors
- No hidden privileged API endpoints

# Supabase Tooling Rule

Always use the Supabase MCP tools (`mcp_supabase_*` or via `call_mcp_tool`) for interacting with Supabase. Do NOT use the `supabase` CLI directly.

# Database & SQL Synchronization Rule

Whenever modifying database schemas, migrations, functions, or reference data, you MUST always update the local SQL files (`supabase/schema/*.sql` and migrations) and execute the corresponding changes against the remote live Supabase database at the same time. Never permit local SQL definitions to drift from the active remote database schema.
