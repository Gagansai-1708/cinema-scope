
'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star, Film, Bookmark, Share2, PlayCircle, Award, Heart, CheckCircle, MinusCircle, X } from 'lucide-react';
import Link from 'next/link';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp, query as firestoreQuery, where, getDocs, deleteDoc, doc, onSnapshot } from 'firebase/firestore';


function MoviePageSkeleton() {
  return (
    <div className='space-y-8'>
      <div className="flex items-center gap-2 -ml-2 mb-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-6 w-1/3" />
      </div>

      <section>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <Skeleton className="h-10 w-2/3 mb-2" />
            <div className='flex items-center gap-3'>
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
          <Skeleton className="h-16 w-24" />
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        <div className="space-y-4 self-start">
          <Skeleton className="aspect-[2/3] w-full rounded-md" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex gap-2"><Skeleton className="h-6 w-16" /><Skeleton className="h-6 w-20" /><Skeleton className="h-6 w-24" /></div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <Skeleton className="h-px w-full" />
          <div className="space-y-2"><Skeleton className="h-5 w-full" /><Skeleton className="h-5 w-full" /><Skeleton className="h-5 w-full" /></div>
          <Skeleton className="h-px w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </section>
    </div>
  );
}


export default function SearchResultPage() {
    const router = useRouter();
    const params = useParams();
    const searchQuery = decodeURIComponent(params.query as string);

    const [movie, setMovie] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [bookmarkId, setBookmarkId] = useState<string | null>(null);
    const [isTrailerOpen, setIsTrailerOpen] = useState(false);
    const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
    
    const { user } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
      async function fetchMovie() {
        if (!searchQuery) return;

        setLoading(true);
        setError(null);

        try {
          const response = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}`);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch movie data');
          }
          const data = await response.json();
          setMovie(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
      
      fetchMovie();
    }, [searchQuery]);

    useEffect(() => {
        if (!user || !movie?.id) return;

        const bookmarksRef = collection(db, 'users', user.uid, 'bookmarks');
        const q = firestoreQuery(bookmarksRef, where('movieId', '==', movie.id));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                setIsBookmarked(true);
                setBookmarkId(snapshot.docs[0].id);
            } else {
                setIsBookmarked(false);
                setBookmarkId(null);
            }
        });

        return () => unsubscribe();
    }, [user, movie?.id]);


    const handleToggleBookmark = async () => {
        if (!user) {
            toast({ title: 'Not logged in', description: 'You need to be logged in to manage your watchlist.', variant: 'destructive'});
            return;
        }
        if (!movie || !movie.id) {
            toast({ title: 'Error', description: 'Movie data is not available to bookmark.', variant: 'destructive'});
            return;
        };

        if (isBookmarked && bookmarkId) {
            // Remove from watchlist
            try {
                await deleteDoc(doc(db, 'users', user.uid, 'bookmarks', bookmarkId));
                toast({ title: 'Removed from Watchlist', description: `${movie.title} has been removed from your collection.` });
            } catch (error) {
                console.error('Error removing bookmark:', error);
                toast({ title: 'Error', description: 'Could not remove the movie from your watchlist.', variant: 'destructive'});
            }
        } else {
            // Add to watchlist
            try {
                const bookmarksRef = collection(db, 'users', user.uid, 'bookmarks');
                await addDoc(bookmarksRef, {
                    type: 'movie',
                    movieId: movie.id,
                    title: movie.title,
                    posterUrl: movie.posterUrl,
                    releaseYear: movie.releaseYear,
                    bookmarkedAt: Timestamp.now(),
                });
                toast({ title: 'Added to Watchlist!', description: `${movie.title} has been added to your collection.` });
            } catch(error) {
                console.error('Error bookmarking movie:', error);
                toast({ title: 'Error', description: 'Could not add the movie to your watchlist.', variant: 'destructive'});
            }
        }
    };
    
    const handleWatchVideo = (url: string) => {
        setActiveVideoUrl(url);
        setIsTrailerOpen(true);
    }
    
    const handleCloseDialog = () => {
        setIsTrailerOpen(false);
        setActiveVideoUrl(null);
    }


    return (
        <AppLayout rightSidebar={null}>
            <Dialog open={isTrailerOpen} onOpenChange={handleCloseDialog}>
              <DialogContent className="max-w-4xl p-0 bg-black border-0">
                {activeVideoUrl && (
                  <div className="aspect-video">
                    <iframe
                      src={isTrailerOpen ? `${activeVideoUrl}?autoplay=1` : ""}
                      title="YouTube video player"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  </div>
                )}
              </DialogContent>
            </Dialog>
            <div className="bg-background/80">
                <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
                    {loading ? (
                         <MoviePageSkeleton />
                    ) : error || !movie ? (
                        <div className="text-center py-16">
                            <Film className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h2 className="mt-4 text-xl font-semibold">{error || `No results found for "${searchQuery}"`}</h2>
                            <p className="text-muted-foreground mt-2">Please try searching for a different movie.</p>
                            <Button variant="outline" onClick={() => router.push('/search')} className="mt-4">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
                            </Button>
                        </div>
                    ) : (
                        <div className='space-y-8'>
                            <div className="flex items-center gap-2 -ml-2 mb-4">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.back()}>
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                                <h1 className="text-xl font-bold text-muted-foreground">Search Results</h1>
                            </div>

                            {/* Section 1 & 2: Movie Header & Ratings */}
                            <section>
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                    <div>
                                        <h2 className="text-4xl font-bold">{movie.title}</h2>
                                        <div className='flex items-center gap-3 text-sm text-muted-foreground mt-1 flex-wrap'>
                                            <span>{movie.releaseYear}</span>
                                            <Badge variant="outline">{movie.rating}</Badge>
                                            <span>{movie.duration}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 shrink-0">
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-primary">IMDb RATING</p>
                                            <div className="flex items-center gap-2">
                                                <Star className="h-7 w-7 text-yellow-400 fill-yellow-400"/>
                                                <div>
                                                    <p className="font-bold text-lg"><span className="text-xl">{movie.imdbRating}</span>/10</p>
                                                    <p className="text-xs text-muted-foreground -mt-1">{movie.imdbVotes}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
                                {/* Left Column: Poster & Actions */}
                                <div className="space-y-4 self-start">
                                    <div className="relative aspect-[2/3] w-full rounded-md overflow-hidden">
                                        <Image src={movie.posterUrl || 'https://picsum.photos/400/600'} alt={`Poster for ${movie.title}`} fill className="object-cover" data-ai-hint={movie.posterHint} />
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        <Button size="lg" className="w-full" onClick={() => handleWatchVideo(movie.trailerUrl)} disabled={!movie.trailerUrl}><PlayCircle className='mr-2' /> Watch Trailer</Button>
                                        <Button variant="outline" size="lg" className="w-full" onClick={handleToggleBookmark}>
                                            {isBookmarked ? <MinusCircle className='mr-2' /> : <Bookmark className='mr-2' />}
                                            {isBookmarked ? 'Remove from Watchlist' : 'Add to Watchlist'}
                                        </Button>
                                    </div>
                                </div>

                                {/* Right Column: Details */}
                                <div className="space-y-8">
                                    {/* Genres & Storyline */}
                                    <div>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {movie.genres?.map((genre: string) => <Badge key={genre} variant="secondary" className="text-sm">{genre}</Badge>)}
                                        </div>
                                        <p className='leading-relaxed text-muted-foreground'>{movie.storyline}</p>
                                    </div>
                                    <Separator />
                                    {/* Director, Writers, Stars */}
                                    <div className='space-y-2 text-sm'>
                                        {movie.director && <div className='flex gap-2 items-center'>
                                            <p className='font-semibold w-20'>Director</p>
                                            <Link href={movie.director.href} className="text-primary hover:underline">{movie.director.name}</Link>
                                        </div>}
                                        {movie.writers?.length > 0 && <div className='flex gap-2 items-center'>
                                            <p className='font-semibold w-20'>Writers</p>
                                            {movie.writers.map((w: any, i: number) => <Link key={i} href={w.href} className="text-primary hover:underline">{w.name}</Link>)}
                                        </div>}
                                        {movie.topCast?.length > 0 && <div className='flex gap-2 items-center'>
                                            <p className='font-semibold w-20'>Stars</p>
                                            {movie.topCast.slice(0,3).map((c: any, i: number) => <Link key={i} href={c.href} className="text-primary hover:underline">{c.name}</Link>)}
                                        </div>}
                                    </div>
                                    <Separator />
                                    {/* Reviews & Awards */}
                                    <div className='flex items-center gap-4 text-sm'>
                                        <div className='flex items-center gap-2'>
                                            <div className='p-2 bg-yellow-400 text-black font-bold rounded'>
                                                {movie.metascore}
                                            </div>
                                            <div>
                                                <p className='font-semibold'>Metascore</p>
                                                <p className='text-xs text-muted-foreground'>Critic reviews</p>
                                            </div>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <Award className='w-5 h-5 text-primary' />
                                            <p>{movie.awardsSummary}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 7: Videos */}
                            {movie.videos?.length > 0 && <section>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-2xl font-bold">Videos</h3>
                                    <Button variant="link" className="text-primary">See all videos</Button>
                                </div>
                                <Carousel opts={{ align: "start" }} className="w-full">
                                    <CarouselContent>
                                        {movie.videos.map((video: any, index: number) => (
                                            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                                                <div className="group cursor-pointer" onClick={() => handleWatchVideo(video.videoUrl)}>
                                                    <div className="relative aspect-video rounded-lg overflow-hidden border">
                                                        <Image src={video.thumbnailUrl} alt={video.type} fill className="object-cover transition-transform group-hover:scale-105" data-ai-hint={video.hint} />
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <PlayCircle className="h-12 w-12 text-white" />
                                                        </div>
                                                        <p className="absolute bottom-1 right-2 text-white text-xs bg-black/70 px-1.5 py-0.5 rounded">{video.duration}</p>
                                                    </div>
                                                    <p className="font-semibold mt-2 text-sm">{video.type}</p>
                                                </div>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious className="hidden md:flex" />
                                    <CarouselNext className="hidden md:flex" />
                                </Carousel>
                            </section>}

                             {/* Section 8: Photos */}
                            {movie.photos?.length > 0 && <section>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-2xl font-bold">Photos</h3>
                                    <Button variant="link" className="text-primary">See all photos</Button>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {movie.photos.map((photo: any, index: number) => (
                                    <div key={index} className="relative aspect-video rounded-lg overflow-hidden border group">
                                        <Image src={photo.url} alt={`Photo ${index + 1}`} fill className="object-cover transition-transform group-hover:scale-105" data-ai-hint={photo.hint} />
                                    </div>
                                ))}
                                </div>
                            </section>}


                            {/* Section 9: Top Cast */}
                           {movie.topCast?.length > 0 && <section>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-2xl font-bold">Top Cast</h3>
                                    <Button variant="link" className="text-primary">See full cast & crew</Button>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-6">
                                {movie.topCast.map((member: any) => (
                                    <div key={member.name} className="flex items-center gap-3">
                                        <Link href={member.href}>
                                            <Avatar className='h-16 w-16 cursor-pointer'>
                                                <AvatarImage src={member.avatar} />
                                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        </Link>
                                        <div>
                                            <Link href={member.href} className="font-semibold hover:underline">{member.name}</Link>
                                            <p className="text-sm text-muted-foreground">{member.role}</p>
                                        </div>
                                    </div>
                                ))}
                                </div>
                            </section>}

                            <section>
                                 <Accordion type="multiple" className="w-full space-y-4">
                                    {/* Storyline */}
                                    <AccordionItem value="storyline" className="bg-secondary/50 rounded-lg px-4">
                                        <AccordionTrigger className="text-lg font-semibold">Storyline</AccordionTrigger>
                                        <AccordionContent className="space-y-4">
                                            <p>{movie.storyline}</p>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="font-semibold">Plot keywords:</span>
                                                {movie.plotKeywords.map((keyword: string) => <Badge key={keyword} variant="outline">{keyword}</Badge>)}
                                            </div>
                                             <div>
                                                <span className="font-semibold">Tagline:</span>
                                                <em className="text-muted-foreground ml-2">"{movie.tagline}"</em>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                    
                                     {/* Did you know */}
                                    <AccordionItem value="did-you-know" className="bg-secondary/50 rounded-lg px-4">
                                        <AccordionTrigger className="text-lg font-semibold">Did You Know?</AccordionTrigger>
                                        <AccordionContent className="space-y-3">
                                            {movie.didYouKnow.trivia && <div><h4 className="font-semibold mb-1">Trivia</h4><ul className="list-disc pl-5 text-muted-foreground"> {movie.didYouKnow.trivia.map((item:string, i:number) => <li key={i}>{item}</li>)} </ul></div>}
                                            {movie.didYouKnow.goofs && <div><h4 className="font-semibold mb-1">Goofs</h4><ul className="list-disc pl-5 text-muted-foreground"> {movie.didYouKnow.goofs.map((item:string, i:number) => <li key={i}>{item}</li>)} </ul></div>}
                                            {movie.didYouKnow.quotes && <div><h4 className="font-semibold mb-1">Quotes</h4><ul className="list-disc pl-5 text-muted-foreground"> {movie.didYouKnow.quotes.map((item:string, i:number) => <li key={i}>{item}</li>)} </ul></div>}
                                        </AccordionContent>
                                    </AccordionItem>

                                     {/* Technical Specs */}
                                    <AccordionItem value="tech-specs" className="bg-secondary/50 rounded-lg px-4">
                                        <AccordionTrigger className="text-lg font-semibold">Technical Specs</AccordionTrigger>
                                        <AccordionContent className="space-y-2">
                                            {Object.entries(movie.technicalSpecs).map(([key, value]) => (
                                                <div key={key} className="flex">
                                                    <p className="w-32 font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                                                    <p className="text-muted-foreground">{value as string}</p>
                                                </div>
                                            ))}
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </section>
                            
                            {/* Section 14: More Like This */}
                            {movie.relatedMovies?.length > 0 && <section>
                                <h3 className="text-2xl font-bold mb-4">More Like This</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {movie.relatedMovies.map((related: any) => (
                                        <Link key={related.id} href={`/search/${encodeURIComponent(related.title)}`} passHref>
                                            <Card className="hover:bg-accent/50 transition-colors cursor-pointer flex gap-4 p-4">
                                                <div className="relative aspect-[2/3] w-24 rounded-md overflow-hidden shrink-0">
                                                    <Image src={related.posterUrl} alt={related.title} fill className="object-cover" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <CardTitle className="text-lg">{related.title}</CardTitle>
                                                    <div className="flex items-center gap-4 text-sm my-1">
                                                        <div className="flex items-center gap-1">
                                                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                            <span className="font-semibold">{related.rating}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-muted-foreground">
                                                            <Heart className="w-4 h-4" />
                                                            <span>{related.likes}</span>
                                                        </div>
                                                    </div>
                                                    <CardDescription className="text-xs leading-relaxed line-clamp-3">{related.description}</CardDescription>
                                                </div>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            </section>}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
