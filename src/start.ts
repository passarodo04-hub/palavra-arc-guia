import { createStart, createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);

    // RPC calls (server functions) must answer with JSON, never the HTML error
    // shell: the browser cannot parse HTML and every failure — including a
    // simply expired session — would surface as "server unreachable".
    const url = (() => {
      try {
        return getRequest()?.url ?? "";
      } catch {
        return "";
      }
    })();
    if (url.includes("/_serverFn/")) {
      const message = error instanceof Error ? error.message : "Internal Server Error";
      const unauthorized = /unauthorized|invalid token|authorization header/i.test(message);
      return new Response(JSON.stringify({ error: true, message }), {
        status: unauthorized ? 401 : 500,
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    }

    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware],
  functionMiddleware: [attachSupabaseAuth],
}));
