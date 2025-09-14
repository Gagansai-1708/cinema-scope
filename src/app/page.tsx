
'use client';

import Image from "next/image";
import { AppLayout } from "@/components/layout/app-layout";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, MoreHorizontal, Repeat, Bookmark } from "lucide-react";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, increment, addDoc, deleteDoc, Timestamp, where } from 'firebase/firestore';
import type { Post as PostType } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CommentDialog } from "@/components/comment-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function PostSkeleton() {
  return (
    <div className="flex gap-4 p-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="relative aspect-[16/9] rounded-lg overflow-hidden border border-border">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="flex justify-around pt-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}

const mockPosts: PostType[] = [
    {
        id: 'mock-1',
        author: {
            name: 'CinemaScope Staff',
            username: 'cinemascope',
            avatarUrl: 'https://picsum.photos/seed/cinemascope/200/200',
            uid: 'cinemascope_staff_uid'
        },
        timestamp: Timestamp.fromMillis(Date.now() - 3600000 * 2), // 2 hours ago
        content: `Welcome to CinemaScope! This is a sample post to show you how things look. You can share your thoughts on movies, post reviews, or discuss the latest industry news.`,
        imageUrl: 'https://picsum.photos/seed/welcome/1200/675',
        imageHint: 'cinema seats',
        likes: 15,
        comments: 2,
        retweets: 1,
    },
    {
        id: 'mock-2',
        author: {
            name: 'Jane Doe',
            username: 'janedoe',
            avatarUrl: 'https://picsum.photos/seed/janedoe/200/200',
            uid: 'jane_doe_uid'
        },
        timestamp: Timestamp.fromMillis(Date.now() - 86400000), // 1 day ago
        content: `Just watched the new "Dune: Part Two" trailer. The scale is absolutely epic! Denis Villeneuve is a master of visual storytelling. What does everyone else think? #Dune #SciFi`,
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        likes: 256,
        comments: 42,
        retweets: 58,
    },
    {
        id: 'mock-3',
        author: {
            name: 'A24',
            username: 'A24',
            avatarUrl: 'https://pbs.twimg.com/profile_images/1473431189494210561/hQp0S3b5_400x400.jpg',
            uid: 'a24_uid'
        },
        timestamp: Timestamp.fromMillis(Date.now() - 86400000 * 3), // 3 days ago
        content: `From the mind of Ari Aster. BEAU IS AFRAID starring Joaquin Phoenix is now playing everywhere.`,
        imageUrl: 'https://picsum.photos/seed/beau/1200/675',
        imageHint: 'movie still',
        likes: 1200,
        comments: 150,
        retweets: 300,
    }
];


