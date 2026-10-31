const API_URL = 'https://api.themoviedb.org/3';

export async function fetchMovies({ apiKey, query = '', page = 1, signal }) {
  const params = new URLSearchParams({
    api_key: apiKey,
    language: 'en-US',
    page: String(page),
    include_adult: 'false',
  });
  if (query.trim()) params.set('query', query.trim());
  const endpoint = query.trim() ? '/search/movie' : '/movie/popular';
  const response = await fetch(`${API_URL}${endpoint}?${params}`, { signal });

  if (!response.ok) {
    if (response.status === 401) throw new Error('The TMDB key is invalid. Check VITE_TMDB_API_KEY in your .env file.');
    if (response.status === 429) throw new Error('Too many requests. Wait a moment and try again.');
    throw new Error('Could not load movies. Please try again.');
  }
  const data = await response.json();
  return {
    movies: data.results.slice(0, 20),
    // TMDB only lets us request the first 500 pages.
    totalPages: Math.min(data.total_pages, 500),
  };
}

export function sortMovies(movies, sortBy) {
  const sorted = [...movies];
  if (!sortBy) return sorted;
  const direction = sortBy.endsWith('asc') ? 1 : -1;
  const field = sortBy.startsWith('release') ? 'release_date' : 'vote_average';

  return sorted.sort((a, b) => {
    // Keep missing dates at the end in either direction.
    if (field === 'release_date') {
      if (!a[field] && !b[field]) return 0;
      if (!a[field]) return 1;
      if (!b[field]) return -1;
      return a[field].localeCompare(b[field]) * direction;
    }
    return ((a[field] ?? 0) - (b[field] ?? 0)) * direction;
  });
}
