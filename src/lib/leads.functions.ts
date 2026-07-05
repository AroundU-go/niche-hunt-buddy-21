import { createServerFn } from "@tanstack/react-start";
import { auth, clerkClient } from "@clerk/tanstack-react-start/server";
import { supabase, getSupabaseClient } from "./supabase";

export type Lead = {
  placeId: string;
  title: string;
  categoryName: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  phoneUnformatted: string | null;
  totalScore: number | null;
  reviewsCount: number | null;
  url: string | null;
  imageUrl: string | null;
  neighborhood: string | null;
  openingHours: { day: string; hours: string }[] | null;
  topReviews: { name: string | null; text: string | null; stars: number | null; publishedAt: string | null }[];
  hasWebsite: boolean;
  leadScore: number;
};

function computeLeadScore(item: {
  totalScore?: number | null;
  reviewsCount?: number | null;
  phone?: string | null;
  website?: string | null;
}): number {
  const rating = typeof item.totalScore === "number" ? item.totalScore : 0;
  const reviews = typeof item.reviewsCount === "number" ? item.reviewsCount : 0;
  const hasPhone = !!item.phone;
  const noWebsite = !item.website;

  // Rating contribution (0-40)
  const ratingScore = (rating / 5) * 40;
  // Reviews contribution (0-30) — log scale, caps around ~200 reviews
  const reviewScore = Math.min(30, Math.log10(reviews + 1) * 13);
  // Phone availability (0-20)
  const phoneScore = hasPhone ? 20 : 0;
  // No website bonus (0-10) — this is a "no website" leads app
  const noWebBonus = noWebsite ? 10 : 0;

  return Math.round(ratingScore + reviewScore + phoneScore + noWebBonus);
}

/* ────────────────────────────
 *  SYNC USER PROFILE
 * ──────────────────────────── */

