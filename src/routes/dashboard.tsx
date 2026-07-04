import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { auth } from "@clerk/tanstack-react-start/server";
import { UserButton } from "@clerk/tanstack-react-start";
import {
  Crosshair,
  MapPin,
  Phone,
  Star,
  ExternalLink,
  Loader2,
  Target,
  TrendingUp,
  Search,
  Building2,
} from "lucide-react";
import { searchLeads, type Lead } from "@/lib/leads.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — HuntX" },
      {
        name: "description",
        content: "Enter a city and niche to find local businesses without websites.",
      },
    ],
  }),
  beforeLoad: async () => {
    const { userId } = await auth();
    if (!userId) {
      throw redirect({ to: "/sign-in" });
    }
  },
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Dashboard Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(16px)",
          background: "oklch(0.985 0.002 120 / 0.85)",
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
          <Link
            to="/"
            style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}
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
          </Link>

          {/* User controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: { width: 36, height: 36 },
                },
              }}
            />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1
            style={{
              fontSize: "1.8rem",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "oklch(0.12 0.02 250)",
              marginBottom: 8,
            }}
          >
            Find Your Next Client
          </h1>
          <p style={{ color: "oklch(0.5 0.02 250)", fontSize: "1rem" }}>
            Enter a city and business niche to discover leads without websites.
          </p>
        </div>
        <DashboardSearch />
      </main>
    </div>
  );
}

/* ────────────────────────────
 *  DASHBOARD SEARCH
 * ──────────────────────────── */

function DashboardSearch() {
  const [city, setCity] = useState("");
  const [niche, setNiche] = useState("");
  const [results, setResults] = useState<Lead[]>([]);
  const [meta, setMeta] = useState<{ city: string; niche: string } | null>(null);

  const runSearch = useServerFn(searchLeads);

  const mutation = useMutation({
    mutationFn: async (vars: { city: string; niche: string }) =>
      runSearch({ data: { city: vars.city, niche: vars.niche, limit: 3 } }),
    onSuccess: (data) => {
      setResults(data.leads);
      setMeta({ city: data.city, niche: data.niche });
      if (data.leads.length === 0) {
        toast.info("No leads found. Try a broader city or different niche.");
      } else {
        toast.success(`Found ${data.leads.length} leads without websites`);
      }
    },
    onError: (err: Error) => {
      toast.error(err.message || "Search failed");
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim() || !niche.trim()) return;
    mutation.mutate({ city: city.trim(), niche: niche.trim() });
  };

  const hotCount = results.filter((r) => r.leadScore >= 75).length;
  const withPhone = results.filter((r) => r.phone).length;
  const avgRating =
    results.length > 0
      ? (
          results.reduce((s, r) => s + (r.totalScore ?? 0), 0) /
          results.filter((r) => r.totalScore != null).length
        ).toFixed(1)
      : "—";

  return (
    <div>
      {/* Search */}
      <Card className="mb-6 border-border/60 bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="mb-3 flex items-center gap-2">
          <Search className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            New hunt
          </h3>
        </div>
        <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">City</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Austin, USA"
                className="pl-9"
                disabled={mutation.isPending}
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Business niche
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="barber shop, plumber, dentist…"
                className="pl-9"
                disabled={mutation.isPending}
              />
            </div>
          </div>
          <div className="flex items-end">
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="w-full font-semibold md:w-auto"
              style={{ background: "var(--gradient-hunt)", color: "var(--primary-foreground)" }}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Hunting…
                </>
              ) : (
                <>
                  <Crosshair className="mr-2 h-4 w-4" />
                  Start hunt
                </>
              )}
            </Button>
          </div>
        </form>
        {mutation.isPending && (
          <p className="mt-3 text-xs text-muted-foreground">
            Scanning Google Maps for {niche} in {city} without a website. This may take 30–90 seconds.
          </p>
        )}
      </Card>

      {/* Stats */}
      {results.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Total leads" value={String(results.length)} icon={Target} />
          <StatCard label="Hot leads" value={String(hotCount)} icon={TrendingUp} accent />
          <StatCard label="With phone" value={String(withPhone)} icon={Phone} />
          <StatCard label="Avg rating" value={avgRating} icon={Star} />
        </div>
      )}

      {/* Results */}
      {results.length > 0 ? (
        <div>
          <div className="mb-4 flex items-baseline justify-between">
            <h3 className="text-lg font-semibold">
              Leads for <span className="text-primary">{meta?.niche}</span> in{" "}
              <span className="text-primary">{meta?.city}</span>
            </h3>
            <p className="text-xs text-muted-foreground">Sorted by lead score</p>
          </div>
          <div className="grid gap-4">
            {results.map((lead) => (
              <LeadCard key={lead.placeId} lead={lead} />
            ))}
          </div>
        </div>
      ) : !mutation.isPending ? (
        <EmptyState />
      ) : (
        <LoadingSkeleton />
      )}
    </div>
  );
}

