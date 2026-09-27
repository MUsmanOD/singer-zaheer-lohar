Playlist & Admin Dashboard — Complete Development Plan
1. Project Goal

Build a new modern Playlists system for the website.

The system must include:

A new public Playlists page.
A Playlists link in the main website header/navigation.
A modern, responsive playlist browsing experience.
Backend-powered playlist management.
A secure Admin Dashboard built with shadcn/ui.
Admin management pages for playlists, videos, overview, and settings.
Admins can add YouTube playlist URLs from the dashboard.
Added playlists should automatically appear on the public Playlists page.
The system should fetch and display playlist information and videos dynamically.
Proper validation, caching, rate limiting, authentication, authorization, loading states, error handling, and responsive design must be implemented.

Do not create a basic CRUD interface. The complete system should feel like a professional modern media-management platform.

2. Public Website — Playlists Page

Create a new route:

/playlists

Add Playlists to the main website header/navigation.

The page should follow the existing website's visual identity while introducing a modern media-focused layout.

Page Structure
Hero Section

Create a modern playlist hero section containing:

Page title: Playlists
Short supporting description.
Optional decorative background/media element.
Subtle animations.
Responsive typography.
Clean spacing.
No excessive visual clutter.

Example:

Explore curated playlists, performances, interviews, concerts, and other videos.

The content should be configurable where appropriate.

3. Playlist Listing

Display playlists retrieved from the backend.

Each playlist should be displayed as a modern card containing:

Playlist thumbnail.
Playlist title.
Short description if available.
Number of videos.
YouTube/platform icon.
Published/added date where appropriate.
"View Playlist" button.
Hover animation.
Proper image aspect ratio.
Fallback image when thumbnail is unavailable.

Cards should support:

Desktop layout.
Tablet layout.
Mobile layout.
Keyboard accessibility.
Touch-friendly interactions.

Use a modern responsive grid.

Example:

Desktop

4 cards per row where space allows.

Tablet

2–3 cards per row.

Mobile

1–2 cards per row depending on screen width.

Do not force fixed heights that cause content overflow.

4. Playlist Detail Experience

When the user opens a playlist, provide a dedicated playlist experience.

Recommended route:

/playlists/[slug]

The page should contain:

Playlist cover/thumbnail.
Playlist title.
Description.
Video count.
YouTube playlist link.
Video list/grid.
Video thumbnails.
Video titles.
Video duration where available.
Published date where available.
Video index/order.
Play/open action.

The layout should feel similar to a modern streaming/media platform.

5. Video Display

Videos inside a playlist should be displayed in a modern responsive layout.

Each video card should contain:

Thumbnail.
Play button overlay.
Video title.
Duration if available.
Video number/index.
Published date.
Optional YouTube icon.

Clicking a video should either:

Open the YouTube video directly, or
Open an internal video/player page.

Use the approach that best fits the existing website architecture.

Do not download or permanently host YouTube videos unless explicitly required.

6. Backend Playlist System

Create a proper backend playlist management system.

A playlist record should support fields such as:

id
title
slug
description
playlistUrl
platform
externalPlaylistId
thumbnail
videoCount
videos
status
displayOrder
isFeatured
createdAt
updatedAt

Where appropriate, avoid storing data that can be reliably fetched from the external platform.

The backend should normalize and validate playlist information before saving it.

7. Admin Dashboard

Create a dedicated secure admin dashboard.

Recommended route:

/admin

Use:

shadcn/ui
Tailwind CSS
Responsive layout
Reusable components
Sidebar navigation
Header/topbar
Cards
Tables
Dialogs
Dropdown menus
Tabs
Forms
Toast notifications
Skeleton loaders
Empty states
Confirmation dialogs

The dashboard should look professional and production-ready.

Do not create a generic template with unnecessary UI components.

8. Admin Dashboard Layout
Sidebar

Include navigation such as:

Overview
Playlists
Videos
Featured Playlists
Settings

Add appropriate icons.

The sidebar must support:

Desktop expanded mode.
Collapsed mode where appropriate.
Mobile drawer.
Active navigation state.
Smooth transitions.
9. Admin Overview Page

Create:

/admin/overview

Display useful statistics such as:

