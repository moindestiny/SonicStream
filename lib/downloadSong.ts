import { Song, getHighQualityDownloadUrl } from '@/lib/api';
import toast from 'react-hot-toast';

/**
 * Downloads a song using simple fetch-and-blob logic.
 * This version avoids binary modification to prevent browser hangs.
 */
export const downloadSong = async (song: Song) => {
  try {
    toast.loading(`Downloading "${song.name}"...`, { id: 'download-toast' });

    const downloadUrl = getHighQualityDownloadUrl(song.downloadUrl);

    if (!downloadUrl) {
      toast.error('Download URL not found', { id: 'download-toast' });
      return;
    }

    // 1. Fetch Audio
    const response = await fetch(downloadUrl);
    if (!response.ok) throw new Error('Failed to fetch audio');
    
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    
    // 2. Trigger Download
    const artistString = song.artists?.primary?.map(a => a.name).join(', ') || 'Unknown Artist';
    const a = document.createElement('a');
    a.href = url;
    a.download = `${song.name} - ${artistString}.m4a`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Download started!', { id: 'download-toast' });
  } catch (error) {
    console.error('Download error:', error);
    toast.error('Failed to download song', { id: 'download-toast' });
  }
};
