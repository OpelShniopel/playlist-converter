import { NextResponse } from "next/server";
import axios from "axios";
import { db } from "@/lib/firebase/config";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { adminAuth } from "@/lib/firebase/admin";

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_URL = "https://api.spotify.com/v1";
const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`;

// Helper function to refresh token
async function refreshSpotifyToken(userId: string, refreshToken: string) {
  try {
    const response = await axios.post(
      SPOTIFY_TOKEN_URL,
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
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

    const newTokens = {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token || refreshToken, // Keep an old refresh token if new one isn't provided
      expiresAt: Date.now() + response.data.expires_in * 1000,
      scope: response.data.scope,
    };

    // Update tokens in Firestore
    const userDoc = doc(db, "users", userId);
    await updateDoc(userDoc, {
      spotifyTokens: newTokens,
    });

    return newTokens;
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Handle token refresh request
    if (body.type === "refresh_token") {
      const { userId, refreshToken } = body;
      if (!userId || !refreshToken) {
        return NextResponse.json(
          { error: "Missing required parameters" },
          { status: 400 },
        );
      }
      const newTokens = await refreshSpotifyToken(userId, refreshToken);
      return NextResponse.json(newTokens);
    }

    // Handle initial authentication
    const { code, googleUid } = body;

    if (!googleUid) {
      throw new Error("No Google UID provided");
    }

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

    // Fetch Spotify user profile
    const userResponse = await axios.get(`${SPOTIFY_API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    const spotifyUser = userResponse.data;

    // Always use the Google UID as the document ID
    const userDoc = doc(db, "users", googleUid);
    const userSnapshot = await getDoc(userDoc);
    const existingData = userSnapshot.data() || {};

    console.log("Current user data:", existingData);
    console.log("Current connected services:", existingData.connectedServices);

    const newData = {
      ...existingData,
      email: spotifyUser.email || existingData.email,
      displayName: spotifyUser.display_name || existingData.displayName,
      photoURL: spotifyUser.images?.[0]?.url || existingData.photoURL,
      spotifyId: spotifyUser.id,
      connectedServices: {
        ...existingData.connectedServices,
        spotify: true,
        youtube: true, // Preserve YouTube connection
      },
      spotifyTokens: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: Date.now() + tokens.expires_in * 1000,
        scope: tokens.scope,
      },
      updatedAt: new Date().toISOString(),
    };

    console.log("New data to write:", newData);

    // Use merge: true to preserve existing data
    await setDoc(userDoc, newData, { merge: true });

    // Verify the writing
    const verifySnapshot = await getDoc(userDoc);
    console.log("Verified data after write:", verifySnapshot.data());

    // Create custom token using the Google UID
    const customToken = await adminAuth.createCustomToken(googleUid);

    return NextResponse.json({
      customToken,
      tokens,
      user: spotifyUser,
    });
  } catch (error) {
    console.error("Error in Spotify auth:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 },
    );
  }
}