Total playlists.
Total videos.
Active playlists.
Featured playlists.
Recently added playlists.
Recently updated playlists.

Use modern dashboard cards.

Optionally include:

Playlist growth.
Video statistics.
Recent activity.
Most viewed/featured content if the backend later supports analytics.

Do not display fake analytics. Only show data that actually exists.

10. Admin Playlists Page

Create:

/admin/playlists

This should be the primary playlist management page.

Features:

Playlist Table

Display:

Thumbnail.
Title.
Platform.
Video count.
Status.
Featured status.
Display order.
Created date.
Updated date.
Actions.

Actions:

View
Edit
Refresh
Feature/unfeature
Activate/deactivate
Delete

Use shadcn components such as:

Table
DropdownMenu
Dialog
AlertDialog
Badge
Button
Input
Select
11. Add Playlist

Create an Add Playlist dialog/page.

Admin should be able to enter:

Playlist URL.
Optional custom title.
Optional description.
Featured status.
Active/inactive status.
Display order.

The system should automatically detect:

Platform.
Playlist ID.
Playlist title.
Thumbnail.
Video count.
Videos where supported.

Do not blindly trust user-provided URLs.

12. Playlist URL Validation

Only allow supported playlist URLs.

For YouTube, support common URL formats such as:

https://www.youtube.com/playlist?list=PLAYLIST_ID

and playlist URLs containing additional parameters.

Normalize the URL before saving.

Validate:

Correct protocol.
Correct hostname.
Valid playlist ID.
Supported platform.
Duplicate playlist detection.

Reject:

Malformed URLs.
Unsupported domains.
Empty playlist IDs.
Duplicate playlists.

Return clear validation messages.

13. YouTube API Integration

If YouTube data is required, use the official YouTube Data API where appropriate.

Create a backend service responsible for:

Parsing playlist IDs.
Fetching playlist metadata.
Fetching playlist videos.
Fetching thumbnails.
Fetching video counts.
Handling pagination.
Handling API errors.
Respecting API quotas.

Keep API keys and secrets on the server.

Never expose private API credentials in frontend code.

Use environment variables, for example:

YOUTUBE_API_KEY=

Do not hard-code secrets.

14. Playlist Synchronization

Add a mechanism to refresh playlist data.

Admin should be able to click:

Refresh Playlist

The backend should then:

Validate the playlist.
Fetch latest playlist information.
Update title/thumbnail/video count.
Synchronize videos.
Preserve the playlist's local configuration.
Update updatedAt.

Do not unnecessarily call the external API on every public page request.

15. Caching

Implement caching to reduce external API requests and improve performance.

Recommended strategy:

Cache playlist metadata.
Cache video lists.
Cache thumbnails where appropriate.
Refresh cache when admin manually refreshes a playlist.
Use appropriate cache expiration/TTL.

The public page should primarily read from the application's backend/database/cache instead of directly calling YouTube APIs from the browser.

16. Rate Limiting

Implement backend rate limiting.

Protect:

Admin authentication endpoints.
Login attempts.
Playlist creation.
Playlist refresh.
Playlist deletion.
Public playlist APIs.
Search/filter APIs.

Use different limits for:

Public APIs

Reasonable request limits to prevent abuse.

Admin APIs

Stricter limits for sensitive operations.

External API requests

Prevent repeated unnecessary YouTube API requests.

Return:

429 Too Many Requests

when limits are exceeded.

Add appropriate response headers where supported.

17. Authentication & Authorization

The admin dashboard must not be publicly accessible.

Implement:

Secure admin authentication.
Protected routes.
Backend authorization middleware.
Session/token validation.
Logout.
Unauthorized handling.
Forbidden handling.

Frontend route protection alone is not sufficient.

Every sensitive backend endpoint must verify authorization.

Example:

GET    /api/admin/playlists
POST   /api/admin/playlists
PUT    /api/admin/playlists/:id
DELETE /api/admin/playlists/:id
POST   /api/admin/playlists/:id/refresh

All admin endpoints must be protected.

18. Admin Settings

Create:

/admin/settings

Settings can include:

General
Website playlist title.
Playlist page description.
Default playlist visibility.
Default sorting order.
Display
Number of playlists per page.
Featured playlist configuration.
Default video layout.
Integrations
YouTube API configuration status.
Integration status.
API quota/error information where available.
Security
Admin session settings.
Rate-limit configuration where appropriate.
Login/security information.

