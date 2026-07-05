import { createFileRoute } from "@tanstack/react-router";
import { SignUp } from "@clerk/tanstack-react-start";
import { Crosshair } from "lucide-react";

export const Route = createFileRoute("/sign-up")({
  head: () => ({
    meta: [
      { title: "Sign Up — HuntX" },
      {
        name: "description",
        content: "Create a HuntX account to find local businesses that need a website.",
      },
    ],
  }),
  component: SignUpPage,
});

function SignUpPage() {
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

        {/* Clerk SignUp component */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <SignUp
            routing="hash"
            forceRedirectUrl="/dashboard"
            signInUrl="/sign-in"
          />
        </div>
      </div>
    </div>
  );
}
