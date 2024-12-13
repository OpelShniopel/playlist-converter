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
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Playlist Converter
        </h1>
        <p className="text-xl text-center mb-8">
          Convert your playlists between Spotify, YouTube, and SoundCloud
        </p>

        {!user && (
          <div className="max-w-md mx-auto">
            <LoginButtons />
          </div>
        )}
      </main>
    </div>
  );
}
