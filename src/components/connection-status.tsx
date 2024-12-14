"use client";

import { useAuth } from "@/context/auth-context";
import { getSpotifyAuthUrl } from "@/services/spotify";

export function ConnectionStatus() {
  const { user, signInWithGoogle } = useAuth();

  const handleSpotifyConnect = () => {
    window.location.href = getSpotifyAuthUrl();
  };

  const handleGoogleConnect = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Failed to connect Google:", error);
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h2 className="text-lg font-semibold mb-4">Connected Services</h2>

      <div className="space-y-4">
        {/* YouTube Section */}
        <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white">
                <path d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.254,4,12,4,12,4S5.746,4,4.186,4.418 c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.746,2,12,2,12s0,4.254,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768 C5.746,20,12,20,12,20s6.254,0,7.814-0.418c0.861-0.23,1.538-0.908,1.768-1.768C22,16.254,22,12,22,12S22,7.746,21.582,6.186z M10,15.464V8.536L16,12L10,15.464z" />
              </svg>
            </div>
            <div>
              <p className="font-medium">YouTube</p>
              <p className="text-sm text-muted-foreground">
                Video streaming service
              </p>
            </div>
          </div>
          {user?.connectedServices?.youtube ? (
            <div className="flex items-center space-x-2 text-green-500">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Connected</span>
            </div>
          ) : (
            <button
              onClick={handleGoogleConnect}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-opacity-90 transition-colors"
            >
              Connect
            </button>
          )}
        </div>

        {/* Spotify Section */}
        <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#1DB954] rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.371-.721.49-1.101.24-3.021-1.85-6.82-2.27-11.3-1.24-.418.101-.842-.179-.94-.601-.101-.418.179-.842.601-.94 4.901-1.12 9.121-.63 12.5 1.44.369.241.49.721.24 1.101zm1.47-3.27c-.301.458-.921.6-1.379.3-3.459-2.13-8.731-2.74-12.821-1.5-.491.12-1.001-.21-1.12-.71-.121-.491.21-1.001.71-1.12 4.671-1.42 10.471-.721 14.461 1.71.449.301.6.919.29 1.379zm.129-3.39c-4.149-2.461-11.021-2.689-14.97-1.489-.629.18-1.291-.18-1.471-.811-.18-.629.18-1.291.811-1.471 4.561-1.38 12.13-1.11 16.891 1.71.57.341.761 1.082.42 1.651-.34.568-1.081.758-1.65.419z" />
              </svg>
            </div>
            <div>
              <p className="font-medium">Spotify</p>
              <p className="text-sm text-muted-foreground">
                Music streaming service
              </p>
            </div>
          </div>
          {user?.connectedServices?.spotify ? (
            <div className="flex items-center space-x-2 text-green-500">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Connected</span>
            </div>
          ) : (
            <button
              onClick={handleSpotifyConnect}
              className="px-4 py-2 bg-[#1DB954] text-white rounded-md hover:bg-opacity-90 transition-colors"
            >
              Connect
            </button>
          )}
        </div>
      </div>

      {(!user?.connectedServices?.spotify ||
        !user?.connectedServices?.youtube) && (
        <p className="mt-4 text-sm text-muted-foreground">
          Connect both services to start converting your playlists.
        </p>
      )}
    </div>
  );
}