Sensitive credentials must never be displayed in plain text.

19. Featured Playlists

Create a feature allowing admins to mark playlists as:

Featured

Featured playlists can be displayed prominently on the public website.

Admin should be able to:

Feature playlist.
Remove from featured.
Change featured ordering.

Use drag-and-drop ordering if appropriate.

The public page should retrieve featured playlists from the backend rather than hard-coding them.

20. Playlist Ordering

Add a displayOrder field.

Admin should be able to change playlist ordering.

Possible implementation:

Drag-and-drop ordering.
Manual order number.
Automatic ordering by creation date.

The selected ordering must be reflected on the public page.

21. Search and Filtering

On the admin playlists page, add:

Search by playlist title.
Filter by status.
Filter by featured.
Filter by platform.
Sort by newest/oldest/order.

Use debounced search where appropriate.

Do not make unnecessary API requests for every keystroke.

22. Pagination

Implement backend pagination.

Do not load thousands of playlists/videos into the browser at once.

Example:

?page=1&limit=20

Return metadata such as:

{
  data: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 100,
    totalPages: 5
  }
}
23. API Structure

Use a clean API architecture.

Example:

Public
GET /api/playlists
GET /api/playlists/featured
GET /api/playlists/:slug
GET /api/playlists/:slug/videos
Admin
GET    /api/admin/playlists
POST   /api/admin/playlists
GET    /api/admin/playlists/:id
PUT    /api/admin/playlists/:id
DELETE /api/admin/playlists/:id
POST   /api/admin/playlists/:id/refresh
PATCH  /api/admin/playlists/:id/status
PATCH  /api/admin/playlists/:id/featured
PATCH  /api/admin/playlists/reorder
Dashboard
GET /api/admin/dashboard/stats

Use proper HTTP status codes and consistent API response structures.

24. API Response Standard

Use a consistent backend response format.

Success example:

{
  "success": true,
  "message": "Playlist created successfully",
  "data": {}
}

Error example:

{
  "success": false,
  "message": "Invalid playlist URL",
  "error": "INVALID_PLAYLIST_URL"
}

Do not expose internal stack traces or sensitive backend information to users.

25. Database Design

Create a proper Playlist model/schema.

Recommended fields:

title
slug
description
playlistUrl
platform
externalPlaylistId
thumbnail
videoCount
status
isFeatured
displayOrder
videos
createdBy
createdAt
updatedAt

If videos are stored separately, use a dedicated Video model instead of unnecessarily embedding a large video collection.

For example:

Playlist
Playlist
 ├── id
 ├── title
 ├── slug
 ├── externalPlaylistId
 └── metadata
Video
Video
 ├── id
 ├── playlistId
 ├── externalVideoId
 ├── title
 ├── thumbnail
 ├── position
 └── metadata

Choose the architecture that best fits the existing application's database.

26. Security Requirements

Implement proper security throughout the system.

Requirements:

Validate all backend input.
Sanitize user-controlled data.
Validate URLs.
Prevent unauthorized admin access.
Protect admin APIs.
Rate-limit sensitive endpoints.
Keep API keys server-side.
Do not expose stack traces.
Use secure cookies/session handling where applicable.
Prevent duplicate records.
Prevent malicious external URLs.
Validate IDs before database queries.
Use safe database queries.
Add CORS configuration appropriate for the production domain.
27. Error Handling

Implement professional error handling.

Handle:

Invalid playlist URL.
Playlist not found.
YouTube API unavailable.
YouTube API quota exceeded.
Empty playlist.
Deleted/private playlist.
Network failure.
Database failure.
Unauthorized admin access.
Rate limit exceeded.
Duplicate playlist.
Invalid form data.

The frontend should show understandable error messages.

Avoid displaying raw server errors.

28. Loading States

Use shadcn skeleton components.

Add skeletons for:

Playlist cards.
Playlist details.
Video cards.
Admin tables.
Dashboard statistics.

Avoid blank screens while data is loading.

29. Empty States

Create polished empty states.

Examples:

Public

No playlists are available yet.

Admin

No playlists found.

Include useful actions where appropriate.

