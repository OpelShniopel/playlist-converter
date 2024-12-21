'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';

import { auth } from '@/lib/firebase/config';

export default function SpotifyCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    async function handleCallback() {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const storedState = sessionStorage.getItem('spotify_auth_state');
      const error = searchParams.get('error');

      if (error) {
        console.error('Spotify auth error:', error);
        router.push('/?error=spotify_auth_failed');
        return;
      }

      if (!code || !state || state !== storedState) {
        console.error('Invalid state or missing code');
        router.push('/?error=invalid_state');
        return;
      }

      // Wait for auth state to be determined
      await new Promise<void>((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            console.log('Found authenticated user:', user.uid);
          } else {
            console.log('No authenticated user found');
          }
          unsubscribe();
          setAuthChecked(true);
          resolve();
        });
      });

      try {
        // Get current Firebase user after auth state is checked
        const currentUser = auth.currentUser;

        if (!currentUser) {
          console.error('No authenticated user found after auth check');
          // Store the Spotify auth code temporarily
          sessionStorage.setItem('pending_spotify_code', code);
          // Redirect to log in
          router.push('/?error=login_required');
          return;
        }

        console.log('Proceeding with Spotify auth for user:', currentUser.uid);

        // Exchange code for tokens through our API
        const response = await fetch('/api/auth/spotify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            googleUid: currentUser.uid,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to exchange code for tokens');
        }

        const data = await response.json();

        // Sign in with the custom token
        await signInWithCustomToken(auth, data.customToken);

        // Clean up
        sessionStorage.removeItem('spotify_auth_state');
        sessionStorage.removeItem('pending_spotify_code');

        // Redirect to dashboard
        router.push('/dashboard');
      } catch (error) {
        console.error('Error in Spotify callback:', error);
        router.push('/?error=token_exchange_failed');
      }
    }

    handleCallback();
  }, [router, searchParams]);

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
          <p>Checking authentication status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
        <p>Completing Spotify authentication...</p>
      </div>
    </div>
  );
}
