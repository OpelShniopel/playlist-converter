"use client";

import { useAuth } from "@/context/auth-context";
import { LoginButtons } from "@/components/auth/login-buttons";

export default function Home() {
  const { user, loading, signOut } = useAuth();

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

        {user ? (
          <div className="text-center">
            <p className="mb-4">Welcome, {user.displayName || user.email}</p>
            <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-auto max-w-lg mx-auto border border-gray-700 mb-4">
              {JSON.stringify(user, null, 2)}
            </pre>
            <button
              onClick={() => signOut()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <LoginButtons />
          </div>
        )}
      </main>
    </div>
  );
}
