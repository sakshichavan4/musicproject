import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Download, Volume2, VolumeX, Repeat2, SlidersHorizontal, Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { demoAudioUrl, type KaraokeResult } from '@/lib/melody/types';

export function TrackArt({ art = 'midnight' }: { art?: string }) { return <div className={`track-art art-${art}`}><div className="art-landscape"/><Music2 size={24}/></div>; }
const bars = Array.from({ length: 72 }, (_, i) => 12 + Math.abs(Math.sin(i * 1.8) * Math.cos(i * .24)) * 49 + Math.abs(Math.sin(i * .55)) * 18);
const time = (value: number) => `${Math.floor(value / 60)}:${Math.floor(value % 60).toString().padStart(2, '0')}`;
export function Player({ result = null }: { result?: KaraokeResult | null }) {
  const source = result?.url ?? demoAudioUrl;
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(result ? 0 : 24);
  const [volume, setVolume] = useState(.7);
  const [loop, setLoop] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { if (audio.current) audio.current.volume = volume; }, [volume]);
  async function toggle() {
    const el = audio.current; if (!el) return;
    if (playing) el.pause(); else { try { await el.play(); setError(''); } catch { setError('Unable to play the audio. Please try again.'); } }
  }
  function seek(value: number) { if (audio.current) audio.current.currentTime = value; setPosition(value); }
  return <section className="player-panel" aria-label={result ? 'Generated karaoke player' : 'Karaoke preview player'}>
    <div className="panel-heading"><span className="eyebrow">A LITTLE SOUND CHECK</span><span className="demo-badge">{result ? 'INSTRUMENTAL' : 'DEMO'}</span></div>
    <h2>Your stage is waiting.</h2><p className="panel-description">Press play. Find your rhythm.</p>
    <div className="track-details"><TrackArt/><div className="min-w-0"><h3 className="file-name">{result?.title ?? 'Midnight Drive'}</h3><p>{result ? 'Your uploaded track' : 'Melody Studio'}</p><span className="instrumental-tag">{result ? 'Returned by audio service' : 'Original instrumental sample'}</span></div><span className="track-menu"><Music2 size={18}/></span></div>
    <div className="waveform" aria-hidden="true">{bars.map((height, i) => <span key={i} className={i / bars.length <= position / duration ? 'wave-played' : ''} style={{ height: `${height}%` }}/>)}</div>
    <input className="seek-range" aria-label="Playback position" type="range" min="0" max={duration} step="0.1" value={position} onChange={e => seek(Number(e.target.value))}/>
    <div className="time-row"><span>{time(position)}</span><span>{time(duration)}</span></div>
    <div className="playback-controls"><Button variant="ghost" size="icon" aria-label={loop ? 'Disable repeat' : 'Enable repeat'} title="Repeat" aria-pressed={loop} className={loop ? 'text-primary' : ''} onClick={() => setLoop(!loop)}><Repeat2/></Button><Button variant="play" className="play-button" aria-label={playing ? (result ? 'Pause instrumental' : 'Pause sample') : (result ? 'Play instrumental' : 'Play sample')} onClick={toggle}>{playing ? <Pause fill="currentColor"/> : <Play fill="currentColor"/>}</Button><Button variant="ghost" size="icon" aria-label={volume > 0 ? 'Mute' : 'Unmute'} onClick={() => setVolume(volume > 0 ? 0 : .7)}>{volume > 0 ? <Volume2/> : <VolumeX/>}</Button></div>
    <div className="player-settings"><label><span><SlidersHorizontal size={13}/> Speed</span><select disabled aria-label="Playback speed (coming soon)"><option>1.0×</option></select></label><label><span><Music2 size={13}/> Pitch</span><select disabled aria-label="Pitch (coming soon)"><option>Original</option></select></label></div>
    <p className="coming-soon">Speed & pitch adjustments coming soon</p>
    <Button asChild variant="outline" className="download-button"><a href={source} download={result?.downloadName ?? 'MelodyAI-original-demo.wav'}><Download/> Download instrumental {!result && <span className="text-muted-foreground">· Demo</span>}</a></Button>
    <p className="demo-note">{result ? 'Instrumental audio received from your service. Waveform is illustrative.' : 'Original demo audio, not an AI-separated track.'}</p>
    {error && <p role="alert" className="error-message">{error}</p>}
    <audio ref={audio} src={source} preload="metadata" loop={loop} aria-label={result ? 'Generated instrumental audio' : 'Demo audio'} onError={() => { setPlaying(false); setError('Unable to load the audio file. Please try again.'); }} onLoadedMetadata={() => { const value = audio.current?.duration; if (value && Number.isFinite(value)) setDuration(value); }} onTimeUpdate={() => setPosition(audio.current?.currentTime ?? 0)} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)}/>
  </section>;
}