# Playlist Converter

A modern web application that allows users to convert their playlists between different music streaming platforms.
Currently, it supports conversion from Spotify to YouTube,
with an intuitive user interface and seamless authentication flow.

## Features

- **Multi-Platform Authentication**

  - Google/YouTube authentication
  - Spotify authentication
  - Secure token management with automatic refresh

- **Playlist Management**

  - View Spotify playlists with detailed track information
  - Select specific tracks for conversion
  - Track-by-track conversion progress monitoring
  - Conversion history tracking

- **User Interface**
  - Modern, responsive design
  - Dark mode support
  - Real-time conversion progress updates
  - Beautiful playlist grid layout with thumbnails

## Tech Stack

- **Frontend Framework**: Next.js 15.1.0
- **UI Components**: React 19
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **APIs**:
  - Spotify Web API
  - YouTube Data API v3

## Prerequisites

Before you begin, ensure you have:

- Node.js (latest LTS version recommended)
- Yarn package manager
- Firebase project with Firestore database
- Spotify Developer account and registered application
- Google Cloud project with YouTube Data API enabled

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```plaintext
# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Firebase Admin
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Spotify Config
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd playlist-converter
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Run the development server:

   ```bash
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/               # Next.js app router pages and API routes
├── components/        # React components
├── context/          # React context providers
├── lib/              # Firebase and other configurations
├── services/         # API service functions
└── types/            # TypeScript type definitions
```

## Development

The application uses Next.js App Router and follows a component-based architecture. Key areas include:

- `src/app/*`: Page components and API routes
- `src/components/*`: Reusable UI components
- `src/services/*`: Service functions for API interactions
- `src/context/*`: Global state management
- `src/lib/*`: Configuration and utilities

## Building for Production

1. Build the application:

   ```bash
   yarn build
   ```

2. Start the production server:
   ```bash
   yarn start
   ```

## Deployment

The application can be deployed on Vercel with minimal configuration. Simply connect your repository and:

1. Configure environment variables in Vercel dashboard
2. Deploy with the "Import Project" function
3. Vercel will automatically build and deploy your application
