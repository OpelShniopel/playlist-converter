import { NextResponse } from "next/server";
import axios from "axios";
import { db } from "@/lib/firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { adminAuth } from "@/lib/firebase/admin";

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_URL = "https://api.spotify.com/v1";
const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`;

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    // Exchange code for tokens
    const tokenResponse = await axios.post(
      SPOTIFY_TOKEN_URL,
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${CLIENT_ID}:${CLIENT_SECRET}`,
          ).toString("base64")}`,
        },
      },
    );

    const tokens = tokenResponse.data;

    // Fetch user profile
    const userResponse = await axios.get(`${SPOTIFY_API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const spotifyUser = userResponse.data;

    // Store in Firestore
    const userDoc = doc(db, "users", spotifyUser.id);
    await setDoc(
      userDoc,
      {
        email: spotifyUser.email,
        displayName: spotifyUser.display_name,
        photoURL: spotifyUser.images?.[0]?.url,
        spotifyId: spotifyUser.id,
        spotifyTokens: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: Date.now() + tokens.expires_in * 1000,
          scope: tokens.scope,
        },
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    const customToken = await adminAuth.createCustomToken(spotifyUser.id, {
      provider: "spotify",
      spotify: {
        id: spotifyUser.id,
        email: spotifyUser.email,
      },
    });

    return NextResponse.json({
      tokens,
      user: spotifyUser,
      firebaseToken: customToken, // Add this
    });
  } catch (error) {
    console.error("Error in Spotify auth:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 },
    );
  }
}
