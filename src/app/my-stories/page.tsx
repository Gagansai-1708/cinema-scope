
'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Loader2, PlusCircle, BookText, Trash2, Save, Search,
  Undo, Redo, Bold, Italic, Underline, Palette, Pilcrow,
  AlignCenter, AlignLeft, AlignRight, AlignJustify
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, addDoc, serverTimestamp, deleteDoc, updateDoc, orderBy } from 'firebase/firestore';
import type { Story as StoryType } from '@/lib/types';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const exampleStories: StoryType[] = [
    {
        id: 'example-story-1',
        title: 'The Last Signal',
        content: `<h3>Logline</h3><p>In a future where humanity lives in underground bunkers, a lone radio operator picks up a mysterious signal from the surface, forcing her to choose between the safety of her home and the dangerous truth above.</p><br/><h3>Characters</h3><ul><li><b>ANYA (20s):</b> A sharp, curious radio operator, born and raised in Bunker 7.</li><li><b>COMMANDER VALERIUS (50s):</b> The rigid, protective leader of the bunker.</li></ul><br/><h3>Scene 1</h3><p><b>INT. RADIO ROOM - NIGHT</b></p><p>Anya sits amidst a sea of humming analog equipment. Static crackles. Suddenly, a faint, rhythmic beep cuts through. Not a distress call. Something else. Something... structured.</p>`,
        authorId: 'system',
        createdAt: new Date(Date.now() - 86400000 * 3), // 3 days ago
        updatedAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
    },
    {
        id: 'example-story-2',
        title: 'Emerald City Blues',
        content: `<h3>Logline</h3><p>A down-on-his-luck private investigator in a rain-soaked, neon-lit Seattle gets more than he bargained for when a simple missing person case unravels a conspiracy involving a tech giant and a mythical artifact.</p><br/><h3>Characters</h3><ul><li><b>JAKE (40s):</b> A cynical but brilliant P.I. with a troubled past.</li><li><b>CHLOE (30s):</b> The enigmatic client who hires him.</li></ul>`,
        authorId: 'system',
        createdAt: new Date(Date.now() - 86400000 * 5), // 5 days ago
        updatedAt: new Date(Date.now() - 86400000 * 1), // 1 day ago
    },
     {
        id: 'example-story-3',
        title: 'Untitled Romantic Comedy',
        content: `<h3>Logline</h3><p>Two rival bookstore owners in a charming small town must join forces to save their businesses from a corporate chain, only to find they might be writing their own love story in the process.</p>`,
        authorId: 'system',
        createdAt: new Date(Date.now() - 86400000 * 10), // 10 days ago
        updatedAt: new Date(Date.now() - 86400000 * 10), // 10 days ago
    }
]

