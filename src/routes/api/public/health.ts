import { createFileRoute } from "@tanstack/react-router";

/**
 * Public diagnostics endpoint. Reports ONLY whether a server-side configuration
 * value is present — never its value — so we can tell a real outage apart from
 * a missing environment binding without exposing any secret.
 */
export const Route = createFileRoute("/api/public/health")({
  server: {
    handlers: {
      GET: async () => {
        const present = (name: string) => Boolean(process.env[name]);
        return Response.json({
          ok: true,
          runtime: {
            supabaseUrl: present("SUPABASE_URL"),
            supabasePublishableKey: present("SUPABASE_PUBLISHABLE_KEY"),
            supabaseServiceRoleKey: present("SUPABASE_SERVICE_ROLE_KEY"),
            lovableApiKey: present("LOVABLE_API_KEY"),
            viteSupabaseUrl: Boolean(import.meta.env.VITE_SUPABASE_URL),
            viteSupabasePublishableKey: Boolean(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY),
          },
        });
      },
    },
  },
});