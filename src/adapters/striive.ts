/**
 * Striive Platform Adapter
 *
 * Open REST API at striive-cms.codebridge.nl — no auth required.
 * 25 items per page, paginated with ?page=N.
 * Full data (including content/description) returned in list endpoint.
 */

import { PlatformAdapter, Listing } from './types';
import { parseRateFromContent } from '../lib/rate-from-content';

const STRIIVE_API = 'https://striive-cms.codebridge.nl/api/jobs?open=true';

interface StriiveJob {
  id: string;
  title: string;
  content?: string;                // HTML — full job description
  requirements?: string;           // Requirements text (IMPORTANT - often missed!)
  clientName?: string;             // Organization name
  location?: string;               // City
  locationSlug?: string;
  workSiteAddress?: string;        // Full work site address
  workSiteCity?: string;           // Work site city
  workSitePostalCode?: string;     // Work site postal code
  hoursPerWeekMin?: number;
  hoursPerWeekMax?: number;
  hoursPerDay?: number;            // Hours per day
  hourlyRateMin?: number;
  hourlyRateMax?: number;
  startDate?: string;              // ISO datetime
  endDate?: string;                // ISO datetime
  closingDateClient?: string;      // Application deadline (ISO)
  publishedDate?: string;
  referenceCode?: string;
  referenceCodeClient?: string;
  source?: string;                 // Source agency (e.g., "Between")
  broker?: string;                 // Broker platform (e.g., "headfirst-select")
  brokerUrl?: string;
  numberOfPositions?: number;      // Number of open positions
  extendable?: boolean;            // Whether contract is extendable
  permanentJob?: boolean;
  department?: string;             // Department name
  travelTime?: string;             // Travel time information
  tagNames?: string[];             // Tags for categorization
  segmentName?: string;            // Segment/category
  recruiterFirstName?: string;
  recruiterLastName?: string;
  recruiterEmail?: string;
  recruiterPhoneNumber?: string;
  createdAt?: string;
  updatedAt?: string;
  // Image fields (excluded from rawData to avoid clutter)
  clientLogo?: string;              // Base64 encoded image
  clientLogoContentType?: string;
  hasClientLogo?: boolean;
  recruiterImage?: string;           // Base64 encoded image
  recruiterImageContentType?: string;
  hasRecruiterImage?: boolean;
  coverImageUrl?: string;
}

interface StriiveResponse {
  data: StriiveJob[];
  total: number;
}

export class StriiveAdapter implements PlatformAdapter {
  readonly name = 'striive';
  readonly displayName = 'Striive';
  enabled = true;

  async fetchListings(lastKnownId?: string): Promise<Listing[]> {
    const listings: Listing[] = [];

    // First page to get total count
    const firstPage = await this.fetchPage(1);
    const totalPages = Math.ceil(firstPage.total / 25);

    for (const job of firstPage.data) {
      const externalId = `striive-${job.id}`;
      if (lastKnownId && externalId === lastKnownId) return listings;
      listings.push(this.mapToListing(job));
    }

    for (let page = 2; page <= totalPages; page++) {
      const pageData = await this.fetchPage(page);
      for (const job of pageData.data) {
        const externalId = `striive-${job.id}`;
        if (lastKnownId && externalId === lastKnownId) return listings;
        listings.push(this.mapToListing(job));
      }
      await new Promise(r => setTimeout(r, 500));
    }

    return listings;
  }

  async fetchDetail(id: string): Promise<Listing | null> {
    // List endpoint already returns full data including content
    return null;
  }

  private async fetchPage(page: number): Promise<StriiveResponse> {
    const response = await fetch(`${STRIIVE_API}&page=${page}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'HireStream/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Striive API error: ${response.status}`);
    }