30. Toast Notifications

Use a consistent toast system.

Examples:

Playlist added successfully.
Playlist updated successfully.
Playlist deleted successfully.
Playlist refreshed successfully.
Playlist featured.
Playlist removed from featured.
Invalid URL.
API synchronization failed.

Avoid browser alert() dialogs.

31. Confirmation Dialogs

Destructive operations must require confirmation.

For example:

Delete Playlist

Are you sure you want to delete this playlist? This action cannot be undone.

Buttons:

Cancel
Delete Playlist

Use shadcn AlertDialog.

32. Responsive Design

The entire system must be fully responsive.

Test:

Large desktop.
Laptop.
Tablet.
Mobile.
Small mobile screens.

Admin dashboard must work properly on mobile using a sidebar drawer.

Public playlist page must have:

Touch-friendly cards.
Proper image sizing.
Responsive typography.
No horizontal overflow.
Smooth scrolling.
Proper spacing.
33. Accessibility

Implement:

Semantic HTML.
Keyboard navigation.
Visible focus states.
Accessible buttons.
ARIA labels where required.
Proper dialog accessibility.
Image alt text.
Sufficient contrast.
Keyboard-accessible dropdowns and menus.

Do not rely only on color to communicate status.

34. SEO

Optimize the public playlist pages.

For /playlists:

Proper title.
Meta description.
Open Graph metadata.
Twitter/social metadata where applicable.
Canonical URL.
Semantic headings.

For individual playlists:

Dynamic title.
Dynamic description.
Playlist thumbnail as social image where appropriate.
Structured metadata where appropriate.

Do not expose admin pages to search engines.

35. Performance

Optimize the entire system.

Requirements:

Lazy-load images where appropriate.
Use optimized image components.
Avoid unnecessary client-side API requests.
Cache backend data.
Paginate large datasets.
Debounce search.
Avoid repeated external API calls.
Use server-side data fetching where appropriate.
Avoid unnecessary JavaScript on the public playlist page.

The public page should remain fast even when many playlists exist.

36. UI/UX Design Direction

Use a modern premium media-platform style.

Design principles:

Clean layout.
Strong typography hierarchy.
Consistent spacing.
Subtle shadows.
Modern borders.
Rounded cards.
Smooth hover effects.
Minimal animations.
Professional empty states.
Consistent iconography.
No excessive gradients.
No excessive glassmorphism.
No clutter.

Use shadcn/ui components wherever applicable.

Use Lucide icons or the project's existing icon system.

Animations should be subtle and purposeful.

37. Public Playlist Page Advanced Features

Where appropriate, include:

Featured playlists.
Recently added playlists.
All playlists.
Search playlists.
Category/filter support if categories exist.
Smooth card hover effects.
Playlist video count.
External YouTube button.
Responsive video grid.
Pagination or load-more behavior.

Do not implement features that require fake data.

38. Admin Video Management

Create:

/admin/videos

The page should allow admins to view synchronized videos.

Features:

Search videos.
Filter by playlist.
View video details.
View external YouTube URL.
View thumbnail.
View playlist relationship.
View video order.
Refresh/sync playlist videos.
Remove stale synchronization records where appropriate.

Do not allow admins to edit external YouTube video data manually unless there is a clear local override requirement.

39. Activity / Audit Logging

Add an admin activity log where practical.

Record actions such as:

Playlist created.
Playlist updated.
Playlist deleted.
Playlist refreshed.
Playlist featured/unfeatured.
Playlist status changed.

Store:

adminId
action
resource
resourceId
timestamp
metadata

This makes the admin system easier to maintain and audit.

# 46. Next.js Backend & API Implementation

The project uses **Next.js**, so implement the backend using **Next.js Route Handlers** under:

```text
app/api/
```

Do not create a separate Express.js server unless the existing project already requires one.

Use a clean, modular API architecture that can scale as the playlist/video system grows.

---

# 47. Next.js API Folder Structure

Create the following structure:

