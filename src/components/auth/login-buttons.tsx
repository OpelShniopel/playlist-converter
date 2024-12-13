"use client";

import { useAuth } from "@/context/auth-context";
import { getSpotifyAuthUrl } from "@/services/spotify-auth";

export function LoginButtons() {
  const { signInWithGoogle } = useAuth();

  const handleSpotifyLogin = () => {
    window.location.href = getSpotifyAuthUrl();
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => signInWithGoogle()}
        className="w-full flex items-center justify-center gap-2 bg-white text-gray-800 border border-gray-300 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <span>Continue with Google</span>
      </button>

      <button
        onClick={handleSpotifyLogin}
        className="w-full flex items-center justify-center gap-2 bg-[#1DB954] text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors"
      >
        <span>Continue with Spotify</span>
      </button>
    </div>
  );
}
