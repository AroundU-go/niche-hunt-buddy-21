import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useState, lazy, Suspense } from "react";
import {
  Crosshair,
  Loader2,
  Globe2,
  ShieldCheck,
  Clock,
  Send,
  ChevronRight,
  X as XIcon,
  Building2,
  User,
  Sparkles,
} from "lucide-react";
import { useAuth, SignInButton, UserButton, useUser } from "@clerk/tanstack-react-start";
import { auth } from "@clerk/tanstack-react-start/server";

const GlobeLeads = lazy(() => import("@/components/GlobeLeads"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HuntX — Find Businesses That Need a Website" },
      {
        name: "description",
        content:
          "HuntX helps web agencies and freelancers find local businesses that don't have a website — so you can reach out first and close more deals.",
      },
      {
        property: "og:title",
        content: "HuntX — Find Businesses That Need a Website",
      },
      {
        property: "og:description",
        content:
          "Hunt local businesses that need a website. Scored, sorted, ready to pitch.",
      },
    ],
  }),
  component: LandingPage,
});

/* ──────────────────────────────────────────────────────────
 *  LANDING PAGE
 * ────────────────────────────────────────────────────────── */

function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();

  const userEmail = user?.primaryEmailAddress?.emailAddress;

  const basicCheckoutUrl = userEmail
    ? `https://checkout.dodopayments.com/buy/pdt_0NiVJmJzctfUNFC2qgT1k?quantity=1&email=${encodeURIComponent(userEmail)}`
    : "https://checkout.dodopayments.com/buy/pdt_0NiVJmJzctfUNFC2qgT1k?quantity=1";

  const proCheckoutUrl = userEmail
    ? `https://checkout.dodopayments.com/buy/pdt_0NiVK2h79kd3euwcFhI9z?quantity=1&email=${encodeURIComponent(userEmail)}`
    : "https://checkout.dodopayments.com/buy/pdt_0NiVK2h79kd3euwcFhI9z?quantity=1";

  const handlePaymentClick = (e: React.MouseEvent<HTMLAnchorElement>, checkoutUrl: string) => {
    if (!isSignedIn) {
      e.preventDefault();
      navigate({ to: "/sign-in" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* ===== HEADER / NAV ===== */}
      <header
        id="header"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(16px)",
          background: "oklch(0.985 0.002 284.1 / 0.85)",
          borderBottom: "1px solid oklch(0 0 0 / 0.06)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 72,
          }}
        >
          {/* Logo */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
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
          </Link>

          {/* Desktop Nav */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: 32,
            }}
            className="desktop-nav"
          >
            {["Features", "How It Works", "Pricing"].map((item) => {
              const targetId = item.toLowerCase().replace(/\s+/g, "-");
              return (
                <Link
                  key={item}
                  to="/"
                  hash={targetId}
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    color: "oklch(0.4 0.02 250)",
                    textDecoration: "none",
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "oklch(0.18 0.02 250)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "oklch(0.4 0.02 250)")}
                >
                  {item}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }} className="desktop-nav">
            {isLoaded && !isSignedIn && (
              <>
                <Link
                  to="/sign-in"
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    color: "oklch(0.3 0.02 250)",
                    textDecoration: "none",
                  }}
                >
                  Log in
                </Link>
                <Link to="/sign-up" className="btn-primary" style={{ padding: "10px 22px", fontSize: "0.85rem" }}>
                  Get Started
                </Link>
              </>
            )}
            {isLoaded && isSignedIn && (
              <>
                <Link
                  to="/dashboard"
                  className="btn-primary"
                  style={{
                    padding: "10px 22px",
                    fontSize: "0.85rem",
                  }}
                >
                  Dashboard
                </Link>
                <UserButton afterSignOutUrl="/" />
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: "none",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 8,
            }}
          >
            {mobileMenuOpen ? (
              <XIcon style={{ width: 24, height: 24 }} />
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div
            className="mobile-nav"
            style={{
              padding: "16px 24px 24px",
              borderTop: "1px solid oklch(0 0 0 / 0.06)",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {["Features", "How It Works", "Pricing"].map((item) => {
              const targetId = item.toLowerCase().replace(/\s+/g, "-");
              return (
                <Link
                  key={item}
                  to="/"
                  hash={targetId}
                  style={{
                    fontSize: "1rem",
                    fontWeight: 500,
                    color: "oklch(0.3 0.02 250)",
                    textDecoration: "none",
                    padding: "8px 0",
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </Link>
              );
            })}
            <div style={{ display: "flex", gap: 12, marginTop: 8, alignItems: "center" }}>
              {isLoaded && !isSignedIn && (
                <>
                  <Link
                    to="/sign-in"
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 500,
                      color: "oklch(0.3 0.02 250)",
                      textDecoration: "none",
                      padding: "10px 0",
                    }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link
                    to="/sign-up"
                    className="btn-primary"
                    style={{ padding: "10px 22px", fontSize: "0.85rem" }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
              {isLoaded && isSignedIn && (
                <Link
                  to="/dashboard"
                  className="btn-primary"
                  style={{
                    padding: "10px 22px",
                    fontSize: "0.85rem",
                    width: "100%",
                    textAlign: "center",
                    justifyContent: "center",
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ===== HERO ===== */}
      <section
        id="hero"
        className="landing-section"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "4rem 24px 2rem",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          alignItems: "center",
          gap: "2rem",
        }}
      >
        {/* Left — Copy */}
        <div>
          {/* Badge */}
          <div className="hero-badge" style={{ marginBottom: 24 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 1L9.5 6.5L15 8L9.5 9.5L8 15L6.5 9.5L1 8L6.5 6.5L8 1Z"
                fill="oklch(0.62 0.24 284.1)"
                opacity="0.7"
              />
            </svg>
            Find High-Quality Leads. Close More Clients.
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: "oklch(0.12 0.02 250)",
              marginBottom: 20,
            }}
          >
            Find Businesses
            <br />
            That{" "}
            <span style={{ color: "oklch(0.52 0.22 284.1)" }}>Need a Website.</span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: "1.1rem",
              lineHeight: 1.7,
              color: "oklch(0.45 0.02 250)",
              maxWidth: 480,
              marginBottom: 32,
            }}
          >
            HuntX helps web agencies and freelancers find local businesses that
            don't have a website—so you can reach out first and close more deals.
          </p>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 36 }}>
            <Link to={isLoaded && isSignedIn ? "/dashboard" : "/sign-in"} className="btn-primary">
              Find businesses
              <ChevronRight style={{ width: 18, height: 18 }} />
            </Link>
          </div>

          {/* Feature Pills */}
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <span className="feature-pill">
              <Globe2 />
              Find leads without websites
            </span>
            <span className="feature-pill">
              <ShieldCheck />
              Verified contact info
            </span>
            <span className="feature-pill">
              <Send />
              Export & reach out instantly
            </span>
          </div>
        </div>

        {/* Right — Globe */}
        <div style={{ position: "relative" }}>
          <Suspense
            fallback={
              <div
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  borderRadius: "50%",
                  background: "oklch(0.96 0.005 284.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Loader2 style={{ width: 40, height: 40, animation: "spin 1s linear infinite", color: "oklch(0.62 0.24 284.1)" }} />
              </div>
            }
          >
            <GlobeLeads />
          </Suspense>
        </div>
      </section>

      {/* ===== PRODUCT DEMO VIDEO ===== */}
      <section
        id="demo"
        style={{
          padding: "5rem 24px",
          background: "oklch(0.985 0.002 250 / 0.5)",
          textAlign: "center",
          borderTop: "1px solid oklch(0 0 0 / 0.06)",
          borderBottom: "1px solid oklch(0 0 0 / 0.06)",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <p
            style={{
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "oklch(0.6 0.2 284.1)",
              marginBottom: 12,
              textTransform: "uppercase" as const,
              letterSpacing: "0.05em",
            }}
          >
            Product Demo
          </p>
          <h2
            style={{
              fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              color: "oklch(0.12 0.02 250)",
              marginBottom: 36,
            }}
          >
            See HuntX in Action
          </h2>
          <div
            className="video-container"
            style={{
              position: "relative",
              borderRadius: 24,
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px oklch(0.4 0.2 284.1 / 0.15)",
              border: "1px solid oklch(0.6 0.2 284.1 / 0.15)",
              background: "black",
              aspectRatio: "16 / 9",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.01)";
              e.currentTarget.style.boxShadow = "0 30px 60px -10px oklch(0.6 0.2 284.1 / 0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 25px 50px -12px oklch(0.4 0.2 284.1 / 0.15)";
            }}
          >
            <video
              src="/huntx-demo.mp4"
              controls
              playsInline
              preload="metadata"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="landing-section" style={{ maxWidth: 1200, margin: "0 auto", padding: "5rem 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p
            style={{
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "oklch(0.52 0.22 284.1)",
              marginBottom: 12,
              textTransform: "uppercase" as const,
              letterSpacing: "0.05em",
            }}
          >
            Why Agencies Choose HuntX
          </p>
          <h2
            style={{
              fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              color: "oklch(0.12 0.02 250)",
            }}
          >
            Built to Help You{" "}
            <span style={{ color: "oklch(0.52 0.22 284.1)" }}>Find, Reach & Close</span>
            <br />
            More Clients
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 24,
          }}
        >
          {[
            {
              icon: <Globe2 />,
              title: "Find Local Businesses",
              desc: "Discover businesses in any location that don't have a website yet.",
            },
            {
              icon: <ShieldCheck />,
              title: "Verified & Accurate",
              desc: "Get accurate business information you can trust to reach out.",
            },
            {
              icon: <Clock />,
              title: "Save Time",
              desc: "Stop manual research. Get fresh leads in seconds.",
            },
            {
              icon: <Send />,
              title: "Close More Deals",
              desc: "More leads = more opportunities = more clients.",
            },
          ].map((feat) => (
            <div key={feat.title} className="feature-card">
              <div className="icon-wrap">{feat.icon}</div>
              <h3
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "oklch(0.15 0.02 250)",
                  marginBottom: 8,
                }}
              >
                {feat.title}
              </h3>
              <p
                style={{
                  fontSize: "0.9rem",
                  lineHeight: 1.65,
                  color: "oklch(0.45 0.02 250)",
                }}
              >
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section
        id="how-it-works"
        className="landing-section"
        style={{
          background: "oklch(0.97 0.003 284.1)",
          padding: "5rem 24px",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p
              style={{
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "oklch(0.52 0.22 284.1)",
                marginBottom: 12,
                textTransform: "uppercase" as const,
                letterSpacing: "0.05em",
              }}
            >
              How It Works
            </p>
            <h2
              style={{
                fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                color: "oklch(0.12 0.02 250)",
              }}
            >
              Three Simple Steps
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 32,
            }}
          >
            {[
              {
                step: "01",
                title: "Enter a City & Niche",
                desc: "Tell us where and what type of businesses you want to find — barbers, dentists, plumbers, anything.",
              },
              {
                step: "02",
                title: "We Scan & Score",
                desc: "HuntX scans Google Maps, filters businesses without websites, and scores each lead.",
              },
              {
                step: "03",
                title: "Reach Out & Close",
                desc: "Get phone numbers, emails, and all the info you need to pitch your services and win new clients.",
              },
            ].map((s) => (
              <div
                key={s.step}
                style={{
                  background: "white",
                  borderRadius: 20,
                  padding: "2rem",
                  border: "1px solid oklch(0 0 0 / 0.06)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "var(--shadow-card-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: "var(--gradient-hunt)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "0.85rem",
                    fontWeight: 800,
                    marginBottom: 20,
                  }}
                >
                  {s.step}
                </div>
                <h3
                  style={{
                    fontSize: "1.15rem",
                    fontWeight: 700,
                    color: "oklch(0.15 0.02 250)",
                    marginBottom: 8,
                  }}
                >
                  {s.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.9rem",
                    lineHeight: 1.65,
                    color: "oklch(0.45 0.02 250)",
                  }}
                >
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHO IS IT FOR ===== */}
      <section
        id="who-is-it-for"
        className="landing-section"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "5rem 24px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p
            style={{
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "oklch(0.52 0.22 284.1)",
              marginBottom: 12,
              textTransform: "uppercase" as const,
              letterSpacing: "0.05em",
            }}
          >
            Who Is It For
          </p>
          <h2
            style={{
              fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              color: "oklch(0.12 0.02 250)",
            }}
          >
            Perfect Match for Web Professionals
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 24,
          }}
        >
          {[
            {
              icon: <Building2 />,
              title: "Web Design Agencies",
              desc: "Supercharge your pipeline. Find high-value local businesses that need professional redesigns, SEO, and full digital transformations.",
            },
            {
              icon: <User />,
              title: "Freelancers",
              desc: "Stop hunting on job boards. Directly pitching businesses with custom offers gives you a higher response rate and bigger contract values.",
            },
            {
              icon: <Sparkles />,
              title: "AI Web Builders",
              desc: "Automate custom page generation. Find clients, instantly generate initial design mockups with AI, and present ready-to-buy sites.",
            },
          ].map((target) => (
            <div key={target.title} className="feature-card">
              <div className="icon-wrap">{target.icon}</div>
              <h3
                style={{
                  fontSize: "1.15rem",
                  fontWeight: 700,
                  color: "oklch(0.15 0.02 250)",
                  marginBottom: 10,
                }}
              >
                {target.title}
              </h3>
              <p
                style={{
                  fontSize: "0.9rem",
                  lineHeight: 1.65,
                  color: "oklch(0.45 0.02 250)",
                }}
              >
                {target.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section id="pricing" className="landing-section" style={{ maxWidth: 1200, margin: "0 auto", padding: "5rem 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p
            style={{
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "oklch(0.52 0.22 284.1)",
              marginBottom: 12,
              textTransform: "uppercase" as const,
              letterSpacing: "0.05em",
            }}
          >
            Pricing
          </p>
          <h2
            style={{
              fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              color: "oklch(0.12 0.02 250)",
            }}
          >
            Simple, Transparent Pricing
          </h2>
          <p style={{ color: "oklch(0.5 0.02 250)", marginTop: 12, fontSize: "1rem" }}>
            Start free. Upgrade when you're ready.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 24,
            maxWidth: 780,
            margin: "0 auto",
          }}
        >
          {/* Starter Plan */}
          <div className="pricing-card">
            <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "oklch(0.5 0.02 250)", textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: 8 }}>
              Basic
            </p>
            <div style={{ marginBottom: 24 }}>
              <span style={{ fontSize: "3rem", fontWeight: 800, color: "oklch(0.12 0.02 250)" }}>$9</span>
              <span style={{ fontSize: "1rem", color: "oklch(0.5 0.02 250)" }}>/mo</span>
            </div>
            <ul className="pricing-feature-list">
              <PricingItem included label="100 leads per month" />
              <PricingItem included label="Save to library" />
              <PricingItem included label="Phone numbers" />
              <PricingItem included label="Prioritized lead scoring" />
              <PricingItem included={false} label="Email addresses" />
              <PricingItem included={false} label="CSV export" />
              <PricingItem included={false} label="Ready to send emails" />
            </ul>
            <a
              href={basicCheckoutUrl}
              onClick={(e) => handlePaymentClick(e, basicCheckoutUrl)}
              className="btn-outline"
              style={{
                width: "100%",
                justifyContent: "center",
                marginTop: 28,
                padding: "12px 20px",
              }}
            >
              Get Started
            </a>
          </div>

          {/* Basic Plan */}
          <div className="pricing-card featured">
            <div
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "oklch(0.92 0.04 284.1)",
                color: "oklch(0.45 0.2 284.1)",
                fontSize: "0.75rem",
                fontWeight: 700,
                padding: "4px 12px",
                borderRadius: 999,
              }}
            >
              Most Popular
            </div>
            <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "oklch(0.5 0.02 250)", textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: 8 }}>
              Pro
            </p>
            <div style={{ marginBottom: 24 }}>
              <span style={{ fontSize: "3rem", fontWeight: 800, color: "oklch(0.12 0.02 250)" }}>$49</span>
              <span style={{ fontSize: "1rem", color: "oklch(0.5 0.02 250)" }}>/mo</span>
            </div>
            <ul className="pricing-feature-list">
              <PricingItem included label="1,000 leads per month" />
              <PricingItem included label="Save to library" />
              <PricingItem included label="Phone numbers" />
              <PricingItem included label="Prioritized lead scoring" />
              <PricingItem included label="Email addresses" />
              <PricingItem included label="CSV export" />
            </ul>
            <a
              href={proCheckoutUrl}
              onClick={(e) => handlePaymentClick(e, proCheckoutUrl)}
              className="btn-primary"
              style={{
                width: "100%",
                justifyContent: "center",
                marginTop: 28,
                padding: "12px 20px",
              }}
            >
              Get Pro
              <ChevronRight style={{ width: 16, height: 16 }} />
            </a>
          </div>
        </div>
      </section>



      {/* ===== CTA ===== */}
      <section
        style={{
          textAlign: "center",
          padding: "5rem 24px",
          background: "var(--gradient-hunt)",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
            fontWeight: 800,
            color: "white",
            lineHeight: 1.2,
            marginBottom: 16,
          }}
        >
          Ready to Find Your Next Client?
        </h2>
        <p style={{ fontSize: "1.05rem", color: "oklch(1 0 0 / 0.8)", marginBottom: 28, maxWidth: 480, margin: "0 auto 28px" }}>
          Join 100+ agencies already using HuntX to find and close more web design deals.
        </p>
        <Link
          to={isLoaded && isSignedIn ? "/dashboard" : "/"}
          hash={isLoaded && isSignedIn ? undefined : "pricing"}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "14px 32px",
            background: "white",
            color: "oklch(0.45 0.2 284.1)",
            borderRadius: 12,
            fontWeight: 700,
            fontSize: "1rem",
            textDecoration: "none",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 8px 24px oklch(0 0 0 / 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {isLoaded && isSignedIn ? "Go to Dashboard" : "Start Free Trial"}
          <ChevronRight style={{ width: 18, height: 18 }} />
        </Link>
      </section>

      {/* ===== FOOTER ===== */}
      <footer
        style={{
          borderTop: "1px solid oklch(0 0 0 / 0.06)",
          padding: "3rem 24px 2rem",
          background: "oklch(0.985 0.002 284.1)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 40,
          }}
        >
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: "var(--gradient-hunt)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Crosshair style={{ width: 16, height: 16, color: "white" }} strokeWidth={2.5} />
              </div>
              <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "oklch(0.18 0.02 250)" }}>HuntX</span>
            </div>
            <p style={{ fontSize: "0.85rem", color: "oklch(0.5 0.02 250)", lineHeight: 1.65, maxWidth: 250 }}>
              Find local businesses that need a website. Score, sort, and close more deals.
            </p>
          </div>

          {/* Links */}
          {[
            {
              title: "Product",
              links: ["Features", "Pricing", "How It Works", "Changelog"],
            },
            {
              title: "Resources",
              links: ["Blog", "Help Center", "Community", "API Docs"],
            },
            {
              title: "Company",
              links: ["About", "Careers", "Contact", "Privacy"],
            },
          ].map((col) => (
            <div key={col.title}>
              <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "oklch(0.3 0.02 250)", marginBottom: 12, textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>
                {col.title}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {col.links.map((link) => {
                  const isSection = ["Features", "Pricing", "How It Works"].includes(link);
                  const targetId = link.toLowerCase().replace(/\s+/g, "-");
                  if (isSection) {
                    return (
                      <Link
                        key={link}
                        to="/"
                        hash={targetId}
                        style={{
                          fontSize: "0.85rem",
                          color: "oklch(0.5 0.02 250)",
                          textDecoration: "none",
                          transition: "color 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "oklch(0.25 0.02 250)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "oklch(0.5 0.02 250)")}
                      >
                        {link}
                      </Link>
                    );
                  }
                  return (
                    <a
                      key={link}
                      href="#"
                      style={{
                        fontSize: "0.85rem",
                        color: "oklch(0.5 0.02 250)",
                        textDecoration: "none",
                        transition: "color 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "oklch(0.25 0.02 250)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "oklch(0.5 0.02 250)")}
                    >
                      {link}
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            maxWidth: 1200,
            margin: "40px auto 0",
            paddingTop: 20,
            borderTop: "1px solid oklch(0 0 0 / 0.06)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <p style={{ fontSize: "0.8rem", color: "oklch(0.55 0.02 250)" }}>
            © {new Date().getFullYear()} HuntX. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: 20 }}>
            <a href="#" style={{ fontSize: "0.8rem", color: "oklch(0.55 0.02 250)", textDecoration: "none" }}>
              Terms
            </a>
            <a href="#" style={{ fontSize: "0.8rem", color: "oklch(0.55 0.02 250)", textDecoration: "none" }}>
              Privacy
            </a>
            <a href="#" style={{ fontSize: "0.8rem", color: "oklch(0.55 0.02 250)", textDecoration: "none" }}>
              Cookies
            </a>
          </div>
        </div>
      </footer>

      {/* ===== RESPONSIVE STYLES (inline via style tag) ===== */}
      <style>{`
        .desktop-nav { display: flex !important; }
        .mobile-menu-btn { display: none !important; }
        .mobile-nav { display: none !important; }

        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
          .mobile-nav { display: flex !important; }

          #hero {
            grid-template-columns: 1fr !important;
            text-align: center;
          }
          #hero > div:first-child {
            order: 0;
          }
          #hero > div:last-child {
            order: 1;
          }
          #hero .hero-badge {
            margin-left: auto;
            margin-right: auto;
          }
          #hero p {
            margin-left: auto;
            margin-right: auto;
          }
          #hero > div:first-child > div:last-child {
            justify-content: center;
          }
          #hero > div:first-child > div:nth-last-child(2) {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}

/* ────────────────────────────
 *  PRICING ITEM
 * ──────────────────────────── */

function PricingItem({ included, label }: { included: boolean; label: string }) {
  return (
    <li className={included ? "" : "disabled"}>
      <span className="check">
        {included ? (
          <svg viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 12 12" fill="none">
            <path d="M3 9L9 3M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </span>
      {label}
    </li>
  );
}
