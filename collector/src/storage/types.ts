export interface DocumentRecord {
  id: string;
  sourceId: string;
  url: string;
  title: string;
  cleanText: string;
  rawHtml: string;
  contentHash: string;
  statusCode: number;
  fetchedAt: Date;
  tier: number;
  tags: string[];
}