export const syncUserProfile = createServerFn({ method: "POST" })
  .handler(async () => {
    const { userId, getToken } = await auth();
    if (!userId) {
      return { synced: false };
    }

    const user = await clerkClient.users.getUser(userId);
    const email = user.emailAddresses?.[0]?.emailAddress ?? "";

    const supabaseClient = await getSupabaseClient(getToken);
    const { error } = await supabaseClient.from("profiles").upsert(
      {
        id: userId,
        email,
        first_name: user.firstName ?? null,
        last_name: user.lastName ?? null,
        last_login: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (error) {
      console.error("Supabase profile sync error:", error.message);
      return { synced: false, error: error.message };
    }

    return { synced: true };
  });

export const searchLeads = createServerFn({ method: "POST" })
  .inputValidator((data: { city: string; niche: string; limit?: number }) => {
    if (!data || typeof data.city !== "string" || typeof data.niche !== "string") {
      throw new Error("city and niche are required");
    }
    const city = data.city.trim();
    const niche = data.niche.trim();
    if (!city || !niche) throw new Error("city and niche cannot be empty");
    return { city, niche };
  })
  .handler(async ({ data }) => {
    const token = process.env.APIFY_TOKEN;
    if (!token) throw new Error("APIFY_TOKEN not configured");

    let limit = 3;
    // --- Clerk: get authenticated user ---
    let userId: string | null = null;
    let supabaseClient = supabase;
    try {
      const { userId: authedId, getToken } = await auth();
      userId = authedId;
      if (userId) {
        supabaseClient = await getSupabaseClient(getToken);
        const user = await clerkClient.users.getUser(userId);
        const email = user.emailAddresses?.[0]?.emailAddress ?? "";
        // Upsert profile in Supabase
        await supabaseClient.from("profiles").upsert(
          {
            id: userId,
            email,
            first_name: user.firstName ?? null,
            last_name: user.lastName ?? null,
            last_login: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

        // Fetch plan status to determine search limits dynamically
        const { data: profile } = await supabaseClient
          .from("profiles")
          .select("plan")
          .eq("id", userId)
          .single();

        if (profile?.plan === "pro") {
          limit = 20;
        } else if (profile?.plan === "basic") {
          limit = 10;
        }
      }
    } catch (_) {
      // Auth is optional for the search itself; continue gracefully
    }

    const input = {
      enableCompetitorAnalysis: false,
      includeWebResults: false,
      language: "en",
      locationQuery: data.city,
      maxCompetitorsToAnalyze: 0,
      maxCrawledPlacesPerSearch: limit,
      maxReviews: 3,
      maximumLeadsEnrichmentRecords: 0,
      reviewsSort: "newest",
      scrapeContacts: false,
      scrapeDirectories: false,
      scrapeImageAuthors: false,
      scrapeOrderOnline: false,
      scrapePlaceDetailPage: false,
      scrapeReviewsPersonalData: false,
      scrapeSocialMediaProfiles: {
        facebooks: false,
        instagrams: false,
        tiktoks: false,
        twitters: false,
        youtubes: false,
      },
      scrapeTableReservationProvider: false,
      searchStringsArray: [data.niche],
      skipClosedPlaces: true,
      verifyLeadsEnrichmentEmails: false,
      website: "withoutWebsite" as const,
    };

    const url = `https://api.apify.com/v2/acts/nwua9Gu5YrADL7ZDj/run-sync-get-dataset-items?token=${encodeURIComponent(
      token,
    )}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Apify request failed (${res.status}): ${text.slice(0, 300)}`);
    }

    const items = (await res.json()) as any[];

    const leads: Lead[] = (Array.isArray(items) ? items : []).map((item) => {
      const hasWebsite = !!item.website;
      return {
        placeId: item.placeId ?? item.fid ?? String(Math.random()),
        title: item.title ?? "Unknown business",
        categoryName: item.categoryName ?? null,
        address: item.address ?? null,
        city: item.city ?? null,
        phone: item.phone ?? null,
        phoneUnformatted: item.phoneUnformatted ?? null,
        totalScore: typeof item.totalScore === "number" ? item.totalScore : null,
        reviewsCount: typeof item.reviewsCount === "number" ? item.reviewsCount : null,
        url: item.url ?? null,
        imageUrl: item.imageUrl ?? null,
        neighborhood: item.neighborhood ?? null,
        openingHours: Array.isArray(item.openingHours) ? item.openingHours : null,
        topReviews: Array.isArray(item.reviews)
          ? item.reviews.slice(0, 3).map((r: any) => ({
              name: r?.name ?? null,
              text: r?.text ?? null,
              stars: typeof r?.stars === "number" ? r.stars : null,
              publishedAt: r?.publishedAtDate ?? r?.publishAt ?? null,
            }))
          : [],
        hasWebsite,
        leadScore: computeLeadScore(item),
      };
    });

    // Sort by lead score desc
    leads.sort((a, b) => b.leadScore - a.leadScore);

    // --- Log search to Supabase ---
    if (userId) {
      await supabaseClient.from("searches").insert({
        user_id: userId,
        city: data.city,
        niche: data.niche,
        results: leads,
      }).then(({ error }) => {
        if (error) console.error("Supabase insert error:", error.message);
      });
    }

    return { leads, searchedAt: new Date().toISOString(), city: data.city, niche: data.niche };
  });

/* ────────────────────────────
 *  GET SEARCH HISTORY
 * ──────────────────────────── */

export type SearchHistoryItem = {
  id: string;
  city: string;
  niche: string;
  results: Lead[];
  created_at: string;
};

export const getSearchHistory = createServerFn({ method: "GET" })
  .handler(async () => {
    const { userId, getToken } = await auth();
    if (!userId) {
      return { history: [] as SearchHistoryItem[] };
    }

    const supabaseClient = await getSupabaseClient(getToken);
    const { data, error } = await supabaseClient
      .from("searches")
      .select("id, city, niche, results, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Supabase history fetch error:", error.message);
      return { history: [] as SearchHistoryItem[] };
    }

    return { history: (data ?? []) as SearchHistoryItem[] };
  });