export default function MyStoriesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stories, setStories] = useState<StoryType[]>([]);
  const [filteredStories, setFilteredStories] = useState<StoryType[]>([]);
  const [activeStory, setActiveStory] = useState<StoryType | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loadingStories, setLoadingStories] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      setLoadingStories(false);
      setStories(exampleStories);
      if (exampleStories.length > 0) {
        setActiveStory(exampleStories[0]);
      }
      return;
    };
    
    setLoadingStories(true);
    const storiesQuery = query(
      collection(db, 'stories'),
      where('authorId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(storiesQuery, (snapshot) => {
      const fetchedStories = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as StoryType));
      if (snapshot.empty) {
        setStories(exampleStories);
        if (exampleStories.length > 0) {
            setActiveStory(exampleStories[0]);
        }
      } else {
        setStories(fetchedStories);
        if (!activeStory || !fetchedStories.find(s => s.id === activeStory.id)) {
            setActiveStory(fetchedStories[0] || null);
        }
      }
      setLoadingStories(false);
    }, (error) => {
      console.error("Error fetching stories:", error);
      toast({ title: 'Error', description: 'Could not fetch stories.', variant: 'destructive' });
      setLoadingStories(false);
    });

    return () => unsubscribe();
  }, [user, toast, activeStory]);

  useEffect(() => {
      const results = stories.filter(story =>
          story.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStories(results);
  }, [searchTerm, stories]);


  useEffect(() => {
    if (activeStory) {
      setTitle(activeStory.title);
      const storyContent = activeStory.content || '';
      setContent(storyContent);
      if (editorRef.current) {
        editorRef.current.innerHTML = storyContent;
      }
    } else {
      setTitle('');
      setContent('');
      if (editorRef.current) {
        editorRef.current.innerHTML = '';
      }
    }
  }, [activeStory]);

  const handleNewStory = () => {
    setActiveStory(null);
    setTitle('Untitled Story');
    setContent('');
     if (editorRef.current) {
        editorRef.current.innerHTML = '';
        editorRef.current.focus();
    }
  };

  const handleSelectStory = (story: StoryType) => {
    setActiveStory(story);
  };

  const handleSaveStory = async () => {
    if (!user || (activeStory && activeStory.authorId === 'system')) {
        toast({ title: 'Cannot Save Example', description: 'Please create a new story to save your work.', variant: 'destructive' });
        return;
    };

    if (!title.trim()) {
        toast({ title: 'Error', description: 'Title is required to save a story.', variant: 'destructive' });
        return;
    };
    
    setIsSaving(true);
    const currentContent = editorRef.current?.innerHTML || content;

    try {
      if (activeStory && activeStory.authorId !== 'system') {
        // Update existing story
        const storyRef = doc(db, 'stories', activeStory.id);
        await updateDoc(storyRef, {
          title,
          content: currentContent,
          updatedAt: serverTimestamp(),
        });
        toast({ title: 'Success', description: 'Story updated successfully.' });
      } else {
        // Create new story
        const storiesRef = collection(db, 'stories');
        const now = serverTimestamp();
        const newStoryDoc = await addDoc(storiesRef, {
          title,
          content: currentContent,
          authorId: user.uid,
          createdAt: now,
          updatedAt: now,
        });
        const newStory: StoryType = { 
            id: newStoryDoc.id, 
            title, 
            content: currentContent, 
            authorId: user.uid, 
            // @ts-ignore
            createdAt: { toDate: () => new Date() }, 
            // @ts-ignore
            updatedAt: { toDate: () => new Date() } 
        };
        setActiveStory(newStory);
        toast({ title: 'Success', description: 'Story saved successfully.' });
      }
    } catch (error) {
        console.error("Error saving story:", error);
        toast({ title: 'Error', description: 'Could not save the story.', variant: 'destructive' });
    } finally {
        setIsSaving(false);
    }
  };
  
  const handleDeleteStory = async () => {
    if (!activeStory || !user || activeStory.authorId !== user.uid) {
        toast({ title: 'Error', description: "You can't delete this story.", variant: 'destructive'});
        return;
    }

    if (!window.confirm(`Are you sure you want to delete "${activeStory.title}"?`)) return;

    setIsDeleting(true);
    try {
        await deleteDoc(doc(db, 'stories', activeStory.id));
        toast({ title: 'Success', description: 'Story deleted.' });
        setActiveStory(null);
    } catch (error) {
        console.error("Error deleting story:", error);
        toast({ title: 'Error', description: 'Could not delete the story.', variant: 'destructive' });
    } finally {
        setIsDeleting(false);
    }
  }

  const handleFormat = (command: string, value?: string) => {
    if (editorRef.current) {
        editorRef.current.focus();
        document.execCommand(command, false, value);
        setContent(editorRef.current.innerHTML);
    }
  }

  return (
    <AppLayout>
      <div className="grid grid-cols-1 md:grid-cols-[380px_1fr] h-screen">
        <aside className="col-span-1 border-r border-border flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h1 className="text-xl font-bold flex items-center gap-2"><BookText /> My Stories</h1>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleNewStory}>
                    <PlusCircle className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>New Story</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search stories..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            {loadingStories ? (
              <div className="p-4 space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : filteredStories.length > 0 ? (
                filteredStories.map(story => (
                    <div
                        key={story.id}
                        className={`p-4 border-b border-border cursor-pointer hover:bg-accent ${activeStory?.id === story.id ? 'bg-accent' : ''}`}
                        onClick={() => handleSelectStory(story)}
                    >
                        <h3 className="font-semibold truncate">{story.title}</h3>
                        <p className="text-sm text-muted-foreground truncate" dangerouslySetInnerHTML={{ __html: story.content?.replace(/<[^>]+>/g, '') || 'No content yet...' }} />
                        <p className="text-xs text-muted-foreground mt-1">
                            {story.updatedAt && (story.updatedAt.toDate ? format(story.updatedAt.toDate(), 'PPp') : format(story.updatedAt, 'PPp'))}
                        </p>
                    </div>
                ))
            ) : (
                <div className="text-center text-muted-foreground p-8">
                    <p>{stories.length > 0 ? 'No stories match your search.' : "You haven't written any stories yet."}</p>
                    {stories.length === 0 && <Button variant="link" onClick={handleNewStory}>Create your first story</Button>}
                </div>
            )}
          </ScrollArea>
        </aside>
        <main className="col-span-1 flex flex-col h-screen bg-secondary/20">
           <div className="p-4 border-b border-border bg-background flex items-center justify-between gap-4">
              <Input
                placeholder="Story Title"
                className="text-lg font-semibold border-0 focus-visible:ring-0 ring-offset-0 p-0 h-auto bg-transparent"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <div className="flex items-center gap-2">
                {activeStory && activeStory.authorId === user?.uid && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                         <Button variant="destructive" size="icon" onClick={handleDeleteStory} disabled={isDeleting}>
                            {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 />}
                         </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete Story</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <Button onClick={handleSaveStory} disabled={isSaving || (!!activeStory && activeStory.authorId === 'system')}>
                  {isSaving ? <Loader2 className="mr-2 animate-spin" /> : <Save className="mr-2" />}
                  Save Story
                </Button>
              </div>
           </div>
           <div className="flex-1 flex flex-col">
              <Card className="m-4 flex-1 flex flex-col rounded-md overflow-hidden">
                <TooltipProvider>
                  <div className="p-2 border-b border-border bg-background flex items-center gap-1 flex-wrap">
                      <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleFormat('undo')}><Undo className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent><p>Undo</p></TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleFormat('redo')}><Redo className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent><p>Redo</p></TooltipContent></Tooltip>
                      <Separator orientation="vertical" className="h-6 mx-1" />
                      <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleFormat('bold')}><Bold className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent><p>Bold</p></TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleFormat('italic')}><Italic className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent><p>Italic</p></TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleFormat('underline')}><Underline className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent><p>Underline</p></TooltipContent></Tooltip>
                      <Separator orientation="vertical" className="h-6 mx-1" />
                      <div className="relative h-8 w-8">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8" 
                              onClick={() => {
                                const colorInput = document.getElementById('color-picker-input') as HTMLInputElement;
                                colorInput?.click();
                              }}
                            >
                              <Palette className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                           <TooltipContent><p>Text Color</p></TooltipContent>
                        </Tooltip>
                        <input
                          id="color-picker-input"
                          type="color"
                          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => handleFormat('foreColor', e.target.value)}
                        />
                      </div>
                      <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-8 w-8"><Pilcrow className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent><p>Paragraph</p></TooltipContent></Tooltip>
                      <Separator orientation="vertical" className="h-6 mx-1" />
                      <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleFormat('justifyLeft')}><AlignLeft className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent><p>Align Left</p></TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleFormat('justifyCenter')}><AlignCenter className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent><p>Align Center</p></TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleFormat('justifyRight')}><AlignRight className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent><p>Align Right</p></TooltipContent></Tooltip>
                      <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleFormat('justifyFull')}><AlignJustify className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent><p>Justify</p></TooltipContent></Tooltip>
                  </div>
                </TooltipProvider>
                <div
                  ref={editorRef}
                  contentEditable
                  className="flex-1 w-full h-full resize-none border-0 focus-visible:ring-0 ring-offset-0 p-4 text-base bg-background focus:outline-none overflow-y-auto"
                  onInput={(e) => setContent(e.currentTarget.innerHTML)}
                  suppressContentEditableWarning={true}
                />
              </Card>
           </div>
        </main>
      </div>
    </AppLayout>
  );
}

