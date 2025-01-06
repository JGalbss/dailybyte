import { ScrapflyClient, ScrapeConfig } from 'scrapfly-sdk';
import { system, SystemProp } from './system';

export class Scraper {
  private readonly client: ScrapflyClient;

  constructor() {
    this.client = new ScrapflyClient({
      key: system.get(SystemProp.SCRAPFLY_API_KEY),
    });
  }

  public async scrape(url: string): Promise<string> {
    try {
      const result = await this.client.scrape(
        new ScrapeConfig({
          url,
          tags: ['leetcode-scraper'],
          format: 'markdown',
        }),
      );
      return result.result.content;
    } catch (err) {
      throw new Error(`Failed to scrape URL ${url}: ${err.message}`);
    }
  }
}
