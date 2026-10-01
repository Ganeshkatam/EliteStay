/**
 * Ambient module declarations for Deno HTTP URL imports used in Supabase Edge Functions.
 * This resolves IDE and TypeScript language server diagnostics for https:// imports.
 */

declare module 'https://*' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value: any;
  export default value;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const serve: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const createClient: any;
}
