
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  User,
  Shield,
  Eye,
  Bell,
  Palette,
  LifeBuoy,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/settings/account', label: 'Your account', icon: User },
  { href: '/settings/security', label: 'Security', icon: Shield },
  { href: '/settings/privacy', label: 'Privacy and safety', icon: Eye },
  { href: '/settings/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings/display', label: 'Display & Languages', icon: Palette, },
  { href: '/settings/help', label: 'Help Center', icon: LifeBuoy },
];

export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:block border-r border-border">
      <div className="p-4">
        <h1 className="text-xl font-bold">Settings</h1>
      </div>
      <nav className="flex flex-col">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}>
                <Button
                    variant="ghost"
                    className={cn(
                        "w-full justify-start items-center p-6 text-base",
                        isActive && "bg-accent text-accent-foreground font-semibold"
                    )}
                >
                    <item.icon className="h-5 w-5 mr-4" />
                    <span className='flex-1 text-left'>{item.label}</span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Button>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
