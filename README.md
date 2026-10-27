# 🎧 Purrify — Music Streaming Web App

**Purrify** is a responsive music streaming web application built with Vue 3, TypeScript, and Tailwind CSS. It integrates with the Spotify Web API to let users explore music, discover artists, manage favorites, create personalized playlists, and listen to songs through the Spotify Web Playback SDK.

The application uses Appwrite for user authentication integration and database storage, allowing users to keep their favorite songs and custom playlists across sessions.

## Features

### Music Discovery
- Browse recently played songs and personalized recommendations.
- Search for songs, albums, and artists.
- Explore artists and their music.
- View song details, album artwork, and artist information.

### Music Player
- Play music using the Spotify Web Playback SDK.
- Pause, resume, and seek through songs.
- Adjust playback volume.
- Track playback progress and automatically handle song transitions.

### Favorites & Playlists
- Save and remove favorite songs.
- Create personalized playlists with names, descriptions, and cover images.
- Add and remove songs from playlists.
- Edit and delete existing playlists.
- Store favorites and playlists in Appwrite so changes persist after refreshing.

### User Experience
- Responsive layouts for desktop and mobile devices.
- Reusable Vue components and consistent design styling.
- Toast notifications for playlist and favorite actions.
- Infinite scrolling for longer music lists.
- Accessibility features including semantic HTML, ARIA attributes, keyboard focus styles, and reduced-motion support.
- Dynamic page titles and meta descriptions.

## Technologies Used

| Technology | Purpose |
|---|---|
| Vue 3 | Frontend framework and component architecture |
| TypeScript | Type safety and application logic |
| Vite | Development server and production builds |
| Tailwind CSS | Responsive styling and reusable design tokens |
| Vue Router | Client-side navigation |
| Spotify Web API | Music, artist, album, and listening data |
| Spotify Web Playback SDK | Browser-based music playback |
| Appwrite | Authentication integration and persistent data storage |
| Unhead | Dynamic SEO metadata |

## How It Works

Purrify connects to Spotify using OAuth 2.0 with PKCE authentication.

After logging in, users can explore music through Spotify's API and play tracks using the Spotify Web Playback SDK.

Appwrite handles the application's persistent user data, including favorite songs and custom playlists. Playlist information and playlist tracks are stored in separate database tables, allowing users to manage their collections without losing changes after refreshing the application.

## Project Structure

The application separates components, features, composables, services, and TypeScript definitions to keep the code organized and maintainable.

```text
src/
├── assets/
├── components/
├── composables/
├── features/
├── router/
├── services/
│   ├── appwrite/
│   └── spotify/
├── styles/
├── types/
├── App.vue
└── main.ts
```

## Getting Started

### Prerequisites

- Node.js and npm
- Spotify Developer application
- Appwrite project with the required database tables and authentication function

### Installation

Clone the repository and install dependencies.

```bash
git clone <repository-url>
cd <repository-folder>
npm install
```

Create a `.env` file in the project root and configure the required environment variables:

```env
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_SPOTIFY_REDIRECT_URI=your_redirect_uri

VITE_APPWRITE_ENDPOINT=your_appwrite_endpoint
VITE_APPWRITE_PROJECT_ID=your_appwrite_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id

VITE_APPWRITE_FAVORITES_TABLE_ID=favorites
VITE_APPWRITE_PLAYLISTS_TABLE_ID=playlists
VITE_APPWRITE_PLAYLIST_TRACKS_TABLE_ID=playlist_tracks
```

The Appwrite project must also have the appropriate tables, permissions, and Spotify authentication function configured.

Start the development server:

```bash
npm run dev
```

Build the application for production:

```bash
npm run build
```

## What I Worked On

Through Purrify, I gained practical experience in building a more complex Vue application and integrating multiple external services.

The project helped me strengthen my skills in:

- Developing reusable and maintainable Vue components with TypeScript.
- Working with asynchronous API requests and Spotify authentication.
- Implementing interactive music playback and managing shared application state.
- Building persistent CRUD functionality using Appwrite.
- Designing responsive interfaces with Tailwind CSS.
- Improving accessibility, usability, and SEO.
- Organizing frontend code into reusable composables and services.

## Notes

Spotify playback requires a compatible Spotify account, and some features may depend on Spotify API permissions and account restrictions.

Purrify is an independent educational project and is not affiliated with Spotify.

## Author

Developed as a Multimedia Design project, with a focus on frontend development, user experience, and third-party API integration.