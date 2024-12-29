# Playlist Converter

A modern web application that allows users to seamlessly convert their playlists between Spotify and YouTube. Built with Next.js, TypeScript, and Firebase.

## Features

- **Cross-Platform Playlist Conversion**: Convert playlists between Spotify and YouTube with ease
- **Selective Track Conversion**: Choose specific tracks from a playlist to convert
- **Real-Time Progress Tracking**: Monitor conversion progress with a sleek progress interface
- **Conversion History**: Keep track of all your previous playlist conversions
- **Dark Mode Support**: Automatic theme switching based on system preferences
- **Responsive Design**: Fully functional on both desktop and mobile devices

## Tech Stack

- **Frontend Framework**: Next.js 15 with TypeScript
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **Styling**: Tailwind CSS with dynamic theming
- **UI Components**: 
  - Radix UI for accessible components
  - Headless UI for complex interactions
  - Hero Icons for iconography
- **API Integration**:
  - Spotify Web API
  - YouTube Data API v3

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn
- Firebase account
- Spotify Developer account
- Google Cloud account with YouTube Data API enabled

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Firebase Admin
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_client_email
FIREBASE_ADMIN_PRIVATE_KEY='your_private_key'

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Spotify API
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# YouTube API
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key
YOUTUBE_CLIENT_ID=your_youtube_client_id
YOUTUBE_CLIENT_SECRET=your_youtube_client_secret
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/playlist-converter.git
cd playlist-converter
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features in Detail

### Authentication Flow
- Sign in with Google (YouTube) authentication
- Connect Spotify account with OAuth 2.0
- Manage multiple service connections

### Playlist Management
- View all Spotify playlists
- Select individual tracks for conversion
- Custom naming for converted playlists
- Track conversion progress in real-time

### Service Integration
- Automatic token refresh handling
- Rate limiting and error handling
- Batch processing for large playlists