    return response.json() as Promise<StriiveResponse>;
  }

  private mapToListing(job: StriiveJob): Listing {
    // Convert HTML to plain text while preserving structure
    const htmlToText = (html: string): string => {
      return html
        // Preserve paragraph breaks
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<br\s*\/?>/gi, '\n')
        // Convert lists to readable format
        .replace(/<li>/gi, '\n• ')
        .replace(/<\/li>/gi, '')
        // Remove remaining HTML tags
        .replace(/<[^>]*>/g, '')
        // Decode HTML entities
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        // Normalize whitespace but preserve double newlines
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    };

    let description = job.content ? htmlToText(job.content) : undefined;

    // If requirements exist, append them to description
    if (job.requirements) {
      const requirements = htmlToText(job.requirements);
      description = description
        ? `${description}\n\nVereisten:\n${requirements}`
        : requirements;
    }

    // Build more complete location string
    const locationParts = [
      job.workSiteCity || job.location,
      job.workSitePostalCode,
      job.workSiteAddress
    ].filter(Boolean);
    const fullLocation = locationParts.length > 0
      ? locationParts[0] // Use city as primary location
      : undefined;

    // Build skills array from tagNames if available
    const skills = job.tagNames && job.tagNames.length > 0
      ? job.tagNames
      : undefined;

    // Determine category from department or segment
    const category = job.department || job.segmentName || undefined;

    // Format extension option
    const extensionOption = job.extendable
      ? (job.numberOfPositions && job.numberOfPositions > 1
          ? `Verlengbaar · ${job.numberOfPositions} posities`
          : 'Verlengbaar')
      : (job.numberOfPositions && job.numberOfPositions > 1
          ? `${job.numberOfPositions} posities`
          : undefined);

    // API often returns 0 for hourlyRateMin/Max when rate is only in content
    const hasApiRate = (job.hourlyRateMin ?? 0) > 0 || (job.hourlyRateMax ?? 0) > 0;
    const parsedRate = hasApiRate ? undefined : parseRateFromContent(description ?? job.content ?? '');

    return {
      externalId: `striive-${job.id}`,
      platform: this.name,
      title: job.title,
      description,
      organization: job.clientName,
      location: fullLocation,
      province: fullLocation ? this.inferProvince(fullLocation) : undefined,
      hoursPerWeek: job.hoursPerWeekMax || job.hoursPerWeekMin,
      hoursPerWeekMin: job.hoursPerWeekMin || undefined,
      rateMin: (job.hourlyRateMin && job.hourlyRateMin > 0 ? job.hourlyRateMin : undefined) ?? parsedRate?.rateMin,
      rateMax: (job.hourlyRateMax && job.hourlyRateMax > 0 ? job.hourlyRateMax : undefined) ?? parsedRate?.rateMax,
      startDate: job.startDate?.split('T')[0],
      endDate: job.endDate?.split('T')[0],
      deadline: job.closingDateClient?.split('T')[0],
      category,
      skills,
      contactPerson: [job.recruiterFirstName, job.recruiterLastName].filter(Boolean).join(' ') || undefined,
      contactEmail: job.recruiterEmail || undefined,
      contactPhone: job.recruiterPhoneNumber || undefined,
      referenceCode: job.referenceCode || job.referenceCodeClient || undefined,
      publishedAt: job.publishedDate?.split('T')[0],
      contractType: job.permanentJob ? 'vast' : 'freelance',
      duration: job.travelTime ? `Reistijd: ${job.travelTime}` : undefined,
      extensionOption,
      sourceUrl: job.brokerUrl || `https://striive.com/nl/opdrachten/${job.id}`,
      rawData: this.sanitizeRawData(job),
    };
  }

  /**
   * Remove binary/large fields from rawData to keep JSON display clean.
   * Excludes base64 image data, content type fields, and other clutter.
   */
  private sanitizeRawData(job: StriiveJob): Record<string, unknown> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { clientLogo, clientLogoContentType, recruiterImage, recruiterImageContentType, coverImageUrl, ...cleanData } = job as any;
    return cleanData as Record<string, unknown>;
  }

  private inferProvince(location: string): string | undefined {
    if (!location) return undefined;
    const loc = location.toLowerCase();

    const cityToProvince: Record<string, string> = {
      amsterdam: 'Noord-Holland', haarlem: 'Noord-Holland', hilversum: 'Noord-Holland',
      zaandam: 'Noord-Holland', alkmaar: 'Noord-Holland', hoofddorp: 'Noord-Holland',
      rotterdam: 'Zuid-Holland', 'den haag': 'Zuid-Holland', "'s-gravenhage": 'Zuid-Holland',
      leiden: 'Zuid-Holland', delft: 'Zuid-Holland', dordrecht: 'Zuid-Holland',
      zoetermeer: 'Zuid-Holland', gouda: 'Zuid-Holland',
      utrecht: 'Utrecht', amersfoort: 'Utrecht', nieuwegein: 'Utrecht',
      eindhoven: 'Noord-Brabant', tilburg: 'Noord-Brabant', breda: 'Noord-Brabant',
      'den bosch': 'Noord-Brabant', "'s-hertogenbosch": 'Noord-Brabant', helmond: 'Noord-Brabant',
      arnhem: 'Gelderland', nijmegen: 'Gelderland', apeldoorn: 'Gelderland',
      ede: 'Gelderland', wageningen: 'Gelderland',
      groningen: 'Groningen', almere: 'Flevoland', lelystad: 'Flevoland',
      zwolle: 'Overijssel', enschede: 'Overijssel', deventer: 'Overijssel',
      maastricht: 'Limburg', venlo: 'Limburg', heerlen: 'Limburg',
      leeuwarden: 'Friesland', assen: 'Drenthe', emmen: 'Drenthe',
      middelburg: 'Zeeland',
    };

    for (const [city, province] of Object.entries(cityToProvince)) {
      if (loc.includes(city)) return province;
    }
    return undefined;
  }
}
