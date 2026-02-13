/**
 * Opdrachtoverheid Platform Adapter
 *
 * POST API at kbenp-match-api.azurewebsites.net/search — no auth required.
 * Offset-based pagination, up to 1000 items per request.
 * 51,839+ total listings. Full data in list response.
 */

import { PlatformAdapter, Listing } from './types';

const OPDRACHT_API = 'https://kbenp-match-api.azurewebsites.net/search';

interface OpdrachtTender {
  tender_id: string;
  web_key?: string;
  tender_name: string;
  tender_description?: string;
  tender_description_html?: string;
  tender_buying_organization?: string;
  tender_competences?: string;       // HTML — required skills
  tender_requirements?: string;      // HTML
  tender_categories?: Array<{ id: string; type: string }>;
  tender_maximum_tariff?: number;    // EUR/hr
  tender_tariff?: number;
  tender_hours_week?: string;        // "16-24"
  tender_min_hours?: number;
  tender_max_hours?: number;
  tender_start_date?: string;
  tender_end_date?: string;
  tender_date?: string;              // Application deadline
  tender_first_seen?: string;
  tender_source?: string;
  contract_type?: string;
  tender_hybrid_working?: string;
  tender_last_seen?: string;
  tender_document?: string;
  opdracht_overheid_url?: string;
  vacancies_location?: {
    company_address?: string;
    postcode?: string;
    province?: string;
    latitude?: number;
    longitude?: number;
  };
}

interface OpdrachtResponse {
  negometrix_tenders: OpdrachtTender[];
}

export class OpdrachtoverheidAdapter implements PlatformAdapter {
  readonly name = 'opdrachtoverheid';
  readonly displayName = 'Opdracht Overheid';
  enabled = true;

  async fetchListings(lastKnownId?: string): Promise<Listing[]> {
    const listings: Listing[] = [];
    let offset = 0;
    const limit = 100; // Conservative to avoid timeouts
    let hasMore = true;

    while (hasMore) {
      const data = await this.fetchPage(offset, limit);

      for (const tender of data.negometrix_tenders) {
        const externalId = `opdrachtoverheid-${tender.tender_id}`;

        if (lastKnownId && externalId === lastKnownId) {
          return listings;
        }

        listings.push(this.mapToListing(tender));
      }

      hasMore = data.negometrix_tenders.length === limit;
      offset += limit;

      // Cap at 500 listings per sync to stay within reasonable limits
      if (listings.length >= 500) break;

      await new Promise(r => setTimeout(r, 500));
    }

    return listings;
  }

  async fetchDetail(id: string): Promise<Listing | null> {
    // List endpoint already returns full data
    return null;
  }

  private async fetchPage(offset: number, limit: number): Promise<OpdrachtResponse> {
    const response = await fetch(OPDRACHT_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'HireStream/1.0',
      },
      body: JSON.stringify({
        single: false,
        userInput: null,
        limit,
        offset,
        disjunction: 0,
        user_coordinates: {},
        filters: {
          and_filters: [{
            filters: [
              { field_name: 'publish', value: ['0'], operator: 'neq' },
              { field_name: 'oim_vacancy', value: ['true'], operator: 'neq' },
            ],
          }],
          or_filters: [],
          or_disjunction: 0,
        },
        order_by: [{ field: 'tender_first_seen', direction: 'desc' }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Opdrachtoverheid API error: ${response.status}`);
    }

    return response.json() as Promise<OpdrachtResponse>;
  }

  private mapToListing(tender: OpdrachtTender): Listing {
    // Parse hours from "16-24" or use max_hours field
    const hoursParts = tender.tender_hours_week?.split('-').map(s => parseInt(s.trim(), 10));
    const hoursPerWeek = tender.tender_max_hours
      || (hoursParts?.length === 2 ? hoursParts[1] : hoursParts?.[0])
      || undefined;
    const hoursPerWeekMin = tender.tender_min_hours
      || (hoursParts?.length === 2 ? hoursParts[0] : undefined)
      || undefined;

    // Use plain text description, fall back to stripping HTML
    let description = tender.tender_description
      || (tender.tender_description_html
        ? tender.tender_description_html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
        : undefined);

    // Append requirements if present (critical field often separate from description)
    if (tender.tender_requirements) {
      const requirements = tender.tender_requirements
        .replace(/<[^>]*>/g, '\n')
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean)
        .join('\n');

      if (requirements) {
        description = description
          ? `${description}\n\nVereisten:\n${requirements}`
          : requirements;
      }
    }

    // Extract skills from competences HTML
    const skillsHtml = tender.tender_competences || '';
    const skills = skillsHtml
      ? skillsHtml.replace(/<[^>]*>/g, '\n').split('\n').map(s => s.trim()).filter(Boolean).slice(0, 20)
      : undefined;

    // Extract city from address
    const address = tender.vacancies_location?.company_address;
    const location = address
      ? address.split(',').pop()?.trim() || address
      : undefined;

    // Category from first item — handle nested tender_category_obj
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const catArr = tender.tender_categories as any[];
    const category = catArr?.[0]?.tender_category_obj?.type || catArr?.[0]?.type;

    // Filter out placeholder dates like "1900-01-01"
    const validDate = (d?: string) => d && !d.startsWith('1900') && !d.startsWith('1901') ? d : undefined;

    return {
      externalId: `opdrachtoverheid-${tender.tender_id}`,
      platform: this.name,
      title: tender.tender_name,
      description,
      organization: tender.tender_buying_organization,
      location,
      province: tender.vacancies_location?.province,
      rateMax: (tender.tender_maximum_tariff && tender.tender_maximum_tariff > 0 ? tender.tender_maximum_tariff : undefined)
        || (tender.tender_tariff && tender.tender_tariff > 0 ? tender.tender_tariff : undefined),
      hoursPerWeek: hoursPerWeek || undefined,
      hoursPerWeekMin: hoursPerWeekMin || undefined,
      startDate: validDate(tender.tender_start_date),
      endDate: validDate(tender.tender_end_date),
      deadline: tender.tender_date,
      category,
      skills,
      publishedAt: tender.tender_first_seen,
      contractType: tender.contract_type || undefined,
      remoteWorkPolicy: tender.tender_hybrid_working || undefined,
      sourceUrl: tender.opdracht_overheid_url
        || `https://opdrachtoverheid.nl/vacatures/${tender.web_key || tender.tender_id}`,
      rawData: tender as unknown as Record<string, unknown>,
    };
  }
}
