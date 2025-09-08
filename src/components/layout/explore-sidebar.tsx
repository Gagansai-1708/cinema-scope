
'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Input } from "../ui/input";
import { Search } from "lucide-react";

const suggestions = [
  { name: 'Christopher Nolan', username: 'nolan', avatar: 'https://picsum.photos/id/1005/200/200', type: 'Director' },
  { name: 'Denis Villeneuve', username: 'denis', avatar: 'https://picsum.photos/id/1012/200/200', type: 'Director' },
  { name: 'Florence Pugh', username: 'florence', avatar: 'https://picsum.photos/id/1027/200/200', type: 'Actor' },
  { name: 'Roger Deakins', username: 'deakins', avatar: 'https://picsum.photos/id/1040/200/200', type: 'Cinematographer' },
  { name: 'CineFix', username: 'cinefix', avatar: 'https://picsum.photos/id/1062/200/200', type: 'Influencer' },
];


export function ExploreSidebar() {
  return (
    <div className="space-y-4">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search CinemaScope" className="pl-9 bg-secondary border-none h-11 rounded-full focus-visible:ring-primary focus-visible:bg-background focus-visible:border" />
        </div>

        <Card className="bg-secondary border-none">
            <CardHeader>
                <CardTitle>Who to follow</CardTitle>
            </CardHeader>
            <CardContent>
                {suggestions.map(sugg => (
                    <div key={sugg.username} className="flex items-center justify-between mb-4 hover:bg-accent/50 -mx-6 px-6 py-2 cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={sugg.avatar} />
                                <AvatarFallback>{sugg.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-sm hover:underline">{sugg.name}</p>
                                <p className="text-xs text-muted-foreground">@{sugg.username}</p>
                            </div>
                        </div>
                        <Button size="sm" variant="outline" className="bg-foreground text-background hover:bg-foreground/90 rounded-full">Follow</Button>
                    </div>
                ))}
                <Button variant="link" className="p-0 h-auto text-primary">Show more</Button>
            </CardContent>
        </Card>
      
        <div className="text-xs text-muted-foreground space-x-2 flex flex-wrap px-4">
            <Link href="#" className="hover:underline">Terms of Service</Link>
            <Link href="#" className="hover:underline">Privacy Policy</Link>
            <Link href="#" className="hover:underline">Cookie Policy</Link>
            <Link href="#" className="hover:underline">Accessibility</Link>
            <Link href="#" className="hover:underline">More...</Link>
            <span>© 2024 CinemaScope, Inc.</span>
        </div>
    </div>
  )
}
