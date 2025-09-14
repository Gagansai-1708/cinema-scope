
'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { AppLayout } from "@/components/layout/app-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { MoreHorizontal, Paperclip, Search, Send, Smile, Loader2, Mail, BookText, ArrowLeft, Video, Phone } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import type { Conversation as ConversationType, Message as MessageType } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, getDoc, Timestamp } from 'firebase/firestore';


const mockStorySubmissions: ConversationType[] = [
    {
        id: 'mock-story-1',
        participants: ['user-uid', 'producer_universal_uid'],
        participantDetails: {
            'user-uid': { name: 'You', avatar: '', username: 'you' },
            'producer_universal_uid': { name: 'Universal Pictures', username: 'universal', avatar: 'https://pbs.twimg.com/profile_images/1473431189494210561/hQp0S3b5_400x400.jpg' }
        },
        lastMessage: '**New Story Submission for "High-Concept Sci-Fi Thriller"**',
        // @ts-ignore
        timestamp: Timestamp.fromMillis(Date.now() - 86400000 * 2), // 2 days ago
        unreadCounts: { 'user-uid': 0, 'producer_universal_uid': 1 }
    },
    {
        id: 'mock-story-2',
        participants: ['user-uid', 'producer_a24_uid'],
        participantDetails: {
            'user-uid': { name: 'You', avatar: '', username: 'you' },
            'producer_a24_uid': { name: 'A24', username: 'a24', avatar: 'https://pbs.twimg.com/profile_images/1473431189494210561/hQp0S3b5_400x400.jpg' }
        },
        lastMessage: '**New Story Submission for "Quirky Indie Comedy"**',
        // @ts-ignore
        timestamp: Timestamp.fromMillis(Date.now() - 86400000 * 5), // 5 days ago
        unreadCounts: { 'user-uid': 0, 'producer_a24_uid': 1 }
    }
];

const mockStoryMessages: { [key: string]: MessageType[] } = {
    'mock-story-1': [
        {
            id: 'msg-1',
            conversationId: 'mock-story-1',
            senderId: 'user-uid',
            text: `**New Story Submission for "High-Concept Sci-Fi Thriller"**\n\n**Writer:** Alex Writer (alex@example.com)\n**Location:** Los Angeles, CA\n\n---\n**Story Category:** Sci-Fi\n\n**Previous Works:**\nShort film "Echoes" won at LA Film Fest.\n\n---\n**Story Content:**\nIn a future where dreams are recorded, a cynical detective hunts a memory thief, only to discover the stolen dreams hold the key to his own forgotten past. He must navigate a surreal landscape of subconscious minds before his own identity unravels completely.`,
            // @ts-ignore
            timestamp: Timestamp.fromMillis(Date.now() - 86400000 * 2)
        },
        {
            id: 'msg-2',
            conversationId: 'mock-story-1',
            senderId: 'producer_universal_uid',
            text: `Hi Alex, thanks for the submission. The logline is intriguing. We'll review it and get back to you within 2-3 weeks.`,
            // @ts-ignore
            timestamp: Timestamp.fromMillis(Date.now() - 86400000 * 1)
        }
    ],
    'mock-story-2': [
        {
            id: 'msg-3',
            conversationId: 'mock-story-2',
            senderId: 'user-uid',
            text: `**New Story Submission for "Quirky Indie Comedy"**\n\n**Writer:** Sam Script (sam@example.com)\n**Location:** Austin, TX\n\n---\n**Story Category:** Comedy\n\n**Previous Works:**\nN/A\n\n---\n**Story Content:**\nA struggling musician inherits a failing pet psychic business. To save it, she must learn to "communicate" with animals, leading to hilarious and heartwarming consultations with the town's eccentric pet owners.`,
            // @ts-ignore
            timestamp: Timestamp.fromMillis(Date.now() - 86400000 * 5)
        }
    ]
};

const mockDirectConversations: ConversationType[] = [
    {
        id: 'mock-convo-1',
        participants: ['user-uid', 'friend_1_uid'],
        participantDetails: {
            'user-uid': { name: 'You', avatar: '', username: 'you' },
            'friend_1_uid': { name: 'Jane Doe', username: 'janedoe', avatar: 'https://picsum.photos/seed/janedoe/200/200' }
        },
        lastMessage: 'Sounds good! See you then.',
        // @ts-ignore
        timestamp: Timestamp.fromMillis(Date.now() - 86400000 * 1), // 1 day ago
        unreadCounts: { 'user-uid': 2, 'friend_1_uid': 0 }
    },
    {
        id: 'mock-convo-2',
        participants: ['user-uid', 'verified_1_uid'],
        participantDetails: {
            'user-uid': { name: 'You', avatar: '', username: 'you' },
            'verified_1_uid': { name: 'A24', username: 'a24', avatar: 'https://pbs.twimg.com/profile_images/1473431189494210561/hQp0S3b5_400x400.jpg' }
        },
        lastMessage: 'We received your submission and our team will review it shortly.',
        // @ts-ignore
        timestamp: Timestamp.fromMillis(Date.now() - 86400000 * 3), // 3 days ago
        unreadCounts: { 'user-uid': 0, 'verified_1_uid': 0 }
    }
];