/* ────────────────────────────
 *  REUSABLE HELPERS
 * ──────────────────────────── */

function scoreColor(score: number) {
  if (score >= 75) return "text-primary";
  if (score >= 50) return "text-chart-2";
  if (score >= 30) return "text-chart-3";
  return "text-muted-foreground";
}

function scoreLabel(score: number) {
  if (score >= 75) return "Hot";
  if (score >= 50) return "Warm";
  if (score >= 30) return "Cool";
  return "Cold";
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: boolean;
}) {
  return (
    <Card
      className={`border-border/60 bg-card p-4 ${accent ? "border-primary/40" : ""}`}
      style={accent ? { boxShadow: "var(--glow-primary)" } : undefined}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className={`mt-1 text-2xl font-bold ${accent ? "text-primary" : ""}`}>{value}</p>
        </div>
        <Icon className={`h-5 w-5 ${accent ? "text-primary" : "text-muted-foreground"}`} />
      </div>
    </Card>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  return (
    <Card className="border-border/60 bg-card p-5 transition-colors hover:border-primary/40">
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        {/* Score badge */}
        <div className="flex flex-row items-center gap-3 md:w-24 md:flex-col md:items-center">
          <div className="text-center">
            <div className={`text-3xl font-bold ${scoreColor(lead.leadScore)}`}>
              {lead.leadScore}
            </div>
            <div className={`text-[10px] font-semibold uppercase tracking-widest ${scoreColor(lead.leadScore)}`}>
              {scoreLabel(lead.leadScore)}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h4 className="truncate text-base font-semibold">{lead.title}</h4>
              {lead.categoryName && (
                <p className="text-xs text-muted-foreground">{lead.categoryName}</p>
              )}
            </div>
            {lead.url && (
              <a
                href={lead.url}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 text-xs text-primary hover:underline inline-flex items-center gap-1"
              >
                Google Maps <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
            {lead.address && (
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{lead.address}</span>
              </div>
            )}
            {lead.phone ? (
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-primary" />
                <a
                  href={`tel:${lead.phoneUnformatted ?? lead.phone}`}
                  className="font-medium text-foreground hover:text-primary"
                >
                  {lead.phone}
                </a>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                <span className="italic">No phone</span>
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {lead.totalScore != null && (
              <Badge variant="secondary" className="gap-1">
                <Star className="h-3 w-3 fill-current" />
                {lead.totalScore.toFixed(1)}
                <span className="text-muted-foreground">
                  ({lead.reviewsCount ?? 0})
                </span>
              </Badge>
            )}
            {!lead.hasWebsite && (
              <Badge className="bg-primary/15 text-primary border border-primary/30 hover:bg-primary/20">
                No website
              </Badge>
            )}
            {lead.neighborhood && (
              <Badge variant="outline" className="text-muted-foreground">
                {lead.neighborhood}
              </Badge>
            )}
          </div>

          {lead.topReviews.length > 0 && (
            <details className="mt-3 group">
              <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                Show recent reviews ({lead.topReviews.length})
              </summary>
              <div className="mt-2 space-y-2">
                {lead.topReviews.map((r, i) => (
                  <div
                    key={i}
                    className="rounded-md border border-border/60 bg-muted/40 p-3 text-xs"
                  >
                    <div className="mb-1 flex items-center gap-2">
                      {r.stars != null && (
                        <span className="flex items-center gap-0.5 text-primary">
                          {Array.from({ length: r.stars }).map((_, k) => (
                            <Star key={k} className="h-3 w-3 fill-current" />
                          ))}
                        </span>
                      )}
                      {r.name && <span className="font-medium">{r.name}</span>}
                    </div>
                    {r.text && <p className="text-muted-foreground line-clamp-3">{r.text}</p>}
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      </div>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-border/60 bg-card/40 p-12 text-center">
      <Crosshair className="mx-auto h-10 w-10 text-muted-foreground" />
      <h3 className="mt-4 text-base font-semibold">Ready to hunt</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter a city and business niche above to find leads without websites.
      </p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="h-32 animate-pulse rounded-lg border border-border/60 bg-card/50"
        />
      ))}
    </div>
  );
}
