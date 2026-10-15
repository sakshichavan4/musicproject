export interface KaraokeResult { url: string; title: string; downloadName: string }
export const maxAudioBytes = 50 * 1024 * 1024;
export interface DemoTrack { id: string; title: string; artist: string; mood: string; art: string }
export const demoTracks: DemoTrack[] = [
  { id: 'midnight', title: 'Midnight Drive', artist: 'Melody Studio', mood: 'Electronic · 24 sec', art: 'midnight' },
  { id: 'neon', title: 'Neon Reverie', artist: 'Melody Studio', mood: 'Preview artwork', art: 'neon' },
  { id: 'afterglow', title: 'Afterglow', artist: 'Melody Studio', mood: 'Preview artwork', art: 'afterglow' },
];
export const demoAudioUrl = '/audio/midnight-drive-demo.wav';
export const acceptedAudio = '.mp3,.wav,.flac,.m4a';
export function validateAudio(file: File): string | null {
  if (!/\.(mp3|wav|flac|m4a)$/i.test(file.name)) return 'Please choose an MP3, WAV, FLAC, or M4A audio file.';
  if (file.size === 0) return 'This file is empty. Please choose another audio file.';
  if (file.size > maxAudioBytes) return 'Please choose an audio file no larger than 50 MB.';
  return null;
}