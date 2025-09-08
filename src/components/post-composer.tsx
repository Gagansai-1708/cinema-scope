
'use client'
import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Image as ImageIcon, BarChart2, Smile, Film, Loader2, GitCommit, X } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Image from "next/image";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

const emojis = ['😀', '😂', '😍', '🤔', '😢', '🔥', '👍', '👎', '❤️', '🚀', '🎉', '💯'];

export function PostComposer({ onPostSuccess }: { onPostSuccess?: () => void }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [content, setContent] = useState("");
    const [isPosting, setIsPosting] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const [videoPreview, setVideoPreview] = useState<string | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setVideoFile(null);
            setVideoPreview(null);
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleVideoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(null);
            setImagePreview(null);
            setVideoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setVideoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handlePost = async () => {
        if ((!content.trim() && !imageFile && !videoFile) || !user) {
            return;
        }

        setIsPosting(true);
        let imageUrl = '';
        let imageHint = '';
        let videoUrl = '';

        try {
             if (imageFile) {
                const imageRef = ref(storage, `posts/${user.uid}/${Date.now()}_${imageFile.name}`);
                const snapshot = await uploadBytes(imageRef, imageFile);
                imageUrl = await getDownloadURL(snapshot.ref);
                imageHint = 'user uploaded image';
            } else if (videoFile) {
                const videoRef = ref(storage, `posts/${user.uid}/${Date.now()}_${videoFile.name}`);
                const snapshot = await uploadBytes(videoRef, videoFile);
                videoUrl = await getDownloadURL(snapshot.ref);
            }

            await addDoc(collection(db, "posts"), {
                content,
                imageUrl: imageUrl,
                imageHint: imageHint,
                videoUrl: videoUrl,
                timestamp: serverTimestamp(),
                author: {
                    uid: user.uid,
                    name: user.displayName || "Anonymous",
                    username: user.email?.split('@')[0] || "anonymous",
                    avatarUrl: user.photoURL || `https://avatar.vercel.sh/${user.uid}`,
                },
                likes: 0,
                comments: 0,
                retweets: 0,
            });

            setContent("");
            setImageFile(null);
            setImagePreview(null);
            setVideoFile(null);
            setVideoPreview(null);
            if (imageInputRef.current) {
                imageInputRef.current.value = "";
            }
            if (videoInputRef.current) {
                videoInputRef.current.value = "";
            }

            toast({
                title: "Posted!",
                description: "Your post is now live.",
            });
            if (onPostSuccess) {
                onPostSuccess();
            }
        } catch (error) {
            console.error("Error creating post:", error);
            toast({
                title: "Error",
                description: "Failed to create post. Please try again.",
                variant: "destructive",
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
        <div className="p-4 border-b border-border">
            <div className="flex gap-4">
                <Avatar>
                    <AvatarImage src={user.photoURL ?? undefined} />
                    <AvatarFallback>{user.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
                </Avatar>
                <div className="w-full">
                    <Textarea
                        placeholder="What's happening?!"
                        className="bg-transparent border-0 focus-visible:ring-0 ring-offset-0 p-0 text-xl placeholder:text-muted-foreground/80 resize-none"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        disabled={isPosting}
                    />
                    {imagePreview && (
                        <div className="mt-4 relative">
                            <Image src={imagePreview} alt="Image preview" width={500} height={300} className="rounded-lg object-cover w-full max-h-96" />
                            <Button
                                size="icon"
                                variant="destructive"
                                className="absolute top-2 right-2 h-7 w-7"
                                onClick={() => {
                                    setImagePreview(null);
                                    setImageFile(null);
                                    if (imageInputRef.current) {
                                        imageInputRef.current.value = "";
                                    }
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                    {videoPreview && (
                         <div className="mt-4 relative">
                            <video src={videoPreview} controls className="rounded-lg object-cover w-full max-h-96" />
                            <Button
                                size="icon"
                                variant="destructive"
                                className="absolute top-2 right-2 h-7 w-7"
                                onClick={() => {
                                    setVideoPreview(null);
                                    setVideoFile(null);
                                    if (videoInputRef.current) {
                                        videoInputRef.current.value = "";
                                    }
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                    <div className="flex justify-between items-center mt-4">
                        <div className="flex gap-1 text-primary -ml-2">
                             <input
                                type="file"
                                ref={imageInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageSelect}
                                disabled={isPosting}
                            />
                             <input
                                type="file"
                                ref={videoInputRef}
                                className="hidden"
                                accept="video/*"
                                onChange={handleVideoSelect}
                                disabled={isPosting}
                            />
                            <Button variant="ghost" size="icon" className="h-9 w-9" disabled={isPosting} onClick={() => imageInputRef.current?.click()}>
                                <ImageIcon className="h-5 w-5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-9 w-9" disabled={isPosting} onClick={() => videoInputRef.current?.click()}><Film className="h-5 w-5" /></Button>
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
                        <Button className="rounded-full font-bold" onClick={handlePost} disabled={isPosting || (!content.trim() && !imageFile && !videoFile)}>
                            {isPosting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Post
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
