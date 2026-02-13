/**
 * Flextender Platform Adapter
 *
 * WordPress AJAX endpoint + public detail pages at app.flextender.nl.
 * Step 1: Get widget config token from /opdrachten/ page
 * Step 2: POST to admin-ajax.php with action=kbs_flx_searchjobs → all listings as HTML
 * Step 3: Parse listing cards with Cheerio, fetch detail pages for full data
 */

import { PlatformAdapter, Listing } from './types';
import * as cheerio from 'cheerio';

const FLEXTENDER_SITE = 'https://www.flextender.nl';
const FLEXTENDER_AJAX = `${FLEXTENDER_SITE}/wp-admin/admin-ajax.php`;
const FLEXTENDER_DETAIL = 'https://app.flextender.nl/nologin/jobdetails';

export interface FlextenderAdapterOptions {
  firecrawlApiKey?: string;
  detailLimit?: number;
}

export class FlextenderAdapter implements PlatformAdapter {
  readonly name = 'flextender';
  readonly displayName = 'Flextender';
  enabled = true;
  private firecrawlApiKey?: string;
  private detailLimit: number;

  constructor(opts?: FlextenderAdapterOptions) {
    this.firecrawlApiKey = opts?.firecrawlApiKey;
    this.detailLimit = opts?.detailLimit ?? 40; // Safe default based on research
  }

