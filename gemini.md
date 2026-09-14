# Database Modification Rule

Always use MCP tools (apply_migration / execute_sql) for database modifications. Do NOT use local CLI commands like 'supabase db push'.

IMPORTANT: The `Workspace` entity has been renamed to `Host`. All references, types, and imports must be updated to use `Host` instead of `Workspace`.
