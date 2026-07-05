import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

// Safely load env variables from .env in Node/local environment
if (typeof process !== "undefined" && process.env) {
  // Only attempt FS operations if we are running in a Node.js process
  const isNode = typeof process.release === "object" && process.release.name === "node";
  if (isNode) {
    Promise.all([import("fs"), import("path")])
      .then(([fs, path]) => {
        const envPath = path.resolve(process.cwd(), ".env");
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, "utf8");
          envContent.split("\n").forEach((line) => {
            const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
            if (match) {
              const key = match[1];
              let value = match[2] || "";
              if (
                value.length > 0 &&
                value.charAt(0) === '"' &&
                value.charAt(value.length - 1) === '"'
              ) {
                value = value.replace(/\\n/gm, "\n");
              }
              value = value.replace(/(^['"]|['"]$)/g, "").trim();
              if (!process.env[key]) {
                process.env[key] = value;
              }
            }
          });
          console.log("Local .env loaded into process.env");
        }
      })
      .catch(() => {});
  }
}

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    // Populate process.env with Cloudflare env bindings for server compatibility
    if (
      typeof process !== "undefined" &&
      process.env &&
      typeof env === "object" &&
      env !== null
    ) {
      Object.assign(process.env, env);
    }
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
