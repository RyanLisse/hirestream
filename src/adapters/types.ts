/**
 * Dutch Freelance Scraper - Type Definitions
 * Ported from TSG app for HireStream
 */

/**
 * Raw listing data from any platform, normalized to common format
 */
export interface Listing {
  externalId: string;       // "{platform}-{unique_id}"
  platform: string;
  title: string;
  description?: string;
  organization?: string;
  location?: string;
  province?: string;
  rateMin?: number;
  rateMax?: number;
  hoursPerWeek?: number;
  hoursPerWeekMin?: number;
  startDate?: string;       // ISO date string
  endDate?: string;         // ISO date string
  deadline?: string;        // ISO date string
  category?: string;
  skills?: string[];
  sourceUrl?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  referenceCode?: string;
  publishedAt?: string;     // When source platform first listed it
  contractType?: string;    // detachering, ZZP, etc.
  duration?: string;        // "3 maanden", "6 maanden"
  educationLevel?: string;  // "WO", "HBO", etc.
  extensionOption?: string; // "2x 3 maanden"
  remoteWorkPolicy?: string; // "volledig remote", "hybride", "op locatie"
  rawData: Record<string, unknown>;
}

/**
 * Platform adapter interface - all adapters must implement this
 */
export interface PlatformAdapter {
  readonly name: string;
  readonly displayName: string;
  enabled: boolean;

  /**
   * Fetch listings from the platform
   * @param lastKnownId - Stop fetching when this ID is encountered (incremental sync)
   * @returns Array of normalized listings
   */
  fetchListings(lastKnownId?: string): Promise<Listing[]>;

  /**
   * Optional: Fetch detailed information for a single listing
   */
  fetchDetail?(id: string): Promise<Listing | null>;
}

/**
 * Dutch provinces for filtering
 */
export const DUTCH_PROVINCES = [
  'Drenthe',
  'Flevoland',
  'Friesland',
  'Gelderland',
  'Groningen',
  'Limburg',
  'Noord-Brabant',
  'Noord-Holland',
  'Overijssel',
  'Utrecht',
  'Zeeland',
  'Zuid-Holland',
] as const;

export type DutchProvince = typeof DUTCH_PROVINCES[number];
