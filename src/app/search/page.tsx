
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from "@/components/layout/app-layout";
import { ExploreSidebar } from "@/components/layout/explore-sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, Clock } from "lucide-react";

const recentSearches = [
    "Inception",
    "The Matrix",
    "Blade Runner 2049",
    "Dune",
    "Oppenheimer"
];

export default function SearchPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search/${encodeURIComponent(searchQuery.trim())}`);
        }
    };
    
    const handleRecentSearchClick = (query: string) => {
        setSearchQuery(query);
        router.push(`/search/${encodeURIComponent(query)}`);
    }

    return (
        <AppLayout rightSidebar={<ExploreSidebar />}>
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4">
                 <h1 className="text-xl font-bold">Search</h1>
            </div>
            <div className="p-4 md:p-6">
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                    <div className="relative w-full">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            placeholder="Search for a movie, actor, or director..." 
                            className="pl-10 h-12 text-base"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button type="submit" size="lg">Search</Button>
                </form>

                <div className="mt-8">
                    <h2 className="text-lg font-semibold mb-3">Recent Searches</h2>
                    <div className="flex flex-wrap gap-2">
                        {recentSearches.map((searchTerm, index) => (
                            <Button 
                                key={index} 
                                variant="outline" 
                                className="rounded-full"
                                onClick={() => handleRecentSearchClick(searchTerm)}
                            >
                                <Clock className="mr-2 h-4 w-4" />
                                {searchTerm}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    )
}
