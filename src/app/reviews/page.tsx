
'use client';

import { AppLayout } from "@/components/layout/app-layout";
import Image from "next/image";
import { Card, CardContent, CardTitle, CardHeader, CardFooter } from "@/components/ui/card";
import { Star } from "lucide-react";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type MovieReviewSummary = {
    id: string;
    title: string;
    posterUrl: string;
    posterHint: string;
    averageRating: number;
    reviewCount: number;
    likes: number;
    isPromoted?: boolean;
};

const languageFilters = ["New Releases", "Telugu", "Hindi", "English", "Malayalam"];

function ReviewSkeleton() {
    return (
        <Card className="overflow-hidden border-border bg-transparent shadow-none rounded-lg">
            <div className="relative aspect-[2/3] w-full">
                <Skeleton className="w-full h-full" />
            </div>
            <CardFooter className="p-2 flex flex-col items-start space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardFooter>
        </Card>
    );
}

export default function ReviewsPage() {
  const [movies, setMovies] = useState<MovieReviewSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("English");

  useEffect(() => {
    async function fetchMovieReviews() {
        setLoading(true);
        try {
            // In a real app, you would probably filter by language/activeFilter
            const reviewsQuery = query(collection(db, "movie_reviews"), orderBy("averageRating", "desc"));
            const querySnapshot = await getDocs(reviewsQuery);
            const reviewsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MovieReviewSummary));
            setMovies(reviewsData);
        } catch (error) {
            console.error("Error fetching movie reviews:", error);
        } finally {
            setLoading(false);
        }
    }
    fetchMovieReviews();
  }, []);

  return (
    <AppLayout rightSidebar={<RightSidebar />}>
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 p-4 backdrop-blur-md">
        <h1 className="text-xl font-bold">Movie Reviews</h1>
      </div>
      
      <div className="p-4">
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
          {languageFilters.map(filter => (
            <Button 
              key={filter} 
              variant={activeFilter === filter ? "default" : "outline"}
              onClick={() => setActiveFilter(filter)}
              className="rounded-full shrink-0"
            >
              {filter}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 mt-4">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <ReviewSkeleton key={i} />)
          ) : movies.length > 0 ? (
            movies.map((movie) => (
              <Link key={movie.id} href={`/reviews/${movie.id}`} passHref>
                  <Card className="overflow-hidden border-border bg-transparent shadow-none rounded-lg group cursor-pointer">
                    <CardHeader className="p-0 relative">
                      <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden border border-border group-hover:border-primary/50 transition-all">
                        <Image src={movie.posterUrl} alt={movie.title} fill className="object-cover group-hover:scale-105 transition-transform" data-ai-hint={movie.posterHint} />
                        {movie.isPromoted && (
                          <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg">PROMOTED</div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-2">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-1">
                          <div className="flex items-center gap-1.5">
                            <Star className="h-4 w-4 text-rating fill-rating" />
                            <span>{movie.averageRating.toFixed(1)}</span>
                             <span className="text-xs">({(movie.reviewCount/1000).toFixed(1)}k votes)</span>
                          </div>
                      </div>
                      <CardTitle className="text-base font-semibold truncate group-hover:text-primary transition-colors">{movie.title}</CardTitle>
                    </CardContent>
                  </Card>
              </Link>
            ))
          ) : (
            <p className="text-muted-foreground col-span-full text-center">No movie reviews available yet.</p>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
