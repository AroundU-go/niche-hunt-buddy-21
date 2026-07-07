import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
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
  History,
  Clock,
  Download,
} from "lucide-react";
import { searchLeads, getSearchHistory, syncUserProfile, getUserPlan, requireAuth, type Lead, type SearchHistoryItem } from "@/lib/leads.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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
  beforeLoad: () => requireAuth(),
  component: DashboardPage,
});

function DashboardPage() {
  const runSyncProfile = useServerFn(syncUserProfile);

  // Sync user profile to Supabase on dashboard load
  useEffect(() => {
    runSyncProfile()
      .then((res) => {
        if (res && !res.synced && "error" in res) {
          toast.error(`Database Profile Sync failed: ${res.error}`);
        } else if (res && res.synced) {
          console.log("Database Profile Synced successfully.");
        }
      })
      .catch((err) => {
        toast.error(`Profile Sync connection error: ${err.message || err}`);
      });
  }, []);

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
  const [leadsLimit, setLeadsLimit] = useState("10");
  const [results, setResults] = useState<Lead[]>([]);
  const [meta, setMeta] = useState<{ city: string; niche: string } | null>(null);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);

  const runSearch = useServerFn(searchLeads);
  const runGetHistory = useServerFn(getSearchHistory);
  const runGetUserPlan = useServerFn(getUserPlan);
  const queryClient = useQueryClient();

  // Fetch search history
  const historyQuery = useQuery({
    queryKey: ["searchHistory"],
    queryFn: () => runGetHistory(),
  });

  // Fetch user plan status
  const planQuery = useQuery({
    queryKey: ["userPlan"],
    queryFn: () => runGetUserPlan(),
  });

  const historyItems: SearchHistoryItem[] = historyQuery.data?.history ?? [];
  const userPlan = planQuery.data?.plan ?? null;
  const userEmail = planQuery.data?.email ?? "";
  const extractedLeads = planQuery.data?.extractedLeads ?? 0;
  const isAdmin = userEmail === "uddimakesit@gmail.com";
  const hasAccess = isAdmin || userPlan === "pro" || userPlan === "basic";

  const quota = userPlan === "pro" ? 1500 : userPlan === "basic" ? 100 : 0;
  const percentUsed = quota > 0 ? Math.min(100, Math.round((extractedLeads / quota) * 100)) : 0;

  const basicCheckoutUrl = userEmail
    ? `https://checkout.dodopayments.com/buy/pdt_0NiVJmJzctfUNFC2qgT1k?quantity=1&email=${encodeURIComponent(userEmail)}&disableEmail=true`
    : "https://checkout.dodopayments.com/buy/pdt_0NiVJmJzctfUNFC2qgT1k?quantity=1";

  const proCheckoutUrl = userEmail
    ? `https://checkout.dodopayments.com/buy/pdt_0NiVK2h79kd3euwcFhI9z?quantity=1&email=${encodeURIComponent(userEmail)}&disableEmail=true`
    : "https://checkout.dodopayments.com/buy/pdt_0NiVK2h79kd3euwcFhI9z?quantity=1";

  const mutation = useMutation({
    mutationFn: async (vars: { city: string; niche: string; limit: number }) =>
      runSearch({ data: { city: vars.city, niche: vars.niche, limit: vars.limit } }),
    onSuccess: (data) => {
      setResults(data.leads);
      setMeta({ city: data.city, niche: data.niche });
      // Invalidate history and userPlan so count updates
      queryClient.invalidateQueries({ queryKey: ["searchHistory"] });
      queryClient.invalidateQueries({ queryKey: ["userPlan"] });
      if (data.leads.length === 0) {
        toast.info("No leads found. Try a broader city or different niche.");
      } else {
        toast.success(`Found ${data.leads.length} leads without websites`);
      }
    },
    onError: (err: Error) => {
      if (err.message?.includes("subscription_required")) {
        setPricingModalOpen(true);
      } else if (err.message?.includes("quota_exceeded")) {
        toast.error("You have exceeded your plan's monthly leads quota.");
      } else {
        toast.error(err.message || "Search failed");
      }
    },
  });

  const restoreHistory = (item: SearchHistoryItem) => {
    setResults(item.results || []);
    setMeta({ city: item.city, niche: item.niche });
    setCity(item.city);
    setNiche(item.niche);
    toast.success(`Restored results for ${item.niche} in ${item.city}`);
  };

  const exportToCSV = () => {
    if (userPlan !== "pro" && !isAdmin) {
      toast.error("CSV Export is only available on the Pro plan. Please upgrade to Pro.");
      setPricingModalOpen(true);
      return;
    }

    if (results.length === 0) return;

    const headers = [
      "Business Name",
      "Category",
      "Address",
      "Phone",
      "Lead Score",
      "Rating",
      "Reviews Count",
      "Google Maps URL"
    ];

    const rows = results.map(lead => [
      lead.title || "",
      lead.categoryName || "",
      lead.address || "",
      lead.phone || "",
      lead.leadScore || 0,
      lead.totalScore != null ? lead.totalScore : "",
      lead.reviewsCount != null ? lead.reviewsCount : "",
      lead.url || ""
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => 
        row.map(val => {
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        }).join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    
    const fileName = `leads-${(meta?.niche || "search").toLowerCase().replace(/[^a-z0-9]/g, "-")}-${(meta?.city || "results").toLowerCase().replace(/[^a-z0-9]/g, "-")}.csv`;
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("CSV file downloaded successfully!");
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim() || !niche.trim()) return;

    if (!hasAccess) {
      setPricingModalOpen(true);
      return;
    }

    const parsedLimit = parseInt(leadsLimit, 10);
    const finalLimit = isNaN(parsedLimit) ? 10 : Math.max(1, parsedLimit);

    if (!isAdmin) {
      const remaining = quota - extractedLeads;
      if (extractedLeads >= quota) {
        toast.error("You have already reached your plan's extraction quota. Please upgrade or wait for the next billing cycle.");
        return;
      }
      if (finalLimit > remaining) {
        toast.error(`Your request of ${finalLimit} leads exceeds your remaining quota of ${remaining} leads.`);
        return;
      }
    }

    mutation.mutate({ city: city.trim(), niche: niche.trim(), limit: finalLimit });
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
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Main column */}
      <div>
        {/* Quota Tracker */}
        {hasAccess && !isAdmin && (
          <Card className="mb-6 border-border/60 bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Extraction Quota
                </h3>
                <p className="text-2xl font-extrabold text-foreground">
                  {extractedLeads} <span className="text-muted-foreground text-sm font-normal">/ {quota} leads extracted</span>
                </p>
              </div>
              <div className="flex-1 max-w-md w-full">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{percentUsed}% used</span>
                  <span>{Math.max(0, quota - extractedLeads)} remaining</span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${percentUsed}%`, 
                      background: percentUsed >= 90 ? "oklch(0.6 0.18 29)" : "var(--gradient-hunt)" 
                    }} 
                  />
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Search */}
        <Card className="mb-6 border-border/60 bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="mb-3 flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              New hunt
            </h3>
          </div>
          <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-[1fr_1fr_120px_auto]">
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
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                No. of leads
              </label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="number"
                  min={1}
                  max={isAdmin ? 10000 : Math.max(1, quota - extractedLeads)}
                  value={leadsLimit}
                  onChange={(e) => setLeadsLimit(e.target.value)}
                  placeholder="10"
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
            <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
              <h3 className="text-lg font-semibold">
                Leads for <span className="text-primary">{meta?.niche}</span> in{" "}
                <span className="text-primary">{meta?.city}</span>
              </h3>
              <div className="flex items-center gap-3">
                <Button
                  onClick={exportToCSV}
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs font-medium border-primary/20 hover:border-primary/40 hover:bg-primary/5 text-foreground"
                >
                  <Download className="h-3.5 w-3.5 text-primary" />
                  Export CSV
                  {(!isAdmin && userPlan !== "pro") && (
                    <span className="ml-1 rounded bg-primary/10 px-1 py-0.5 text-[9px] font-semibold text-primary uppercase">
                      Pro
                    </span>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">Sorted by lead score</p>
              </div>
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

      {/* History sidebar */}
      <div className="hidden lg:block">
        <Card className="sticky top-24 border-border/60 bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="mb-4 flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Search History
            </h3>
          </div>
          {historyQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-md bg-muted/50" />
              ))}
            </div>
          ) : historyItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">No searches yet. Start your first hunt above!</p>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {historyItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => restoreHistory(item)}
                  className="w-full rounded-lg border border-border/60 bg-background p-3 text-left transition-all hover:border-primary/40 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.niche}</p>
                      <p className="truncate text-xs text-muted-foreground">{item.city}</p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      {(item.results || []).length} leads
                    </Badge>
                  </div>
                  <div className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(item.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Pricing Modal for subscription enforcement */}
      <Dialog open={pricingModalOpen} onOpenChange={setPricingModalOpen}>
        <DialogContent className="max-w-4xl p-6 bg-background border border-border sm:rounded-xl">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-extrabold tracking-tight text-foreground">
              Choose a Subscription Plan
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm mt-1">
              Every email other than admin must have an active subscription to search leads.
            </DialogDescription>
          </DialogHeader>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 20,
              marginTop: 20,
            }}
          >
            {/* Basic Plan */}
            <div className="pricing-card" style={{ padding: "24px", minHeight: "auto" }}>
              <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "oklch(0.5 0.02 250)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                Basic
              </p>
              <div style={{ marginBottom: 16 }}>
                <span style={{ fontSize: "2.5rem", fontWeight: 800, color: "oklch(0.12 0.02 250)" }}>$9</span>
                <span style={{ fontSize: "1rem", color: "oklch(0.5 0.02 250)" }}>/mo</span>
              </div>
              <ul className="pricing-feature-list" style={{ gap: 8, fontSize: "0.85rem" }}>
                <PricingItem included label="100 leads per month" />
                <PricingItem included label="Save to library" />
                <PricingItem included label="Phone numbers" />
                <PricingItem included label="Prioritized lead scoring" />
                <PricingItem included={false} label="CSV export" />
              </ul>
              <a
                href={basicCheckoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  marginTop: 20,
                  padding: "10px 16px",
                  textDecoration: "none",
                }}
              >
                Get Started
              </a>
            </div>

            {/* Pro Plan */}
            <div className="pricing-card featured" style={{ padding: "24px", minHeight: "auto" }}>
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  background: "oklch(0.92 0.04 284.1)",
                  color: "oklch(0.45 0.2 284.1)",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  padding: "2px 10px",
                  borderRadius: 999,
                }}
              >
                Most Popular
              </div>
              <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "oklch(0.5 0.02 250)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                Pro
              </p>
              <div style={{ marginBottom: 16 }}>
                <span style={{ fontSize: "2.5rem", fontWeight: 800, color: "oklch(0.12 0.02 250)" }}>$49</span>
                <span style={{ fontSize: "1rem", color: "oklch(0.5 0.02 250)" }}>/mo</span>
              </div>
              <ul className="pricing-feature-list" style={{ gap: 8, fontSize: "0.85rem" }}>
                <PricingItem included label="1,500 leads per month" />
                <PricingItem included label="Save to library" />
                <PricingItem included label="Phone numbers" />
                <PricingItem included label="Prioritized lead scoring" />
                <PricingItem included label="CSV export" />
              </ul>
              <a
                href={proCheckoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  marginTop: 20,
                  padding: "10px 16px",
                  textDecoration: "none",
                }}
              >
                Get Pro
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ────────────────────────────
 *  PRICING ITEM HELPER
 * ──────────────────────────── */

function PricingItem({ included, label }: { included: boolean; label: string }) {
  return (
    <li className={included ? "" : "disabled"}>
      <span className="check">
        {included ? (
          <svg viewBox="0 0 12 12" fill="none" style={{ width: 12, height: 12 }}>
            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 12 12" fill="none" style={{ width: 12, height: 12 }}>
            <path d="M3 9L9 3M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </span>
      {label}
    </li>
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
