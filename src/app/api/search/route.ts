
import { NextResponse } from 'next/server';

// IMPORTANT: Add your TMDb API key to your environment variables.
// You can get a free key from https://www.themoviedb.org/
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_URL = 'https://api.themoviedb.org/3';

// This function transforms the data from TMDb into the structure our app expects.
// This is a great pattern to follow, as it decouples our component's data needs
// from the specific structure of the external API.
const transformMovieData = (tmdbMovie: any, credits: any, videos: any) => {
    if (!tmdbMovie) return null;

    const director = credits.crew.find((person: any) => person.job === 'Director');
    const writers = credits.crew.filter((person: any) => person.department === 'Writing');
    const topCast = credits.cast.slice(0, 10);
    const trailer = videos.results.find((video: any) => video.type === 'Trailer' && video.site === 'YouTube');

    return {
        id: tmdbMovie.id,
        title: tmdbMovie.title,
        posterUrl: `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}`,
        posterHint: `${tmdbMovie.title} movie poster`,
        releaseYear: tmdbMovie.release_date ? tmdbMovie.release_date.substring(0, 4) : 'N/A',
        rating: 'PG-13', // TMDb doesn't provide MPAA ratings directly in this endpoint
        duration: `${Math.floor(tmdbMovie.runtime / 60)}h ${tmdbMovie.runtime % 60}m`,
        genres: tmdbMovie.genres.map((g: any) => g.name),
        releaseDate: new Date(tmdbMovie.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        imdbRating: tmdbMovie.vote_average.toFixed(1),
        imdbVotes: tmdbMovie.vote_count.toLocaleString(),
        storyline: tmdbMovie.overview,
        director: director ? { name: director.name, href: `/cast/${encodeURIComponent(director.name)}` } : null,
        writers: writers.map((w: any) => ({ name: w.name, role: w.job, href: `/cast/${encodeURIComponent(w.name)}` })),
        topCast: topCast.map((c: any) => ({
            name: c.name,
            role: c.character,
            avatar: c.profile_path ? `https://image.tmdb.org/t/p/w200${c.profile_path}` : `https://picsum.photos/seed/${c.name}/100/100`,
            href: `/cast/${encodeURIComponent(c.name)}`
        })),
        trailerUrl: trailer ? `https://www.youtube.com/embed/${trailer.key}` : null,
        videos: videos.results
            .filter((v: any) => v.site === 'YouTube')
            .slice(0, 5)
            .map((v: any) => ({
                 type: v.name,
                 thumbnailUrl: `https://img.youtube.com/vi/${v.key}/0.jpg`,
                 videoUrl: `https://www.youtube.com/embed/${v.key}`,
                 hint: `movie ${v.type}`,
                 duration: 'N/A' // This is not easily available
        })),
        photos: tmdbMovie.images?.backdrops.slice(0, 4).map((p: any) => ({
            url: `https://image.tmdb.org/t/p/w500${p.file_path}`,
            hint: 'movie still'
        })) || [],
        relatedMovies: tmdbMovie.similar?.results.slice(0, 4).map((m: any) => ({
            id: m.id,
            title: m.title,
            posterUrl: `https://image.tmdb.org/t/p/w400${m.poster_path}`,
            year: m.release_date?.substring(0, 4),
            rating: m.vote_average.toFixed(1),
            likes: m.vote_count.toLocaleString(),
            description: m.overview
        })) || [],
        metascore: tmdbMovie.vote_average * 10, // Example conversion
        awardsSummary: 'N/A', // This data is not easily available from TMDb
        plotKeywords: tmdbMovie.keywords?.keywords.map((k: any) => k.name) || [],
        tagline: tmdbMovie.tagline,
        didYouKnow: { trivia: [], goofs: [], quotes: [] }, // Not from TMDb
        technicalSpecs: {
            runtime: `${tmdbMovie.runtime} min`,
            soundMix: 'N/A',
            aspectRatio: 'N/A'
        }
    };
}


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  if (!TMDB_API_KEY) {
    console.error('TMDb API key is not configured');
    return NextResponse.json({ 
      error: 'TMDb API key is not configured. Please add TMDB_API_KEY to your environment variables.',
      hint: 'Get a free API key from https://www.themoviedb.org/settings/api'
    }, { status: 500 });
  }

  try {
    // 1. Search for the movie to get its ID
    const searchRes = await fetch(`${TMDB_API_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
    const searchData = await searchRes.json();
    
    if (!searchData.results || searchData.results.length === 0) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }
    const movieId = searchData.results[0].id;

    // 2. Fetch full movie details using the ID
    const detailsRes = await fetch(`${TMDB_API_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,images,similar,keywords`);
    const movieData = await detailsRes.json();
    
    // 3. Transform the data into the structure our frontend expects
    const formattedData = transformMovieData(movieData, movieData.credits, movieData.videos);
    
    if (!formattedData) {
        return NextResponse.json({ error: 'Failed to format movie data' }, { status: 500 });
    }

    return NextResponse.json(formattedData);

  } catch (error) {
    console.error('Error fetching from TMDb:', error);
    return NextResponse.json({ error: 'Failed to fetch movie data' }, { status: 500 });
  }
}
