import { Metadata } from 'next';
import { BASE_URL, api, getHighQualityImage } from '@/lib/api';
import SongClient from './SongClient';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${BASE_URL}${api.songDetails(id)}`);
    const data = await res.json();
    const song = data?.data?.[0];

    if (!song) return { title: 'Song Not Found | SonicStream' };

    const title = `${song.name} — Listen on SonicStream`;
    const artists = song.artists?.primary?.map((a: any) => a.name).join(', ') || '';
    const description = `Stream "${song.name}" by ${artists} on SonicStream. Enjoy high-quality audio streaming.`;
    const imageUrl = getHighQualityImage(song.image);

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'music.song',
        images: [
          {
            url: imageUrl,
            width: 500,
            height: 500,
            alt: song.name,
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
  let initialSong = null;

  try {
    const res = await fetch(`${BASE_URL}${api.songDetails(id)}`);
    const data = await res.json();
    initialSong = data?.data?.[0] || null;
  } catch (error) {
    console.error('Failed to fetch initial song data:', error);
  }

  return <SongClient songId={id} initialSong={initialSong} />;
}