export default function Home() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);

  const [commentingPost, setCommentingPost] = useState<PostType | null>(null);

  // States to track user interactions
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [retweetedPosts, setRetweetedPosts] = useState<Set<string>>(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const postsQuery = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    
    const unsubscribe = onSnapshot(postsQuery, (querySnapshot) => {
        if (querySnapshot.empty) {
            setPosts(mockPosts);
        } else {
            const postsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PostType));
            setPosts(postsData);
        }
        setLoading(false);
    }, (error) => {
        console.error("Error fetching posts: ", error);
        // Show sample data when Firestore is unavailable
        console.log("Using sample data due to Firestore connection issue");
        setPosts(mockPosts);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  useEffect(() => {
    if (!user) return;
    
    const bookmarksRef = collection(db, 'users', user.uid, 'bookmarks');
    const q = query(bookmarksRef, where('type', '==', 'post'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const bookmarks: {[key: string]: string} = {};
        snapshot.forEach(doc => {
            bookmarks[doc.data().originalPostId] = doc.id;
        });
        setBookmarkedPosts(bookmarks);
    }, (error) => {
        console.error("Error fetching bookmarks:", error);
    });
    
    return () => unsubscribe();
  }, [user]);

  const handleActionClick = async (
    post: PostType,
    action: 'like' | 'retweet' | 'comment',
    stateSet?: Set<string>,
    stateSetter?: React.Dispatch<React.SetStateAction<Set<string>>>
  ) => {
    if (post.id.startsWith('mock-')) {
        toast({ title: "Demo Post", description: "Interactions are disabled for sample posts." });
        return;
    }
      
    if (action === 'comment') {
        setCommentingPost(post);
        return;
    }

    // Allow interactions for both authenticated users and guests
    if (stateSet && stateSetter) {
        const isUndoing = stateSet.has(post.id);
        
        // For guests, just update local state without database changes
        if (!user) {
            const newSet = new Set(stateSet);
            if (isUndoing) {
                newSet.delete(post.id);
            } else {
                newSet.add(post.id);
            }
            stateSetter(newSet);
            return;
        }

        // For authenticated users, update database
        const countField = action === 'like' ? 'likes' : 'retweets';
        const postRef = doc(db, 'posts', post.id);

        try {
            await updateDoc(postRef, {
                [countField]: increment(isUndoing ? -1 : 1)
            });

            const newSet = new Set(stateSet);
            if (isUndoing) {
                newSet.delete(post.id);
            } else {
                newSet.add(post.id);
            }
            stateSetter(newSet);

        } catch (error) {
            console.error(`Error ${isUndoing ? 'un' : ''}${action}ing post:`, error);
            toast({ title: "Error", description: "Could not update post. It might not exist in the database.", variant: "destructive" });
        }
    }
  };


  const handleBookmarkPost = async (post: PostType) => {
    if (post.id.startsWith('mock-')) {
        toast({ title: "Demo Post", description: "Interactions are disabled for sample posts." });
        return;
    }
      
    // For guests, show a message that they need to sign in for bookmarks
    if (!user) {
      toast({ title: 'Sign in to bookmark', description: 'Create an account to save posts to your bookmarks.', variant: 'default'});
      return;
    }

    const isAlreadyBookmarked = bookmarkedPosts[post.id];

    if (isAlreadyBookmarked) {
        try {
            await deleteDoc(doc(db, 'users', user.uid, 'bookmarks', isAlreadyBookmarked));
            toast({ title: 'Post Removed from Bookmarks', description: 'It has been removed from your collection.' });
        } catch(error) {
            console.error('Error removing bookmark:', error);
            toast({ title: 'Error', description: 'Could not remove the post from your bookmarks.', variant: 'destructive'});
        }
    } else {
        try {
          const bookmarksRef = collection(db, 'users', user.uid, 'bookmarks');
          const authorData = {
              name: post.author.name,
              username: post.author.username,
              avatarUrl: post.author.avatarUrl || '',
          };

          await addDoc(bookmarksRef, {
            type: 'post',
            originalPostId: post.id,
            author: authorData,
            content: post.content,
            timestamp: formatDistanceToNow(post.timestamp.toDate()) + ' ago',
            bookmarkedAt: Timestamp.now(),
          });
          toast({ title: 'Post Bookmarked!', description: 'It has been added to your collection.' });
        } catch(error) {
          console.error('Error bookmarking post:', error);
          toast({ title: 'Error', description: 'Could not bookmark the post.', variant: 'destructive'});
        }
    }
  }
  
  const handleSharePost = (postId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
    toast({ title: "Link Copied!", description: "The post link has been copied to your clipboard." });
  }


  return (
    <AppLayout rightSidebar={<RightSidebar />}>
      {commentingPost && (
          <CommentDialog
            isOpen={!!commentingPost}
            setIsOpen={(isOpen) => !isOpen && setCommentingPost(null)}
            post={commentingPost}
          />
      )}
      <div className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="p-4">
            <h1 className="text-xl font-bold">Home</h1>
            {!user && (
              <div className="mt-2 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <p className="text-sm text-purple-300">
                  You're browsing as a guest. <button 
                    onClick={() => window.location.href = '/signup'} 
                    className="underline hover:text-purple-200"
                  >
                    Sign up
                  </button> for full access to bookmark posts and more features.
                </p>
              </div>
            )}
        </div>
      </div>
      <div className="border-t border-border">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)
        ) : posts.length > 0 ? (
          posts.map((post) => {
            const isLiked = likedPosts.has(post.id);
            const isRetweeted = retweetedPosts.has(post.id);
            const isBookmarked = !!bookmarkedPosts[post.id];

            return (
              <Card key={post.id} className="border-x-0 border-b border-t-0 rounded-none hover:bg-accent/50 transition-colors">
                <div className="flex gap-4 p-4">
                  <Avatar>
                    <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
                    <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold hover:underline cursor-pointer">{post.author.name}</p>
                        <p className="text-sm text-muted-foreground">@{post.author.username} · {post.timestamp ? formatDistanceToNow(post.timestamp.toDate()) + ' ago' : 'just now'}</p>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-8 h-8 -mr-2 -mt-2">
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>More</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <p className="whitespace-pre-wrap py-2">{post.content}</p>
                    <CardContent className="p-0 pt-3">
                      {post.imageUrl && (
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-border">
                          <Image src={post.imageUrl} alt="Post image" fill className="object-cover" data-ai-hint={post.imageHint} />
                        </div>
                      )}
                      {post.videoUrl && (
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-border mt-2">
                            <video src={post.videoUrl} controls className="w-full h-full object-contain bg-black" />
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="p-0 pt-3 flex justify-around -ml-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                             <Button variant="ghost" size="sm" className={cn("flex items-center gap-2 text-muted-foreground hover:text-red-500", isLiked && 'text-red-500')} onClick={() => handleActionClick(post, 'like', likedPosts, setLikedPosts)}>
                              <Heart className={cn("h-5 w-5", isLiked && 'fill-current')} />
                              <span className="text-xs">{post.likes}</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Like</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground hover:text-primary" onClick={() => handleActionClick(post, 'comment')}>
                              <MessageCircle className="h-5 w-5" />
                              <span className="text-xs">{post.comments}</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Comment</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className={cn("flex items-center gap-2 text-muted-foreground hover:text-green-500", isRetweeted && 'text-green-500')} onClick={() => handleActionClick(post, 'retweet', retweetedPosts, setRetweetedPosts)}>
                              <Repeat className="h-5 w-5" />
                              <span className="text-xs">{post.retweets}</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Retweet</p></TooltipContent>
                        </Tooltip>
                         <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className={cn("flex items-center gap-2 text-muted-foreground hover:text-primary", isBookmarked && 'text-primary')} onClick={() => handleBookmarkPost(post)}>
                              <Bookmark className={cn("h-5 w-5", isBookmarked && 'fill-current')} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Bookmark</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="flex items-center gap-2 text-muted-foreground hover:text-primary" onClick={() => handleSharePost(post.id)}>
                              <Share2 className="h-5 w-5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p>Share</p></TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardFooter>
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="text-center p-8 text-muted-foreground">
            No posts yet. Be the first to post!
          </div>
        )}
      </div>
    </AppLayout>
  );
}
