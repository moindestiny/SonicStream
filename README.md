# 🎵 SonicStream

SonicStream is a premium, high-performance music streaming application built with the **Next.js 15 App Router**. It offers a sleek, immersive user experience with smooth animations, dynamic themes, and a robust feature set for music discovery and management.

![SonicStream Banner](https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070&auto=format&fit=crop)

## ✨ Features

- **🚀 High-Quality Streaming**: Powered by a robust music API with deep integration for high-fidelity audio.
- **📱 Responsive Aurora Design**: A stunning mobile-first UI with frosted glass effects, dynamic gradients, and meticulous spacing.
- **🎼 Smart Player**: 
  - Dynamic Full-Screen Player with infinite marquee for track info.
  - Vinyl-effect album art and background ambient glow.
  - Queue management, Shuffle, and Repeat modes.
- **📂 Playlist Management**: Create custom playlists, add/remove songs on the fly, and manage your collection with instant UI updates.
- **🔍 Advanced Discovery**: Search for songs, artists, and albums with real-time suggestions and trending content.
- **🛡️ Secure Auth**: Full authentication system with protected actions and personalized profiles.
- **⚙️ Admin Dashboard**: Comprehensive admin tools for user management and application statistics.
- **📥 ID3-Tagged Downloads**: Download your favorite tracks with embedded album art and metadata.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) & [TanStack Query v5](https://tanstack.com/query/latest)
- **Database**: [Neon DB](https://neon.tech/) (PostgreSQL)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Animations**: [Motion](https://motion.dev/) (Framer Motion)
- **Icons**: [Lucide React](https://lucide.dev/)
- **UI Feedback**: [react-hot-toast](https://react-hot-toast.com/)

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or later
- A PostgreSQL database (Neon recommended)
- Environment variables configured (see `.env.example`)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/sonicstream.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup the database:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

### 🌍 Deployment

The easiest way to deploy SonicStream is with [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

## 📸 Screenshots

*Coming Soon...*

## 📄 License

This project is licensed under the MIT License.
