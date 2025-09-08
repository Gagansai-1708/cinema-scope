
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Image as ImageIcon, BarChart2, Smile, Film, Loader2 } from 'lucide-react';
import type { Post } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';

type CommentDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  post: Post;
  onCommentSuccess?: () => void;
};

const emojis = ['😀', '😂', '😍', '🤔', '😢', '🔥', '👍', '👎', '❤️', '🚀', '🎉', '💯'];

export function CommentDialog({ isOpen, setIsOpen, post, onCommentSuccess }: CommentDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const handlePostComment = async () => {
    if (!content.trim() || !user) {
      return;
    }
    setIsPosting(true);
    try {
      const postRef = doc(db, 'posts', post.id); 
      
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      const username = userDocSnap.exists() ? userDocSnap.data().username : user.email?.split('@')[0];

      // Add comment to subcollection
      await addDoc(collection(postRef, 'comments'), {
        content,
        timestamp: serverTimestamp(),
        author: {
          uid: user.uid,
          name: user.displayName || 'Anonymous',
          username: username || 'anonymous',
          avatarUrl: user.photoURL || `https://avatar.vercel.sh/${user.uid}`,
        },
        likes: 0,
      });

      // Increment comment count on the post
      await updateDoc(postRef, {
        comments: increment(1)
      });

      setContent('');
      toast({
        title: 'Reply Sent!',
        description: 'Your comment has been posted.',
      });
      if (onCommentSuccess) {
        onCommentSuccess();
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to post comment. This might be because the post does not exist in the database.',
        variant: 'destructive',
      });
    } finally {
      setIsPosting(false);
    }
  };
  
  const onEmojiClick = (emoji: string) => {
    setContent(content + emoji);
  }

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
           <DialogClose />
        </DialogHeader>
        <div className="flex gap-4 pt-4">
          <div className="flex flex-col items-center">
            <Avatar className="h-10 w-10">
                <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
                <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="w-0.5 grow bg-border my-2" />
             <Avatar className="h-10 w-10">
                <AvatarImage src={user.photoURL ?? undefined} />
                <AvatarFallback>{user.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
            </Avatar>
          </div>
          <div className="w-full">
             <div>
                <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold">{post.author.name}</p>
                    <p className="text-sm text-muted-foreground">@{post.author.username} · {post.timestamp ? formatDistanceToNow(post.timestamp.toDate()) : ''}</p>
                </div>
                <p className="text-muted-foreground mt-1">{post.content}</p>
                <p className="mt-4 text-sm text-muted-foreground">
                    Replying to <span className="text-primary">@{post.author.username}</span>
                </p>
             </div>
            <Textarea
              placeholder="Post your reply"
              className="bg-transparent border-0 focus-visible:ring-0 ring-offset-0 p-0 text-xl placeholder:text-muted-foreground/80 resize-none min-h-[120px] mt-4"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isPosting}
            />
          </div>
        </div>
        <DialogFooter className="flex items-center justify-between w-full">
            <div className="flex gap-1 text-primary -ml-2">
                <Button variant="ghost" size="icon" className="h-9 w-9" disabled={isPosting}><ImageIcon className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon" className="h-9 w-9" disabled={isPosting}><Film className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon" className="h-9 w-9" disabled={isPosting}><BarChart2 className="h-5 w-5" /></Button>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9" disabled={isPosting}><Smile className="h-5 w-5" /></Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2">
                        <div className="grid grid-cols-6 gap-1">
                            {emojis.map(emoji => (
                                <Button key={emoji} variant="ghost" size="icon" className="text-xl" onClick={() => onEmojiClick(emoji)}>
                                    {emoji}
                                </Button>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
            <div className='flex items-center gap-2'>
                <Button onClick={handlePostComment} disabled={isPosting || !content.trim()}>
                    {isPosting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Reply
                </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
