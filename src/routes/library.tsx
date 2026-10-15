import { createFileRoute, Link } from '@tanstack/react-router';
import { Headphones, Plus, ArrowDownToLine } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Player, TrackArt } from '@/components/melody/player';
import { demoTracks, demoAudioUrl } from '@/lib/melody/types';
export const Route = createFileRoute('/library')({
  head: () => ({ meta: [
    { title: 'My Library — MelodyAI' },
    { name: 'description', content: 'Explore MelodyAI’s sample library and original instrumental demo. No tracks are saved or AI processed in this frontend preview.' },
    { property: 'og:title', content: 'My Library — MelodyAI' },
    { property: 'og:description', content: 'A little collection of sounds to inspire your next sing-along.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: LibraryPage,
});
function LibraryPage() {
  const [filter, setFilter] = useState('all');
  return <div className="content-width library-page"><div className="library-heading"><div><span className="eyebrow">YOUR COLLECTION</span><h1>My Library<span className="text-primary">.</span></h1><p>A little inspiration for your next encore.</p></div><Button variant="melody" asChild><Link to="/create"><Plus/> Create karaoke</Link></Button></div>
    <div className="library-notice"><Headphones size={19}/><p><strong>Demo library</strong> · These are sample tracks, not your saved songs. Only Midnight Drive includes original demo audio.</p></div>
    <div className="library-tabs"><Button variant={filter === 'all' ? 'secondary' : 'ghost'} aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>All previews <span>3</span></Button><Button variant={filter === 'playable' ? 'secondary' : 'ghost'} aria-pressed={filter === 'playable'} onClick={() => setFilter('playable')}>Playable samples <span>1</span></Button></div>
    <div className="library-grid"><div><div className="sample-grid">{demoTracks.filter(t => filter === 'all' || t.id === 'midnight').map(t => <article className="sample-card" key={t.id}><TrackArt art={t.art}/><span className="demo-badge">DEMO</span><h2>{t.title}</h2><p>{t.artist}</p><div className="sample-meta"><span>{t.mood}</span>{t.id === 'midnight' && <Button variant="ghost" size="icon" asChild><a href={demoAudioUrl} download aria-label="Download Midnight Drive demo"><ArrowDownToLine/></a></Button>}</div></article>)}</div><p className="demo-note library-footnote">Preview only. No accounts, cloud storage, or generated tracks.</p></div><Player/></div>
  </div>;
}