```text
app/
├── api/
│   ├── playlists/
│   │   ├── route.js
│   │   ├── featured/
│   │   │   └── route.js
│   │   └── [slug]/
│   │       ├── route.js
│   │       └── videos/
│   │           └── route.js
│   │
│   ├── videos/
│   │   └── route.js
│   │
│   └── admin/
│       ├── dashboard/
│       │   └── stats/
│       │       └── route.js
│       │
│       ├── playlists/
│       │   ├── route.js
│       │   ├── reorder/
│       │   │   └── route.js
│       │   └── [id]/
│       │       ├── route.js
│       │       ├── refresh/
│       │       │   └── route.js
│       │       ├── status/
│       │       │   └── route.js
│       │       └── featured/
│       │           └── route.js
│       │
│       ├── videos/
│       │   └── route.js
│       │
│       └── settings/
│           └── route.js
```

Use JavaScript because the existing project uses Next.js JavaScript rather than TypeScript.

---

# 48. Public Playlist APIs

## GET `/api/playlists`

Return the public playlists.

Support:

```text
?page=1
&limit=12
&search=
&featured=true
```

Example:

```text
GET /api/playlists?page=1&limit=12
```

Return:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 0,
    "totalPages": 0
  }
}
```

Only return playlists that are publicly active.

Do not expose admin-only fields.

---

# 49. Featured Playlists API

Create:

```text
GET /api/playlists/featured
```

Return active playlists where:

```text
isFeatured = true
```

Sort according to:

```text
displayOrder
```

Do not return inactive playlists.

---

# 50. Single Playlist API

Create:

```text
GET /api/playlists/[slug]
```

Return:

* Playlist information.
* Thumbnail.
* Description.
* Video count.
* Platform.
* External playlist URL.
* Featured status if appropriate.
* Videos or video endpoint information.

Only return active/public playlists.

Return:

```text
404
```

when the playlist does not exist or is inactive.

---

# 51. Playlist Videos API

Create:

```text
GET /api/playlists/[slug]/videos
```

Support:

```text
?page=1
&limit=24
```

Return:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 24,
    "total": 0,
    "totalPages": 0
  }
}
```

Sort videos using their original playlist position.

---

# 52. Admin Dashboard Statistics API

Create:

```text
GET /api/admin/dashboard/stats
```

Return real database statistics:

```json
{
  "success": true,
  "data": {
    "totalPlaylists": 0,
    "activePlaylists": 0,
    "featuredPlaylists": 0,
    "totalVideos": 0
  }
}
```

Do not use hard-coded/fake statistics.

Protect this endpoint with admin authentication.

---

# 53. Admin Playlist API

Create:

```text
GET /api/admin/playlists
```

Support:

```text
?page=1
&limit=20
&search=
&status=
&featured=
&sort=
```

The response may contain additional admin-only information such as:

* Status.
* Featured state.
* Display order.
* Created date.
* Updated date.
* External playlist ID.

This endpoint must be protected.

---

# 54. Create Playlist API

Create:

```text
POST /api/admin/playlists
```

Request:

```json
{
  "playlistUrl": "https://www.youtube.com/playlist?list=XXXXXXXX",
  "title": "",
  "description": "",
  "isFeatured": false,
  "status": "active",
  "displayOrder": 0
}
```

Backend workflow:

1. Authenticate admin.
2. Validate request body.
3. Validate playlist URL.
4. Extract YouTube playlist ID.
5. Check whether the playlist already exists.
6. Fetch playlist metadata from YouTube.
7. Fetch playlist videos.
8. Create/update database records.
9. Generate/validate slug.
10. Save playlist.
11. Return created playlist.

Do not save an invalid or incomplete playlist.

---

# 55. Playlist Validation

Create a reusable validator such as:

```text
lib/validators/playlist.js
```

Validate:

* URL.
* Platform.
* Playlist ID.
* Title length.
* Description length.
* Status.
* Display order.
* Featured value.

Reject unexpected fields where appropriate.

---

# 56. YouTube Service

Create a dedicated service:

```text
lib/services/youtube.js
```

or:

```text
lib/services/youtube/
├── index.js
├── playlist.js
└── videos.js
```

The service should handle:

```text
getPlaylist()
getPlaylistVideos()
getVideoDetails()
extractPlaylistId()
validatePlaylistUrl()
```

Do not put YouTube API code directly inside the route handlers.

---

# 57. Environment Variables

Use:

```env
YOUTUBE_API_KEY=
```

Keep the key server-side.

Do NOT use:

