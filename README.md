# Zaheer Lohar — website and playlist studio

This Next.js app contains the public artist website and a server-backed YouTube playlist library with an authenticated admin dashboard.

## Local setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and set the values described below.
3. Start the app with `npm run dev` and open `http://localhost:3000`.

### Required services

- **MongoDB:** Set `MONGODB_URI` to a MongoDB Atlas or replica-set connection string. Playlists, synchronized videos, admin activity, settings, and distributed rate-limit counters are stored in MongoDB. A standalone local MongoDB is also supported; operations continue without a transaction when transactions are unavailable. A replica set is recommended for atomic synchronization and reordering.
- **Admin account:** Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `MONGODB_URI`, and a `SESSION_SECRET` with at least 32 characters, then run `npm run seed`. The seed upserts a scrypt-hashed admin account. There is no public sign-up. The dashboard uses a signed, HTTP-only, same-site session cookie.
- **YouTube API:** Enable YouTube Data API v3 in a Google Cloud project and set its server-side key in `YOUTUBE_API_KEY`. The key is never sent to the browser. Public playlist pages read synchronized MongoDB data and do not contact YouTube.
- **Performance bookings:** Booking requests are validated and stored in MongoDB, with shared API rate limits, a honeypot, and a 24-hour duplicate fingerprint. `BOOKING_DEDUPE_SECRET` is optional; when omitted, the server derives the HMAC key from the configured session secret or MongoDB connection string.
- **Canonical origin:** Set `NEXT_PUBLIC_SITE_URL` to the deployed site origin so playlist pages can emit canonical links and social metadata.

Generate a strong session secret with Node.js:

```sh
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

Keep `.env.local` private. The `.env.example` file contains placeholders only.

## Playlist workflow

Sign in at `/admin/login`, then add a public YouTube playlist from `/admin/playlists`. The API validates and normalizes the URL, rejects unsupported domains and duplicates, fetches playlist metadata and paginated video details on the server, and saves the normalized records. The active playlist then appears at `/playlists`; its detail page links each video to YouTube. Refreshing a playlist synchronizes changes and removes stale video records while preserving local title, description, visibility, featured, and ordering settings.

The admin workspace is available at `/admin` and includes overview statistics, playlist and video management, featured collections, public-page settings, and `/admin/bookings` for reviewing event inquiries. Add an individual YouTube video at `/admin/videos/new`; video and playlist URLs are detected automatically, metadata is verified and fetched server-side, and featured selections appear in the homepage’s Popular songs section. Playlist videos can also be featured directly from the Videos table. Booking notifications appear in the admin inbox and are refreshed every 30 seconds. All admin APIs verify the signed session on the server. Browser mutations must be same-origin, and API limits are stored in MongoDB so they are shared across server instances.

## Data and API

The Mongoose models live in `src/lib/db/models`. Route handlers under `src/app/api` return consistent JSON errors and paginated responses. The homepage’s latest songs, featured songs, and four-playlist preview read from public database APIs. Public list/detail/video responses have a short shared-cache lifetime; playlist mutations revalidate the related Next.js pages. Admin pages and APIs are excluded from indexing.

The YouTube synchronizer follows playlist pagination and supports up to 5,000 videos per playlist per sync. YouTube API quota and connectivity errors are returned as safe user-facing messages and recorded as playlist sync state.

## Project commands

- `npm run dev` — development server
- `npm run lint` — ESLint
- `npm run build` — production build
- `npm start` — production server
