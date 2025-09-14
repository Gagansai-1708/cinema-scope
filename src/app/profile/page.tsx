
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { AppLayout } from '@/components/layout/app-layout';
import { RightSidebar } from '@/components/layout/right-sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, Timestamp, doc, updateDoc, increment, addDoc, deleteDoc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { Post as PostType } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { MoreHorizontal, Mail, Calendar, Loader2, Heart, MessageCircle, Repeat, Bookmark, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CommentDialog } from '@/components/comment-dialog';
import { EditProfileDialog } from '@/components/edit-profile-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

function ProfileSkeleton() {
  return (
    <div>
      <div className="h-48 bg-muted" />
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="-mt-16 sm:-mt-24 sm:flex sm:items-end sm:space-x-5">
          <div className="flex">
            <Skeleton className="h-32 w-32 rounded-full ring-4 ring-background" />
          </div>
          <div className="mt-6 sm:flex-1 sm:min-w-0 sm:flex sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
            <div className="mt-6 min-w-0 flex-1 sm:hidden md:block">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="mt-2 h-4 w-32" />
            </div>
          </div>
        </div>
        <div className="mt-6 hidden min-w-0 flex-1 sm:block md:hidden">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="mt-2 h-4 w-32" />
        </div>
        <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="mt-4 flex space-x-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}

function PostSkeleton() {
  return (
    <div className="flex gap-4 p-4 border-t border-border">
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


export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  const [commentingPost, setCommentingPost] = useState<PostType | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [retweetedPosts, setRetweetedPosts] = useState<Set<string>>(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState<{[key: string]: string}>({});
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const createDefaultProfile = useCallback(() => {
    if (!user) return null;
    return {
        uid: user.uid,
        name: user.displayName || 'Cinephile',
        username: user.email?.split('@')[0] || `user_${user.uid.substring(0,5)}`,
        email: user.email,
        bio: 'Movie enthusiast. Critic in the making. Follow me for hot takes on the latest flicks.',
        profilePicture: user.photoURL || `https://picsum.photos/seed/${user.uid}/400/400`,
        followers: [],
        following: [],
        createdAt: {
            toDate: () => new Date(),
        },
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const fetchUserProfile = async () => {
        setLoading(true);
        try {
            const userDocRef = doc(db, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
              setProfile({ ...userDocSnap.data(), id: userDocSnap.id });
            } else {
              const defaultProfile = createDefaultProfile();
              if (defaultProfile) {
                  await setDoc(userDocRef, { ...defaultProfile, createdAt: serverTimestamp() });
                  setProfile(defaultProfile);
              }
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            toast({ title: "Offline Mode", description: "Could not load full profile. Displaying local data.", variant: "default" });
            if (!profile) {
                setProfile(createDefaultProfile());
            }
        } finally {
            setLoading(false);
        }
    };
    
    fetchUserProfile();

    // Set up listeners for posts and interactions
    const postsQuery = query(collection(db, 'posts'), where('author.uid', '==', user.uid), orderBy('timestamp', 'desc'));
    const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
        const userPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PostType));
        setPosts(userPosts);
    }, (error) => {
        console.error("Error fetching posts:", error);
        toast({ title: "Error", description: "Could not fetch your posts.", variant: "destructive" });
    });

    const bookmarksRef = collection(db, 'users', user.uid, 'bookmarks');
    const qBookmarks = query(bookmarksRef, where('type', '==', 'post'));
    const unsubscribeBookmarks = onSnapshot(qBookmarks, (snapshot) => {
        const bookmarks: {[key: string]: string} = {};
        snapshot.forEach(doc => {
            bookmarks[doc.data().originalPostId] = doc.id;
        });
        setBookmarkedPosts(bookmarks);
    }, () => {
        console.warn("Could not fetch bookmarks, you may be offline.");
    });

    return () => {
        unsubscribePosts();
        unsubscribeBookmarks();
    };

  }, [user, toast, createDefaultProfile, profile]);
  
  const handleActionClick = (
    post: PostType,
    action: 'like' | 'retweet' | 'comment',
    stateSet?: Set<string>,
    stateSetter?: React.Dispatch<React.SetStateAction<Set<string>>>
  ) => {
    if (action === 'comment') {
        setCommentingPost(post);
        return;
    }
    
    if (stateSet && stateSetter) {
        const newSet = new Set(stateSet);
        const isUndoing = newSet.has(post.id);

        if (isUndoing) {
            newSet.delete(post.id);
        } else {
            newSet.add(post.id);
        }
        stateSetter(newSet);
        
        // Update the post's count locally for immediate feedback
        setPosts(prevPosts =>
            prevPosts.map(p => {
                if (p.id === post.id) {
                    const countField = action === 'like' ? 'likes' : 'retweets';
                    const incrementBy = isUndoing ? -1 : 1;
                    return { ...p, [countField]: p[countField] + incrementBy };
                }
                return p;
            })
        );
    }
  };


  const handleBookmarkPost = async (post: PostType) => {
    if (!user) {
      toast({ title: 'Not logged in', description: 'You need to be logged in to bookmark posts.', variant: 'destructive'});
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
  
  const handleProfileUpdate = (updatedProfile: any) => {
    setProfile(updatedProfile);
  };


  return (
    <AppLayout rightSidebar={<RightSidebar />}>
        {commentingPost && (
          <CommentDialog
            isOpen={!!commentingPost}
            setIsOpen={(isOpen) => !isOpen && setCommentingPost(null)}
            post={commentingPost}
            onCommentSuccess={() => {
                 setPosts(prevPosts => prevPosts.map(p => {
                    if (p.id === commentingPost.id) {
                        return { ...p, comments: p.comments + 1 };
                    }
                    return p;
                }));
            }}
          />
        )}
        {profile && <EditProfileDialog isOpen={isEditProfileOpen} setIsOpen={setIsEditProfileOpen} profile={profile} onProfileUpdate={handleProfileUpdate} />}
        {loading ? (
            <ProfileSkeleton />
        ) : profile ? (
            <div>
            {/* Header and Profile Info */}
            <div className="pb-4">
                <div className="h-48 bg-muted relative">
                    <Image src="https://picsum.photos/1500/500" alt="Profile banner" fill className="object-cover" data-ai-hint="header background" />
                </div>
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-end -mt-16 sm:-mt-20">
                        <Avatar className="h-32 w-32 rounded-full ring-4 ring-background shrink-0 border-2 border-background">
                            <AvatarImage src={profile.profilePicture} alt={profile.name} />
                            <AvatarFallback>{profile.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex items-center space-x-2 pb-2">
                           <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="outline" size="icon"><Mail className="h-4 w-4" /></Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Message</p></TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <Button onClick={() => setIsEditProfileOpen(true)}>Edit Profile</Button>
                        </div>
                    </div>

                    <div className='mt-4'>
                        <h1 className="truncate text-2xl font-bold text-foreground">{profile.name}</h1>
                        <p className="text-sm text-muted-foreground">@{profile.username}</p>
                    </div>
                
                    <div className="mt-4">
                        <p className="text-muted-foreground">{profile.bio}</p>
                    </div>
                    <div className="mt-4 flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Joined {profile.createdAt ? new Date(profile.createdAt.toDate()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="font-bold text-foreground">1.2k</span> Following
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="font-bold text-foreground">5.8k</span> Followers
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Posts Feed */}
            <div className="border-t border-border">
                {posts.length > 0 ? (
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
                            {post.imageUrl && (
                            <CardContent className="p-0 pt-3">
                                <div className="relative aspect-[16/9] rounded-lg overflow-hidden border border-border">
                                <Image src={post.imageUrl} alt="Post image" fill className="object-cover" data-ai-hint={post.imageHint} />
                                </div>
                            </CardContent>
                            )}
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
                        <h3 className="text-lg font-semibold text-foreground">You haven&apos;t posted anything yet</h3>
                        <p>When you post, it&apos;ll show up here.</p>
                    </div>
                )}
            </div>
            </div>
        ) : (
            <div className="flex justify-center items-center h-full">
                <p>Could not load profile.</p>
            </div>
        )}
    </AppLayout>
  );
}
