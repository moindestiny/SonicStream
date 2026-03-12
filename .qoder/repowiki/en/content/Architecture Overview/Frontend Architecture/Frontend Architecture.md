# Frontend Architecture

<cite>
**Referenced Files in This Document**
- [app/layout.tsx](file://app/layout.tsx)
- [components/QueryProvider.tsx](file://components/QueryProvider.tsx)
- [components/ThemeProvider.tsx](file://components/ThemeProvider.tsx)
- [components/Sidebar.tsx](file://components/Sidebar.tsx)
- [components/Player.tsx](file://components/Player.tsx)
- [store/usePlayerStore.ts](file://store/usePlayerStore.ts)
- [lib/api.ts](file://lib/api.ts)
- [components/AlbumCard.tsx](file://components/AlbumCard.tsx)
- [components/PlaylistCard.tsx](file://components/PlaylistCard.tsx)
- [components/SongCard.tsx](file://components/SongCard.tsx)
- [components/InfiniteSearchSection.tsx](file://components/InfiniteSearchSection.tsx)
- [app/search/page.tsx](file://app/search/page.tsx)
- [hooks/use-mobile.ts](file://hooks/use-mobile.ts)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction
This document describes the frontend architecture of SonicStream’s React-based interface built with Next.js App Router. It covers file-based routing, dynamic routes for content discovery, page component organization, component hierarchy from RootLayout down to reusable cards, provider pattern for global state and theming, component composition patterns, prop interfaces, state management integration, responsive design, animation systems, accessibility considerations, lifecycle and performance optimization via code splitting, and integration with external APIs.

## Project Structure
The application uses Next.js App Router with file-based routing. Pages are organized under app/, with dynamic routes using square brackets (e.g., [id]). Shared UI is centralized under components/, state management under store/, and shared utilities under lib/. Providers wrap the app shell to supply React Query and theme contexts.

```mermaid
graph TB
subgraph "App Shell"
L["RootLayout<br/>app/layout.tsx"]
QP["QueryProvider<br/>components/QueryProvider.tsx"]
TP["ThemeProvider<br/>components/ThemeProvider.tsx"]
end
subgraph "UI"
SB["Sidebar<br/>components/Sidebar.tsx"]
PL["Player<br/>components/Player.tsx"]
SC["SongCard<br/>components/SongCard.tsx"]
AC["AlbumCard<br/>components/AlbumCard.tsx"]
PC["PlaylistCard<br/>components/PlaylistCard.tsx"]
end
subgraph "State"
ZS["Zustand Store<br/>store/usePlayerStore.ts"]
end
subgraph "Routing"
P1["Search Page<br/>app/search/page.tsx"]
DYN["Dynamic Routes<br/>app/album[Id]/page.tsx<br/>app/artist[Id]/page.tsx<br/>app/song[Id]/page.tsx"]
end
subgraph "External"
API["External API<br/>lib/api.ts"]
end
L --> QP --> TP --> SB
TP --> PL
TP --> SC
TP --> AC
TP --> PC
PL --> ZS
SC --> ZS
AC --> API
PC --> API
P1 --> API
DYN --> API
```

**Diagram sources**
- [app/layout.tsx:21-48](file://app/layout.tsx#L21-L48)
- [components/QueryProvider.tsx:6-25](file://components/QueryProvider.tsx#L6-L25)
- [components/ThemeProvider.tsx:21-44](file://components/ThemeProvider.tsx#L21-L44)
- [components/Sidebar.tsx:19-106](file://components/Sidebar.tsx#L19-L106)
- [components/Player.tsx:19-250](file://components/Player.tsx#L19-L250)
- [store/usePlayerStore.ts:43-127](file://store/usePlayerStore.ts#L43-L127)
- [components/AlbumCard.tsx:14-47](file://components/AlbumCard.tsx#L14-L47)
- [components/PlaylistCard.tsx:14-47](file://components/PlaylistCard.tsx#L14-L47)
- [components/SongCard.tsx:22-139](file://components/SongCard.tsx#L22-L139)
- [app/search/page.tsx:20-120](file://app/search/page.tsx#L20-L120)
- [lib/api.ts:37-83](file://lib/api.ts#L37-L83)

**Section sources**
- [app/layout.tsx:1-49](file://app/layout.tsx#L1-L49)
- [components/QueryProvider.tsx:1-26](file://components/QueryProvider.tsx#L1-L26)
- [components/ThemeProvider.tsx:1-45](file://components/ThemeProvider.tsx#L1-L45)

## Core Components
- RootLayout orchestrates providers and renders the sidebar, page content, and player. It sets up fonts, theme attributes, and persistent UI spacers.
- QueryProvider configures React Query defaults (staleTime, refetchOnWindowFocus, retry) and wraps children.
- ThemeProvider manages theme state, persists to localStorage, and exposes a context for toggling themes.
- Sidebar provides desktop floating dock and mobile bottom dock navigation, with theme toggle and active-state styling.
- Player handles audio playback, keyboard shortcuts, progress seeking, queue panel, favorites, and downloads. Integrates with Zustand store.
- Card components encapsulate media item presentation and actions (play, queue, like, download, add to playlist).
- Zustand store centralizes player state, queue, favorites, and user data with persistence.
- API module defines typed Song interface, external endpoints, and helpers for images/downloads/duration normalization.

**Section sources**
- [app/layout.tsx:21-48](file://app/layout.tsx#L21-L48)
- [components/QueryProvider.tsx:6-25](file://components/QueryProvider.tsx#L6-L25)
- [components/ThemeProvider.tsx:21-44](file://components/ThemeProvider.tsx#L21-L44)
- [components/Sidebar.tsx:19-106](file://components/Sidebar.tsx#L19-L106)
- [components/Player.tsx:19-250](file://components/Player.tsx#L19-L250)
- [components/AlbumCard.tsx:14-47](file://components/AlbumCard.tsx#L14-L47)
- [components/PlaylistCard.tsx:14-47](file://components/PlaylistCard.tsx#L14-L47)
- [components/SongCard.tsx:22-139](file://components/SongCard.tsx#L22-L139)
- [store/usePlayerStore.ts:43-127](file://store/usePlayerStore.ts#L43-L127)
- [lib/api.ts:1-153](file://lib/api.ts#L1-L153)

## Architecture Overview
The app uses a layered provider pattern:
- RootLayout composes QueryProvider and ThemeProvider around the entire app.
- Sidebar and Player are always visible; Sidebar provides navigation and theme switching; Player provides playback controls and queue.
- Page components (e.g., Search) render content and compose reusable cards.
- Cards integrate with Zustand store for playback and user actions.
- External API integration is centralized in lib/api.ts with typed Song interface and helper functions.

```mermaid
graph TB
RL["RootLayout"] --> QP["QueryProvider"]
QP --> TP["ThemeProvider"]
TP --> SB["Sidebar"]
TP --> PL["Player"]
TP --> PG["Pages (e.g., Search)"]
PG --> IS["InfiniteSearchSection"]
IS --> SC["SongCard"]
IS --> AC["AlbumCard"]
IS --> PC["PlaylistCard"]
PL --> ZS["usePlayerStore"]
SC --> ZS
AC --> API["lib/api.ts"]
PC --> API
IS --> API
ZS --> API
```

**Diagram sources**
- [app/layout.tsx:21-48](file://app/layout.tsx#L21-L48)
- [components/QueryProvider.tsx:6-25](file://components/QueryProvider.tsx#L6-L25)
- [components/ThemeProvider.tsx:21-44](file://components/ThemeProvider.tsx#L21-L44)
- [components/Sidebar.tsx:19-106](file://components/Sidebar.tsx#L19-L106)
- [components/Player.tsx:19-250](file://components/Player.tsx#L19-L250)
- [components/InfiniteSearchSection.tsx:23-89](file://components/InfiniteSearchSection.tsx#L23-L89)
- [components/SongCard.tsx:22-139](file://components/SongCard.tsx#L22-L139)
- [components/AlbumCard.tsx:14-47](file://components/AlbumCard.tsx#L14-L47)
- [components/PlaylistCard.tsx:14-47](file://components/PlaylistCard.tsx#L14-L47)
- [store/usePlayerStore.ts:43-127](file://store/usePlayerStore.ts#L43-L127)
- [lib/api.ts:37-83](file://lib/api.ts#L37-L83)

## Detailed Component Analysis

### Provider Pattern: QueryProvider and ThemeProvider
- QueryProvider initializes a React Query client with default caching and retry behavior and exposes a provider context.
- ThemeProvider manages theme state, applies data-theme to html, persists to localStorage, and exposes a toggle function via context.

```mermaid
classDiagram
class QueryProvider {
+children : ReactNode
+client : QueryClient
}
class ThemeProvider {
+children : ReactNode
+theme : "dark"|"light"
+toggleTheme() : void
}
class ThemeContext {
+theme : "dark"|"light"
+toggleTheme() : void
}
QueryProvider --> "wraps" ReactQueryClientProvider
ThemeProvider --> ThemeContext
```

**Diagram sources**
- [components/QueryProvider.tsx:6-25](file://components/QueryProvider.tsx#L6-L25)
- [components/ThemeProvider.tsx:21-44](file://components/ThemeProvider.tsx#L21-L44)

**Section sources**
- [components/QueryProvider.tsx:6-25](file://components/QueryProvider.tsx#L6-L25)
- [components/ThemeProvider.tsx:21-44](file://components/ThemeProvider.tsx#L21-L44)

### RootLayout Composition and Routing
- RootLayout sets metadata, font, and theme attributes. It composes providers, renders Sidebar and Player, and passes page children. It also adds a bottom spacer to avoid content clipping by the fixed player and mobile navbar.

```mermaid
sequenceDiagram
participant Browser as "Browser"
participant Layout as "RootLayout"
participant Providers as "Providers"
participant Sidebar as "Sidebar"
participant Page as "Page Children"
participant Player as "Player"
Browser->>Layout : Render app shell
Layout->>Providers : Wrap children
Providers->>Sidebar : Render navigation
Providers->>Page : Render current route
Providers->>Player : Render playback controls
```

**Diagram sources**
- [app/layout.tsx:21-48](file://app/layout.tsx#L21-L48)
- [components/Sidebar.tsx:19-106](file://components/Sidebar.tsx#L19-L106)
- [components/Player.tsx:19-250](file://components/Player.tsx#L19-L250)

**Section sources**
- [app/layout.tsx:21-48](file://app/layout.tsx#L21-L48)

### Sidebar Navigation and Theming
- Sidebar renders a desktop floating dock and a mobile bottom dock. It computes active state based on pathname and integrates with ThemeProvider to toggle themes.

```mermaid
flowchart TD
Start(["Render Sidebar"]) --> GetPath["Read pathname"]
GetPath --> ComputeActive["Compute active nav item"]
ComputeActive --> RenderDesktop["Render desktop dock"]
ComputeActive --> RenderMobile["Render mobile dock"]
RenderDesktop --> ThemeToggle["Bind theme toggle"]
RenderMobile --> ThemeToggle
ThemeToggle --> Persist["Persist theme to localStorage"]
Persist --> End(["Done"])
```

**Diagram sources**
- [components/Sidebar.tsx:19-106](file://components/Sidebar.tsx#L19-L106)
- [components/ThemeProvider.tsx:21-44](file://components/ThemeProvider.tsx#L21-L44)

**Section sources**
- [components/Sidebar.tsx:19-106](file://components/Sidebar.tsx#L19-L106)
- [components/ThemeProvider.tsx:21-44](file://components/ThemeProvider.tsx#L21-L44)

### Player Controls and State Integration
- Player manages audio lifecycle, keyboard shortcuts, progress, volume, favorites, and queue. It integrates with Zustand store and uses animations for queue panel and album art transitions.

```mermaid
sequenceDiagram
participant User as "User"
participant Player as "Player"
participant Store as "usePlayerStore"
participant Audio as "HTMLAudioElement"
participant API as "lib/api.ts"
User->>Player : Click play/pause
Player->>Store : togglePlay()
Store-->>Player : isPlaying state
Player->>Audio : play()/pause()
User->>Player : Seek progress
Player->>Audio : set currentTime
User->>Player : Like song
Player->>Store : toggleFavorite(songId)
Store-->>Player : favorites state
Player->>API : Trigger external like endpoint
```

**Diagram sources**
- [components/Player.tsx:19-250](file://components/Player.tsx#L19-L250)
- [store/usePlayerStore.ts:43-127](file://store/usePlayerStore.ts#L43-L127)
- [lib/api.ts:37-83](file://lib/api.ts#L37-L83)

**Section sources**
- [components/Player.tsx:19-250](file://components/Player.tsx#L19-L250)
- [store/usePlayerStore.ts:43-127](file://store/usePlayerStore.ts#L43-L127)
- [lib/api.ts:37-83](file://lib/api.ts#L37-L83)

### Reusable Card Components and Composition Patterns
- SongCard, AlbumCard, and PlaylistCard accept props and render media items with hover actions and links to detail pages. They use Motion for hover animations and integrate with the player store for playback and queue actions.

```mermaid
classDiagram
class SongCard {
+song : Song
+queue? : Song[]
+handlePlay()
+handleAddToQueue()
+handleLike()
+handleDownload()
+handleAddPlaylist()
}
class AlbumCard {
+album : any
}
class PlaylistCard {
+playlist : any
}
SongCard --> "uses" usePlayerStore
SongCard --> "opens" AddToPlaylistModal
SongCard --> "opens" AuthModal
```

**Diagram sources**
- [components/SongCard.tsx:17-139](file://components/SongCard.tsx#L17-L139)
- [components/AlbumCard.tsx:10-47](file://components/AlbumCard.tsx#L10-L47)
- [components/PlaylistCard.tsx:10-47](file://components/PlaylistCard.tsx#L10-L47)
- [store/usePlayerStore.ts:43-127](file://store/usePlayerStore.ts#L43-L127)

**Section sources**
- [components/SongCard.tsx:17-139](file://components/SongCard.tsx#L17-L139)
- [components/AlbumCard.tsx:10-47](file://components/AlbumCard.tsx#L10-L47)
- [components/PlaylistCard.tsx:10-47](file://components/PlaylistCard.tsx#L10-L47)
- [store/usePlayerStore.ts:43-127](file://store/usePlayerStore.ts#L43-L127)

### Dynamic Routes and Content Discovery
- Dynamic routes under app/album[id], app/artist[id], app/song[id] enable content discovery. The Search page composes InfiniteSearchSection to load paginated results and render cards.

```mermaid
sequenceDiagram
participant User as "User"
participant Search as "Search Page"
participant Infinite as "InfiniteSearchSection"
participant API as "External API"
participant Cards as "Cards"
User->>Search : Enter query
Search->>Infinite : Pass query and endpoint
Infinite->>API : Fetch page N
API-->>Infinite : Results
Infinite->>Cards : Render Song/Album/Artist/Playlist cards
User->>Cards : Click item -> navigate to [id] route
```

**Diagram sources**
- [app/search/page.tsx:20-120](file://app/search/page.tsx#L20-L120)
- [components/InfiniteSearchSection.tsx:23-89](file://components/InfiniteSearchSection.tsx#L23-L89)
- [lib/api.ts:37-83](file://lib/api.ts#L37-L83)

**Section sources**
- [app/search/page.tsx:20-120](file://app/search/page.tsx#L20-L120)
- [components/InfiniteSearchSection.tsx:23-89](file://components/InfiniteSearchSection.tsx#L23-L89)
- [lib/api.ts:37-83](file://lib/api.ts#L37-L83)

## Dependency Analysis
- RootLayout depends on QueryProvider and ThemeProvider, which wrap Sidebar and Player.
- Player and SongCard depend on Zustand store for playback state and user actions.
- Cards depend on lib/api.ts for image and download URLs and Song typing.
- Search page depends on InfiniteSearchSection and lib/api.ts for infinite loading and rendering.

```mermaid
graph LR
RL["RootLayout"] --> QP["QueryProvider"]
RL --> TP["ThemeProvider"]
TP --> SB["Sidebar"]
TP --> PL["Player"]
TP --> IS["InfiniteSearchSection"]
PL --> ZS["usePlayerStore"]
SC["SongCard"] --> ZS
IS --> API["lib/api.ts"]
AC["AlbumCard"] --> API
PC["PlaylistCard"] --> API
```

**Diagram sources**
- [app/layout.tsx:21-48](file://app/layout.tsx#L21-L48)
- [components/QueryProvider.tsx:6-25](file://components/QueryProvider.tsx#L6-L25)
- [components/ThemeProvider.tsx:21-44](file://components/ThemeProvider.tsx#L21-L44)
- [components/Sidebar.tsx:19-106](file://components/Sidebar.tsx#L19-L106)
- [components/Player.tsx:19-250](file://components/Player.tsx#L19-L250)
- [components/InfiniteSearchSection.tsx:23-89](file://components/InfiniteSearchSection.tsx#L23-L89)
- [components/SongCard.tsx:22-139](file://components/SongCard.tsx#L22-L139)
- [components/AlbumCard.tsx:14-47](file://components/AlbumCard.tsx#L14-L47)
- [components/PlaylistCard.tsx:14-47](file://components/PlaylistCard.tsx#L14-L47)
- [store/usePlayerStore.ts:43-127](file://store/usePlayerStore.ts#L43-L127)
- [lib/api.ts:37-83](file://lib/api.ts#L37-L83)

**Section sources**
- [app/layout.tsx:21-48](file://app/layout.tsx#L21-L48)
- [components/QueryProvider.tsx:6-25](file://components/QueryProvider.tsx#L6-L25)
- [components/ThemeProvider.tsx:21-44](file://components/ThemeProvider.tsx#L21-L44)
- [components/Player.tsx:19-250](file://components/Player.tsx#L19-L250)
- [components/InfiniteSearchSection.tsx:23-89](file://components/InfiniteSearchSection.tsx#L23-L89)
- [store/usePlayerStore.ts:43-127](file://store/usePlayerStore.ts#L43-L127)
- [lib/api.ts:37-83](file://lib/api.ts#L37-L83)

## Performance Considerations
- Code splitting: Next.js file-based routing naturally splits pages; Suspense boundaries in Search page improve perceived performance during hydration and fetching.
- Infinite scrolling: InfiniteSearchSection uses React Query’s infinite query to paginate results efficiently.
- Animations: Motion components are used for hover and transitions; keep animations minimal on lower-end devices.
- Images: getHighQualityImage ensures fallbacks and lazy loading via Next/Image; avoid unnecessary re-renders by passing memoized props.
- Audio: Player manages a single audio element and updates src/volume/seek only when needed.
- Persistence: Zustand persist middleware reduces redundant network requests by retaining user preferences locally.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
- Hydration mismatch: RootLayout uses suppressHydrationWarning to avoid mismatches between server-rendered and client-mounted providers. Ensure providers are client components and theme initialization is guarded.
- Theme persistence: ThemeProvider reads localStorage on mount; verify localStorage availability and correct data-theme attribute application.
- Player audio errors: Player catches play promise rejections; check CORS for external audio URLs and ensure downloadUrl is present.
- Infinite query: If pagination stops unexpectedly, verify nextPageParam logic and PAGE_SIZE alignment with backend responses.
- Accessibility: Sidebar buttons include aria-labels; ensure interactive elements have proper focus styles and keyboard navigation support.

**Section sources**
- [app/layout.tsx:21-48](file://app/layout.tsx#L21-L48)
- [components/ThemeProvider.tsx:25-35](file://components/ThemeProvider.tsx#L25-L35)
- [components/Player.tsx:33-45](file://components/Player.tsx#L33-L45)
- [components/InfiniteSearchSection.tsx:38-44](file://components/InfiniteSearchSection.tsx#L38-L44)

## Conclusion
SonicStream’s frontend leverages Next.js App Router for structured routing, a robust provider pattern for state and theming, and a cohesive set of reusable UI components. The architecture balances performance with rich interactions, supports dynamic content discovery, and integrates seamlessly with external APIs. The combination of React Query, Zustand, and Motion delivers a responsive and accessible music streaming experience.