
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, Upload, Trash2, Bold, Italic, Underline } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc, getDoc, writeBatch } from "firebase/firestore";

// Mock data - in a real app, this would be fetched based on the [id]
const productionRequirements = {
  '1': {
    id: '1',
    title: 'High-Concept Sci-Fi Thriller',
    category: 'Feature Film',
    details: "Looking for a mind-bending sci-fi script with a strong protagonist and a twisty plot. Think 'Inception' meets 'Blade Runner'. Key themes: identity, reality, corporate espionage.",
    postedBy: 'Universal Pictures',
    producerId: 'producer_universal_uid',
    producerDetails: {
      name: 'Universal Pictures',
      username: 'universal',
      avatar: 'https://pbs.twimg.com/profile_images/1473431189494210561/hQp0S3b5_400x400.jpg',
    }
  },
  '2': {
    id: '2',
    title: 'Character-Driven Historical Drama',
    category: 'Limited Series',
    details: "Seeking a compelling story set in a significant historical period, focusing on the personal journey of a complex character. Must be well-researched and emotionally resonant.",
    postedBy: 'Warner Bros.',
    producerId: 'producer_wb_uid',
     producerDetails: {
      name: 'Warner Bros.',
      username: 'warnerbros',
      avatar: 'https://pbs.twimg.com/profile_images/1780659392623714304/m0Oh1vJv_400x400.png',
    }
  },
  '3': {
    id: '3',
    title: "Quirky Indie Comedy",
    category: "Feature Film",
    details: "We want a script that is laugh-out-loud funny but also has a lot of heart. Unique, relatable characters are a must.",
    postedBy: "A24",
    producerId: 'producer_a24_uid',
    producerDetails: {
      name: 'A24',
      username: 'a24',
      avatar: 'https://pbs.twimg.com/profile_images/1473431189494210561/hQp0S3b5_400x400.jpg',
    }
  },
  '4': {
    id: '4',
    title: "Episodic Mystery Series",
    category: "TV Series",
    details: "Looking for a pilot script for a mystery series with a strong ensemble cast and a central puzzle that unfolds over the season.",
    postedBy: "HBO",
    producerId: 'producer_hbo_uid',
    producerDetails: {
      name: 'HBO',
      username: 'hbo',
      avatar: 'https://pbs.twimg.com/profile_images/1785361899933863936/eI0TMC2B_400x400.jpg',
    }
  },
  '5': {
    id: '5',
    title: "Animated Fantasy Adventure",
    category: "Animated Film",
    details: "Seeking a magical story for all ages. We love worlds with unique lore and characters that audiences will fall in love with.",
    postedBy: "Pixar",
    producerId: 'producer_pixar_uid',
    producerDetails: {
      name: 'Pixar',
      username: 'pixar',
      avatar: 'https://pbs.twimg.com/profile_images/1763259642959962112/I_99ihM1_400x400.jpg',
    }
  },
  '6': {
    id: '6',
    title: "Contained Psychological Thriller",
    category: "Feature Film",
    details: "We're in the market for a tense, single-location thriller that relies on suspense and performance over spectacle.",
    postedBy: "Blumhouse",
    producerId: 'producer_blumhouse_uid',
    producerDetails: {
      name: 'Blumhouse',
      username: 'blumhouse',
      avatar: 'https://pbs.twimg.com/profile_images/1291800473293393921/x-L5g03w_400x400.jpg',
    }
  }
};

