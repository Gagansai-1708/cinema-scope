
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';


export default function PostOpportunityPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title || !company || !location || !type || !description) {
        toast({
            title: "Missing Fields",
            description: "Please fill out all the required fields.",
            variant: "destructive",
        });
        return;
    }
    
    if (!user) {
        toast({ title: "Not Authenticated", description: "You must be logged in to post an opportunity.", variant: "destructive" });
        return;
    }

    setIsLoading(true);
    
    try {
        await addDoc(collection(db, 'jobs'), {
            title,
            company,
            location,
            type,
            description,
            postedBy: user.uid,
            postedAt: serverTimestamp()
        });

        toast({
            title: "Success!",
            description: "Your opportunity has been posted successfully.",
        });
        router.push('/jobs');
    } catch(error) {
        console.error("Error posting job:", error);
        toast({ title: "Error", description: "Could not post the job opportunity. Please try again.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-4 md:p-8 max-w-4xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Discover
        </Button>
        <Card>
            <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle>Post a New Opportunity</CardTitle>
                    <CardDescription>
                        Share your job opening with thousands of talented professionals. Fill in the details below.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Job Title</Label>
                            <Input 
                                id="title" 
                                placeholder="e.g., Senior Screenwriter, Production Assistant" 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required 
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="company">Company</Label>
                            <Input 
                                id="company" 
                                placeholder="e.g., Pixar Animation Studios" 
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                required 
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input 
                                id="location" 
                                placeholder="e.g., Los Angeles, CA or Remote" 
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                required 
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type">Job Type</Label>
                            <Select onValueChange={setType} value={type} required disabled={isLoading}>
                                <SelectTrigger id="type">
                                    <SelectValue placeholder="Select a job type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Full-time">Full-time</SelectItem>
                                    <SelectItem value="Part-time">Part-time</SelectItem>
                                    <SelectItem value="Contract">Contract</SelectItem>
                                    <SelectItem value="Internship">Internship</SelectItem>
                                    <SelectItem value="Freelance">Freelance</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Job Description</Label>
                        <Textarea 
                            id="description" 
                            placeholder="Describe the role, responsibilities, qualifications, and any other relevant details." 
                            className="min-h-[200px]"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" size="lg" className="ml-auto" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Post Opportunity
                    </Button>
                </CardFooter>
            </form>
        </Card>
      </div>
    </AppLayout>
  );
}
