import { Link } from '@tanstack/react-router';
import { AudioLines, ArrowUpRight, Upload, WandSparkles, Mic2, ArrowRight } from 'lucide-react';
import studioImage from '@/assets/melody-studio.jpg';
import { Button } from '@/components/ui/button';
import { Generator } from './generator';
import { Player } from './player';
import { useState } from 'react';
import type { KaraokeResult } from '@/lib/melody/types';

export function HomePage({ create = false }: { create?: boolean }) {
  const [result, setResult] = useState<KaraokeResult | null>(null);
  return <>
    <section className={`hero ${create ? 'hero-compact' : ''}`}>
      <img className="hero-image" src={studioImage} width={1536} height={1024} alt="Chrome studio microphone lit in violet and pink"/>
      <div className="hero-shade"/>
      <div className="content-width hero-content"><span className="hero-eyebrow"><AudioLines size={16}/> YOUR PERSONAL KARAOKE STUDIO</span>
        <h1>{create ? <>Make it<br/><span>your Melody.</span></> : <>Your Music.<br/>Your Voice. <span>Your Stage.</span></>}</h1>
        <p>Turn your favorite songs into karaoke tracks with AI.</p>
        <div className="hero-details"><span><span className="tiny-wave"><i/><i/><i/><i/></span>More music. More you.</span><span className="hero-dot"/><span>No spotlight required.</span></div>
      </div>
      <span className="hero-photo-credit"><Mic2 size={13}/> A space for your sound</span>
    </section>
    <div className="content-width studio-section"><div className="section-title"><div><span className="eyebrow">FROM TRACK TO SPOTLIGHT</span><h2>{create ? 'Create your karaoke track' : 'Your next sing-along starts here.'}</h2></div><span className="section-caption">The original track. A whole new feeling.</span></div>
      <div className="studio-grid"><Generator onResult={setResult}/><Player key={result?.url ?? 'demo'} result={result}/></div>
      <div className="frontend-disclaimer"><span className="status-dot"/><p>Song search is a demo. Vocal removal requires a connected audio service and your uploaded file.</p></div>
    </div>
    <section className="how-section content-width"><div className="how-heading"><span className="eyebrow">LESS SETUP. MORE SINGING.</span><h2>From your playlist to your stage.</h2><p>A little AI magic. A lot of you.</p></div><div className="steps-grid">
      <div className="step"><div className="step-icon"><Upload/></div><span className="step-number">01</span><h3>Bring your song</h3><p>Upload a track you own, or find a song when search becomes available.</p></div>
      <div className="step"><div className="step-icon"><WandSparkles/></div><span className="step-number">02</span><h3>Make room for your voice</h3><p>Once connected, AI will separate the vocals and keep the music you love.</p></div>
      <div className="step"><div className="step-icon"><Mic2/></div><span className="step-number">03</span><h3>Take the mic</h3><p>Play your instrumental, download your track, and make the moment yours.</p></div>
    </div></section>
    <section className="bottom-band content-width"><div><AudioLines size={24}/><h3>Every song has another version. Yours.</h3></div><Button variant="link" asChild><Link to={create ? '/library' : '/create'}>{create ? 'Explore the library' : 'Find your sound'}<ArrowUpRight/></Link></Button></section>
  </>;
}