export default function SubmissionPage() {
  const router = useRouter();
  const params = useParams();
  const requirementId = Array.isArray(params.id) ? params.id[0] : params.id;
  // @ts-ignore
  const requirement = requirementId ? productionRequirements[requirementId as keyof typeof productionRequirements] : null;

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const [writerDetails, setWriterDetails] = useState({ name: '', place: '', email: '', phone: '' });
  const [storyContent, setStoryContent] = useState('');
  const [storyCategory, setStoryCategory] = useState('');
  const [previousWorks, setPreviousWorks] = useState('');
  
  // In a real app, you'd check if user details are already saved.
  const handleNextStep = () => {
     if (!writerDetails.name || !writerDetails.email) {
      toast({ title: "Missing Details", description: "Please fill in your name and email.", variant: "destructive" });
      return;
    }
    setStep(2);
  };
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !requirement) return;

    if (!storyContent.trim() && !storyCategory.trim()) {
        toast({ title: "Empty Submission", description: "Please provide either the story content or a category.", variant: "destructive" });
        return;
    }

    setIsLoading(true);
    
    try {
        const batch = writeBatch(db);

        // 1. Create a new conversation
        const conversationRef = doc(collection(db, 'conversations'));

        const userDocSnap = await getDoc(doc(db, 'users', user.uid));
        const writerProfile = userDocSnap.exists() ? userDocSnap.data() as { name: string; username: string; avatar: string; } : {
            name: user.displayName || 'Unknown Writer',
            username: user.email?.split('@')[0] || 'writer',
            avatar: user.photoURL || '',
        };

        const conversationData = {
            participants: [user.uid, requirement.producerId],
            participantDetails: {
                [user.uid]: {
                    name: writerProfile.name,
                    username: writerProfile.username,
                    avatar: writerProfile.avatar,
                },
                [requirement.producerId]: requirement.producerDetails,
            },
            timestamp: serverTimestamp(),
            lastMessage: `Story Submission: ${requirement.title}`,
            unreadCounts: {
                [user.uid]: 0,
                [requirement.producerId]: 1,
            }
        };
        batch.set(conversationRef, conversationData);

        // 2. Create the first message with the story details
        const messageRef = doc(collection(conversationRef, 'messages'));
        const messageText = `
**New Story Submission for "${requirement.title}"**

**Writer:** ${writerDetails.name} (${writerDetails.email})
**Location:** ${writerDetails.place}

---
**Story Category:** ${storyCategory}

**Previous Works:** 
${previousWorks || 'N/A'}

---
**Story Content:**
${storyContent}

_This message was generated automatically from a story submission._
        `.trim();

        batch.set(messageRef, {
            text: messageText,
            senderId: user.uid,
            timestamp: serverTimestamp(),
        });

        await batch.commit();

        toast({
            title: "Success!",
            description: `Your story has been sent to ${requirement.postedBy}.`,
        });
        router.push('/messages');

    } catch (error) {
        console.error("Error submitting story: ", error);
        toast({ title: "Submission Failed", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  if (!requirement) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p>Requirement not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <div className="container mx-auto p-4 md:p-8">
        <Button variant="ghost" onClick={() => (step === 1 ? router.back() : setStep(1))} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        {step === 1 ? (
          <WriterDetailsForm onNext={handleNextStep} details={writerDetails} setDetails={setWriterDetails} />
        ) : (
          <StoryEditorForm 
            requirement={requirement} 
            onSubmit={handleSubmit} 
            isLoading={isLoading}
            storyContent={storyContent}
            setStoryContent={setStoryContent}
            storyCategory={storyCategory}
            setStoryCategory={setStoryCategory}
            previousWorks={previousWorks}
            setPreviousWorks={setPreviousWorks}
          />
        )}
      </div>
    </div>
  );
}

function WriterDetailsForm({ onNext, details, setDetails }: { onNext: () => void; details: any; setDetails: (d: any) => void; }) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setDetails({ ...details, [e.target.id]: e.target.value });
  };
    
  return (
    <div className="max-w-2xl mx-auto">
       <Card>
        <CardHeader>
            <CardTitle>Writer&apos;s Details</CardTitle>
            <CardDescription>Before you submit, please provide your contact information. This will be sent to the producer along with your story.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Your full name" value={details.name} onChange={handleChange} required />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="place">Place</Label>
                    <Input id="place" placeholder="City, Country" value={details.place} onChange={handleChange} required />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label htmlFor="email">Email ID</Label>
                    <Input id="email" type="email" placeholder="your.email@example.com" value={details.email} onChange={handleChange} required />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone No.</Label>
                    <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" value={details.phone} onChange={handleChange} required />
                </div>
            </div>
        </CardContent>
        <CardFooter>
            <Button onClick={onNext} className="ml-auto">Continue to Editor</Button>
        </CardFooter>
       </Card>
    </div>
  )
}

