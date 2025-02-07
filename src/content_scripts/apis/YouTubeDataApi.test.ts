import { describe, expect, it, test, vi } from 'vitest';
import { YouTubeURL, createUrl, fetchNextPage } from './YouTubeDataApi';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('createUrl', () => {
  it('can create without page token', () => {
    const actual = createUrl(
      'videoId' as VideoId,
      'apiKey' as ApiKey,
      undefined,
    );

    expect(actual).toEqual(
      new URL(
        'https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&order=relevance&maxResults=100&textFormat=plainText&videoId=videoId&key=apiKey',
      ),
    );
  });

  it('can create with page token', () => {
    const actual = createUrl(
      'videoId' as VideoId,
      'apiKey' as ApiKey,
      'pageToken',
    );

    expect(actual).toEqual(
      new URL(
        'https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&order=relevance&maxResults=100&textFormat=plainText&videoId=videoId&key=apiKey&pageToken=pageToken',
      ),
    );
  });
});

describe('fetchNextPage', () => {
  describe('ok', () => {
    test('returns pageToken, totalCount, comments', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            nextPageToken: 'nextPageToken',
            pageInfo: {
              totalResults: 234,
            },
            items: [
              {
                snippet: {
                  topLevelComment: {
                    snippet: {
                      textOriginal: 'comment1',
                    },
                  },
                },
              },
            ],
          }),
      } as Response);
      const url = new URL('https://example.test') as YouTubeURL;

      const actual = await fetchNextPage(url, 100);

      expect(actual).toEqual({
        pageToken: 'nextPageToken',
        totalCount: 334,
        comments: ['comment1'],
      });
    });
  });

  describe('not ok', () => {
    test('reason is commentsDisabled - returns comments-disabled', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () =>
          Promise.resolve({
            error: {
              errors: [
                {
                  reason: 'commentsDisabled',
                },
              ],
            },
          }),
      } as Response);
      const url = new URL('https://example.test') as YouTubeURL;

      const actual = await fetchNextPage(url, 100);

      expect(actual).toBe('comments-disabled');
    });

    test('reason is forbidden - returns invalid-api-key', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () =>
          Promise.resolve({
            error: {
              errors: [
                {
                  reason: 'forbidden',
                },
              ],
            },
          }),
      } as Response);
      const url = new URL('https://example.test') as YouTubeURL;

      const actual = await fetchNextPage(url, 100);

      expect(actual).toBe('invalid-api-key');
    });

    test('reason is badRequest - returns invalid-api-key', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () =>
          Promise.resolve({
            error: {
              errors: [
                {
                  reason: 'badRequest',
                },
              ],
            },
          }),
      } as Response);
      const url = new URL('https://example.test') as YouTubeURL;

      const actual = await fetchNextPage(url, 100);

      expect(actual).toBe('invalid-api-key');
    });

    test('reason is others - returns unknown', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () =>
          Promise.resolve({
            error: {
              errors: [
                {
                  reason: '',
                },
              ],
            },
          }),
      } as Response);
      const url = new URL('https://example.test') as YouTubeURL;

      const actual = await fetchNextPage(url, 100);

      expect(actual).toBe('unknown');
    });
  });
});
