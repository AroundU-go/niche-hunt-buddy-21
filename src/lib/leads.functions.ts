import { createServerFn } from "@tanstack/react-start";

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

export const searchLeads = createServerFn({ method: "POST" })
  .inputValidator((data: { city: string; niche: string; limit?: number }) => {
    if (!data || typeof data.city !== "string" || typeof data.niche !== "string") {
      throw new Error("city and niche are required");
    }
    const city = data.city.trim();
    const niche = data.niche.trim();
    if (!city || !niche) throw new Error("city and niche cannot be empty");
    const limit = Math.min(Math.max(data.limit ?? 20, 1), 50);
    return { city, niche, limit };
  })
  .handler(async ({ data }) => {
    const token = process.env.APIFY_TOKEN;
    if (!token) throw new Error("APIFY_TOKEN not configured");

    const input = {
      enableCompetitorAnalysis: false,
      includeWebResults: false,
      language: "en",
      locationQuery: data.city,
      maxCompetitorsToAnalyze: 0,
      maxCrawledPlacesPerSearch: data.limit,
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

    return { leads, searchedAt: new Date().toISOString(), city: data.city, niche: data.niche };
  });