const mockDirectMessages: { [key: string]: MessageType[] } = {
    'mock-convo-1': [
        {
            id: 'msg-c1-1',
            conversationId: 'mock-convo-1',
            senderId: 'friend_1_uid',
            text: `Hey! Are we still on for the screening tomorrow night?`,
            // @ts-ignore
            timestamp: Timestamp.fromMillis(Date.now() - 86400000 * 1.1)
        },
        {
            id: 'msg-c1-2',
            conversationId: 'mock-convo-1',
            senderId: 'user-uid',
            text: `Absolutely! I've already got the tickets.`,
            // @ts-ignore
            timestamp: Timestamp.fromMillis(Date.now() - 86400000 * 1.05)
        },
        {
            id: 'msg-c1-3',
            conversationId: 'mock-convo-1',
            senderId: 'friend_1_uid',
            text: `Awesome! I'm bringing popcorn.`,
            // @ts-ignore
            timestamp: Timestamp.fromMillis(Date.now() - 86400000 * 1)
        },
        {
            id: 'msg-c1-4',
            conversationId: 'mock-convo-1',
            senderId: 'friend_1_uid',
            text: `Sounds good! See you then.`,
            // @ts-ignore
            timestamp: Timestamp.fromMillis(Date.now() - 86400000 * 1)
        },
    ],
    'mock-convo-2': [
         {
            id: 'msg-c2-1',
            conversationId: 'mock-convo-2',
            senderId: 'verified_1_uid',
            text: `We received your submission and our team will review it shortly.`,
            // @ts-ignore
            timestamp: Timestamp.fromMillis(Date.now() - 86400000 * 3)
        }
    ]
};


