'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';

import { auth } from '@/lib/firebase/config';

async function checkAuthState(): Promise<void> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('Found authenticated user:', user.uid);
      } else {
        console.log('No authenticated user found');
      }
      unsubscribe();
      resolve();
    });
  });
}

async function exchangeSpotifyCode(code: string, googleUid: string) {
  const response = await fetch('/api/auth/spotify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code, googleUid }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange code for tokens');
  }

  return response.json();
}

function CallbackContent() {
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

      try {
        await checkAuthState();
        setAuthChecked(true);

        const currentUser = auth.currentUser;
        if (!currentUser) {
          sessionStorage.setItem('pending_spotify_code', code);
          router.push('/?error=login_required');
          return;
        }

        const data = await exchangeSpotifyCode(code, currentUser.uid);
        await signInWithCustomToken(auth, data.customToken);

        sessionStorage.removeItem('spotify_auth_state');
        sessionStorage.removeItem('pending_spotify_code');
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
        <p>
          {authChecked
            ? 'Completing Spotify authentication...'
            : 'Checking authentication status...'}
        </p>
      </div>
    </div>
  );
}

export default function SpotifyCallback() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
            <p>Loading...</p>
          </div>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
