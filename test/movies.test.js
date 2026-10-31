import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchMovies, sortMovies } from '../src/movies.js';

const movies = [
  { id: 1, title: 'Older', release_date: '2000-01-01', vote_average: 8 },
  { id: 2, title: 'Newer', release_date: '2025-01-01', vote_average: 4 },
  { id: 3, title: 'Unknown', release_date: '', vote_average: 6 },
];

test('sorts dates and ratings both ways without changing API order', () => {
  assert.deepEqual(sortMovies(movies, 'release-asc').map(m => m.id), [1, 2, 3]);
  assert.deepEqual(sortMovies(movies, 'release-desc').map(m => m.id), [2, 1, 3]);
  assert.deepEqual(sortMovies(movies, 'rating-asc').map(m => m.id), [2, 3, 1]);
  assert.deepEqual(sortMovies(movies, 'rating-desc').map(m => m.id), [1, 3, 2]);
  assert.deepEqual(sortMovies(movies, ''), movies);
  assert.deepEqual(movies.map(m => m.id), [1, 2, 3]);
});

test('requests popular movies and limits navigation to TMDB page 500', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url) => {
    const parsed = new URL(url);
    assert.equal(parsed.pathname, '/3/movie/popular');
    assert.equal(parsed.searchParams.get('page'), '2');
    assert.equal(parsed.searchParams.get('api_key'), 'test-key');
    return { ok: true, json: async () => ({ results: Array.from({ length: 20 }, (_, id) => ({ id })), total_pages: 1000 }) };
  });
  const data = await fetchMovies({ apiKey: 'test-key', page: 2 });
  assert.equal(data.movies.length, 20);
  assert.equal(data.totalPages, 500);
});

test('search encodes titles and passes request cancellation through', async (t) => {
  const controller = new AbortController();
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    const parsed = new URL(url);
    assert.equal(parsed.pathname, '/3/search/movie');
    assert.equal(parsed.searchParams.get('query'), 'Wall-E & friends');
    assert.equal(options.signal, controller.signal);
    return { ok: true, json: async () => ({ results: [], total_pages: 0 }) };
  });
  assert.deepEqual(await fetchMovies({ apiKey: 'test-key', query: ' Wall-E & friends ', signal: controller.signal }), { movies: [], totalPages: 0 });
});

test('explains authentication and rate limit errors', async (t) => {
  const mock = t.mock.method(globalThis, 'fetch', async () => ({ ok: false, status: 401 }));
  await assert.rejects(fetchMovies({ apiKey: 'bad' }), /key is invalid/);
  mock.mock.mockImplementation(async () => ({ ok: false, status: 429 }));
  await assert.rejects(fetchMovies({ apiKey: 'test-key' }), /Too many requests/);
});
