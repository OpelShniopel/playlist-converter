'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { signInWithGoogle } from '@/services/auth';
import { User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

import type { User } from '@/types';
import { auth, db } from '@/lib/firebase/config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(
      async (firebaseUser: FirebaseUser | null) => {
        if (!firebaseUser) {
          setUser(null);
          setLoading(false);
          return;
        }

        // Subscribe to Firestore user document
        const userDoc = doc(db, 'users', firebaseUser.uid);
        const unsubscribeFirestore = onSnapshot(userDoc, (snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.data();

            setUser({
              id: firebaseUser.uid,
              email: userData.email || firebaseUser.email || '',
              displayName:
                userData.displayName || firebaseUser.displayName || '',
              photoURL: userData.photoURL || firebaseUser.photoURL || undefined,
              connectedServices: userData.connectedServices || {
                spotify: false,
                youtube: false,
              },
            });
          }
          setLoading(false);
        });

        return () => {
          unsubscribeFirestore();
        };
      }
    );

    return () => {
      unsubscribeAuth();
    };
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    await auth.signOut();
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      signInWithGoogle: handleGoogleSignIn,
      signOut,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
