"use client";

import { useAuth } from "@/context/auth-context";
import { LoginButtons } from "@/components/auth/login-buttons";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6 text-foreground">
            Playlist Converter
          </h1>
          <p className="text-xl mb-12 text-muted-foreground">
            Convert your playlists between Spotify and YouTube.
          </p>

          {!user && (
            <div className="bg-card border border-border rounded-lg p-8">
              <LoginButtons />
            </div>
          )}
        </div>

        <footer className="fixed bottom-0 left-0 right-0 p-4 backdrop-blur-sm bg-background/80">
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <span>Created by</span>
            <span className="font-semibold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent animate-pulse">
              Dovydas
            </span>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
