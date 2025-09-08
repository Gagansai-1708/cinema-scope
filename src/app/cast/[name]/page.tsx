
'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Film, Camera } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

const mockCastData = {
    name: 'Leonardo DiCaprio',
    photoUrl: 'https://picsum.photos/seed/leo-dicaprio/400/600',
    photoHint: 'headshot photo',
    bio: 'Leonardo Wilhelm DiCaprio is an American actor and film producer. Known for his work in biopics and period films, DiCaprio is the recipient of numerous accolades, including an Academy Award, a British Academy Film Award, and three Golden Globe Awards.',
    knownFor: [
        { id: '1', title: 'Inception', posterUrl: 'https://picsum.photos/seed/inception/200/300' },
        { id: '2', title: 'The Wolf of Wall Street', posterUrl: 'https://picsum.photos/seed/wolfws/200/300' },
        { id: '3', title: 'Titanic', posterUrl: 'https://picsum.photos/seed/titanic/200/300' },
        { id: '4', title: 'The Revenant', posterUrl: 'https://picsum.photos/seed/revenant/200/300' },
    ],
    filmography: [
        { year: 2023, title: 'Killers of the Flower Moon', role: 'Ernest Burkhart' },
        { year: 2021, title: 'Don\'t Look Up', role: 'Dr. Randall Mindy' },
        { year: 2019, title: 'Once Upon a Time in Hollywood', role: 'Rick Dalton' },
        { year: 2015, title: 'The Revenant', role: 'Hugh Glass' },
        { year: 2013, title: 'The Wolf of Wall Street', role: 'Jordan Belfort' },
        { year: 2013, title: 'The Great Gatsby', role: 'Jay Gatsby' },
        { year: 2012, title: 'Django Unchained', role: 'Calvin Candie' },
        { year: 2010, title: 'Inception', role: 'Cobb' },
        { year: 2010, title: 'Shutter Island', role: 'Teddy Daniels' },
    ],
    personalDetails: {
        'Born': 'November 11, 1974 (age 49), Los Angeles, California, USA',
        'Height': '6′ 0″ (1.83 m)',
    },
    trivia: [
        'Was considered for the role of "Dirk Diggler" in Boogie Nights (1997) but had already committed to Titanic (1997) and Paul Thomas Anderson cast Mark Wahlberg in the role instead.',
        'He is an environmental conservationist and has produced a number of documentaries about the subject.',
        'His father is of half-German and half-Italian descent. His mother is of German and Russian ancestry.'
    ]
};

