# Audio Player

<cite>
**Referenced Files in This Document**
- [Player.tsx](file://components/Player.tsx)
- [FullPlayer.tsx](file://components/FullPlayer.tsx)
- [usePlayerStore.ts](file://store/usePlayerStore.ts)
- [downloadSong.ts](file://lib/downloadSong.ts)
- [route.ts](file://app/api/queue/route.ts)
- [api.ts](file://lib/api.ts)
- [db.ts](file://lib/db.ts)
- [schema.prisma](file://prisma/schema.prisma)
- [useAuthGuard.ts](file://hooks/useAuthGuard.ts)
- [use-mobile.ts](file://hooks/use-mobile.ts)
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
This document describes the advanced audio player system, covering controls (play/pause, skip forward/backward, volume, shuffle, repeat), queue management with persistent storage, full-screen player, keyboard shortcuts, downloads, Zustand state store integration, audio element management, progress tracking, seek functionality, playback state synchronization, responsive design, accessibility, performance, and error handling.

## Project Structure
The audio player spans UI components, a state store, utilities, and server-side queue persistence:
- UI components: compact mini-player and full-screen player
- State store: centralized playback state with persistence
- Utilities: download orchestration, API helpers, and auth gating
- Backend: queue CRUD endpoints backed by Prisma ORM and PostgreSQL

```mermaid
graph TB
subgraph "UI"
P["Player.tsx"]
FP["FullPlayer.tsx"]
end
subgraph "State"
ZS["usePlayerStore.ts"]
end
subgraph "Utilities"
DS["downloadSong.ts"]
API["api.ts"]
GA["useAuthGuard.ts"]
UM["use-mobile.ts"]
end
subgraph "Server"
QAPI["app/api/queue/route.ts"]
PRISMA["prisma/schema.prisma"]
DB["lib/db.ts"]
end
P --> ZS
FP --> ZS
P --> DS
FP --> DS
P --> GA
FP --> GA
P --> API
FP --> API
ZS --> QAPI
QAPI --> DB
DB --> PRISMA
```

**Diagram sources**
- [Player.tsx:1-251](file://components/Player.tsx#L1-L251)
- [FullPlayer.tsx:1-243](file://components/FullPlayer.tsx#L1-L243)
- [usePlayerStore.ts:1-128](file://store/usePlayerStore.ts#L1-L128)
- [downloadSong.ts:1-42](file://lib/downloadSong.ts#L1-L42)
- [api.ts:1-153](file://lib/api.ts#L1-L153)
- [useAuthGuard.ts:1-29](file://hooks/useAuthGuard.ts#L1-L29)
- [use-mobile.ts:1-20](file://hooks/use-mobile.ts#L1-L20)
- [route.ts:1-86](file://app/api/queue/route.ts#L1-L86)
- [db.ts:1-10](file://lib/db.ts#L1-L10)
- [schema.prisma:1-111](file://prisma/schema.prisma#L1-L111)

**Section sources**
- [Player.tsx:1-251](file://components/Player.tsx#L1-L251)
- [FullPlayer.tsx:1-243](file://components/FullPlayer.tsx#L1-L243)
- [usePlayerStore.ts:1-128](file://store/usePlayerStore.ts#L1-L128)
- [downloadSong.ts:1-42](file://lib/downloadSong.ts#L1-L42)
- [api.ts:1-153](file://lib/api.ts#L1-L153)
- [useAuthGuard.ts:1-29](file://hooks/useAuthGuard.ts#L1-L29)
- [use-mobile.ts:1-20](file://hooks/use-mobile.ts#L1-L20)
- [route.ts:1-86](file://app/api/queue/route.ts#L1-L86)
- [db.ts:1-10](file://lib/db.ts#L1-L10)
- [schema.prisma:1-111](file://prisma/schema.prisma#L1-L111)

## Core Components
- Player (mini-player): renders playback controls, progress bar, queue panel, and downloads; integrates with the audio element and keyboard shortcuts.
- FullPlayer (full-screen): expanded controls, seek bar, volume slider, “Up Next” suggestions, and actions.
- Zustand store: manages current song, queue, playback state, shuffle/repeat, favorites, and persistence.
- Queue API: server endpoints to fetch, add, clear, and remove queue items per user.
- Download utility: orchestrates fetching audio and triggering browser downloads.
- Utilities: API helpers for images, durations, and normalization; auth gating hook; mobile detection.

**Section sources**
- [Player.tsx:19-251](file://components/Player.tsx#L19-L251)
- [FullPlayer.tsx:22-243](file://components/FullPlayer.tsx#L22-L243)
- [usePlayerStore.ts:12-128](file://store/usePlayerStore.ts#L12-L128)
- [route.ts:4-86](file://app/api/queue/route.ts#L4-L86)
- [downloadSong.ts:8-42](file://lib/downloadSong.ts#L8-L42)
- [api.ts:73-90](file://lib/api.ts#L73-L90)
- [useAuthGuard.ts:12-29](file://hooks/useAuthGuard.ts#L12-L29)
- [use-mobile.ts:5-19](file://hooks/use-mobile.ts#L5-L19)

## Architecture Overview
The player architecture combines a client-side state store with server-backed queue persistence and UI components that synchronize playback state via an HTMLAudioElement.

```mermaid
sequenceDiagram
participant UI as "Player/FullPlayer"
participant Store as "usePlayerStore"
participant Audio as "HTMLAudioElement"
participant API as "Queue API"
participant DB as "PostgreSQL"
UI->>Store : "togglePlay(), playNext(), playPrevious()"
Store->>Audio : "play()/pause(), currentTime, volume"
Audio-->>UI : "onTimeUpdate(), onLoadedMetadata(), onEnded()"
UI->>Store : "setCurrentSong(), setQueue(), toggleShuffle(), setRepeatMode()"
UI->>API : "GET/POST/DELETE queue (userId)"
API->>DB : "CRUD queue items"
DB-->>API : "queue rows"
API-->>UI : "queue payload"
```

**Diagram sources**
- [Player.tsx:33-61](file://components/Player.tsx#L33-L61)
- [FullPlayer.tsx:34-51](file://components/FullPlayer.tsx#L34-L51)
- [usePlayerStore.ts:70-99](file://store/usePlayerStore.ts#L70-L99)
- [route.ts:4-86](file://app/api/queue/route.ts#L4-L86)

## Detailed Component Analysis

### Player (Mini-Player)
Responsibilities:
- Manage audio element lifecycle and events (load, play/pause, time update, ended).
- Synchronize UI with playback state (progress, duration, volume, mute).
- Keyboard shortcuts for play/pause, seek, volume, and mute.
- Queue panel overlay with remove-from-queue and selection.
- Download button and like/favorite with auth gating.
- Full-screen player trigger.

Key behaviors:
- Audio initialization and playback control are handled via refs and effects.
- Progress calculation uses currentTime/duration.
- Repeat mode cycles among none/all/one; special indicator shown for one-repeat.
- Shuffle toggles random selection in queue progression.
- Queue panel shows queue items and allows removal.

```mermaid
flowchart TD
Start(["Render Player"]) --> InitAudio["Set audio src<br/>Play/Pause on isPlaying change"]
InitAudio --> Events["Attach onTimeUpdate/onLoadedMetadata/onEnded"]
Events --> Progress["Compute progress (%)"]
Progress --> Controls{"User presses control?"}
Controls --> |Play/Pause| TogglePlay["togglePlay()"]
Controls --> |Skip Forward| Next["playNext()"]
Controls --> |Skip Backward| Prev["playPrevious()"]
Controls --> |Seek| Seek["handleSeek(time)"]
Controls --> |Volume| Vol["setVolume(v)"]
Controls --> |Mute| Mute["toggleMute()"]
Controls --> |Repeat| Repeat["setRepeatMode(next)"]
Controls --> |Shuffle| Shuffle["toggleShuffle()"]
Controls --> |Queue Panel| QueuePanel["setQueueOpen(true/false)"]
Controls --> |Download| DL["downloadSong()"]
Controls --> |Like| Like["requireAuth(toggleFavorite)"]
TogglePlay --> AudioPlay["audio.play()/pause()"]
Next --> NextSong["store.playNext()"]
Prev --> PrevSong["store.playPrevious()"]
Seek --> SetTime["audio.currentTime = time"]
Vol --> SetVol["audio.volume = vol"]
Mute --> SetMute["audio.volume = 0 or restore"]
Repeat --> UpdateRepeat["persist repeatMode"]
Shuffle --> UpdateShuffle["persist isShuffle"]
QueuePanel --> RenderQueue["Render queue list"]
DL --> FetchBlob["Fetch blob and trigger download"]
Like --> UpdateFav["Persist favorites"]
```

**Diagram sources**
- [Player.tsx:33-82](file://components/Player.tsx#L33-L82)
- [Player.tsx:104-180](file://components/Player.tsx#L104-L180)
- [Player.tsx:193-233](file://components/Player.tsx#L193-L233)
- [usePlayerStore.ts:70-103](file://store/usePlayerStore.ts#L70-L103)
- [downloadSong.ts:8-42](file://lib/downloadSong.ts#L8-L42)
- [useAuthGuard.ts:16-25](file://hooks/useAuthGuard.ts#L16-L25)

**Section sources**
- [Player.tsx:19-251](file://components/Player.tsx#L19-L251)
- [usePlayerStore.ts:70-103](file://store/usePlayerStore.ts#L70-L103)
- [downloadSong.ts:8-42](file://lib/downloadSong.ts#L8-L42)
- [useAuthGuard.ts:16-25](file://hooks/useAuthGuard.ts#L16-L25)

### FullPlayer (Full-Screen Player)
Responsibilities:
- Expanded controls and seek/volume sliders.
- Suggestions panel powered by a remote API.
- Download, like, and add-to-playlist actions with auth gating.
- Smooth animations and responsive layout.

Behavior highlights:
- Uses react-query to fetch song suggestions.
- Seek and volume sliders update state and reflect current values.
- Repeat/shuffle toggles and play controls mirror mini-player logic.
- Background album art with blur effect and gradient overlay.

```mermaid
sequenceDiagram
participant UI as "FullPlayer"
participant Store as "usePlayerStore"
participant Query as "react-query"
participant API as "Remote API"
participant Audio as "HTMLAudioElement"
UI->>Store : "togglePlay(), playNext(), playPrevious()"
UI->>Audio : "seek(volume), update currentTime"
UI->>Query : "fetch suggestions (enabled by currentSong)"
Query->>API : "GET /songs/{id}/suggestions"
API-->>Query : "JSON suggestions"
Query-->>UI : "normalized suggestions"
UI->>Store : "setCurrentSong(), setQueue()"
```

**Diagram sources**
- [FullPlayer.tsx:44-51](file://components/FullPlayer.tsx#L44-L51)
- [FullPlayer.tsx:59-62](file://components/FullPlayer.tsx#L59-L62)
- [FullPlayer.tsx:164-209](file://components/FullPlayer.tsx#L164-L209)
- [usePlayerStore.ts:70-89](file://store/usePlayerStore.ts#L70-L89)

**Section sources**
- [FullPlayer.tsx:22-243](file://components/FullPlayer.tsx#L22-L243)
- [usePlayerStore.ts:70-89](file://store/usePlayerStore.ts#L70-L89)

### Zustand State Store (usePlayerStore)
State shape:
- Playback: currentSong, isPlaying, queue, volume, repeatMode, isShuffle, isQueueOpen
- Collections: favorites, recentlyPlayed, user
Actions:
- Queue management: setQueue, addToQueue, removeFromQueue, clearQueue, playNext, playPrevious
- Playback controls: togglePlay, setVolume, setRepeatMode, toggleShuffle
- Favorites and user: toggleFavorite, setFavorites, setUser
- UI state: setQueueOpen

Persistence:
- Uses Zustand persist middleware to save selected fields to storage.

```mermaid
classDiagram
class PlayerState {
+Song currentSong
+Song[] queue
+boolean isPlaying
+number volume
+("none"|"one"|"all") repeatMode
+boolean isShuffle
+Song[] recentlyPlayed
+string[] favorites
+UserData user
+boolean isQueueOpen
+setCurrentSong(song)
+setQueue(songs)
+addToQueue(song)
+removeFromQueue(songId)
+clearQueue()
+playNext()
+playPrevious()
+togglePlay()
+setVolume(vol)
+setRepeatMode(mode)
+toggleShuffle()
+toggleFavorite(songId)
+setFavorites(ids)
+addToRecentlyPlayed(song)
+setUser(user)
+setQueueOpen(open)
}
```

**Diagram sources**
- [usePlayerStore.ts:12-41](file://store/usePlayerStore.ts#L12-L41)

**Section sources**
- [usePlayerStore.ts:12-128](file://store/usePlayerStore.ts#L12-L128)

### Queue Management and Persistent Storage
- Client-side queue: managed in-memory via Zustand store; supports add/remove/clear and next/previous navigation.
- Server-side queue: persisted per user with ordered positions; supports fetch, add, clear, and delete.
- Schema defines QueueItem with JSON songData and position ordering.

```mermaid
erDiagram
USER {
string id PK
string email UK
string name
string avatarUrl
enum role
}
QUEUE_ITEM {
string id PK
string user_id FK
string song_id
json song_data
int position
}
USER ||--o{ QUEUE_ITEM : "owns"
```

**Diagram sources**
- [schema.prisma:73-84](file://prisma/schema.prisma#L73-L84)
- [route.ts:9-21](file://app/api/queue/route.ts#L9-L21)

**Section sources**
- [route.ts:4-86](file://app/api/queue/route.ts#L4-L86)
- [schema.prisma:73-84](file://prisma/schema.prisma#L73-L84)
- [db.ts:1-10](file://lib/db.ts#L1-L10)

### Audio Element Management and Progress Tracking
- Audio element is controlled via a ref; src updates when currentSong changes; play/pause synchronized with isPlaying.
- Progress tracking uses onTimeUpdate to keep currentTime; duration is captured on onLoadedMetadata.
- Seek functionality updates currentTime and the audio element’s position.
- Repeat-one restarts playback; otherwise, playNext selects the next item based on shuffle and repeat mode.

```mermaid
sequenceDiagram
participant C as "Caller"
participant A as "Audio Element"
participant U as "UI"
C->>A : "src = highQualityDownloadUrl"
C->>A : "play() or pause()"
A-->>U : "onTimeUpdate -> update currentTime"
A-->>U : "onLoadedMetadata -> set duration"
U->>A : "seek(time) -> currentTime = time"
A-->>U : "onEnded -> repeatMode check"
U->>U : "playNext() or restart"
```

**Diagram sources**
- [Player.tsx:33-61](file://components/Player.tsx#L33-L61)
- [usePlayerStore.ts:70-89](file://store/usePlayerStore.ts#L70-L89)

**Section sources**
- [Player.tsx:33-61](file://components/Player.tsx#L33-L61)
- [usePlayerStore.ts:70-89](file://store/usePlayerStore.ts#L70-L89)

### Download Functionality
- Resolves high-quality download URL and fetches the audio as a Blob.
- Creates a temporary object URL and triggers a download link with appropriate filename.
- Handles errors and shows user feedback via toasts.

```mermaid
flowchart TD
Start(["User clicks Download"]) --> Resolve["Resolve high-quality URL"]
Resolve --> Fetch["Fetch audio Blob"]
Fetch --> BlobOK{"Response OK?"}
BlobOK --> |No| ToastErr["Show error toast"]
BlobOK --> |Yes| CreateURL["Create Object URL"]
CreateURL --> Trigger["Create <a> and click"]
Trigger --> Revoke["Revoke Object URL"]
Revoke --> ToastDone["Show success toast"]
```

**Diagram sources**
- [downloadSong.ts:8-42](file://lib/downloadSong.ts#L8-L42)
- [api.ts:79-83](file://lib/api.ts#L79-L83)

**Section sources**
- [downloadSong.ts:8-42](file://lib/downloadSong.ts#L8-L42)
- [api.ts:79-83](file://lib/api.ts#L79-L83)

### Keyboard Shortcuts
- Space: toggle play/pause
- ArrowRight / ArrowLeft: skip forward/backward (with Ctrl/Cmd modifiers to jump to next/previous)
- ArrowUp / ArrowDown: increase/decrease volume
- KeyM: toggle mute

**Section sources**
- [Player.tsx:68-82](file://components/Player.tsx#L68-L82)

### Responsive Design and Accessibility
- Responsive breakpoints: compact controls on mobile; expanded controls on larger screens.
- Motion animations for slide-in/out panels and transitions.
- Accessible controls: buttons with clear icons and tooltips; sliders with numeric labels; focus-friendly interactions.
- Safe area and mobile navigation adjustments via CSS variables.

**Section sources**
- [Player.tsx:91-96](file://components/Player.tsx#L91-L96)
- [Player.tsx:134-180](file://components/Player.tsx#L134-L180)
- [FullPlayer.tsx:75-83](file://components/FullPlayer.tsx#L75-L83)

## Dependency Analysis
- Player and FullPlayer depend on usePlayerStore for state and actions.
- Both components rely on api.ts for image and duration helpers and download URL resolution.
- FullPlayer additionally queries song suggestions via react-query.
- Queue persistence depends on route.ts and Prisma schema.
- Auth gating is provided by useAuthGuard; mobile detection by use-is-mobile.

```mermaid
graph LR
Player["Player.tsx"] --> Store["usePlayerStore.ts"]
Full["FullPlayer.tsx"] --> Store
Player --> API["api.ts"]
Full --> API
Full --> Query["react-query"]
Store --> QueueAPI["app/api/queue/route.ts"]
QueueAPI --> Prisma["prisma/schema.prisma"]
Player --> Auth["useAuthGuard.ts"]
Full --> Auth
Player --> Mobile["use-mobile.ts"]
```

**Diagram sources**
- [Player.tsx:19-25](file://components/Player.tsx#L19-L25)
- [FullPlayer.tsx:34-42](file://components/FullPlayer.tsx#L34-L42)
- [usePlayerStore.ts:43-127](file://store/usePlayerStore.ts#L43-L127)
- [api.ts:37-83](file://lib/api.ts#L37-L83)
- [route.ts:4-86](file://app/api/queue/route.ts#L4-L86)
- [schema.prisma:73-84](file://prisma/schema.prisma#L73-L84)
- [useAuthGuard.ts:12-29](file://hooks/useAuthGuard.ts#L12-L29)
- [use-mobile.ts:5-19](file://hooks/use-mobile.ts#L5-L19)

**Section sources**
- [Player.tsx:19-25](file://components/Player.tsx#L19-L25)
- [FullPlayer.tsx:34-42](file://components/FullPlayer.tsx#L34-L42)
- [usePlayerStore.ts:43-127](file://store/usePlayerStore.ts#L43-L127)
- [api.ts:37-83](file://lib/api.ts#L37-L83)
- [route.ts:4-86](file://app/api/queue/route.ts#L4-L86)
- [schema.prisma:73-84](file://prisma/schema.prisma#L73-L84)
- [useAuthGuard.ts:12-29](file://hooks/useAuthGuard.ts#L12-L29)
- [use-mobile.ts:5-19](file://hooks/use-mobile.ts#L5-L19)

## Performance Considerations
- Audio element lifecycle: avoid redundant play calls; only set src when currentSong changes.
- State updates: minimize re-renders by using Zustand selectors and memoization where appropriate.
- Queue operations: deduplicate adds and filter removes efficiently.
- Downloads: use streaming fetch and revoke object URLs promptly.
- Rendering: hide queue panel offscreen when closed; lazy-load suggestion images.
- Memory: clear intervals/timers if added later; dispose of event listeners on unmount.

## Troubleshooting Guide
Common issues and remedies:
- Audio does not start: ensure src is set and isPlaying is true; catch and log play promise rejections.
- Progress bar not updating: verify onTimeUpdate fires and currentTime is updated; confirm duration is loaded.
- Queue not persisting: check userId passed to queue endpoints; ensure Prisma model and route match.
- Download fails: confirm download URL exists; inspect network tab for fetch errors; handle non-OK responses.
- Auth-required actions fail silently: ensure useAuthGuard is invoked before toggling favorites.

**Section sources**
- [Player.tsx:33-44](file://components/Player.tsx#L33-L44)
- [Player.tsx:51-57](file://components/Player.tsx#L51-L57)
- [route.ts:6-22](file://app/api/queue/route.ts#L6-L22)
- [downloadSong.ts:19-41](file://lib/downloadSong.ts#L19-L41)
- [useAuthGuard.ts:16-25](file://hooks/useAuthGuard.ts#L16-L25)

## Conclusion
The audio player integrates a robust UI layer with a centralized state store and server-backed queue persistence. It provides comprehensive playback controls, responsive layouts, keyboard shortcuts, downloads, and thoughtful UX patterns. The architecture leverages modern React patterns (refs, effects, hooks) and state management (Zustand) while maintaining performance and reliability.