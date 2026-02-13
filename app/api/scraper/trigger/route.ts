import { NextRequest, NextResponse } from "next/server";

const VALID_PLATFORMS = ["striive", "opdrachtoverheid", "flextender", "all"];

// Mock scraper function - replace with actual implementation
async function scrapePlatform(platform: string): Promise<{
  success: boolean;
  listingsFound: number;
  newListings: number;
  duration: number;
  error?: string;
}> {
  // Simulate scraping delay
  await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 2000));

  // Simulate different results per platform
  const results: Record<string, { listings: number; newListings: number }> = {
    striive: { listings: 150 + Math.floor(Math.random() * 20), newListings: 20 + Math.floor(Math.random() * 10) },
    opdrachtoverheid: { listings: 80 + Math.floor(Math.random() * 20), newListings: 10 + Math.floor(Math.random() * 8) },
    flextender: { listings: 60 + Math.floor(Math.random() * 15), newListings: 5 + Math.floor(Math.random() * 6) },
  };

  const result = results[platform] || { listings: 0, newListings: 0 };

  return {
    success: true,
    listingsFound: result.listings,
    newListings: result.newListings,
    duration: 3000 + Math.floor(Math.random() * 3000),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform } = body;

    if (!platform || typeof platform !== "string") {
      return NextResponse.json(
        { error: "Invalid request body. Expected 'platform' field." },
        { status: 400 }
      );
    }

    const normalizedPlatform = platform.toLowerCase();

    if (!VALID_PLATFORMS.includes(normalizedPlatform)) {
      return NextResponse.json(
        {
          error: `Invalid platform. Must be one of: ${VALID_PLATFORMS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Handle "all" platforms
    if (normalizedPlatform === "all") {
      const platforms = ["striive", "opdrachtoverheid", "flextender"];
      const results = await Promise.all(
        platforms.map((p) => scrapePlatform(p))
      );

      const aggregated = {
        success: true,
        listingsFound: results.reduce((sum, r) => sum + r.listingsFound, 0),
        newListings: results.reduce((sum, r) => sum + r.newListings, 0),
        duration: Math.max(...results.map((r) => r.duration)),
        timestamp: new Date().toISOString(),
        platforms: results.map((r, i) => ({
          platform: platforms[i],
          ...r,
        })),
      };

      return NextResponse.json(aggregated);
    }

    // Single platform
    const result = await scrapePlatform(normalizedPlatform);

    return NextResponse.json({
      ...result,
      platform: normalizedPlatform,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Scraper API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
