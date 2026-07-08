import { Metadata } from 'next';
import { BASE_URL, api, getHighQualityImage } from '@/lib/api';
import AlbumClient from './AlbumClient';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${BASE_URL}${api.albumDetails(id)}`);
    const data = await res.json();
    const album = data?.data;

    if (!album) return { title: 'Album Not Found | SonicStream' };

    const title = `${album.name} — Album by ${album.artists?.primary?.[0]?.name || 'Unknown Artist'} | SonicStream`;
    const description = `Listen to "${album.name}" album on SonicStream. Stream all ${album.songCount} tracks in high quality.`;
    const imageUrl = getHighQualityImage(album.image);

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'music.album',
        images: [
          {
            url: imageUrl,
            width: 500,
            height: 500,
            alt: album.name,
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
  let initialAlbum = null;

  try {
    const res = await fetch(`${BASE_URL}${api.albumDetails(id)}`);
    const data = await res.json();
    initialAlbum = data?.data || null;
  } catch (error) {
    console.error('Failed to fetch initial album data:', error);
  }

  return <AlbumClient albumId={id} initialAlbum={initialAlbum} />;
}
