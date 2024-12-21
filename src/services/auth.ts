import {
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import { auth, db } from '@/lib/firebase/config';

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/youtube');
googleProvider.addScope('https://www.googleapis.com/auth/youtube.force-ssl');
googleProvider.addScope('https://www.googleapis.com/auth/youtube.readonly');

export async function signInWithGoogle(): Promise<UserCredential> {
  try {
    const result = await signInWithPopup(auth, googleProvider);

    // Get the Google Access Token
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential) {
      throw new Error('No credentials returned from Google');
    }
    const accessToken = credential.accessToken;

    const userDoc = doc(db, 'users', result.user.uid);
    const userSnapshot = await getDoc(userDoc);
    const existingData = userSnapshot.data() || {};

    // Preserve existing services, especially Spotify connection
    const existingServices = existingData.connectedServices || {};

    console.log('Existing services before Google update:', existingServices);

    const newData = {
      // Preserve ALL existing data
      ...existingData,
      // Update only the necessary fields
      email: result.user.email ?? existingData.email,
      displayName: result.user.displayName ?? existingData.displayName,
      photoURL: result.user.photoURL ?? existingData.photoURL,
      connectedServices: {
        ...existingServices,
        youtube: true,
        // Preserve Spotify if it was true
        spotify: existingServices.spotify || false,
      },
      // Save Google tokens
      googleTokens: {
        accessToken: accessToken,
        scope:
          'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.force-ssl',
        expiresAt: Date.now() + 3600000, // Token expires in 1 hour
      },
      updatedAt: new Date().toISOString(),
    };

    console.log('New data after Google update:', newData);

    // Use merge option to ensure we don't overwrite other fields
    await setDoc(userDoc, newData, { merge: true });

    return result;
  } catch (error) {
    console.error('Auth error:', error);
    throw error;
  }
}
