'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, User, Film, Star, MessageSquare, Bookmark } from 'lucide-react';

export default function DashboardPage() {
  const { user, isGuest, guestId, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If neither user nor guest, redirect to login
    if (!user && !isGuest) {
      router.push('/login');
    }
  }, [user, isGuest, router]);

  const handleSignOut = () => {
    if (signOut) {
      signOut();
    }
    router.push('/login');
  };

  if (!user && !isGuest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">CinemaScope</h1>
            {isGuest && (
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                Guest: {guestId}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2 text-white">
                <User className="h-5 w-5" />
                <span>{user.displayName || user.email}</span>
              </div>
            )}
            <Button 
              onClick={handleSignOut}
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-2">
            Welcome to CinemaScope
          </h2>
          <p className="text-gray-300 text-lg">
            {isGuest 
              ? `You're browsing as a guest. Explore movies, reviews, and more!`
              : `Welcome back! Discover your next favorite film.`
            }
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-colors cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Film className="h-5 w-5" />
                Movies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Discover and explore movies
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-colors cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Star className="h-5 w-5" />
                Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Read and write movie reviews
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-colors cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Discussions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Join movie discussions
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-colors cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Bookmark className="h-5 w-5" />
                Bookmarks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-300">
                Your saved content
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Guest Notice */}
        {isGuest && (
          <Card className="bg-purple-500/10 backdrop-blur-lg border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-purple-300">Guest Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-purple-200">
                You&apos;re currently browsing as a guest. Some features may be limited. 
                Sign in with Google to access all features and save your preferences.
              </CardDescription>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
