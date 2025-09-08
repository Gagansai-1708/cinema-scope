
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { AppLayout } from "@/components/layout/app-layout";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ComingSoonMovie } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Calendar, Film } from 'lucide-react';

const languageFilters = [
    { label: "All", value: "all" },
    { label: "Telugu", value: "te" },
    { label: "Hindi", value: "hi" },
    { label: "English", value: "en" },
    { label: "Tamil", value: "ta" },
];

function MovieCardSkeleton() {
    return (
        <Card className="overflow-hidden border-border">
            <div className="relative aspect-[2/3] w-full bg-muted">
                <Skeleton className="w-full h-full" />
            </div>
            <CardHeader className="p-3">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
        </Card>
    );
}

export default function ComingSoonPage() {
    const [movies, setMovies] = useState<ComingSoonMovie[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("all");

    useEffect(() => {
        async function fetchComingSoonMovies() {
            setLoading(true);
            try {
                const response = await fetch(`/api/coming-soon?language=${activeFilter}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch movies');
                }
                const data = await response.json();
                setMovies(data);
            } catch (error) {
                console.error("Error fetching coming soon movies:", error);
                setMovies([]);
            } finally {
                setLoading(false);
            }
        }
        fetchComingSoonMovies();
    }, [activeFilter]);

    return (
        <AppLayout rightSidebar={<RightSidebar />}>
            <div className="sticky top-0 z-10 border-b border-border bg-background/80 p-4 backdrop-blur-md">
                <h1 className="text-xl font-bold">Coming Soon</h1>
            </div>
            <div className="p-4">
                <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                    {languageFilters.map(filter => (
                        <Button
                            key={filter.value}
                            variant={activeFilter === filter.value ? "default" : "outline"}
                            onClick={() => setActiveFilter(filter.value)}
                            className="rounded-full shrink-0"
                        >
                            {filter.label}
                        </Button>
                    ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6">
                    {loading ? (
                        Array.from({ length: 10 }).map((_, i) => <MovieCardSkeleton key={i} />)
                    ) : movies.length > 0 ? (
                        movies.map((movie) => (
                            <Card key={movie.id} className="overflow-hidden border-border hover:border-primary/50 transition-colors group">
                                <div className="relative aspect-[2/3] w-full">
                                    <Image src={movie.posterUrl} alt={movie.title} fill className="object-cover group-hover:scale-105 transition-transform" data-ai-hint={`${movie.title} poster`} />
                                </div>
                                <CardHeader className="p-3">
                                    <CardTitle className="text-base truncate group-hover:text-primary">{movie.title}</CardTitle>
                                    <CardDescription className="text-xs flex items-center gap-1.5 pt-1">
                                       <Calendar className='h-3 w-3' />
                                       {movie.releaseDate}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-16 text-muted-foreground">
                            <Film className="mx-auto h-12 w-12 mb-4" />
                            <h3 className="text-lg font-semibold">No Upcoming Movies Found</h3>
                            <p>Check back later or try a different filter.</p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
