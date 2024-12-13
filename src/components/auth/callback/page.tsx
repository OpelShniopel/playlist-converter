"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SpotifyCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function handleCallback() {
      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const storedState = sessionStorage.getItem("spotify_auth_state");
      const error = searchParams.get("error");

      if (error) {
        console.error("Spotify auth error:", error);
        router.push("/?error=spotify_auth_failed");
        return;
      }

      if (!code || !state || state !== storedState) {
        console.error("Invalid state or missing code");
        router.push("/?error=invalid_state");
        return;
      }

      try {
        // Exchange code for tokens through our API
        const response = await fetch("/api/auth/spotify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          throw new Error("Failed to exchange code for tokens");
        }

        // Clean up state
        sessionStorage.removeItem("spotify_auth_state");

        // Redirect to home page
        router.push("/");
      } catch (error) {
        console.error("Error in Spotify callback:", error);
        router.push("/?error=token_exchange_failed");
      }
    }

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Completing Spotify authentication...</p>
      </div>
    </div>
  );
}
