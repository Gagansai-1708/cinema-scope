
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import type { ProductionRequirement } from "@/lib/types";
import { Loader2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

type StorySubmissionDialogProps = {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    requirement: ProductionRequirement;
};

export function StorySubmissionDialog({ isOpen, setIsOpen, requirement }: StorySubmissionDialogProps) {
    const router = useRouter();

    const handleRedirect = () => {
        router.push(`/submit/${requirement.id}`);
        setIsOpen(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Begin Your Submission</DialogTitle>
                    <DialogDescription>
                        You are about to submit a story for &ldquo;{requirement.title}&rdquo;. You will be redirected to a dedicated submission page.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button type="button" onClick={handleRedirect}>Continue</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
