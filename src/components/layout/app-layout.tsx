
'use client';

import { useAuth } from '@/hooks/use-auth';
import { redirect } from 'next/navigation';
import { SidebarProvider, Sidebar } from '@/components/ui/sidebar';
import { MainSidebar } from './main-sidebar';
import { Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export function AppLayout({
  children,
  rightSidebar,
}: {
  children: React.ReactNode;
  rightSidebar?: React.ReactNode | null;
}) {
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    redirect('/login');
    return null;
  }
  
  return (
    <SidebarProvider>
        <div className="relative flex w-full max-w-[1500px] mx-auto">
            <Sidebar collapsible="none">
                <div className="sticky top-0 h-screen overflow-y-auto no-scrollbar pt-4">
                    <MainSidebar />
                </div>
            </Sidebar>
            <main className="relative z-20 flex-1">
                {children}
            </main>
            {rightSidebar && !isMobile && (
                <aside className="relative z-10 w-[380px] hidden lg:block px-6">
                    <div className="sticky top-0 h-screen overflow-y-auto pt-4 no-scrollbar">
                        {rightSidebar}
                    </div>
                </aside>
            )}
        </div>
    </SidebarProvider>
  );
}
