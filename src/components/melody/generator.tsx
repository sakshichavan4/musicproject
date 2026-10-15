import { useEffect, useRef, useState } from 'react';
import { Search, Upload, Sparkles, ArrowRight, FileAudio, X, Check, ShieldCheck, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { acceptedAudio, demoTracks, validateAudio, type KaraokeResult } from '@/lib/melody/types';
import { generateKaraoke } from '@/lib/melody/api';
import { TrackArt } from './player';

export function Generator({ onResult }: { onResult: (result: KaraokeResult | null) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const request = useRef<AbortController | null>(null);
  const resultUrl = useRef<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [query, setQuery] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [selected, setSelected] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [dragging, setDragging] = useState(false);
  const matches = demoTracks.filter(t => `${t.title} ${t.artist}`.toLowerCase().includes(query.toLowerCase()));
  useEffect(() => () => { request.current?.abort(); if (resultUrl.current) URL.revokeObjectURL(resultUrl.current); }, []);
  function clearResult() { onResult(null); if (resultUrl.current) URL.revokeObjectURL(resultUrl.current); resultUrl.current = null; }
  function chooseFile(candidate?: File) {
    if (!candidate || request.current) return;
    clearResult(); setFile(null); setSelected('');
    const invalid = validateAudio(candidate); setError(invalid ?? ''); setNotice('');
    if (!invalid) { setFile(candidate); setSelected(''); setQuery(''); }
  }
  async function generate() {
    if (request.current) return;
    setError(''); setNotice(''); clearResult();
    if (!file) { setError(selected ? 'Demo songs cannot be processed. Please upload your own audio file.' : 'Please upload an audio file first.'); return; }
    const controller = new AbortController(); request.current = controller; setProcessing(true);
    try {
      const blob = await generateKaraoke(file, { signal: controller.signal });
      if (controller.signal.aborted) return;
      const url = URL.createObjectURL(blob); resultUrl.current = url;
      const title = file.name.replace(/\.[^.]+$/, '');
      onResult({ url, title, downloadName: `${title}-instrumental.mp3` });
      setNotice('Your instrumental audio is ready. Play or download it in the player.');
    } catch (failure) {
      if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : 'Something went wrong. Please try again.');
    } finally { if (request.current === controller) { request.current = null; if (!controller.signal.aborted) setProcessing(false); } }
  }
  function cancel() { request.current?.abort(); request.current = null; setProcessing(false); setNotice('Processing cancelled. No result was created.'); }
  return <section className="generator-panel" aria-label="Create karaoke" aria-busy={processing}>
    <div className="panel-heading"><span className="eyebrow">MAKE IT YOURS</span><span className="preview-pill"><span/> Studio preview</span></div>
    <h2>One song. Endless possibilities.</h2><p className="panel-description">Find a song or bring your own audio.</p>
    <div className="search-field"><Search size={19}/><input disabled={processing} aria-label="Search song or artist" placeholder="Search song or artist" value={query} onChange={e => { setQuery(e.target.value); setSelected(''); setNotice(''); }}/><span className="search-demo">DEMO SEARCH</span></div>
    {query && !selected && <div className="search-results"><p>Mock catalog · no songs are fetched</p>{matches.length ? matches.map(track => <Button disabled={processing} variant="ghost" key={track.id} className="search-result" onClick={() => { clearResult(); setNotice(''); setSelected(track.id); setQuery(`${track.title} — ${track.artist}`); setFile(null); setError(''); }}><TrackArt art={track.art}/><span>{track.title}<small>{track.artist}</small></span><ArrowRight/></Button>) : <span className="no-results">No demo matches. Try “Midnight” or upload your audio.</span>}</div>}
    {selected && <p className="selection-note"><Check size={13}/> Demo song selected · no source audio attached</p>}
    <div className="or-divider"><span/>or upload your audio<span/></div>
    <div className={`upload-zone ${dragging ? 'upload-dragging' : ''}`} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); chooseFile(e.dataTransfer.files[0]); }}>
      {file ? <><div className="upload-icon"><FileAudio/></div><strong className="file-name">{file.name}</strong><p>{(file.size / (1024 * 1024)).toFixed(2)} MB · {processing ? 'Processing' : 'Ready to upload'}</p><Button disabled={processing} variant="ghost" size="sm" onClick={() => { clearResult(); setFile(null); setNotice(''); setError(''); if (input.current) input.current.value = ''; }}><X/> Remove file</Button></> : <><div className="upload-icon"><Upload size={23}/></div><strong>Drop your track here</strong><p>or <Button disabled={processing} variant="link" className="browse-button" onClick={() => input.current?.click()}>browse files</Button></p><span className="file-types">MP3, WAV, FLAC, M4A <span>·</span> Up to 50 MB</span></>}
      <input ref={input} disabled={processing} type="file" accept={acceptedAudio} className="sr-only" aria-label="Upload audio file" onChange={e => { chooseFile(e.target.files?.[0]); e.target.value = ''; }}/>
    </div>
    {error && <p role="alert" className="error-message">{error}</p>}
    <Button disabled={processing} variant="melody" className="generate-button" onClick={generate}>{processing ? <LoaderCircle size={18} className="motion-safe:animate-spin"/> : <Sparkles size={18}/>} {processing ? 'Processing audio…' : 'Generate Karaoke'} <ArrowRight size={18}/></Button>
    {processing && <div className="connection-notice" role="status"><LoaderCircle className="motion-safe:animate-spin" size={17}/><p>Uploading and removing vocals. This may take several minutes.</p><Button variant="ghost" size="icon" aria-label="Cancel processing" onClick={cancel}><X/></Button></div>}
    {notice && <div className="connection-notice" role="status"><Sparkles size={17}/><p>{notice}</p></div>}
    <div className="privacy-note"><ShieldCheck size={13}/><span>Generate sends your audio to the configured service.</span></div>
  </section>;
}