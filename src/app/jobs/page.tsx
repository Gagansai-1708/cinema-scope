
'use client';

import { AppLayout } from "@/components/layout/app-layout";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Job as JobType } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

function JobSkeleton() {
  return (
    <Card className="flex flex-col border-border">
      <CardHeader>
        <div className="flex justify-between items-start">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-20" />
        </div>
        <CardDescription className="pt-2 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}


export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const jobsCollection = collection(db, "jobs");
        const q = query(jobsCollection, orderBy("postedAt", "desc"));
        const querySnapshot = await getDocs(q);
        const jobsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobType));
        setJobs(jobsData);
      } catch (error) {
        console.error("Error fetching jobs: ", error);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  return (
    <AppLayout rightSidebar={<RightSidebar />}>
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 p-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Job Board</h1>
          <Button onClick={() => router.push('/post-opportunity')}>Post a Job</Button>
        </div>
      </div>
      <div className="p-4">
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <JobSkeleton key={i} />)
          ) : jobs.length > 0 ? (
            jobs.map((job) => (
              <Card key={job.id} className="flex flex-col border-border hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{job.title}</CardTitle>
                    <Badge variant={job.type === 'Full-time' ? 'default' : 'secondary'}>{job.type}</Badge>
                  </div>
                  <CardDescription className="pt-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building className="h-4 w-4" />
                      <span>{job.company}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground line-clamp-3">{job.description}</p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Apply Now</Button>
                </CardFooter>
              </Card>
            ))
          ) : (
             <p className="text-muted-foreground col-span-full text-center py-16">No jobs posted at the moment.</p>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