```env
NEXT_PUBLIC_YOUTUBE_API_KEY=
```

unless there is a specific public-client requirement.

Never expose the private API key to the browser.

---

# 58. Update Playlist API

Create:

```text
PUT /api/admin/playlists/[id]
```

Allow admins to update local settings such as:

* Title override.
* Description.
* Featured status.
* Status.
* Display order.

Do not overwrite synchronized YouTube data unnecessarily.

---

# 59. Delete Playlist API

Create:

```text
DELETE /api/admin/playlists/[id]
```

Before deletion:

* Authenticate admin.
* Validate ID.
* Find playlist.
* Confirm it exists.
* Delete associated video records if they are stored separately.
* Delete playlist.
* Create audit log.

Return a clear success response.

---

# 60. Refresh Playlist API

Create:

```text
POST /api/admin/playlists/[id]/refresh
```

Workflow:

```text
Admin
 ↓
Authenticate
 ↓
Find playlist
 ↓
Get external playlist ID
 ↓
Fetch latest YouTube metadata
 ↓
Fetch latest videos
 ↓
Synchronize database
 ↓
Update video positions
 ↓
Remove stale records where appropriate
 ↓
Update timestamps
 ↓
Return updated playlist
```

Do not create duplicate videos.

Use the external YouTube video ID as the unique identifier.

---

# 61. Playlist Status API

Create:

```text
PATCH /api/admin/playlists/[id]/status
```

Request:

```json
{
  "status": "active"
}
```

Supported states:

```text
active
inactive
```

Validate status values server-side.

---

# 62. Featured Playlist API

Create:

```text
PATCH /api/admin/playlists/[id]/featured
```

Request:

```json
{
  "isFeatured": true
}
```

Only active playlists should normally be allowed to become featured.

---

# 63. Playlist Reordering API

Create:

```text
PATCH /api/admin/playlists/reorder
```

Request:

```json
{
  "items": [
    {
      "id": "playlist-id-1",
      "displayOrder": 1
    },
    {
      "id": "playlist-id-2",
      "displayOrder": 2
    }
  ]
}
```

Validate every ID before updating.

Use a database transaction where supported so partial ordering updates do not leave inconsistent data.

---

# 64. Admin Videos API

Create:

```text
GET /api/admin/videos
```

Support:

```text
?page=1
&limit=20
&search=
&playlistId=
```

Return:

* Video title.
* Thumbnail.
* External video ID.
* Playlist.
* Position.
* Published date.
* External URL.

Protect the endpoint with admin authentication.

---

# 65. Admin Settings API

Create:

```text
GET /api/admin/settings
PUT /api/admin/settings
```

Settings should be stored in the database if they need to persist dynamically.

Example:

```json
{
  "playlistPageTitle": "Playlists",
  "playlistPageDescription": "Explore all playlists.",
  "defaultPlaylistLimit": 12
}
```

Do not expose sensitive configuration through this API.

---

# 66. Authentication Middleware

Create reusable authentication utilities such as:

```text
lib/auth/
├── requireAuth.js
├── requireAdmin.js
└── session.js
```

Admin API routes should use:

```text
requireAdmin()
```

before performing sensitive operations.

Do not duplicate authentication logic in every route.

Use the project's existing authentication system if one already exists.

---

# 67. Next.js Route Handler Pattern

Keep route handlers clean.

Example architecture:

```text
Route Handler
      ↓
Authentication
      ↓
Validation
      ↓
Controller/Service
      ↓
Database
      ↓
Response
```

Avoid putting large business-logic blocks directly inside:

```text
route.js
```

Create reusable service functions.

---

# 68. Database Layer

Create reusable database models and queries.

For example:

```text
lib/db/
├── connection.js
├── models/
│   ├── Playlist.js
│   └── Video.js
└── queries/
```

If the existing project already has a MongoDB connection/model architecture, reuse it rather than creating another database connection system.

---

# 69. MongoDB Recommendation

If the existing application uses MongoDB, use MongoDB/Mongoose for this feature as well.

Recommended indexes:

### Playlist

```text
slug
externalPlaylistId
status
isFeatured
displayOrder
createdAt
```

### Video

```text
externalVideoId
playlistId
position
```

Make `externalPlaylistId` unique where appropriate.

