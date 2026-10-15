import { createFileRoute } from '@tanstack/react-router';
import { HomePage } from '@/components/melody/home';
export const Route = createFileRoute('/create')({
  head: () => ({ meta: [
    { title: 'Create Karaoke — MelodyAI' },
    { name: 'description', content: 'Prepare your own audio for future AI vocal separation. MP3, WAV, FLAC and M4A uploads supported in this frontend preview.' },
    { property: 'og:title', content: 'Create Karaoke — MelodyAI' },
    { property: 'og:description', content: 'Bring your audio and make room for your voice.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: CreatePage,
});
function CreatePage() { return <HomePage create/>; }