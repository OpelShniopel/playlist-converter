import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // Add the weights you need
  display: "swap",
});

export const metadata: Metadata = {
  title: "Playlist Converter",
  description:
    "Convert your playlists between Spotify, YouTube, and SoundCloud",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={geist.className}>{children}</body>
    </html>
  );
}
