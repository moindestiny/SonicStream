import { Metadata } from 'next';
import { BASE_URL, api, getHighQualityImage } from '@/lib/api';
import PlaylistClient from './PlaylistClient';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${BASE_URL}${api.playlistDetails(id)}`);
    const data = await res.json();
    const playlist = data?.data;

    if (!playlist) return { title: 'Playlist Not Found | SonicStream' };

    const title = `${playlist.name} — Playlist | SonicStream`;
    const description = `Listen to the "${playlist.name}" playlist with ${playlist.songCount} songs on SonicStream. Stream and download for free.`;
    const imageUrl = getHighQualityImage(playlist.image);

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'music.playlist',
        images: [
          {
            url: imageUrl,
            width: 500,
            height: 500,
            alt: playlist.name,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch (error) {
    console.error('Failed to generate metadata:', error);
    return { title: 'Listen on SonicStream' };
  }
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  let initialPlaylist = null;

  try {
    // Fetch only the first page server-side to populate layout/metadata
    const res = await fetch(`${BASE_URL}${api.playlistDetails(id, 1, 10)}`);
    const data = await res.json();
    initialPlaylist = data?.data || null;
  } catch (error) {
    console.error('Failed to fetch initial playlist data:', error);
  }

  return <PlaylistClient playlistId={id} initialPlaylist={initialPlaylist} />;
}
