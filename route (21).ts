import { NextRequest, NextResponse } from 'next/server';
import { scrapeUrl, searchUrl, type ScrapeResponse, type SearchResponse } from '@/firecrawl';

const TRENDING_SOURCES = [
  'https://dexscreener.com',
  'https://www.coingecko.com/en/categories/meme-token',
  'https://www.coinbase.com/price',
];

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { query, mode } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query required' }, { status: 400 });
    }

    let scrapedData: string = '';

    if (mode === 'search') {
      // Use Firecrawl search for trending topics
      const searchResult: SearchResponse = await searchUrl({
        query: `${query} cryptocurrency memecoin trending`,
        limit: 5,
        timeout: 30000,
        scrapeOptions: {
          onlyMainContent: true,
          formats: ['markdown'],
        },
      });

      if (searchResult.success && searchResult.data) {
        scrapedData = searchResult.data
          .map((result) => {
            const title = result.metadata?.title || result.title || 'Untitled';
            const desc = result.metadata?.description || result.description || '';
            const markdown = result.markdown || desc;
            return `### ${title}\n${markdown.substring(0, 500)}...\n`;
          })
          .join('\n\n');
      }
    } else {
      // Scrape specific trending source
      const url = TRENDING_SOURCES[0]; // Default to DexScreener
      const scrapeResult: ScrapeResponse = await scrapeUrl({
        url,
        onlyMainContent: true,
        formats: ['markdown'],
        timeout: 30000,
      });

      if (scrapeResult.success && scrapeResult.data?.markdown) {
        scrapedData = scrapeResult.data.markdown.substring(0, 2000);
      }
    }

    if (!scrapedData) {
      return NextResponse.json({
        error: 'No data scraped',
        fallback: 'Unable to scrape data. Please try with different search terms.',
      }, { status: 200 });
    }

    return NextResponse.json({
      success: true,
      scrapedData,
      query,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Viral scout scraping error:', error);
    return NextResponse.json({
      error: 'Scraping failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
