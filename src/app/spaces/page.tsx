
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { RightSidebar } from '@/components/layout/right-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mic, Plus, Radio, Users } from 'lucide-react';
import { CreateSpaceDialog } from '@/components/create-space-dialog';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const mockSpaces = [
  {
    id: 'space-1',
    title: 'Filmmaking Q&A with Christopher Nolan',
    topic: 'Cinema',
    hosts: [{ name: 'Chris Nolan', avatar: 'https://picsum.photos/id/1005/40/40' }],
    speakers: [{ name: 'You' }, { name: 'Emma' }, { name: 'John' }],
    listenerCount: 1800,
    isLive: true,
  },
  {
    id: 'space-2',
    title: 'The Art of Cinematography',
    topic: 'Filmmaking',
    hosts: [{ name: 'Roger Deakins', avatar: 'https://picsum.photos/id/1040/40/40' }],
    speakers: [{ name: 'Sarah' }, { name: 'Tom' }],
    listenerCount: 789,
    isLive: true,
  },
  {
    id: 'space-3',
    title: 'Screenwriting 101: Crafting Your First Script',
    topic: 'Writing',
    hosts: [{ name: 'Aaron Sorkin', avatar: 'https://picsum.photos/id/1011/40/40' }],
    speakers: [],
    listenerCount: 450,
    isLive: false,
    startTime: 'Starts in 2 hours',
  },
];

export default function SpacesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const router = useRouter();

  const handleJoinSpace = (spaceId: string) => {
    router.push(`/spaces/${spaceId}`);
  };

  return (
    <>
      <CreateSpaceDialog isOpen={isCreateDialogOpen} setIsOpen={setIsCreateDialogOpen} />
      <AppLayout rightSidebar={<RightSidebar />}>
        <div className="sticky top-0 z-10 border-b border-border bg-background/80 p-4 backdrop-blur-md flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Spaces</h1>
            <p className="text-sm text-muted-foreground">Live audio conversations</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create a Space
          </Button>
        </div>

        <div className="p-4 space-y-6">
          {mockSpaces.map((space) => (
             <Link key={space.id} href={`/spaces/${space.id}`} passHref>
                <Card className="cursor-pointer transition-all border-border hover:border-primary/50 bg-gradient-to-tr from-secondary via-background to-background">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            {space.isLive && <Badge variant="destructive" className="mb-2 animate-pulse"><Radio className="mr-1.5 h-3 w-3"/> LIVE</Badge>}
                            <CardTitle>{space.title}</CardTitle>
                            <CardDescription>{space.topic}</CardDescription>
                        </div>
                        <div className="flex -space-x-2">
                            {space.hosts.map((host, i) => (
                                <Avatar key={i} className="h-8 w-8 border-2 border-background">
                                    <AvatarImage src={host.avatar} />
                                    <AvatarFallback>{host.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                            ))}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2">
                        {space.speakers.slice(0, 3).map((speaker, i) => (
                           <div key={i} className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Mic className="h-4 w-4" />
                                <span>{speaker.name}</span>
                           </div>
                        ))}
                        {space.speakers.length > 3 && <span className="text-sm text-muted-foreground">& {space.speakers.length - 3} more</span>}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{space.listenerCount} listening</span>
                    </div>
                    {space.isLive ? (
                         <Button variant="default">Join now</Button>
                    ) : (
                         <Button variant="outline">{space.startTime}</Button>
                    )}
                </CardFooter>
                </Card>
             </Link>
          ))}
        </div>
      </AppLayout>
    </>
  );
}
