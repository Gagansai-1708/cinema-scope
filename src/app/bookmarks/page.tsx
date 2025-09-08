
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/app-layout';
import { RightSidebar } from '@/components/layout/right-sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bookmark, Film, Newspaper, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

// Define types for bookmarked items
type BookmarkedMovie = { id: string; movieId: string; title: string; posterUrl: string; releaseYear: string; type: 'movie'; };
type BookmarkedPost = { id: string; author: { name: string; username: string; avatarUrl: string; }; content: string; timestamp: string; type: 'post'; };
type BookmarkedArticle = { id: string; title: string; source: string; snippet: string; type: 'article'; };

type BookmarkItem = BookmarkedMovie | BookmarkedPost | BookmarkedArticle;


export default function BookmarksPage() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookmarks() {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const bookmarksRef = collection(db, 'users', user.uid, 'bookmarks');
        const q = query(bookmarksRef, orderBy('bookmarkedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedBookmarks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BookmarkItem));
        setBookmarks(fetchedBookmarks);
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBookmarks();
  }, [user]);

  const bookmarkedMovies = bookmarks.filter(b => b.type === 'movie') as BookmarkedMovie[];
  const bookmarkedPosts = bookmarks.filter(b => b.type === 'post') as BookmarkedPost[];
  const bookmarkedArticles = bookmarks.filter(b => b.type === 'article') as BookmarkedArticle[];

  return (
    <AppLayout rightSidebar={<RightSidebar />}>
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 p-4 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Bookmark className="h-6 w-6" />
          <h1 className="text-xl font-bold">My Bookmarks</h1>
        </div>
      </div>
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
        <Tabs defaultValue="movies" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="movies"><Film className="mr-2 h-4 w-4" /> Movies</TabsTrigger>
            <TabsTrigger value="posts"><MessageSquare className="mr-2 h-4 w-4" /> Posts</TabsTrigger>
            <TabsTrigger value="articles"><Newspaper className="mr-2 h-4 w-4" /> Articles</TabsTrigger>
          </TabsList>
          
          <TabsContent value="movies" className="mt-6">
            {bookmarkedMovies.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {bookmarkedMovies.map(movie => (
                  <Link key={movie.id} href={`/search/${encodeURIComponent(movie.title)}`} passHref>
                    <Card className="overflow-hidden border-border hover:border-primary/50 transition-colors group">
                      <div className="relative aspect-[2/3] w-full">
                        <Image src={movie.posterUrl} alt={movie.title} fill className="object-cover group-hover:scale-105 transition-transform" data-ai-hint={`${movie.title} movie poster`} />
                      </div>
                      <CardHeader className="p-3">
                        <CardTitle className="text-base truncate group-hover:text-primary">{movie.title}</CardTitle>
                        <CardDescription>{movie.releaseYear}</CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <Film className="mx-auto h-12 w-12 mb-4" />
                <h3 className="text-lg font-semibold">No Bookmarked Movies</h3>
                <p>Movies you add to your watchlist will appear here.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="posts" className="mt-6">
            {bookmarkedPosts.length > 0 ? (
              <div className="space-y-4">
                {bookmarkedPosts.map(post => (
                  <Card key={post.id} className="border-border hover:bg-accent/50 transition-colors">
                    <CardContent className="p-4 flex gap-4">
                       <Avatar>
                         <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
                         <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                       </Avatar>
                       <div className='flex-1'>
                         <div className="flex items-center gap-2">
                           <p className="font-semibold">{post.author.name}</p>
                           <p className="text-sm text-muted-foreground">@{post.author.username} · {post.timestamp}</p>
                         </div>
                         <p className="mt-1">{post.content}</p>
                       </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
               <div className="text-center py-16 text-muted-foreground">
                <MessageSquare className="mx-auto h-12 w-12 mb-4" />
                <h3 className="text-lg font-semibold">No Bookmarked Posts</h3>
                <p>Posts you bookmark will appear here.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="articles" className="mt-6">
             {bookmarkedArticles.length > 0 ? (
              <div className="space-y-4">
                {bookmarkedArticles.map(article => (
                  <Card key={article.id} className="border-border hover:bg-accent/50 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-lg">{article.title}</CardTitle>
                      <CardDescription>{article.source}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{article.snippet}</p>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" asChild>
                            <Link href="#">Read More</Link>
                        </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <Newspaper className="mx-auto h-12 w-12 mb-4" />
                <h3 className="text-lg font-semibold">No Bookmarked Articles</h3>
                <p>Articles you bookmark will appear here.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        )}
      </div>
    </AppLayout>
  );
}

    
