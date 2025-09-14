"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

export function GuestButton() {
  const { signInAsGuest } = useAuth();
  const router = useRouter();

  const handleGuestSignIn = () => {
    if (signInAsGuest) {
      signInAsGuest();
      router.replace('/');
    }
  };

  return (
    <Button
      variant="secondary"
      className="ml-auto"
      onClick={handleGuestSignIn}
    >
      Continue as Guest
    </Button>
  );
}



