# Music Discovery

<cite>
**Referenced Files in This Document**
- [app/page.tsx](file://app/page.tsx)
- [app/search/page.tsx](file://app/search/page.tsx)
- [app/artist/[id]/page.tsx](file://app/artist/[id]/page.tsx)
- [app/playlist/[id]/page.tsx](file://app/playlist/[id]/page.tsx)
- [lib/api.ts](file://lib/api.ts)
- [components/InfiniteArtistSection.tsx](file://components/InfiniteArtistSection.tsx)
- [components/InfiniteSearchSection.tsx](file://components/InfiniteSearchSection.tsx)
- [components/SongCard.tsx](file://components/SongCard.tsx)
- [components/ArtistCard.tsx](file://components/ArtistCard.tsx)
- [components/PlaylistCard.tsx](file://components/PlaylistCard.tsx)
- [components/AlbumCard.tsx](file://components/AlbumCard.tsx)
- [components/SkeletonLoader.tsx](file://components/SkeletonLoader.tsx)
- [store/usePlayerStore.ts](file://store/usePlayerStore.ts)
</cite>

## Update Summary
**Changes Made**
- Enhanced search functionality with persistent query storage and debouncing
- Improved artist page with 'Add to Queue' button for individual songs
- Redesigned playlist page with better responsive design and enhanced user interactions
- Updated content normalization and infinite loading implementations

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Enhanced Features](#enhanced-features)
7. [Dependency Analysis](#dependency-analysis)
8. [Performance Considerations](#performance-considerations)
9. [Troubleshooting Guide](#troubleshooting-guide)
10. [Conclusion](#conclusion)
11. [Appendices](#appendices)

## Introduction
This document explains the music discovery feature, focusing on:
- Trending content carousel and curated recommendations
- Mood-based recommendations
- Popular artists showcase
- Featured playlists
- Enhanced search functionality with persistent query storage
- Improved artist page with 'Add to Queue' button
- Redesigned playlist page with better responsive design
- Infinite scrolling for artist sections
- Content normalization from external APIs
- Performance optimization strategies
- Integration with the external music API
- Content loading and caching
- User engagement metrics and interaction patterns
- Responsive design considerations

## Project Structure
The discovery feature spans the home page, search functionality, artist and playlist pages, shared API utilities, reusable cards, infinite loaders, and the global player store. The home page orchestrates queries to an external music API, normalizes results, and renders content sections. Enhanced search functionality provides persistent query storage, while improved artist and playlist pages offer better user interactions and responsive design.

```mermaid
graph TB
Home["Home Page<br/>app/page.tsx"] --> API["External Music API<br/>lib/api.ts"]
Home --> Cards["Content Cards<br/>SongCard, ArtistCard, PlaylistCard, AlbumCard"]
Home --> Store["Player Store<br/>store/usePlayerStore.ts"]
Home --> Loader["Skeleton Loader<br/>components/SkeletonLoader.ts"]
Search["Search Page<br/>app/search/page.tsx"] --> API
Search --> InfiniteSearch["InfiniteSearchSection<br/>components/InfiniteSearchSection.tsx"]
Artist["Artist Page<br/>app/artist/[id]/page.tsx"] --> API
Artist --> InfiniteArtist["InfiniteArtistSection<br/>components/InfiniteArtistSection.tsx"]
Playlist["Playlist Page<br/>app/playlist/[id]/page.tsx"] --> API
Cards --> Store
Search --> Cards
Artist --> Cards
Playlist --> Cards
```

**Diagram sources**
- [app/page.tsx:34-203](file://app/page.tsx#L34-L203)
- [app/search/page.tsx:22-151](file://app/search/page.tsx#L22-L151)
- [app/artist/[id]/page.tsx:22-278](file://app/artist/[id]/page.tsx#L22-L278)
- [app/playlist/[id]/page.tsx:18-164](file://app/playlist/[id]/page.tsx#L18-L164)
- [lib/api.ts:37-83](file://lib/api.ts#L37-L83)
- [components/InfiniteArtistSection.tsx:21-126](file://components/InfiniteArtistSection.tsx#L21-L126)
- [components/InfiniteSearchSection.tsx:23-89](file://components/InfiniteSearchSection.tsx#L23-L89)
- [store/usePlayerStore.ts:43-127](file://store/usePlayerStore.ts#L43-L127)
- [components/SkeletonLoader.tsx:11-29](file://components/SkeletonLoader.tsx#L11-L29)

**Section sources**
- [app/page.tsx:34-203](file://app/page.tsx#L34-L203)
- [app/search/page.tsx:22-151](file://app/search/page.tsx#L22-L151)
- [app/artist/[id]/page.tsx:22-278](file://app/artist/[id]/page.tsx#L22-L278)
- [app/playlist/[id]/page.tsx:18-164](file://app/playlist/[id]/page.tsx#L18-L164)
- [lib/api.ts:37-83](file://lib/api.ts#L37-L83)
- [components/InfiniteArtistSection.tsx:21-126](file://components/InfiniteArtistSection.tsx#L21-L126)
- [components/InfiniteSearchSection.tsx:23-89](file://components/InfiniteSearchSection.tsx#L23-L89)
- [store/usePlayerStore.ts:43-127](file://store/usePlayerStore.ts#L43-L127)
- [components/SkeletonLoader.tsx:11-29](file://components/SkeletonLoader.tsx#L11-L29)

## Core Components
- Home page discovery pipeline:
  - Fetches trending songs, popular artists, and top playlists
  - Normalizes data and renders a hero carousel, mood chips, curated grid, artists grid, and playlists grid
- Enhanced search functionality:
  - Persistent query storage with localStorage and debouncing
  - Category browsing when no query is active
  - Tabbed interface for different content types
- Improved artist page:
  - 'Add to Queue' button for individual songs
  - Verified artist badges and enhanced hero section
  - Responsive design with better mobile experience
- Redesigned playlist page:
  - Enhanced responsive layout with grid improvements
  - Better track listing with improved hover states
  - Download functionality and queue management
- Shared API utilities:
  - Provides endpoint builders, fetcher, image and download URL helpers, duration formatter, and content normalization
- Infinite loaders:
  - Artist section supports infinite pagination for songs and albums
  - Search section supports infinite pagination for songs, albums, artists, and playlists
- Player store:
  - Manages playback state, queue, favorites, and recently played history
- Content cards:
  - Renderable UI components for songs, albums, artists, and playlists with interactive actions

**Section sources**
- [app/page.tsx:34-203](file://app/page.tsx#L34-L203)
- [app/search/page.tsx:22-151](file://app/search/page.tsx#L22-L151)
- [app/artist/[id]/page.tsx:22-278](file://app/artist/[id]/page.tsx#L22-L278)
- [app/playlist/[id]/page.tsx:18-164](file://app/playlist/[id]/page.tsx#L18-L164)
- [lib/api.ts:37-153](file://lib/api.ts#L37-L153)
- [components/InfiniteArtistSection.tsx:21-126](file://components/InfiniteArtistSection.tsx#L21-L126)
- [components/InfiniteSearchSection.tsx:23-89](file://components/InfiniteSearchSection.tsx#L23-L89)
- [store/usePlayerStore.ts:43-127](file://store/usePlayerStore.ts#L43-L127)
- [components/SongCard.tsx:22-139](file://components/SongCard.tsx#L22-L139)
- [components/ArtistCard.tsx:14-50](file://components/ArtistCard.tsx#L14-L50)
- [components/PlaylistCard.tsx:14-47](file://components/PlaylistCard.tsx#L14-L47)
- [components/AlbumCard.tsx:14-47](file://components/AlbumCard.tsx#L14-L47)

## Architecture Overview
The discovery system integrates with an external music API via a typed fetcher and endpoint builders. Data is normalized to a consistent shape, then rendered into responsive grids and carousels. Enhanced search functionality provides persistent query storage with debouncing, while improved artist and playlist pages offer better user interactions. Infinite loaders progressively fetch additional pages, deduplicate results, and provide load-more controls. The player store coordinates playback and user preferences.

```mermaid
sequenceDiagram
participant UI as "Enhanced Pages<br/>Search/Artist/Playlist"
participant API as "External Music API<br/>lib/api.ts"
participant Card as "Content Cards<br/>SongCard/ArtistCard/etc."
participant Store as "Player Store<br/>usePlayerStore.ts"
UI->>API : "fetcher(api.searchSongs/artist/playlist(...))"
API-->>UI : "Raw JSON response"
UI->>UI : "normalizeSong(...) for each item"
UI->>Card : "Render SongCard/ArtistCard/PlaylistCard"
Card->>Store : "setCurrentSong/setQueue/addToQueue/toggleFavorite"
Store-->>Card : "Playback state updates"
```

**Diagram sources**
- [app/search/page.tsx:32-51](file://app/search/page.tsx#L32-L51)
- [app/artist/[id]/page.tsx:234-240](file://app/artist/[id]/page.tsx#L234-L240)
- [app/playlist/[id]/page.tsx:131-136](file://app/playlist/[id]/page.tsx#L131-L136)
- [lib/api.ts:39-43](file://lib/api.ts#L39-L43)
- [lib/api.ts:92-152](file://lib/api.ts#L92-L152)
- [components/SongCard.tsx:30-57](file://components/SongCard.tsx#L30-L57)
- [store/usePlayerStore.ts:57-115](file://store/usePlayerStore.ts#L57-L115)

## Detailed Component Analysis

### Trending Carousel and Curated Recommendations
- Hero carousel:
  - Uses the first trending item as the hero with a prominent play action and gradient overlay
  - Integrates with the player store to set the current song and queue
- Curated grid:
  - Renders the remainder of trending items in a responsive grid
  - Uses skeleton loaders during initial fetch
- Data flow:
  - Queries trending songs, slices results, normalizes items, and passes to cards

```mermaid
flowchart TD
Start(["Home Page Mount"]) --> QueryTrending["Query trending songs"]
QueryTrending --> Normalize["Normalize trending items"]
Normalize --> Hero["Select hero item"]
Normalize --> Curated["Prepare curated grid items"]
Hero --> RenderHero["Render hero carousel"]
Curated --> RenderGrid["Render curated grid"]
RenderHero --> End(["Interactive"])
RenderGrid --> End
```

**Diagram sources**
- [app/page.tsx:38-55](file://app/page.tsx#L38-L55)
- [lib/api.ts:92-152](file://lib/api.ts#L92-L152)

**Section sources**
- [app/page.tsx:38-132](file://app/page.tsx#L38-L132)
- [lib/api.ts:92-152](file://lib/api.ts#L92-L152)

### Mood-Based Recommendations
- Mood chips:
  - Predefined moods mapped to external API queries
  - On click, navigates to the search page with the respective query
- Implementation pattern:
  - Chip label, icon, and query are defined centrally
  - Navigation uses Next.js routing

```mermaid
sequenceDiagram
participant User as "User"
participant Home as "Home Page<br/>app/page.tsx"
participant Router as "Next Router"
User->>Home : "Click mood chip"
Home->>Router : "router.push('/search?q=...')"
Router-->>User : "Navigate to search results"
```

**Diagram sources**
- [app/page.tsx:27-32](file://app/page.tsx#L27-L32)
- [app/page.tsx:138-147](file://app/page.tsx#L138-L147)

**Section sources**
- [app/page.tsx:27-32](file://app/page.tsx#L27-L32)
- [app/page.tsx:138-147](file://app/page.tsx#L138-L147)

### Popular Artists Showcase
- Fetch and render:
  - Queries popular artists and renders them in a responsive grid
  - Uses skeleton loaders during loading
- Interaction:
  - Clicking an artist navigates to the artist page

```mermaid
sequenceDiagram
participant UI as "Home Page"
participant API as "External API"
participant Card as "ArtistCard"
UI->>API : "fetcher(api.searchArtists(...))"
API-->>UI : "Artists JSON"
UI->>Card : "Render ArtistCard links"
Card-->>UI : "Navigation to artist page"
```

**Diagram sources**
- [app/page.tsx:43-46](file://app/page.tsx#L43-L46)
- [app/page.tsx:174-182](file://app/page.tsx#L174-L182)
- [components/ArtistCard.tsx:19-48](file://components/ArtistCard.tsx#L19-L48)

**Section sources**
- [app/page.tsx:43-46](file://app/page.tsx#L43-L46)
- [app/page.tsx:174-182](file://app/page.tsx#L174-L182)
- [components/ArtistCard.tsx:19-48](file://components/ArtistCard.tsx#L19-L48)

### Featured Playlists
- Fetch and render:
  - Queries top playlists and renders them in a responsive grid
  - Uses skeleton loaders during loading
- Interaction:
  - Clicking a playlist navigates to the playlist page

```mermaid
sequenceDiagram
participant UI as "Home Page"
participant API as "External API"
participant Card as "PlaylistCard"
UI->>API : "fetcher(api.searchPlaylists(...))"
API-->>UI : "Playlists JSON"
UI->>Card : "Render PlaylistCard links"
Card-->>UI : "Navigation to playlist page"
```

**Diagram sources**
- [app/page.tsx:48-51](file://app/page.tsx#L48-L51)
- [app/page.tsx:190-199](file://app/page.tsx#L190-L199)
- [components/PlaylistCard.tsx:14-47](file://components/PlaylistCard.tsx#L14-L47)

**Section sources**
- [app/page.tsx:48-51](file://app/page.tsx#L48-L51)
- [app/page.tsx:190-199](file://app/page.tsx#L190-L199)
- [components/PlaylistCard.tsx:14-47](file://components/PlaylistCard.tsx#L14-L47)

### Infinite Scrolling for Artist Sections
- Generic artist section component:
  - Accepts type (songs or albums), artist ID, and API endpoint builder
  - Extracts results from arbitrary response shapes
  - Deduplicates items by ID
  - Provides load-more button and skeleton loaders during fetching
- Pagination logic:
  - Uses getNextPageParam to compute the next page number
  - Enabled only when artistId is present

```mermaid
sequenceDiagram
participant Section as "InfiniteArtistSection"
participant API as "External API"
participant Extractor as "Result Extractor"
participant UI as "Grid + Load More"
Section->>API : "GET /artists/ : id/songs?page=N"
API-->>Section : "Response (shape varies)"
Section->>Extractor : "extractResults(response)"
Extractor-->>Section : "Normalized results[]"
Section->>UI : "Render items + skeletons"
UI->>Section : "Load More"
Section->>API : "GET next page"
API-->>Section : "Next batch"
Section->>Extractor : "extractResults(next)"
Extractor-->>Section : "Append + dedupe"
```

**Diagram sources**
- [components/InfiniteArtistSection.tsx:21-126](file://components/InfiniteArtistSection.tsx#L21-L126)
- [lib/api.ts:64-65](file://lib/api.ts#L64-L65)

**Section sources**
- [components/InfiniteArtistSection.tsx:21-126](file://components/InfiniteArtistSection.tsx#L21-L126)
- [lib/api.ts:64-65](file://lib/api.ts#L64-L65)

### Content Normalization from External APIs
- Purpose:
  - Standardizes inconsistent field names and structures returned by the external API
- Key transformations:
  - Ensures consistent song name/title, artist arrays, album objects, and image/download URLs
- Usage:
  - Applied to trending items and search results before rendering

```mermaid
flowchart TD
Raw["Raw API Response"] --> Normalize["normalizeSong(...)"]
Normalize --> Consistent["Consistent Song Shape"]
Consistent --> Render["Render Cards"]
```

**Diagram sources**
- [lib/api.ts:92-152](file://lib/api.ts#L92-L152)

**Section sources**
- [lib/api.ts:92-152](file://lib/api.ts#L92-L152)

### Player Integration and Engagement Metrics
- Playback actions:
  - Set current song and queue from discovery
  - Toggle favorite and manage recently played
- Engagement patterns:
  - Clicking a song card triggers play and queue updates
  - Like toggles update favorites and UI feedback
- Persistence:
  - Player store persists user preferences and history

```mermaid
sequenceDiagram
participant Card as "SongCard"
participant Store as "usePlayerStore"
participant UI as "UI Feedback"
Card->>Store : "setCurrentSong(song)"
Store-->>UI : "Highlight current + play"
Card->>Store : "toggleFavorite(songId)"
Store-->>UI : "Update heart icon + toast"
Card->>Store : "addToQueue(song)"
Store-->>UI : "Toast confirmation"
```

**Diagram sources**
- [components/SongCard.tsx:30-57](file://components/SongCard.tsx#L30-L57)
- [store/usePlayerStore.ts:57-115](file://store/usePlayerStore.ts#L57-L115)

**Section sources**
- [components/SongCard.tsx:30-57](file://components/SongCard.tsx#L30-L57)
- [store/usePlayerStore.ts:57-115](file://store/usePlayerStore.ts#L57-L115)

### Responsive Design Considerations
- Grid layouts:
  - Use responsive grid classes to adapt columns per breakpoint
- Skeleton loaders:
  - Provide consistent loading placeholders across devices
- Typography and spacing:
  - Adjust font sizes and padding for mobile and desktop

**Section sources**
- [app/page.tsx:58-200](file://app/page.tsx#L58-L200)
- [components/SkeletonLoader.tsx:11-29](file://components/SkeletonLoader.tsx#L11-L29)

## Enhanced Features

### Enhanced Search Functionality with Persistent Query Storage
- Persistent query storage:
  - Uses localStorage to save search queries with automatic cleanup
  - Debounces input changes to optimize API calls and reduce unnecessary requests
  - Loads saved queries on initial page load when no query parameter is present
- Category browsing:
  - Displays browse categories when no search query is active
  - Provides quick access to predefined music categories
- Tabbed interface:
  - Organizes search results by content type (Songs, Artists, Albums, Playlists)
  - Maintains separate pagination for each tab
- Implementation details:
  - SEARCH_STORAGE_KEY constant for localStorage persistence
  - 500ms debounce timer for query changes
  - Automatic cleanup of empty queries from localStorage

```mermaid
flowchart TD
Mount(["Search Page Mount"]) --> LoadSaved["Load Saved Query from localStorage"]
LoadSaved --> CheckParam{"Has URL Param?"}
CheckParam --> |Yes| UseParam["Use URL Query Parameter"]
CheckParam --> |No| UseSaved["Use Saved Query"]
UseParam --> SetState["Set Local State"]
UseSaved --> SetState
SetState --> Debounce["500ms Debounce Timer"]
Debounce --> UpdateQuery["Update Debounced Query"]
UpdateQuery --> SaveLocalStorage["Save to localStorage"]
SaveLocalStorage --> ShowResults["Show Search Results"]
```

**Diagram sources**
- [app/search/page.tsx:32-51](file://app/search/page.tsx#L32-L51)
- [app/search/page.tsx:20-28](file://app/search/page.tsx#L20-L28)

**Section sources**
- [app/search/page.tsx:20-51](file://app/search/page.tsx#L20-L51)
- [app/search/page.tsx:90-108](file://app/search/page.tsx#L90-L108)
- [app/search/page.tsx:112-138](file://app/search/page.tsx#L112-L138)

### Improved Artist Page with 'Add to Queue' Button
- Enhanced song interactions:
  - Individual 'Add to Queue' button for each song in the popular songs section
  - Toast notifications confirm successful queue additions
  - Hover states reveal action buttons for better discoverability
- Improved user experience:
  - Better visual feedback for currently playing songs
  - Enhanced hero section with verified artist badges
  - Responsive design improvements for mobile devices
- Implementation details:
  - handleAddToQueue function integrated into song card component
  - Queue management through usePlayerStore addToQueue action
  - Proper event propagation prevention to avoid unwanted navigation

```mermaid
sequenceDiagram
participant User as "User"
participant ArtistPage as "Artist Page"
participant SongCard as "SongCard"
participant Store as "usePlayerStore"
User->>ArtistPage : "View Popular Songs"
ArtistPage->>SongCard : "Render Song with Add to Queue Button"
User->>SongCard : "Click Add to Queue"
SongCard->>Store : "addToQueue(song)"
Store-->>SongCard : "Queue updated"
SongCard-->>User : "Toast notification : Added to queue"
```

**Diagram sources**
- [app/artist/[id]/page.tsx:234-240](file://app/artist/[id]/page.tsx#L234-L240)
- [components/SongCard.tsx:37-42](file://components/SongCard.tsx#L37-L42)
- [store/usePlayerStore.ts:69-74](file://store/usePlayerStore.ts#L69-L74)

**Section sources**
- [app/artist/[id]/page.tsx:206-249](file://app/artist/[id]/page.tsx#L206-L249)
- [components/SongCard.tsx:37-42](file://components/SongCard.tsx#L37-L42)
- [store/usePlayerStore.ts:69-74](file://store/usePlayerStore.ts#L69-L74)

### Redesigned Playlist Page with Better Responsive Design
- Enhanced responsive layout:
  - Improved grid system for track listings across different screen sizes
  - Better mobile-first design with optimized touch targets
  - Enhanced typography and spacing for readability
- Improved user interactions:
  - Better hover states for track actions (add to queue, download)
  - Enhanced visual feedback for currently playing tracks
  - Improved accessibility with proper focus states
- Implementation details:
  - Responsive grid classes adapted for different breakpoints
  - Enhanced skeleton loaders for better loading experience
  - Improved pagination with better loading indicators

```mermaid
flowchart TD
Load(["Playlist Page Load"]) --> CheckSize{"Screen Size?"}
CheckSize --> |Mobile| MobileLayout["Mobile Layout"]
CheckSize --> |Tablet| TabletLayout["Tablet Layout"]
CheckSize --> |Desktop| DesktopLayout["Desktop Layout"]
MobileLayout --> RenderMobile["Render Mobile Grid"]
TabletLayout --> RenderTablet["Render Tablet Grid"]
DesktopLayout --> RenderDesktop["Render Desktop Grid"]
RenderMobile --> Interactions["Enhanced Mobile Interactions"]
RenderTablet --> Interactions
RenderDesktop --> Interactions
Interactions --> End(["Optimized Experience"])
```

**Diagram sources**
- [app/playlist/[id]/page.tsx:101-140](file://app/playlist/[id]/page.tsx#L101-L140)
- [app/playlist/[id]/page.tsx:143-159](file://app/playlist/[id]/page.tsx#L143-L159)

**Section sources**
- [app/playlist/[id]/page.tsx:53-161](file://app/playlist/[id]/page.tsx#L53-L161)
- [app/playlist/[id]/page.tsx:101-140](file://app/playlist/[id]/page.tsx#L101-L140)
- [app/playlist/[id]/page.tsx:143-159](file://app/playlist/[id]/page.tsx#L143-L159)

## Dependency Analysis
- Home page depends on:
  - API utilities for endpoints and normalization
  - Cards for rendering
  - Player store for playback actions
- Enhanced search functionality depends on:
  - API utilities for endpoints and normalization
  - InfiniteSearchSection for paginated results
  - Player store for queue management
- Improved artist and playlist pages depend on:
  - API utilities for endpoints and normalization
  - Player store for queue management
  - Enhanced cards with improved interactions
- Infinite loaders depend on:
  - API utilities for endpoints
  - Cards for rendering
- Player store is a singleton used across components

```mermaid
graph LR
API["lib/api.ts"] --> Home["app/page.tsx"]
API --> Search["app/search/page.tsx"]
API --> Artist["app/artist/[id]/page.tsx"]
API --> Playlist["app/playlist/[id]/page.tsx"]
API --> ArtistSection["InfiniteArtistSection.tsx"]
API --> SearchSection["InfiniteSearchSection.tsx"]
Store["store/usePlayerStore.ts"] --> Home
Store --> Search
Store --> Artist
Store --> Playlist
Store --> SongCard["SongCard.tsx"]
Cards["Cards"] --> Home
Cards --> Search
Cards --> Artist
Cards --> Playlist
Loader["SkeletonLoader.tsx"] --> Home
Loader --> Search
Loader --> Artist
Loader --> Playlist
```

**Diagram sources**
- [lib/api.ts:37-83](file://lib/api.ts#L37-L83)
- [app/page.tsx:34-203](file://app/page.tsx#L34-L203)
- [app/search/page.tsx:22-151](file://app/search/page.tsx#L22-L151)
- [app/artist/[id]/page.tsx:22-278](file://app/artist/[id]/page.tsx#L22-L278)
- [app/playlist/[id]/page.tsx:18-164](file://app/playlist/[id]/page.tsx#L18-L164)
- [components/InfiniteArtistSection.tsx:21-126](file://components/InfiniteArtistSection.tsx#L21-L126)
- [components/InfiniteSearchSection.tsx:23-89](file://components/InfiniteSearchSection.tsx#L23-L89)
- [store/usePlayerStore.ts:43-127](file://store/usePlayerStore.ts#L43-L127)
- [components/SkeletonLoader.tsx:11-29](file://components/SkeletonLoader.tsx#L11-L29)

**Section sources**
- [lib/api.ts:37-83](file://lib/api.ts#L37-L83)
- [app/page.tsx:34-203](file://app/page.tsx#L34-L203)
- [app/search/page.tsx:22-151](file://app/search/page.tsx#L22-L151)
- [app/artist/[id]/page.tsx:22-278](file://app/artist/[id]/page.tsx#L22-L278)
- [app/playlist/[id]/page.tsx:18-164](file://app/playlist/[id]/page.tsx#L18-L164)
- [components/InfiniteArtistSection.tsx:21-126](file://components/InfiniteArtistSection.tsx#L21-L126)
- [components/InfiniteSearchSection.tsx:23-89](file://components/InfiniteSearchSection.tsx#L23-L89)
- [store/usePlayerStore.ts:43-127](file://store/usePlayerStore.ts#L43-L127)
- [components/SkeletonLoader.tsx:11-29](file://components/SkeletonLoader.tsx#L11-L29)

## Performance Considerations
- Lazy loading and skeleton placeholders:
  - Use skeleton loaders during initial fetch and while loading more items
- Efficient pagination:
  - Compute next page param based on received results length
- Deduplication:
  - Remove duplicates by ID before rendering
- Image optimization:
  - Prefer high-quality image URLs and fallbacks
- Minimal re-renders:
  - Memoize extracted results and derived lists
- Caching:
  - React Query caches responses by query key; leverage existing cache keys for trending, artists, and playlists
- Enhanced search performance:
  - Debounced query changes reduce API calls
  - Persistent query storage improves user experience
- Queue management:
  - Optimized queue operations prevent unnecessary re-renders
  - Efficient queue merging for user and default queues

**Section sources**
- [components/InfiniteArtistSection.tsx:72-84](file://components/InfiniteArtistSection.tsx#L72-L84)
- [components/InfiniteArtistSection.tsx:63-70](file://components/InfiniteArtistSection.tsx#L63-L70)
- [lib/api.ts:71-83](file://lib/api.ts#L71-L83)
- [app/page.tsx:98-100](file://app/page.tsx#L98-L100)
- [app/page.tsx:158-160](file://app/page.tsx#L158-L160)
- [app/page.tsx:190-192](file://app/page.tsx#L190-L192)
- [app/search/page.tsx:42-51](file://app/search/page.tsx#L42-L51)
- [store/usePlayerStore.ts:69-74](file://store/usePlayerStore.ts#L69-L74)

## Troubleshooting Guide
- Empty or missing images:
  - Fallback image URL is used when no image is provided
- Inconsistent API response shapes:
  - Result extraction logic attempts multiple keys and nested structures
- No data after loading:
  - Components return null when no data is available and loading is complete
- Authentication-required actions:
  - Favorite and add-to-playlist actions trigger an auth modal if unauthenticated
- Search query persistence issues:
  - Verify localStorage availability and proper key usage
  - Check debounce timing and query validation
- Queue management problems:
  - Ensure proper queue state management in usePlayerStore
  - Verify addToQueue function implementation

**Section sources**
- [lib/api.ts:71-83](file://lib/api.ts#L71-L83)
- [components/InfiniteArtistSection.tsx:22-48](file://components/InfiniteArtistSection.tsx#L22-L48)
- [components/InfiniteArtistSection.tsx:86-87](file://components/InfiniteArtistSection.tsx#L86-L87)
- [components/SongCard.tsx:50-57](file://components/SongCard.tsx#L50-L57)
- [app/search/page.tsx:32-51](file://app/search/page.tsx#L32-L51)
- [store/usePlayerStore.ts:69-74](file://store/usePlayerStore.ts#L69-L74)

## Conclusion
The discovery feature combines a trending hero, mood-driven navigation, curated grids, and infinite loaders to deliver a seamless, responsive music exploration experience. Recent enhancements include persistent search functionality with query storage, improved artist page interactions with 'Add to Queue' capabilities, and redesigned playlist pages with better responsive design. Robust normalization ensures consistent rendering, while the player store and engagement actions integrate deeply with user interactions. Performance is optimized through skeleton loaders, deduplication, efficient pagination, and enhanced search debouncing.

## Appendices

### API Definitions and Endpoints
- Endpoint builders:
  - Search routes for songs, albums, artists, playlists
  - Song routes for details and suggestions
  - Artist routes for details, songs, and albums
  - Playlist routes for details
- Fetcher:
  - Centralized fetcher with error handling
- Helpers:
  - High-quality image and download URL selection
  - Duration formatting
  - Content normalization

**Section sources**
- [lib/api.ts:45-69](file://lib/api.ts#L45-L69)
- [lib/api.ts:39-43](file://lib/api.ts#L39-L43)
- [lib/api.ts:71-90](file://lib/api.ts#L71-L90)
- [lib/api.ts:92-152](file://lib/api.ts#L92-L152)

### Recommendation Algorithms and Patterns
- Trending carousel:
  - Uses the platform's trending endpoint and selects the top result as hero
- Mood-based:
  - Maps predefined moods to external queries
- Curated grid:
  - Renders normalized trending items after the hero
- Artist and search infinite loaders:
  - Paginates results and deduplicates entries
- Enhanced search:
  - Implements persistent query storage with debouncing
  - Provides category browsing when no query is active

**Section sources**
- [app/page.tsx:38-55](file://app/page.tsx#L38-L55)
- [app/page.tsx:27-32](file://app/page.tsx#L27-L32)
- [components/InfiniteArtistSection.tsx:22-84](file://components/InfiniteArtistSection.tsx#L22-L84)
- [components/InfiniteSearchSection.tsx:38-44](file://components/InfiniteSearchSection.tsx#L38-L44)
- [app/search/page.tsx:20-51](file://app/search/page.tsx#L20-L51)

### Enhanced Feature Implementation Details
- Search query persistence:
  - localStorage integration with automatic cleanup
  - 500ms debounce timer for optimal performance
  - URL parameter precedence over saved queries
- Artist page improvements:
  - Individual song queue management
  - Enhanced visual feedback for interactions
  - Improved responsive design
- Playlist page redesign:
  - Better grid responsiveness
  - Enhanced mobile touch targets
  - Improved loading states

**Section sources**
- [app/search/page.tsx:20-51](file://app/search/page.tsx#L20-L51)
- [app/artist/[id]/page.tsx:234-240](file://app/artist/[id]/page.tsx#L234-L240)
- [app/playlist/[id]/page.tsx:101-140](file://app/playlist/[id]/page.tsx#L101-L140)