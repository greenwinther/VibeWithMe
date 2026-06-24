# VibeWithMe

VibeWithMe is a collaborative music and video room app built with Expo and React Native. Users can create or join shared rooms, search YouTube, build a room playlist, chat with other participants, and keep playback state synchronized through a real-time Socket.IO backend.

The project is split into a mobile/web Expo client and a TypeScript Express server backed by Prisma and SQLite.

## Features

- Public room lobby with room filtering, room creation, and participant counts
- Local user identity stored with AsyncStorage
- Profile screen for editing display name and choosing an avatar from the device library
- Room pages with a shared YouTube player
- YouTube search powered by the YouTube Data API
- Shared room playlist with video thumbnails, ordering, and "added by" metadata
- Real-time chat per room with persisted message history
- Socket.IO playback events for play/pause, seeking, and advancing videos
- Prisma data model for users, rooms, participants, videos, and messages
- Automatic cleanup for stale rooms on the server

## Tech Stack

### Client

- Expo 53
- React 19
- React Native 0.79
- Expo Router
- TypeScript
- Socket.IO Client
- React Native YouTube IFrame
- AsyncStorage
- Expo Image Picker

### Server

- Node.js
- Express 5
- TypeScript
- Socket.IO
- Prisma ORM
- SQLite
- Google APIs / YouTube Data API
- Nodemon and ts-node for local development

## Project Structure

```text
VibeWithMe/
|-- app/                    # Expo Router screens and route layouts
|   |-- index.tsx           # Lobby screen
|   |-- profile.tsx         # User profile screen
|   `-- rooms/[id]/         # Dynamic room screen
|-- components/             # Shared React Native UI components
|-- contexts/               # User, room, playlist, and chat state providers
|-- styles/                 # App theme, colors, fonts, and global styles
|-- assets/                 # Logo and custom fonts
|-- server/
|   |-- prisma/             # Prisma schema, migrations, and local SQLite DB
|   |-- src/
|   |   |-- routes/         # REST endpoints for rooms, users, and YouTube search
|   |   |-- socket/         # Socket.IO handlers for rooms, chat, playlist, playback
|   |   `-- lib/            # Prisma, API/socket config, room helpers, cleanup
|   `-- types/              # Shared DTO TypeScript types
|-- package.json            # Expo client scripts and dependencies
`-- README.md
```

## Prerequisites

- Node.js
- npm
- Expo tooling through `npx expo`
- A YouTube Data API key for video search

For mobile device testing, the phone and development machine should be on the same network.

## Environment Variables

The server reads environment variables from `server/.env`.

Create `server/.env` with:

```env
DATABASE_URL="file:./dev.db"
YOUTUBE_API_KEY="your_youtube_data_api_key"
```

Optional:

```env
PORT=4000
```

Notes:

- `DATABASE_URL` is required by Prisma.
- `YOUTUBE_API_KEY` is required for `/youtube-search`.
- The root `.env.local` file currently exists but is empty.
- The client API/socket URLs are currently configured in source files, not environment variables:
    - `server/src/lib/api.ts`
    - `server/src/lib/socket.ts`

If the app cannot reach the backend from your device or emulator, update those host values to match your local setup.

## Installation

Install the Expo client dependencies:

```bash
npm install
```

Install the server dependencies:

```bash
cd server
npm install
```

Generate the Prisma client and apply the local database migration:

```bash
npx prisma migrate dev
```

Then return to the project root:

```bash
cd ..
```

## Running Locally

Start the backend server from the `server` folder:

```bash
cd server
npm run dev
```

By default, the server listens on:

```text
http://localhost:4000
```

In a second terminal, start the Expo app from the project root:

```bash
npm start
```

You can also run a specific target:

```bash
npm run android
npm run ios
npm run web
```

## Basic Usage Flow

1. Start the backend server.
2. Start the Expo client.
3. Open the app in Expo Go, an emulator, simulator, or web browser.
4. The app creates or loads a local user profile.
5. From the lobby, filter existing public rooms or enter a name and create a new room.
6. Inside a room, search YouTube and add videos to the shared playlist.
7. Use the room chat to send messages to other participants.
8. Playback state is shared through Socket.IO events.
9. Use the room drawer to return to the lobby or open the profile screen.

## Available Scripts

### Client

```bash
npm start        # Start Expo
npm run android  # Start Expo for Android
npm run ios      # Start Expo for iOS
npm run web      # Start Expo for web
npm run lint     # Run Expo linting
```

### Server

```bash
npm run dev      # Start the TypeScript server with nodemon
npm run build    # Compile TypeScript to dist/
npm start        # Run the compiled server
```

The server has a placeholder `npm test` script that currently exits with an error.

## API Overview

REST endpoints:

- `GET /` - healthcheck
- `GET /rooms` - list public rooms
- `GET /rooms/:id` - get room metadata
- `POST /rooms` - create a room
- `GET /users/:id` - get a user profile
- `PUT /users/:id` - create or update a user profile
- `GET /youtube-search?q=...` - search YouTube videos

Socket.IO events include:

- `join-room`
- `chat:fetch`
- `chat:history`
- `chat:message`
- `playlist:fetch`
- `playlist:update`
- `video:add`
- `play-pause`
- `seek`
- `video:advance`
- `signal`

## Known Limitations

- The client backend host is currently hard-coded in `server/src/lib/api.ts` and `server/src/lib/socket.ts`.
- `server/src/lib/api.ts` includes a development IP override, while `server/src/lib/socket.ts` uses `localhost`; these may need adjustment depending on emulator, web, or physical-device testing.
- The "Server Settings" drawer option is a placeholder.
- There is no implemented automated test suite yet.
- Room cleanup is configured for a short inactivity window during development.
- YouTube search depends on a valid YouTube Data API key and API quota availability.
- Avatar images are stored as local URI strings, not uploaded to shared storage.

## Future Improvements

- Move client API and socket URLs into environment-based configuration.
- Add automated tests for REST routes, socket events, and critical client flows.
- Add stronger loading, empty, and error states across the app.
- Improve room participant presence and leaving/disconnect behavior.
- Add playlist management actions such as remove, reorder, and selecting a specific queued video.
- Persist or upload avatars through backend-managed storage.
- Complete the server settings flow.
- Prepare production deployment configuration for the API, database, and Expo builds.

## Author

Created by Dennis as a school project.