type StoryEditorFormProps = {
  // @ts-ignore
  requirement: { id: string; title: string; postedBy: string; details: string; category: string };
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  storyContent: string;
  setStoryContent: (s: string) => void;
  storyCategory: string;
  setStoryCategory: (s: string) => void;
  previousWorks: string;
  setPreviousWorks: (s: string) => void;
};

function StoryEditorForm({ requirement, onSubmit, isLoading, storyContent, setStoryContent, storyCategory, setStoryCategory, previousWorks, setPreviousWorks }: StoryEditorFormProps) {
    return (
        <form onSubmit={onSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 space-y-6">
                   <Card className="sticky top-24">
                     <CardHeader>
                       <CardTitle>{requirement.title}</CardTitle>
                       <CardDescription>by {requirement.postedBy}</CardDescription>
                     </CardHeader>
                     <CardContent className="text-sm space-y-4">
                        <p className="text-muted-foreground">{requirement.details}</p>
                        <div>
                          <Label className="text-xs font-bold uppercase text-muted-foreground">Category</Label>
                          <p>{requirement.category}</p>
                        </div>
                     </CardContent>
                   </Card>
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Story</CardTitle>
                            <CardDescription>You can write your story here or attach a file below.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-background rounded-md border border-input">
                                <div className="p-2 border-b border-input flex items-center gap-1">
                                     <Button type="button" variant="ghost" size="icon" className="h-8 w-8"><Bold className="h-4 w-4"/></Button>
                                     <Button type="button" variant="ghost" size="icon" className="h-8 w-8"><Italic className="h-4 w-4"/></Button>
                                     <Button type="button" variant="ghost" size="icon" className="h-8 w-8"><Underline className="h-4 w-4"/></Button>
                                     <Separator orientation="vertical" className="h-6 mx-1" />
                                     <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setStoryContent('')}><Trash2 className="h-4 w-4"/></Button>
                                </div>
                                <Textarea 
                                    placeholder="Once upon a time..." 
                                    className="min-h-[400px] border-0 focus-visible:ring-0 ring-offset-0 p-4 text-base"
                                    value={storyContent}
                                    onChange={(e) => setStoryContent(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Supporting Information</CardTitle>
                            <CardDescription>Provide additional context for your submission.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <div className="space-y-1.5">
                               <Label htmlFor="category">Category of Story</Label>
                               <Input id="category" placeholder="e.g., Sci-Fi, Romance, Thriller" value={storyCategory} onChange={(e) => setStoryCategory(e.target.value)} required disabled={isLoading} />
                           </div>
                           <div className="space-y-1.5">
                                <Label htmlFor="previous-works">Previous Works, Awards, or Prizes</Label>
                                <Textarea id="previous-works" placeholder="List any relevant experience or achievements." value={previousWorks} onChange={(e) => setPreviousWorks(e.target.value)} disabled={isLoading} />
                           </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="story-file">Attach Story File</Label>
                                <div className="flex items-center justify-center w-full">
                                    <Label htmlFor="story-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-lg cursor-pointer bg-card hover:bg-accent">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                            <p className="text-xs text-muted-foreground">Accepts all file types</p>
                                        </div>
                                        <Input id="story-file" type="file" className="hidden" disabled={isLoading} />
                                    </Label>
                                </div> 
                           </div>
                        </CardContent>
                    </Card>
                    <div className="flex justify-end">
                       <Button type="submit" size="lg" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit to {requirement.postedBy}
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
}
