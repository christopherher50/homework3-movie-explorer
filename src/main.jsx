import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { fetchMovies, sortMovies } from './movies.js';
import './styles.css';

const apiKey = import.meta.env.VITE_TMDB_API_KEY?.trim();

function MovieCard({ movie }) {
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <article className="movie-card">
      {movie.poster_path && !imageFailed ? (
        <img
          className="poster"
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="poster poster-fallback" role="img" aria-label={`No poster available for ${movie.title}`}>
          No poster available
        </div>
      )}
      <h2>{movie.title}</h2>
      <p>Release Date: {movie.release_date || 'Not available'}</p>
      <p>Rating: {movie.vote_average ?? 'Not available'}</p>
    </article>
  );
}

function App() {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [page, setPage] = useState(1);
  const [movies, setMovies] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(Boolean(apiKey));
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    // Give the user a moment to finish typing before searching.
    const timer = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!apiKey) return;
    const controller = new AbortController();
    setLoading(true);
    setError('');
    fetchMovies({ apiKey, query, page, signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return;
        setMovies(data.movies);
        setTotalPages(data.totalPages);
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setMovies([]);
          setError(err.message === 'Failed to fetch' ? 'Could not connect to TMDB. Check your connection and try again.' : err.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    // Ignore old requests when the search or page changes.
    return () => controller.abort();
  }, [query, page, retry]);

  const searching = search.trim() !== query;
  const busy = loading || searching;
  const displayedMovies = sortMovies(movies, sortBy);

  function changePage(nextPage) {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <>
      <header><h1>Movie Explorer</h1></header>
      <section className="controls" aria-label="Search and sort movies">
        <input
          type="search"
          aria-label="Search for a movie"
          placeholder="Search for a movie..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select aria-label="Sort movies" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
          <option value="">Sort By</option>
          <option value="release-asc">Release Date (Asc)</option>
          <option value="release-desc">Release Date (Desc)</option>
          <option value="rating-asc">Rating (Asc)</option>
          <option value="rating-desc">Rating (Desc)</option>
        </select>
      </section>
      <main aria-busy={busy}>
        {!apiKey ? (
          <div className="message" role="status">
            <h2>Add your TMDB API key</h2>
            <p>Set VITE_TMDB_API_KEY in the .env file, then restart the app.</p>
          </div>
        ) : error ? (
          <div className="message" role="alert">
            <p>{error}</p>
            <button onClick={() => setRetry(retry + 1)}>Try again</button>
          </div>
        ) : busy ? (
          <p className="message" role="status">Loading movies...</p>
        ) : movies.length === 0 ? (
          <p className="message" role="status">No movies found. Try another title.</p>
        ) : (
          <div className="movie-grid">
            {displayedMovies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
          </div>
        )}
        {apiKey && !error && (
          <nav className="pagination" aria-label="Movie pages">
            <button onClick={() => changePage(page - 1)} disabled={busy || page <= 1}>Previous</button>
            <span aria-live="polite">Page {totalPages ? page : 1} of {totalPages || 1}</span>
            <button onClick={() => changePage(page + 1)} disabled={busy || page >= totalPages}>Next</button>
          </nav>
        )}
      </main>
      <footer>This product uses the TMDB API but is not endorsed or certified by TMDB.</footer>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);
