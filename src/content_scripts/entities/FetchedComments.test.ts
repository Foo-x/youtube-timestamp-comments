import { describe, expect, test } from 'vitest';
import { createFetchedComments } from './FetchedComments';

describe('createFetchedComments', () => {
  test('different timestamps in a single comment are extracted', () => {
    const actual = createFetchedComments(['12:34 foo 23:45']);

    expect(actual).toEqual({
      comments: ['12:34 foo 23:45'],
      secondCommentIndexPairs: [
        [754, 0], // 12 * 60 + 34 = 754
        [1425, 0], // 23 * 60 + 45 = 1425
      ],
    });
  });

  test('same timestamps in a single comment are extracted only one', () => {
    const actual = createFetchedComments(['12:34 foo 12:34']);

    expect(actual).toEqual({
      comments: ['12:34 foo 12:34'],
      secondCommentIndexPairs: [
        [754, 0], // 12 * 60 + 34 = 754
      ],
    });
  });

  test('different timestamps in different comments are extracted', () => {
    const actual = createFetchedComments([
      '12:34 foo 23:45',
      '34:56 bar 45:12',
    ]);

    expect(actual).toEqual({
      comments: ['12:34 foo 23:45', '34:56 bar 45:12'],
      secondCommentIndexPairs: [
        [754, 0], // 12 * 60 + 34 = 754
        [1425, 0], // 23 * 60 + 45 = 1425
        [2096, 1], // 34 * 60 + 56 = 2096
        [2712, 1], // 45 * 60 + 12 = 2712
      ],
    });
  });

  test('same timestamps in different comments are extracted', () => {
    const actual = createFetchedComments([
      '12:34 foo 23:45',
      '23:45 bar 45:12',
    ]);

    expect(actual).toEqual({
      comments: ['12:34 foo 23:45', '23:45 bar 45:12'],
      secondCommentIndexPairs: [
        [754, 0], // 12 * 60 + 34 = 754
        [1425, 0], // 23 * 60 + 45 = 1425
        [1425, 1], // 23 * 60 + 45 = 1425
        [2712, 1], // 45 * 60 + 12 = 2712
      ],
    });
  });

  test('timestamps are sorted with seconds and index', () => {
    const actual = createFetchedComments([
      '34:56 foo 23:45',
      '23:45 bar 12:34',
    ]);

    expect(actual).toEqual({
      comments: ['34:56 foo 23:45', '23:45 bar 12:34'],
      secondCommentIndexPairs: [
        [754, 1], // 12 * 60 + 34 = 754
        [1425, 0], // 23 * 60 + 45 = 1425
        [1425, 1], // 23 * 60 + 45 = 1425
        [2096, 0], // 34 * 60 + 56 = 2096
      ],
    });
  });

  test('timestamp with hours can be extracted', () => {
    const actual = createFetchedComments(['12:34:56 foo']);

    expect(actual).toEqual({
      comments: ['12:34:56 foo'],
      secondCommentIndexPairs: [
        [45296, 0], // 12 * 60 * 60 + 34 * 60 + 56 = 45296
      ],
    });
  });

  test('comments without timestamps are removed', () => {
    const actual = createFetchedComments(['12:34 foo 23:45', 'bar']);

    expect(actual).toEqual({
      comments: ['12:34 foo 23:45'],
      secondCommentIndexPairs: [
        [754, 0], // 12 * 60 + 34 = 754
        [1425, 0], // 23 * 60 + 45 = 1425
      ],
    });
  });

  test('colon not in timestamp is valid', () => {
    const actual = createFetchedComments(['12:a1 foo']);

    expect(actual).toEqual({
      comments: [],
      secondCommentIndexPairs: [],
    });
  });

  test('empty comments return empty result', () => {
    const actual = createFetchedComments([]);

    expect(actual).toEqual({
      comments: [],
      secondCommentIndexPairs: [],
    });
  });
});
