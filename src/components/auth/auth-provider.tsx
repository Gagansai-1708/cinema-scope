"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { AuthContextType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const { toast: toastFn } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Restore guest flag from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('guest');
      setIsGuest(stored === '1');
    }
  }, []);

  // Wrap toast to match AuthContextType
  const toast: AuthContextType['toast'] = ({ title, description, variant }) => {
    toastFn({
      title: title ? title.toString() : undefined,
      description: description ? description.toString() : undefined,
      variant,
    });
  };

  const value: AuthContextType = {
    user,
    loading,
    toast,
    isGuest,
    signInAsGuest: () => {
      setIsGuest(true);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('guest', '1');
      }
      toast({ title: 'Guest mode', description: 'You are browsing as a guest.' });
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
