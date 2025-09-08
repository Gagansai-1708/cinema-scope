
'use client';

import { AppLayout } from "@/components/layout/app-layout";
import { TicketBookingSidebar } from "@/components/layout/ticket-booking-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Heart } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import type { Movie } from '@/lib/types';
import Link from "next/link";
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from "@/components/ui/skeleton";

function MovieCardSkeleton() {
    return (
        <Card className="overflow-hidden border-border">
            <Skeleton className="aspect-[2/3] w-full" />
            <CardHeader className="p-3">
                <Skeleton className="h-5 w-3/4" />
            </CardHeader>
            <CardFooter className="p-3 pt-0 flex justify-between items-center">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-16" />
            </CardFooter>
        </Card>
    );
}

export default function TicketBookingPage() {
    const [selectedLocation, setSelectedLocation] = useState('New York');
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMovies() {
            setLoading(true);
            try {
                // In a real app, you might also filter by location
                const moviesQuery = query(collection(db, "movies_now_showing"), orderBy("likes", "desc"));
                const querySnapshot = await getDocs(moviesQuery);
                const moviesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Movie));
                setMovies(moviesData);
            } catch (error) {
                console.error("Error fetching movies:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchMovies();
    }, [selectedLocation]); // Refetch when location changes

    return (
        <AppLayout rightSidebar={<TicketBookingSidebar selectedLocation={selectedLocation} onLocationChange={setSelectedLocation} />}>
            <div className="sticky top-0 z-10 border-b border-border bg-background/80 p-4 backdrop-blur-md">
                <h1 className="text-xl font-bold">Book Tickets</h1>
                <p className="text-sm text-muted-foreground">Now showing in {selectedLocation}</p>
            </div>
            
            <div className="p-4">
                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-3">Now Showing</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => <MovieCardSkeleton key={i} />)
                        ) : movies.length > 0 ? (
                            movies.map(movie => (
                                <Card key={movie.id} className="overflow-hidden border-border hover:border-primary/50 transition-colors group">
                                    <Link href="#" className="block">
                                        <div className="relative aspect-[2/3] w-full">
                                            <Image src={movie.posterUrl} alt={movie.title} fill className="object-cover group-hover:scale-105 transition-transform" data-ai-hint={movie.posterHint} />
                                        </div>
                                        <CardHeader className="p-3">
                                            <CardTitle className="text-base truncate group-hover:text-primary">{movie.title}</CardTitle>
                                        </CardHeader>
                                    </Link>
                                    <CardFooter className="p-3 pt-0 flex justify-between items-center">
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <Heart className="h-4 w-4 text-red-500 fill-current" />
                                            <span className="text-xs font-medium">{(movie.likes / 1000).toFixed(1)}k likes</span>
                                        </div>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href="#">Book</Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))
                        ) : (
                             <p className="text-muted-foreground col-span-full text-center">No movies currently showing in {selectedLocation}.</p>
                        )}
                    </div>
                </div>
                
                <Separator className="my-8" />

                <div>
                    <h2 className="text-lg font-semibold mb-3">Coming Soon</h2>
                    {/* Placeholder for coming soon movies */}
                    <p className="text-muted-foreground text-center py-8">More movies coming soon!</p>
                </div>
            </div>
        </AppLayout>
    );
}
