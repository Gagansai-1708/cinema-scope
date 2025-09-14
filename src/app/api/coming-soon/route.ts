
import { NextResponse } from 'next/server';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_URL = 'https://api.themoviedb.org/3';

const transformMovieData = (tmdbMovie: any) => {
    if (!tmdbMovie || !tmdbMovie.poster_path) return null;

    return {
        id: tmdbMovie.id,
        title: tmdbMovie.title,
        posterUrl: `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}`,
        releaseDate: tmdbMovie.release_date ? new Date(tmdbMovie.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'TBA',
        overview: tmdbMovie.overview,
    };
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get('language');

  if (!TMDB_API_KEY) {
    console.error('TMDb API key is not configured');
    return NextResponse.json({ 
      error: 'TMDb API key is not configured. Please add TMDB_API_KEY to your environment variables.',
      hint: 'Get a free API key from https://www.themoviedb.org/settings/api'
    }, { status: 500 });
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    let url = `${TMDB_API_URL}/discover/movie?api_key=${TMDB_API_KEY}&sort_by=popularity.desc&primary_release_date.gte=${today}`;

    if (language && language !== 'all') {
        url += `&with_original_language=${language}`;
    } else {
        // Default to top-rated across all languages if 'all' or no language is specified
        url = `${TMDB_API_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&sort_by=vote_average.desc&vote_count.gte=100`;
    }

    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.status_message || 'Failed to fetch from TMDb');
    }

    const movies = data.results.map(transformMovieData).filter(Boolean); // Filter out any null results

    return NextResponse.json(movies);

  } catch (error: any) {
    console.error('Error fetching from TMDb:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch movie data' }, { status: 500 });
  }
}
