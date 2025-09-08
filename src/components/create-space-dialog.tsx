
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Radio } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type CreateSpaceDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

export function CreateSpaceDialog({ isOpen, setIsOpen }: CreateSpaceDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [spaceName, setSpaceName] = useState('');
  const [topic, setTopic] = useState('Cinema');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSpace = async () => {
    if (!spaceName.trim()) {
      toast({
        title: 'Space name is required',
        variant: 'destructive',
      });
      return;
    }
    
    setIsCreating(true);

    // Mock creation logic
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsCreating(false);
    setIsOpen(false);

    // In a real app, you would get a real ID from the backend
    const newSpaceId = 'space-newly-created';
    router.push(`/spaces/${newSpaceId}`);
  };


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create your Space</DialogTitle>
          <DialogDescription>
            Start a live audio room where you can talk with others.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-1.5">
            <Label htmlFor="space-name">Name your Space</Label>
            <Input 
                id="space-name" 
                placeholder="e.g., The Future of Indie Film" 
                value={spaceName}
                onChange={(e) => setSpaceName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
             <Label>Add a topic (up to 3)</Label>
              <RadioGroup defaultValue={topic} onValueChange={setTopic}>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Cinema" id="r-cinema" />
                    <Label htmlFor="r-cinema">Cinema</Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Filmmaking" id="r-filmmaking" />
                    <Label htmlFor="r-filmmaking">Filmmaking</Label>
                </div>
                 <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Writing" id="r-writing" />
                    <Label htmlFor="r-writing">Writing</Label>
                </div>
              </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleCreateSpace} disabled={isCreating}>
            {isCreating ? (
                <>
                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                 Starting...
                </>
            ) : (
                <>
                <Radio className="mr-2 h-4 w-4" />
                Start your Space
                </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
