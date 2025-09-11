
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Home,
  Star,
  Bell,
  LogOut,
  Settings,
  MoreHorizontal,
  Mail,
  Search,
  Clapperboard,
  User,
  Ticket,
  Clock,
  MoreVertical,
  Feather,
  HelpCircle,
  Bookmark,
  BookText,
  Users,
} from 'lucide-react';
import { Logo } from '../logo';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useState } from 'react';
import { PostComposerDialog } from '../post-composer-dialog';

const menuItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/messages', label: 'Messages', icon: Mail },
  { href: '/jobs', label: 'Jobs', icon: Clapperboard },
  { href: '/reviews', label: 'Reviews', icon: Star },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/my-stories', label: 'My Stories', icon: BookText },
  { href: '/coming-soon', label: 'Coming Soon', icon: Clock },
  { href: '/profile', label: 'Profile', icon: User },
];

export function MainSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, toast } = useAuth();
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      toast({
        title: 'Error signing out',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <PostComposerDialog isOpen={isPostDialogOpen} setIsOpen={setIsPostDialogOpen} />
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent className="flex-grow p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                onClick={() => router.push(item.href)}
                isActive={pathname === item.href}
                tooltip={item.label}
                className="text-lg"
              >
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
           <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  className="text-lg w-full"
                  tooltip="More"
                >
                  <MoreVertical />
                  <span>More</span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 mb-2">
                <DropdownMenuItem onClick={() => router.push('/bookmarks')}>
                  <Bookmark className="mr-2 h-4 w-4" />
                  <span>Bookmarks</span>
                </DropdownMenuItem>
                 <DropdownMenuItem onClick={() => router.push('/spaces')}>
                  <Users className="mr-2 h-4 w-4" />
                  <span>Create your space</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings and privacy</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
        <Button 
          className="mt-4 w-full rounded-full text-lg h-12 group-data-[collapsible=icon]:h-12 group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:p-0"
          onClick={() => setIsPostDialogOpen(true)}
        >
          <Feather className="group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6"/>
          <span className="group-data-[collapsible=icon]:hidden">Post</span>
        </Button>
      </SidebarContent>
      <SidebarFooter className="p-2">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-auto w-full justify-start p-2 text-left">
                <div className="flex items-center gap-3 w-full">
                  <Avatar>
                    <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? 'User'} />
                    <AvatarFallback>{user.displayName?.charAt(0) ?? user.email?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden text-left group-data-[collapsible=icon]:hidden">
                    <p className="truncate font-semibold text-sm">{user.displayName ?? 'Cinephile'}</p>
                    <p className="truncate text-xs text-muted-foreground">@{user.email?.split('@')[0] ?? 'cinephile'}</p>
                  </div>
                  <MoreHorizontal className="h-4 w-4 ml-auto group-data-[collapsible=icon]:hidden" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 mb-2">
               <DropdownMenuItem className="focus:bg-transparent cursor-default">
                  <div className="flex flex-col gap-2 w-full">
                      <div className="flex items-center gap-3">
                          <Avatar>
                              <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? 'User'} />
                              <AvatarFallback>{user.displayName?.charAt(0) ?? user.email?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 overflow-hidden">
                              <p className="truncate font-semibold text-sm">{user.displayName ?? 'Cinephile'}</p>
                              <p className="truncate text-xs text-muted-foreground">@{user.email?.split('@')[0] ?? 'cinephile'}</p>
                          </div>
                      </div>
                      <div className="flex gap-4 text-sm mt-1">
                          <div>
                              <span className="font-bold">1.2k</span> <span className="text-muted-foreground">Following</span>
                          </div>
                          <div>
                              <span className="font-bold">5.8k</span> <span className="text-muted-foreground">Followers</span>
                          </div>
                      </div>
                  </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarFooter>
    </>
  );
}