// @ts-ignore
function CastPageSkeleton() {
    return (
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
            <Skeleton className="h-8 w-32 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
                <div className="space-y-6">
                    <Card className="overflow-hidden shadow-lg">
                        <Skeleton className="aspect-[3/4] w-full" />
                    </Card>
                    <Card>
                        <CardHeader><CardTitle><Skeleton className="h-6 w-1/2" /></CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-8">
                    <div>
                        <Skeleton className="h-4 w-16 mb-2" />
                        <Skeleton className="h-12 w-3/4" />
                    </div>
                    <Card>
                        <CardHeader><CardTitle><Skeleton className="h-6 w-1/4" /></CardTitle></CardHeader>
                        <CardContent><Skeleton className="h-20 w-full" /></CardContent>
                    </Card>
                    <div>
                        <Skeleton className="h-8 w-1/3 mb-4" />
                        <div className="space-y-4">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CastMemberPage() {
    const router = useRouter();
    const params = useParams();
    const name = decodeURIComponent(params.name as string);

    const [castMember, setCastMember] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCastMember() {
            if (!name) return;
            setLoading(true);
            try {
                // In a real app, you might use a slugified name or a unique ID.
                const docId = name.toLowerCase().replace(/\s+/g, '-');
                const memberRef = doc(db, 'cast', docId);
                const memberSnap = await getDoc(memberRef);

                if (memberSnap.exists()) {
                    setCastMember({ id: memberSnap.id, ...memberSnap.data() });
                } else {
                    // Fallback for demo purposes
                    if (name.toLowerCase() === 'leonardo dicaprio') {
                        setCastMember(mockCastData);
                    } else {
                        setCastMember(null);
                    }
                }
            } catch (error) {
                console.error("Error fetching cast member:", error);
                setCastMember(null);
            } finally {
                setLoading(false);
            }
        }

        fetchCastMember();
    }, [name]);
    
    if (loading) {
        return (
             <AppLayout rightSidebar={null}>
                <CastPageSkeleton />
             </AppLayout>
        )
    }

    if (!castMember) {
        return (
            <AppLayout>
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                    <Camera className="h-16 w-16 mb-4" />
                    <h2 className="text-xl font-semibold text-foreground">Cast Member Not Found</h2>
                    <p>The person you're looking for isn't in our database.</p>
                     <Button variant="outline" onClick={() => router.back()} className="mt-4">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                    </Button>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout rightSidebar={null}>
            <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
                 <Button variant="ghost" onClick={() => router.back()} className="mb-4 -ml-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Movie
                </Button>

                <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                        <Card className="overflow-hidden shadow-lg">
                            <div className="relative aspect-[3/4] w-full">
                                <Image src={castMember.photoUrl} alt={castMember.name} fill className="object-cover" data-ai-hint={castMember.photoHint} />
                            </div>
                        </Card>
                        
                        <Card>
                            <CardHeader><CardTitle>Personal Details</CardTitle></CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                {Object.entries(castMember.personalDetails).map(([key, value]) => (
                                    <div key={key}>
                                        <p className="font-semibold">{key}</p>
                                        <p className="text-muted-foreground">{value as string}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader><CardTitle>Known For</CardTitle></CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-2">
                                    {castMember.knownFor.map((movie: any) => (
                                        <Link key={movie.id} href="#">
                                            <div className="aspect-[2/3] relative rounded-md overflow-hidden group">
                                                 <Image src={movie.posterUrl} alt={movie.title} fill className="object-cover" />
                                                 <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-end p-2 transition-opacity">
                                                    <p className="text-white text-xs font-bold">{movie.title}</p>
                                                 </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                        <div>
                            <p className="text-sm text-primary font-semibold">ACTOR</p>
                            <h1 className="text-5xl font-bold tracking-tight">{castMember.name}</h1>
                        </div>
                        
                        <Card>
                           <CardHeader><CardTitle>Mini Bio</CardTitle></CardHeader>
                           <CardContent><p className="text-muted-foreground leading-relaxed">{castMember.bio}</p></CardContent>
                        </Card>

                        <div>
                            <h2 className="text-2xl font-bold mb-4">Filmography</h2>
                            <div className="flex items-center gap-4 mb-4 border-b pb-2">
                               <Badge>All</Badge>
                               <Button variant="ghost" size="sm">Actor</Button>
                               <Button variant="ghost" size="sm">Producer</Button>
                               <Button variant="ghost" size="sm">Writer</Button>
                               <Button variant="ghost" size="sm">Self</Button>
                            </div>
                            <div className="space-y-4">
                                {castMember.filmography.map((credit: any) => (
                                    <div key={credit.title} className="flex items-center justify-between p-3 rounded-md hover:bg-accent/50">
                                        <div className="flex items-center gap-4">
                                            <span className="text-muted-foreground font-semibold w-12">{credit.year}</span>
                                            <div>
                                                <p className="font-semibold text-base hover:underline cursor-pointer">{credit.title}</p>
                                                <p className="text-sm text-muted-foreground">{credit.role}</p>
                                            </div>
                                        </div>
                                        <Film className="h-5 w-5 text-muted-foreground"/>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <Card>
                            <CardHeader><CardTitle>Did You Know?</CardTitle></CardHeader>
                            <CardContent>
                                <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="trivia">
                                        <AccordionTrigger>Trivia</AccordionTrigger>
                                        <AccordionContent>
                                            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                                                {castMember.trivia.map((item: string, index: number) => <li key={index}>{item}</li>)}
                                            </ul>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
