'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

import { LoginButtons } from '@/components/auth/login-buttons';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="mb-6 text-4xl font-bold text-foreground">
            Playlist Converter
          </h1>
          <p className="mb-12 text-xl text-muted-foreground">
            Convert your playlists between Spotify and YouTube.
          </p>

          {!user && (
            <div className="rounded-lg border border-border bg-card p-8">
              <LoginButtons />
            </div>
          )}
        </div>

        <footer className="bg-background/80 fixed bottom-0 left-0 right-0 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <span>Created by</span>
            <span className="animate-pulse bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text font-semibold text-transparent">
              Jessica ;)
            </span>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
