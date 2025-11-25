'use client';

import { useMemo } from 'react';
import { Models } from 'appwrite';
import { useAccount } from '../provider';

// Convert Appwrite User to a simpler format
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  role?: string;
}

function convertAppwriteUser(appwriteUser: Models.User<Models.Preferences> | null): User | null {
  if (!appwriteUser) return null;
  
  return {
    uid: appwriteUser.$id,
    email: appwriteUser.email || null,
    displayName: appwriteUser.name || null,
    photoURL: null,
    emailVerified: appwriteUser.emailVerification || false,
  };
}

export function useUser() {
  const { user: appwriteUser, isUserLoading } = useAccount();
  const user = useMemo(() => convertAppwriteUser(appwriteUser), [appwriteUser]);
  
  return {
    user,
    isUserLoading,
  };
}

