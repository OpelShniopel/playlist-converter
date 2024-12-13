export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Playlist Converter
        </h1>
        <p className="text-xl text-center mb-8">
          Convert your playlists between Spotify, YouTube, and SoundCloud
        </p>
        {/* Auth and conversion components will go here */}
      </main>
    </div>
  );
}
