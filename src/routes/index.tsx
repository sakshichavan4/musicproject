import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from '@/components/melody/home';
export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: 'MelodyAI — Your Music. Your Voice. Your Stage.' },
    { name: 'description', content: 'Explore your personal karaoke studio. Upload audio and listen to an original instrumental demo in the MelodyAI frontend preview.' },
    { property: 'og:title', content: 'MelodyAI — Your Music. Your Voice. Your Stage.' },
    { property: 'og:description', content: 'Find your rhythm with MelodyAI, your future AI-powered karaoke studio.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: HomePage,
});
