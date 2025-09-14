

import type { User } from 'firebase/auth';
import type { Timestamp } from 'firebase/firestore';

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  toast: (options: {
    title?: React.ReactNode;
    description?: React.ReactNode;
    variant?: 'default' | 'destructive';
  }) => void;
  // Guest browsing support
  isGuest?: boolean;
  guestId?: string | null;
  signInAsGuest?: () => void;
  signOut?: () => void;
};

export type Post = {
  id: string;
  author: {
    name: string;
    username: string;
    avatarUrl: string;
    uid: string;
  };
  timestamp: Timestamp;
  content: string;
  imageUrl?: string;
  imageHint?: string;
  videoUrl?: string;
  likes: number;
  comments: number;
  retweets: number;
  media?: { type: 'image' | 'video'; url: string }[];
};

export type Job = {
    id: string;
    title: string;
    company: string;
    location: string;
    type: string;
    description: string;
    postedAt: Timestamp;
};

export type Story = {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: any;
  updatedAt: any;
}

export type Review = {
    id: string;
    movie: {
      title: string;
      posterUrl: string;
      posterHint: string;
    };
    user: {
      name: string;
      avatarUrl: string;
    };
    rating: number;
    review: string;
    reviewCount: number;
};

export type Notification = {
    id: string;
    type: string;
    user: { name: string; avatarUrl: string };
    content: string;
    timestamp: Timestamp;
    userId: string;
};

export type ProductionRequirement = {
    id: string;
    title: string;
    category: string;
    details: string;
    postedBy: string;
    date: string;
};

export type Conversation = {
    id:string;
    participants: string[];
    participantDetails: { [uid: string]: { name: string; avatar: string; username: string; } };
    lastMessage: string;
    timestamp: Timestamp;
    unreadCounts: { [uid: string]: number };
};

export type Message = {
    id: string;
    conversationId: string;
    senderId: string;
    text: string;
    timestamp: Timestamp;
};

export type Movie = {
    id: string;
    title: string;
    posterUrl: string;
    posterHint?: string;
    likes: number;
    genre: string;
}

export type ComingSoonMovie = {
  id: number;
  title: string;
  posterUrl: string;
  releaseDate: string;
  overview: string;
};

export type BookmarkedPost = { 
  id: string; 
  originalPostId: string;
  author: { 
    name: string; 
    username: string; 
    avatarUrl: string; 
  }; 
  content: string; 
  timestamp: string; 
  type: 'post'; 
};
