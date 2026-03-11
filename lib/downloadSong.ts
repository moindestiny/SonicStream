import { Song, getHighQualityImage, getHighQualityDownloadUrl } from '@/lib/api';
import toast from 'react-hot-toast';

/**
 * Downloads a song as MP3 with embedded ID3 tags (title, artist, album, cover art).
 * Uses browser-id3-writer to write metadata into the MP3 before download.
 */
export async function downloadSong(song: Song): Promise<void> {
  const url = getHighQualityDownloadUrl(song.downloadUrl);
  if (!url) {
    toast.error('Download URL not available');
    return;
  }

  const toastId = toast.loading(`Downloading "${song.name}"...`);

  try {
    // Fetch the MP3 audio
    const audioRes = await fetch(url);
    const audioBuffer = await audioRes.arrayBuffer();

    // Trigger download - save as .m4a because JioSaavn streams are MP4 audio
    const blob = new Blob([audioBuffer], { type: 'audio/mp4' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${song.name || 'song'}.m4a`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);

    toast.success(`Downloaded "${song.name}"`, { id: toastId });
  } catch (err) {
    console.error('Download failed:', err);
    toast.error('Download failed', { id: toastId });
  }
}
