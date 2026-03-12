import { Song, getHighQualityDownloadUrl, getHighQualityImage } from '@/lib/api';
import toast from 'react-hot-toast';

/**
 * Downloads a song with embedded ID3 metadata using server-side FFmpeg conversion
 * Converts M4A to MP3 with proper metadata and album art
 */
export const downloadSong = async (song: Song) => {
  try {
    toast.loading(`Processing "${song.name}"...`, { id: 'download-toast', duration: Infinity });

    const downloadUrl = getHighQualityDownloadUrl(song.downloadUrl);

    if (!downloadUrl) {
      toast.error('Download URL not found', { id: 'download-toast' });
      return;
    }

    // Prepare metadata
    const artistString = song.artists?.primary?.map(a => a.name).join(', ') || 'Unknown Artist';
    const albumName = song.album?.name || 'Unknown Album';
    const songTitle = song.name || 'Unknown Title';
    const year = song.year || '';
    const imageUrl = getHighQualityImage(song.image);

    // Call server API to convert and download
    const response = await fetch('/api/download', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audioUrl: downloadUrl,
        imageUrl: imageUrl.startsWith('data:') ? undefined : imageUrl,
        title: songTitle,
        artist: artistString,
        album: albumName,
        year: year,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to process audio');
    }

    // Get the MP3 blob from response
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    
    // Trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `${songTitle} - ${artistString}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Download completed!', { id: 'download-toast', duration: 2000 });
  } catch (error) {
    console.error('Download error:', error);
    toast.error(`Failed to download: ${(error as Error).message}`, { id: 'download-toast', duration: 3000 });
  }
};
