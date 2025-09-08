'use client';

import { AppLayout } from "@/components/layout/app-layout";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Film, Heart, MessageCircle, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";
import type { Notification as NotificationType } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const NotificationIcon = ({ type }: { type: string }) => {
  const iconClasses = "h-5 w-5 text-white";
  switch (type) {
    case "like":
      return <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-1 border-2 border-background"><Heart className={iconClasses} /></div>;
    case "comment":
      return <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 border-2 border-background"><MessageCircle className={iconClasses} /></div>;
    case "follow":
      return <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1 border-2 border-background"><UserPlus className={iconClasses} /></div>;
    case "mention":
        return <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-background"><Film className={iconClasses} /></div>;
    default:
      return null;
  }
};

function NotificationSkeleton() {
  return (
    <li className="p-4 flex items-start gap-4">
      <div className="relative">
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    </li>
  );
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchNotifications() {
      try {
        const notificationsCollection = collection(db, "notifications");
        const q = query(notificationsCollection, where("userId", "==", user.uid), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        const notificationsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NotificationType));
        setNotifications(notificationsData);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchNotifications();
  }, [user]);

  return (
    <AppLayout rightSidebar={<RightSidebar />}>
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 p-4 backdrop-blur-md">
        <h1 className="text-xl font-bold">Notifications</h1>
      </div>
      {loading ? (
        <ul className="divide-y divide-border">
          {Array.from({ length: 4 }).map((_, i) => <NotificationSkeleton key={i} />)}
        </ul>
      ) : notifications.length > 0 ? (
        <ul className="divide-y divide-border">
            {notifications.map((notification) => (
                <li key={notification.id} className="p-4 flex items-start gap-4 hover:bg-accent transition-colors">
                    <div className="relative">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={notification.user.avatarUrl} />
                            <AvatarFallback>{notification.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <NotificationIcon type={notification.type} />
                    </div>
                    <div className="flex-1">
                        <p>
                            <span className="font-semibold">{notification.user.name}</span>
                            <span className="text-muted-foreground"> {notification.content}</span>
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.timestamp ? formatDistanceToNow(notification.timestamp.toDate()) + ' ago' : 'just now'}
                        </p>
                    </div>
                </li>
            ))}
        </ul>
      ) : (
        <div className="text-center p-8 text-muted-foreground">
          You have no new notifications.
        </div>
      )}
    </AppLayout>
  );
}