  async fetchListings(lastKnownId?: string): Promise<Listing[]> {
    // Step 1: Get widget config token
    const configToken = await this.getWidgetConfig();
    if (!configToken) {
      throw new Error('Could not extract Flextender widget config token');
    }

    // Step 2: Fetch all listings via AJAX
    const response = await fetch(FLEXTENDER_AJAX, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'HireStream/1.0',
      },
      body: new URLSearchParams({
        action: 'kbs_flx_searchjobs',
        kbs_flx_widget_config: configToken,
      }),
    });

    if (!response.ok) {
      throw new Error(`Flextender AJAX error: ${response.status}`);
    }

    const data = await response.json() as { resultHtml?: string };
    if (!data.resultHtml) {
      console.warn('Flextender: Empty resultHtml');
      return [];
    }

    // Step 3: Parse listing cards
    const $ = cheerio.load(data.resultHtml);
    const listings: Listing[] = [];

    $('[data-kbslinkurl], .flx-job-item, [data-favcode]').each((_, el) => {
      const $el = $(el);

      // Extract aanvraagnummer from detail URL or caption
      const detailUrl = $el.attr('data-kbslinkurl') || '';
      const idMatch = detailUrl.match(/\/(\d+)$/);
      const captionId = this.extractCaption($, $el, 'Aanvraagnummer');
      const aanvraagnummer = idMatch?.[1] || captionId;

      if (!aanvraagnummer) return;

      const externalId = `flextender-${aanvraagnummer}`;
      if (lastKnownId && externalId === lastKnownId) return false;

      const title = $el.find('.css-jobtitle').text().trim() || $el.find('h2, h3').first().text().trim();
      const organization = $el.find('.css-customer').text().trim();
      const region = this.extractCaption($, $el, 'Regio');
      const hoursText = this.extractCaption($, $el, 'Uren per week');
      const startText = this.extractCaption($, $el, 'Start');
      const durationText = this.extractCaption($, $el, 'Duur');
      const deadlineTime = this.extractCaption($, $el, 'Eindtijd');

      // Parse "32 tot 36 uur" → 36
      const hoursMatch = hoursText?.match(/(\d+)\s*(?:tot|[-–])\s*(\d+)/);
      const hoursPerWeek = hoursMatch ? parseInt(hoursMatch[2], 10)
        : hoursText?.match(/(\d+)/)?.[1] ? parseInt(hoursText.match(/(\d+)/)![1], 10) : undefined;

      listings.push({
        externalId,
        platform: this.name,
        title,
        organization,
        location: region,
        province: this.inferProvince(region || ''),
        hoursPerWeek,
        startDate: startText === 'Z.s.m.' ? undefined : startText,
        deadline: deadlineTime || undefined,
        referenceCode: aanvraagnummer,
        sourceUrl: `${FLEXTENDER_DETAIL}/${aanvraagnummer}`,
        rawData: {
          duration: durationText,
          detailUrl,
        },
      });
    });

    // Fetch detail pages to fill in descriptions and rates (limit to avoid timeout)
    // Research-validated safe limit: 40 details = ~20s execution with 10s margin
    const actualLimit = Math.min(listings.length, this.firecrawlApiKey ? 10 : this.detailLimit);

    // Performance monitoring
    const startTime = Date.now();
    console.log(`Flextender: Fetching details for ${actualLimit} listings (configured limit: ${this.detailLimit})`);

    for (let i = 0; i < actualLimit; i++) {
      const l = listings[i];
      const numericId = l.externalId.replace('flextender-', '');

      // Monitor execution time to prevent timeout
      const elapsed = Date.now() - startTime;
      if (elapsed > 25000) {  // 25 seconds (5s margin from 30s CPU limit)
        console.warn(`CPU timeout protection: Stopping at ${i + 1}/${actualLimit} details after ${(elapsed / 1000).toFixed(1)}s`);
        break;
      }

      try {
        const detail = await this.fetchDetail(numericId);
        if (detail) {
          if (detail.description) l.description = detail.description;
          if (detail.rateMax) l.rateMax = detail.rateMax;
          if (detail.hoursPerWeek && !l.hoursPerWeek) l.hoursPerWeek = detail.hoursPerWeek;
          if (detail.location && !l.location) l.location = detail.location;
          if (detail.contactPerson) l.contactPerson = detail.contactPerson;
          if (detail.contactEmail) l.contactEmail = detail.contactEmail;
          if (detail.contactPhone) l.contactPhone = detail.contactPhone;
          if (detail.deadline && !l.deadline) l.deadline = detail.deadline;
          if (detail.duration) l.duration = detail.duration;
          if (detail.educationLevel) l.educationLevel = detail.educationLevel;
          if (detail.extensionOption) l.extensionOption = detail.extensionOption;
        }
      } catch (err) {
        console.warn(`Flextender detail fetch failed for ${numericId}:`, err instanceof Error ? err.message : err);
      }
    }

    // Log final performance metrics
    const totalTime = Date.now() - startTime;
    const actualFetched = Math.min(actualLimit, listings.length);
    console.log(`Flextender: Fetched ${actualFetched} details in ${(totalTime / 1000).toFixed(2)}s (avg ${(totalTime / actualFetched).toFixed(0)}ms/detail)`);

    if (totalTime > 20000) {
      console.warn(`⚠️ High CPU usage: ${(totalTime / 1000).toFixed(1)}s execution time - consider reducing detailLimit`);
    }

    return listings;
  }

  async fetchDetail(id: string): Promise<Listing | null> {
    try {
      let html: string;
      const detailUrl = `${FLEXTENDER_DETAIL}/${id}`;

      if (this.firecrawlApiKey) {
        // Prefer Firecrawl — detail pages are JS-rendered (DevExtreme)
        html = await this.fetchViaFirecrawl(detailUrl);
      } else {
        // Fallback: direct fetch (only gets HTML shell, limited data)
        const response = await fetch(detailUrl, {
          headers: { 'Accept': 'text/html', 'User-Agent': 'HireStream/1.0' },
        });
        if (!response.ok) return null;
        html = await response.text();
      }

      const content = html; // May be markdown (Firecrawl) or HTML (direct)
      const isMarkdown = !content.startsWith('<!') && !content.startsWith('<html');
      console.log(`Flextender detail ${id}: ${content.length} chars, isMarkdown=${isMarkdown}, starts="${content.substring(0, 80)}"`);

      let description: string | undefined;
      let title = '';
      let rateMax: number | undefined;
      let hoursPerWeek: number | undefined;
      let location: string | undefined;
      let contactPerson: string | undefined;
      let contactEmail: string | undefined;
      let contactPhone: string | undefined;
      let deadline: string | undefined;
      let duration: string | undefined;
      let educationLevel: string | undefined;
      let extensionOption: string | undefined;

      if (isMarkdown) {
        // Parse from Firecrawl markdown
        // Description comes after "Beschrijving" heading
        const descMatch = content.match(/Beschrijving\n+([\s\S]*?)(?=\n(?:Eisen|Wensen|Minimumeisen|$))/i);
        description = descMatch?.[1]?.trim().substring(0, 5000);
        if (!description) {
          // Fallback: take everything after the structured fields
          const afterFields = content.split(/Verloopt op|Tijd & agenda/i).pop();
          description = afterFields?.replace(/!\[.*?\]\([^)]*\)/g, '').trim().substring(0, 5000);
        }

        // Title from first line
        title = content.split('\n')[0]?.replace(/^#+\s*/, '').trim() || '';

        // Extract structured fields from markdown
        const fieldMatch = (label: string) => {
          const m = content.match(new RegExp(`${label}\\n+([^\\n]+)`, 'i'));
          return m?.[1]?.trim();
        };
        const hoursText = fieldMatch('Uren per week');
        if (hoursText) hoursPerWeek = parseInt(hoursText, 10) || undefined;

        location = fieldMatch('Regio');

        // Contact info from markdown
        const phoneMatch = content.match(/\[(\d{2}-\d{8})\]/);
        contactPhone = phoneMatch?.[1];
        const emailMatch = content.match(/\[([^\]]+@[^\]]+)\]/);
        contactEmail = emailMatch?.[1];
        // Person name: look for image alt text that looks like a name
        const nameMatch = content.match(/!\[([A-Z][a-z]+ [A-Z][a-z]+)\]/);
        contactPerson = nameMatch?.[1];

        // Deadline
        const deadlineMatch = content.match(/Verloopt op\n+[a-z]+ (\d+ [a-z]+ \d{4})/i);
        deadline = deadlineMatch?.[1];

        // Rate
        const rateMatch = content.match(/(\d+[\.,]\d{2})\s*(?:excl\.?\s*BTW|per uur)/i);
        rateMax = rateMatch ? parseFloat(rateMatch[1].replace(',', '.')) : undefined;

        // Extra fields
        duration = fieldMatch('Duur');
        educationLevel = fieldMatch('Opleidingsniveau');
        extensionOption = fieldMatch('Optie tot verlenging');
      } else {
        // HTML mode (direct fetch)
        const $ = cheerio.load(content);
        description = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 5000);
        title = $('h1').first().text().trim() || '';
        const rateMatch = content.match(/(\d+[\.,]\d{2})\s*excl\.?\s*BTW/i);
        rateMax = rateMatch ? parseFloat(rateMatch[1].replace(',', '.')) : undefined;
        const hoursMatch = content.match(/(\d+)\s*(?:tot|[-–])\s*(\d+)\s*uur/i);
        hoursPerWeek = hoursMatch ? parseInt(hoursMatch[2], 10) : undefined;
        const locationMatch = content.match(/(?:Regio|Standplaats)[:\s]*([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/);
        location = locationMatch?.[1];
      }

      return {
        externalId: `flextender-${id}`,
        platform: this.name,
        title,
        description,
        location,
        province: location ? this.inferProvince(location) : undefined,
        rateMax,
        hoursPerWeek,
        contactPerson,
        contactEmail,
        contactPhone,
        deadline,
        duration,
        educationLevel,
        extensionOption,
        sourceUrl: `${FLEXTENDER_DETAIL}/${id}`,
        rawData: { markdown: isMarkdown ? content.substring(0, 3000) : undefined },
      };
    } catch (error) {
      console.error(`Flextender detail fetch error for ${id}:`, error);
      return null;
    }
  }

  /**
   * Extract widget config token from the opdrachten page
   */
  private async getWidgetConfig(): Promise<string | null> {
    try {
      const response = await fetch(`${FLEXTENDER_SITE}/opdrachten/`, {
        headers: {
          'Accept': 'text/html',
          'User-Agent': 'HireStream/1.0',
        },
      });

      if (!response.ok) return null;

      const html = await response.text();
      // Look for kbs_flx_widget_config in the page HTML
      const match = html.match(/kbs_flx_widget_config['"]\s*(?:value|:)\s*=?\s*['"]([^'"]+)['"]/);
      if (match) return match[1];

      // Alternative: look in hidden input
      const $ = cheerio.load(html);
      const input = $('input[name="kbs_flx_widget_config"]').val();
      if (input) return input as string;

      // Alternative: look in script tags
      const scriptMatch = html.match(/widget_config\s*[:=]\s*['"]([^'"]+)['"]/);
      return scriptMatch?.[1] || null;
    } catch (error) {
      console.error('Flextender: Failed to get widget config:', error);
      return null;
    }
  }

  /**
   * Extract text value from a css-caption label in a listing card
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private extractCaption($: cheerio.CheerioAPI, $el: any, label: string): string | undefined {
    let value: string | undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    $el.find('.css-caption').each((_: number, cap: any) => {
      const text = $(cap).text().trim();
      if (text === label || text.includes(label)) {
        // Value is in the next sibling .css-value element
        const siblingValue = $(cap).next('.css-value').text().trim();
        if (siblingValue) {
          value = siblingValue;
          return;
        }
        // Fallback: value might be after the colon in the same element
        const afterLabel = text.split(label).pop()?.replace(/^[\s:]+/, '').trim();
        if (afterLabel) value = afterLabel;
      }
    });
    return value;
  }

  /**
   * Fetch page content via Firecrawl API (for JS-rendered pages)
   * Returns markdown which is easier to parse than raw HTML
   */
  private async fetchViaFirecrawl(url: string): Promise<string> {
    const resp = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.firecrawlApiKey}`,
      },
      body: JSON.stringify({
        url,
        formats: ['markdown'],
        waitFor: 3000,
      }),
    });
    if (!resp.ok) throw new Error(`Firecrawl error: ${resp.status}`);
    const data = await resp.json() as { data?: { markdown?: string } };
    return data.data?.markdown || '';
  }

  /**
   * Infer Dutch province from city/region name
   */
  private inferProvince(location: string): string | undefined {
    if (!location) return undefined;
    const loc = location.toLowerCase();

    const cityToProvince: Record<string, string> = {
      amsterdam: 'Noord-Holland',
      haarlem: 'Noord-Holland',
      hilversum: 'Noord-Holland',
      zaandam: 'Noord-Holland',
      alkmaar: 'Noord-Holland',
      rotterdam: 'Zuid-Holland',
      'den haag': 'Zuid-Holland',
      "'s-gravenhage": 'Zuid-Holland',
      leiden: 'Zuid-Holland',
      delft: 'Zuid-Holland',
      dordrecht: 'Zuid-Holland',
      zoetermeer: 'Zuid-Holland',
      utrecht: 'Utrecht',
      amersfoort: 'Utrecht',
      eindhoven: 'Noord-Brabant',
      tilburg: 'Noord-Brabant',
      breda: 'Noord-Brabant',
      'den bosch': 'Noord-Brabant',
      "'s-hertogenbosch": 'Noord-Brabant',
      helmond: 'Noord-Brabant',
      arnhem: 'Gelderland',
      nijmegen: 'Gelderland',
      apeldoorn: 'Gelderland',
      ede: 'Gelderland',
      groningen: 'Groningen',
      almere: 'Flevoland',
      lelystad: 'Flevoland',
      zwolle: 'Overijssel',
      enschede: 'Overijssel',
      deventer: 'Overijssel',
      maastricht: 'Limburg',
      venlo: 'Limburg',
      heerlen: 'Limburg',
      leeuwarden: 'Friesland',
      assen: 'Drenthe',
      emmen: 'Drenthe',
      middelburg: 'Zeeland',
    };

    for (const [city, province] of Object.entries(cityToProvince)) {
      if (loc.includes(city)) return province;
    }

    // Some Flextender listings use province names directly as "Regio"
    const provinces = ['Noord-Holland', 'Zuid-Holland', 'Utrecht', 'Noord-Brabant',
      'Gelderland', 'Groningen', 'Flevoland', 'Overijssel', 'Limburg',
      'Friesland', 'Drenthe', 'Zeeland'];
    for (const p of provinces) {
      if (loc.toLowerCase() === p.toLowerCase()) return p;
    }

    return undefined;
  }
}
