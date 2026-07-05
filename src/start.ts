import { createStart, createMiddleware } from "@tanstack/react-start";
import { clerkMiddleware } from "@clerk/tanstack-react-start/server";
import { isRedirect } from "@tanstack/react-router";

import { renderErrorPage } from "./lib/error-page";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (
      isRedirect(error) ||
      (error != null &&
        typeof error === "object" &&
        (("isRedirect" in error && error.isRedirect) ||
          ("type" in error && error.type === "redirect")))
    ) {
      throw error;
    }
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  requestMiddleware: [
    clerkMiddleware({
      publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
    }),
    errorMiddleware,
  ],
}));
