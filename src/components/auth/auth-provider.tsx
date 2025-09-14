"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { AuthContextType } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [guestId, setGuestId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      
      // If user is authenticated, clear guest status
      if (user) {
        setIsGuest(false);
        setGuestId(null);
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('userType', 'google');
          window.localStorage.setItem('loginStatus', 'google');
          window.localStorage.removeItem('guest');
          window.localStorage.removeItem('guestId');
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Remove automatic guest sign-in - users must explicitly choose guest mode

  // Restore guest status and guest ID from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userType = window.localStorage.getItem('userType');
      const storedGuestId = window.localStorage.getItem('guestId');
      const loginStatus = window.localStorage.getItem('loginStatus');
      
      if (userType === 'guest' && storedGuestId && loginStatus === 'guest') {
        setIsGuest(true);
        setGuestId(storedGuestId);
      }
    }
  }, []);

  // Simple toast function that doesn't use hooks
  const toastFunction: AuthContextType['toast'] = ({ title, description, variant }) => {
    toast({
      title: title ? title.toString() : undefined,
      description: description ? description.toString() : undefined,
      variant,
    });
  };

  const signInAsGuest = () => {
    // Generate a simple guest ID like guest_12345
    const randomNumber = Math.floor(Math.random() * 90000) + 10000; // 5-digit number
    const newGuestId = `guest_${randomNumber}`;
    
    setIsGuest(true);
    setGuestId(newGuestId);
    
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('userType', 'guest');
      window.localStorage.setItem('guestId', newGuestId);
      window.localStorage.setItem('loginStatus', 'guest');
      window.localStorage.setItem('guest', '1');
    }
    
    toastFunction({ title: 'Guest mode', description: `You are browsing as a guest (${newGuestId}).` });
  };

  const signOut = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('userType');
      window.localStorage.removeItem('guest');
      window.localStorage.removeItem('guestId');
      window.localStorage.removeItem('loginStatus');
    }
    setIsGuest(false);
    setGuestId(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    toast: toastFunction,
    isGuest,
    guestId,
    signInAsGuest,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
