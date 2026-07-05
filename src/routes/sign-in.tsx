import { createFileRoute } from "@tanstack/react-router";
import { SignIn } from "@clerk/tanstack-react-start";
import { Crosshair } from "lucide-react";

export const Route = createFileRoute("/sign-in")({
  head: () => ({
    meta: [
      { title: "Sign In — HuntX" },
      {
        name: "description",
        content: "Sign in to HuntX to find local businesses that need a website.",
      },
    ],
  }),
  component: SignInPage,
});

function SignInPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "oklch(0.985 0.002 284.1)",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        {/* Logo */}
        <a
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "var(--gradient-hunt)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Crosshair style={{ width: 20, height: 20, color: "white" }} strokeWidth={2.5} />
          </div>
          <span
            style={{
              fontSize: "1.25rem",
              fontWeight: 800,
              color: "oklch(0.18 0.02 250)",
              letterSpacing: "-0.02em",
            }}
          >
            HuntX
          </span>
        </a>

        {/* Clerk SignIn component */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <SignIn
            routing="hash"
            forceRedirectUrl="/dashboard"
            signUpUrl="/sign-up"
          />
        </div>
      </div>
    </div>
  );
}
