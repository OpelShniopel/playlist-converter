"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import { User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { signInWithGoogle } from "@/services/auth";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(
      (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          const user: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email ?? "",
            displayName: firebaseUser.displayName ?? "",
            photoURL: firebaseUser.photoURL ?? undefined,
          };
          setUser(user);
        } else {
          setUser(null);
        }
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Google sign-in error:", error);
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
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