Make `externalVideoId + playlistId` unique to prevent duplicate playlist videos.

---

# 70. Rate Limiting in Next.js

Add reusable rate-limit middleware/utilities.

Protect:

```text
POST /api/admin/playlists
POST /api/admin/playlists/[id]/refresh
DELETE /api/admin/playlists/[id]
PATCH /api/admin/playlists/reorder
```

Also protect public APIs against excessive requests.

If the application is deployed on Vercel/serverless infrastructure, use a distributed rate-limit solution rather than relying only on in-memory variables.

Do not implement a rate limiter that resets every time a serverless instance changes.

---

# 71. API Security

Every API route must:

* Validate HTTP method.
* Validate input.
* Validate IDs.
* Authenticate where required.
* Authorize admin operations.
* Rate-limit sensitive operations.
* Sanitize output.
* Avoid exposing secrets.
* Return safe errors.

Never return:

```text
process.env.YOUTUBE_API_KEY
```

or database credentials.

---

# 72. Caching Strategy

Use Next.js caching where appropriate for public playlist data.

The public playlist page should not request YouTube directly.

Preferred flow:

```text
Browser
   ↓
Next.js API
   ↓
Database / Cache
   ↓
Response
```

Admin refresh:

```text
Admin
   ↓
Next.js API
   ↓
YouTube API
   ↓
Database
   ↓
Cache invalidation
```

After an admin creates or refreshes a playlist, invalidate the relevant public cache.

---

# 73. Cache Invalidation

When these actions occur:

```text
Create playlist
Update playlist
Delete playlist
Refresh playlist
Change status
Change featured status
Reorder playlists
```

invalidate/revalidate:

```text
/playlists
/playlists/[slug]
```

and related API cache where applicable.

Use Next.js revalidation mechanisms appropriate to the current Next.js version.

---

# 74. Frontend API Client

Do not scatter raw `fetch()` calls throughout components.

Create a reusable API layer such as:

```text
lib/api/
├── playlists.js
├── adminPlaylists.js
├── videos.js
└── admin.js
```

Example functions:

```text
getPlaylists()
getFeaturedPlaylists()
getPlaylist()
getPlaylistVideos()

getAdminPlaylists()
createPlaylist()
updatePlaylist()
deletePlaylist()
refreshPlaylist()
reorderPlaylists()
```

This keeps frontend components clean and maintainable.

---

# 75. Admin UI Data Flow

The admin dashboard should follow:

```text
Admin UI
   ↓
API Client
   ↓
Next.js Route Handler
   ↓
Authentication
   ↓
Validation
   ↓
Service
   ↓
Database / YouTube
   ↓
API Response
   ↓
Toast + UI Update
```

After successful mutations, update or invalidate the relevant frontend data instead of forcing a full browser reload.

---

# 76. Optimistic UI

Use optimistic updates only where safe.

Suitable examples:

* Featured/unfeatured toggle.
* Active/inactive toggle.
* Playlist ordering.

For destructive or external API operations such as:

* Delete.
* Refresh/synchronize.

wait for the server response before updating the final UI state.

---

# 77. Error Boundaries

Add appropriate Next.js error handling for:

```text
/playlists
/playlists/[slug]
/admin
/admin/playlists
```

Create:

```text
error.js
loading.js
not-found.js
```

where appropriate.

Provide useful recovery actions such as:

* Try again.
* Back to playlists.
* Go to dashboard.

---

# 78. Final Integration Requirement

After implementation, verify the complete flow:

```text
Admin Login
      ↓
Admin Dashboard
      ↓
Playlists
      ↓
Add YouTube Playlist URL
      ↓
Validate URL
      ↓
Extract Playlist ID
      ↓
Fetch YouTube Data
      ↓
Save Playlist + Videos
      ↓
Admin sees playlist
      ↓
Playlist appears on public /playlists
      ↓
User opens playlist
      ↓
User sees synchronized videos
      ↓
Admin can refresh playlist
      ↓
Latest data is synchronized
```

The implementation must be production-ready, modular, secure, responsive, and maintainable.

Do not use mock playlist data after the backend integration is complete.

Do not hard-code playlist cards on the public page.

The public Playlists page must always use the backend/database as its source of truth.
