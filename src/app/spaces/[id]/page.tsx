'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Mic,
  MicOff,
  PhoneOff,
  Hand,
  Share2,
  Heart,
  Laugh,
  ThumbsUp,
  PartyPopper,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const mockSpaceData = {
  id: 'space-1',
  title: 'Filmmaking Q&A with Christopher Nolan',
  hosts: [
    { name: 'Chris Nolan', avatar: 'https://picsum.photos/id/1005/96/96', isHost: true },
  ],
  speakers: [
    { name: 'Emma Thomas', avatar: 'https://picsum.photos/id/1011/80/80', isMuted: false },
    { name: 'John David Washington', avatar: 'https://picsum.photos/id/1012/80/80', isMuted: true },
    { name: 'You', avatar: 'https://picsum.photos/id/1013/80/80', isMuted: true },
  ],
  listeners: Array.from({ length: 27 }, (_, i) => ({
    name: `Listener ${i + 1}`,
    avatar: `https://picsum.photos/seed/${i}/64/64`,
  })),
};

const reactions = [
  { icon: <Heart className="h-6 w-6" />, name: 'Heart' },
  { icon: <ThumbsUp className="h-6 w-6" />, name: 'Thumbs Up' },
  { icon: <Hand className="h-6 w-6" />, name: 'Clap' },
  { icon: <Laugh className="h-6 w-6" />, name: 'Laugh' },
  { icon: <PartyPopper className="h-6 w-6" />, name: 'Celebrate' },
];

export default function SpaceRoomPage() {
  const router = useRouter();
  const params = useParams();
  const spaceId = params.id;

  // In a real app, you would fetch space data based on `spaceId`
  const space = mockSpaceData;

  const [isMuted, setIsMuted] = useState(true);

  return (
    <div className="bg-background text-foreground h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">SPACE</p>
          <h1 className="font-bold text-lg">{space.title}</h1>
        </div>
        <div className="w-10"></div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        {/* Hosts & Speakers */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-4">Hosts & Speakers</h2>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...space.hosts, ...space.speakers].map((person, index) => (
              <div key={index} className="flex flex-col items-center text-center gap-2">
                <div className="relative">
                  <Avatar className="w-20 h-20 md:w-24 md:h-24 border-4 border-primary/50 shadow-lg">
                    <AvatarImage src={person.avatar} />
                    <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                  </Avatar>

                  {/* Badge for host */}
                  {'isHost' in person && person.isHost && (
                    <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2" variant="default">
                      Host
                    </Badge>
                  )}
                </div>

                <p className="font-semibold text-sm truncate">{person.name}</p>

                {/* Mic status for speakers */}
                {'isMuted' in person && (
                  <div className={cn('p-1.5 rounded-full', person.isMuted ? 'bg-muted' : 'bg-green-500/20')}>
                    {person.isMuted ? <MicOff className="h-4 w-4 text-muted-foreground" /> : <Mic className="h-4 w-4 text-green-500" />}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="my-8 h-px bg-border" />

        {/* Listeners */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-4">Listeners ({space.listeners.length})</h2>
          <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
            {space.listeners.map((listener, index) => (
              <Avatar key={index} className="w-12 h-12 md:w-16 md:h-16">
                <AvatarImage src={listener.avatar} />
                <AvatarFallback>{listener.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
          </div>
        </section>
      </main>

      {/* Footer / Controls */}
      <footer className="sticky bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t border-border">
        <div className="flex items-center justify-between">
          <Button variant="destructive" size="lg" className="rounded-full px-6" onClick={() => router.push('/spaces')}>
            <PhoneOff className="mr-2 h-5 w-5" />
            Leave
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="icon" className="rounded-full h-12 w-12" onClick={() => setIsMuted(prev => !prev)}>
              {isMuted ? <MicOff /> : <Mic />}
            </Button>
            <Button variant="secondary" size="icon" className="rounded-full h-12 w-12">
              <Hand />
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="secondary" size="icon" className="rounded-full h-12 w-12">
                    <Heart />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="flex gap-2 bg-secondary border-border p-2 rounded-full">
                  {reactions.map((r, i) => (
                    <Button key={i} variant="ghost" size="icon" className="rounded-full hover:bg-accent">
                      {r.icon}
                    </Button>
                  ))}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Button variant="secondary" size="lg" className="rounded-full px-6">
            <Share2 className="mr-2 h-5 w-5" />
            Share
          </Button>
        </div>
      </footer>
    </div>
  );
}
