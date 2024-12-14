"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

export function LoginButtons() {
  const { signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (error) {
      console.error("Google login error:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <p className="text-muted-foreground">
          Sign in with YouTube to get started. You will be able to connect your
          Spotify account after logging in.
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.254,4,12,4,12,4S5.746,4,4.186,4.418c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.746,2,12,2,12s0,4.254,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768C5.746,20,12,20,12,20s6.254,0,7.814-0.418c0.861-0.23,1.538-0.908,1.768-1.768C22,16.254,22,12,22,12S22,7.746,21.582,6.186z M10,15.464V8.536L16,12L10,15.464z" />
          </svg>
          <span>Continue with YouTube</span>
        </button>
      </div>
    </div>
  );
}