export default function MessagesPage() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<ConversationType[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<ConversationType | null>(null);
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loadingConvos, setLoadingConvos] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const [viewMode, setViewMode] = useState<'messages' | 'stories'>('messages');
    const [storySubmissions, setStorySubmissions] = useState<ConversationType[]>([]);
    const [selectedStory, setSelectedStory] = useState<ConversationType | null>(null);
    const [storyMessages, setStoryMessages] = useState<MessageType[]>([]);
    const [loadingStories, setLoadingStories] = useState(true);
    const [loadingStoryMessages, setLoadingStoryMessages] = useState(false);


    useEffect(() => {
        if (!user) {
            setLoadingConvos(false);
            setLoadingStories(false);
            // Show mock data if not logged in
            setConversations(mockDirectConversations);
            setStorySubmissions(mockStorySubmissions);
            return;
        };

        setLoadingConvos(true);
        const convosQuery = query(
            collection(db, 'conversations'),
            where('participants', 'array-contains', user.uid),
            orderBy('timestamp', 'desc')
        );

        const unsubscribe = onSnapshot(convosQuery, (querySnapshot) => {
            const allConversations = querySnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
            } as ConversationType));
            
            const hasRealConvos = allConversations.length > 0;
            const messageConversations = hasRealConvos 
                ? allConversations.filter(c => !c.lastMessage.startsWith('**New Story Submission'))
                : mockDirectConversations;
            
            const storyConversations = hasRealConvos
                ? allConversations.filter(c => c.lastMessage.startsWith('**New Story Submission'))
                : mockStorySubmissions;

            setConversations(messageConversations);
            setStorySubmissions(storyConversations);

            setLoadingConvos(false);
            setLoadingStories(false);
        }, (error) => {
            console.error("Error fetching conversations:", error);
            setConversations(mockDirectConversations); // Fallback to mock on error
            setStorySubmissions(mockStorySubmissions); // Fallback to mock on error
            setLoadingConvos(false);
            setLoadingStories(false);
        });

        return () => unsubscribe();
    }, [user]);

    useEffect(() => {
        let unsubscribe = () => {};
        if (viewMode === 'messages' && selectedConversation?.id) {
            if (selectedConversation.id.startsWith('mock-convo-')) {
                setMessages(mockDirectMessages[selectedConversation.id] || []);
                return;
            }
            setLoadingMessages(true);
            const messagesQuery = query(
                collection(db, 'conversations', selectedConversation.id, 'messages'),
                orderBy('timestamp', 'asc')
            );
            unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
                const messagesData = querySnapshot.docs.map(doc => ({...doc.data(), id: doc.id} as MessageType));
                setMessages(messagesData);
                setLoadingMessages(false);
            }, (error) => {
                console.error("Error fetching messages:", error);
                setLoadingMessages(false);
            });
        } else if (viewMode === 'stories' && selectedStory?.id) {
            if (selectedStory.id.startsWith('mock-story-')) {
                setStoryMessages(mockStoryMessages[selectedStory.id] || []);
                return;
            }
             setLoadingStoryMessages(true);
             const storyMessagesQuery = query(
                collection(db, 'conversations', selectedStory.id, 'messages'),
                orderBy('timestamp', 'asc')
            );
            unsubscribe = onSnapshot(storyMessagesQuery, (querySnapshot) => {
                const messagesData = querySnapshot.docs.map(doc => ({...doc.data(), id: doc.id} as MessageType));
                setStoryMessages(messagesData);
                setLoadingStoryMessages(false);
            }, (error) => {
                console.error("Error fetching story messages:", error);
                setLoadingStoryMessages(false);
            });
        } else {
            setMessages([]);
            setStoryMessages([]);
        }
        return () => unsubscribe();
        
    }, [selectedConversation, selectedStory, viewMode]);
    
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo(0, scrollAreaRef.current.scrollHeight);
        }
    }, [messages, storyMessages]);


    const handleSelectConversation = async (convo: ConversationType) => {
        setSelectedConversation(convo);
        if (user && !convo.id.startsWith('mock-') && convo.unreadCounts[user.uid] > 0) {
            const convoRef = doc(db, 'conversations', convo.id);
            await updateDoc(convoRef, {
                [`unreadCounts.${user.uid}`]: 0
            });
        }
    };
    
    const handleSelectStory = (story: ConversationType) => {
        setSelectedStory(story);
    }

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation || !user || isSending || selectedConversation.id.startsWith('mock-')) return;

        setIsSending(true);
        const text = newMessage.trim();
        setNewMessage("");

        try {
            const messagesRef = collection(db, 'conversations', selectedConversation.id, 'messages');
            await addDoc(messagesRef, {
                text: text,
                senderId: user.uid,
                timestamp: serverTimestamp(),
            });

            const convoRef = doc(db, 'conversations', selectedConversation.id);
            
            const otherParticipantId = selectedConversation.participants.find(p => p !== user.uid);
            const otherParticipantUnreadCount = selectedConversation.unreadCounts[otherParticipantId!] || 0;

            await updateDoc(convoRef, {
                lastMessage: text,
                timestamp: serverTimestamp(),
                [`unreadCounts.${otherParticipantId}`]: otherParticipantUnreadCount + 1,
            });

        } catch (error) {
            console.error("Error sending message:", error);
            setNewMessage(text);
        } finally {
            setIsSending(false);
        }
    };

    const getOtherParticipant = useCallback((convo: ConversationType) => {
        if (!user && convo.id.startsWith('mock-')) return convo.participantDetails[convo.participants.find(p => p !== 'user-uid')!];
        if (!user) return null;
        const otherId = convo.participants.find(p => p !== user.uid);
        return otherId ? convo.participantDetails[otherId] : null;
    }, [user])
    
    const otherParticipant = useMemo(() => {
        if (!selectedConversation) return null;
        return getOtherParticipant(selectedConversation);
    }, [selectedConversation, getOtherParticipant]);
    
    const storyProducer = useMemo(() => {
        if (!selectedStory) return null;
        return getOtherParticipant(selectedStory);
    }, [selectedStory, getOtherParticipant]);

    
    const ConversationList = ({convos}: {convos: ConversationType[]}) => (
        <ScrollArea className="flex-1">
            {loadingConvos ? Array.from({length: 5}).map((_, i) => (
               <div key={i} className="flex items-start gap-3 p-4 border-b border-border">
                   <Skeleton className="h-10 w-10 rounded-full" />
                   <div className="flex-1 space-y-2">
                       <div className="flex justify-between"><Skeleton className="h-4 w-1/2" /> <Skeleton className="h-3 w-10" /></div>
                       <div className="flex justify-between"><Skeleton className="h-4 w-3/4" /> <Skeleton className="h-5 w-5 rounded-full" /></div>
                   </div>
               </div>
            )) : convos.map(convo => {
                const participant = getOtherParticipant(convo);
                if (!participant) return null;
                const unreadCount = (user ? convo.unreadCounts[user.uid] : 0) || (convo.id.startsWith('mock-') ? convo.unreadCounts['user-uid'] : 0);
                return (
                    <div key={convo.id} onClick={() => handleSelectConversation(convo)} className={cn("flex items-start gap-3 p-4 border-b border-border cursor-pointer hover:bg-accent", selectedConversation?.id === convo.id && 'bg-accent')}>
                        <Avatar>
                            <AvatarImage src={participant?.avatar} />
                            <AvatarFallback>{participant?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                            <div className="flex justify-between items-center">
                                <p className="font-semibold truncate pr-2">{participant?.name}</p>
                                <p className="text-xs text-muted-foreground shrink-0">{convo.timestamp ? formatDistanceToNow(convo.timestamp.toDate(), { addSuffix: false }) : ''}</p>
                            </div>
                            <div className="flex justify-between items-start">
                              <p className={cn("text-sm text-muted-foreground truncate", unreadCount > 0 && 'text-foreground font-semibold')}>{convo.lastMessage}</p>
                              {unreadCount > 0 && <span className="ml-2 shrink-0 text-xs bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center">{unreadCount}</span>}
                            </div>
                        </div>
                    </div>
                );
            })}
        </ScrollArea>
    );

    const StoryList = ({ stories }: { stories: ConversationType[] }) => (
         <ScrollArea className="flex-1">
            {loadingStories ? Array.from({length: 5}).map((_, i) => (
               <div key={i} className="flex items-start gap-3 p-4 border-b border-border">
                   <Skeleton className="h-10 w-10 rounded-full" />
                   <div className="flex-1 space-y-2">
                       <div className="flex justify-between"><Skeleton className="h-4 w-1/2" /> <Skeleton className="h-3 w-10" /></div>
                       <Skeleton className="h-4 w-3/4" />
                   </div>
               </div>
            )) : stories.map(story => {
                const producer = getOtherParticipant(story);
                if (!producer) return null;
                const titleMatch = story.lastMessage.match(/\*\*(?:New Story Submission for ")(.*?)(?:"\*\*)/);
                const title = titleMatch ? titleMatch[1] : 'Untitled Story';
                return (
                    <div key={story.id} onClick={() => handleSelectStory(story)} className={cn("flex items-start gap-3 p-4 border-b border-border cursor-pointer hover:bg-accent", selectedStory?.id === story.id && 'bg-accent')}>
                        <Avatar>
                            <AvatarImage src={producer?.avatar} />
                            <AvatarFallback>{producer?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                             <div className="flex justify-between items-center">
                                <p className="font-semibold truncate pr-2">{title}</p>
                                <p className="text-xs text-muted-foreground shrink-0">{story.timestamp ? formatDistanceToNow(story.timestamp.toDate(), { addSuffix: false }) : ''}</p>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">To: {producer?.name}</p>
                        </div>
                    </div>
                );
            })}
        </ScrollArea>
    )

    // TODO: Implement filtering for verified accounts and friends
    const verifiedConversations = conversations; 
    const friendsConversations = conversations;

    return (
        <AppLayout>
            <div className="grid grid-cols-1 md:grid-cols-[380px_1fr] h-screen">
                {viewMode === 'messages' ? (
                <div className="col-span-1 border-r border-border flex flex-col">
                    <div className="p-4 border-b border-border flex justify-between items-center">
                        <h1 className="text-xl font-bold">Messages</h1>
                        <Button variant="ghost" size="icon" onClick={() => setViewMode('stories')}>
                           <BookText className="h-5 w-5" />
                        </Button>
                    </div>
                    <div className="p-4 border-b border-border">
                        <div className="relative">
                           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                           <Input placeholder="Search messages" className="pl-9 bg-secondary border-secondary focus:bg-background focus:border-primary" />
                        </div>
                    </div>
                     <Tabs defaultValue="friends" className="w-full flex flex-col flex-1">
                        <TabsList className="grid w-full grid-cols-2 bg-transparent px-4 border-b border-border">
                            <TabsTrigger value="friends" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none">Friends</TabsTrigger>
                            <TabsTrigger value="verified" className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none">Verified Accounts</TabsTrigger>
                        </TabsList>
                        <TabsContent value="friends" className="flex-1 flex flex-col">
                            <ConversationList convos={friendsConversations} />
                        </TabsContent>
                        <TabsContent value="verified" className="flex-1 flex flex-col">
                            <ConversationList convos={verifiedConversations} />
                        </TabsContent>
                    </Tabs>
                </div>
                ) : (
                 <div className="col-span-1 border-r border-border flex flex-col">
                    <div className="p-4 border-b border-border flex justify-between items-center">
                        <div className='flex items-center gap-2'>
                           <Button variant="ghost" size="icon" className="-ml-2" onClick={() => setViewMode('messages')}>
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                           <h1 className="text-xl font-bold">My Stories</h1>
                        </div>
                    </div>
                    <div className="p-4 border-b border-border">
                        <div className="relative">
                           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                           <Input placeholder="Search stories" className="pl-9 bg-secondary border-secondary focus:bg-background focus:border-primary" />
                        </div>
                    </div>
                    <StoryList stories={storySubmissions} />
                 </div>
                )}
                
                <div className="col-span-1 hidden md:flex flex-col h-screen">
                    {viewMode === 'messages' && selectedConversation && otherParticipant ? (
                        <>
                            <div className="flex items-center justify-between p-4 border-b border-border">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={otherParticipant.avatar} />
                                        <AvatarFallback>{otherParticipant.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{otherParticipant.name}</p>
                                        <p className="text-xs text-muted-foreground">@{otherParticipant.username}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                            </div>
                             <ScrollArea className="flex-1 p-4 bg-secondary/20" viewportRef={scrollAreaRef}>
                                {loadingMessages ? <div className="flex justify-center items-center h-full"><Loader2 className="h-6 w-6 animate-spin"/></div> : (
                                <div className="space-y-6">
                                    {messages.map((msg) => (
                                        <div key={msg.id} className={cn("flex items-end gap-2", msg.senderId === user?.uid || (user === null && msg.senderId === 'user-uid') ? 'justify-end' : 'justify-start')}>
                                            {(msg.senderId !== user?.uid && !(user === null && msg.senderId === 'user-uid')) && <Avatar className="h-8 w-8"><AvatarImage src={otherParticipant.avatar} /></Avatar>}
                                            <div className={cn("rounded-lg p-3 max-w-xs lg:max-w-md shadow whitespace-pre-wrap", msg.senderId === user?.uid || (user === null && msg.senderId === 'user-uid') ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-secondary rounded-bl-none')}>
                                                <p>{msg.text}</p>
                                                <p className="text-xs text-right mt-1 opacity-70">{msg.timestamp ? formatDistanceToNow(msg.timestamp.toDate(), { addSuffix: true }) : 'sending...'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                )}
                            </ScrollArea>
                            <div className="p-4 border-t border-border bg-background">
                                <div className="relative">
                                    <Textarea
                                        placeholder="Type a message..."
                                        className="pr-28 bg-secondary border-secondary focus:bg-background focus:border-primary resize-none"
                                        rows={1}
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                        disabled={isSending}
                                    />
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                                       <Button variant="ghost" size="icon" disabled={isSending}><Smile /></Button>
                                       <Button variant="ghost" size="icon" disabled={isSending}><Paperclip /></Button>
                                       <Button size="icon" className="h-8 w-8" onClick={handleSendMessage} disabled={isSending || !newMessage.trim()}>
                                          {isSending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4" />}
                                       </Button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : viewMode === 'stories' && selectedStory && storyProducer ? (
                         <>
                            <div className="flex items-center justify-between p-4 border-b border-border">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={storyProducer.avatar} />
                                        <AvatarFallback>{storyProducer.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">Submission to: {storyProducer.name}</p>
                                        <p className="text-xs text-muted-foreground">@{storyProducer.username}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon"><Video /></Button>
                                    <Button variant="ghost" size="icon"><Phone /></Button>
                                    <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                                </div>
                            </div>
                             <ScrollArea className="flex-1 p-4 bg-secondary/20" viewportRef={scrollAreaRef}>
                                {loadingStoryMessages ? <div className="flex justify-center items-center h-full"><Loader2 className="h-6 w-6 animate-spin"/></div> : (
                                <div className="space-y-6">
                                    {storyMessages.map((msg) => (
                                        <div key={msg.id} className="rounded-lg p-4 bg-background border border-border shadow whitespace-pre-wrap">
                                            <p>{msg.text}</p>
                                            <p className="text-xs text-right mt-2 text-muted-foreground">{msg.timestamp ? formatDistanceToNow(msg.timestamp.toDate(), { addSuffix: true }) : 'sending...'}</p>
                                        </div>
                                    ))}
                                </div>
                                )}
                            </ScrollArea>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                            <Mail className="h-16 w-16 mb-4" />
                            <h2 className="text-xl font-semibold text-foreground">Select a conversation</h2>
                            <p>Choose from your existing conversations to start chatting.</p>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    )
}
