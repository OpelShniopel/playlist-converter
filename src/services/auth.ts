import {
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { doc, setDoc, getDoc } from "firebase/firestore";

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("https://www.googleapis.com/auth/youtube");

export async function signInWithGoogle(): Promise<UserCredential> {
  try {
    const result = await signInWithPopup(auth, googleProvider);

    // Create/update user document in Firestore
    const userDoc = doc(db, "users", result.user.uid);
    const userSnapshot = await getDoc(userDoc);

    if (!userSnapshot.exists()) {
      await setDoc(userDoc, {
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        createdAt: new Date().toISOString(),
        platforms: ["google"],
      });
    }

    return result;
  } catch (error) {
    console.error("Auth error:", error);
    throw error;
  }
}
