import { validateAudio } from './types';

export interface GenerateOptions { baseUrl?: string; signal?: AbortSignal }
/** Direct browser-to-FastAPI request; no Lovable server or paid service involved. */
export async function generateKaraoke(file: File, options: GenerateOptions = {}): Promise<Blob> {
  const invalid = validateAudio(file);
  if (invalid) throw new Error(invalid);
  const configured = (options.baseUrl ?? import.meta.env['VITE_KARAOKE_API_URL'] ?? '').trim();
  if (!configured) throw new Error('Vocal removal is not connected yet. Configure VITE_KARAOKE_API_URL with your audio service address.');
  let endpoint: URL;
  try {
    endpoint = new URL(`${configured.replace(/\/+$/, '')}/generate`);
    if (!['http:', 'https:'].includes(endpoint.protocol) || endpoint.username || endpoint.password || endpoint.search || endpoint.hash) throw new Error();
  } catch { throw new Error('The audio service address is invalid. Please check VITE_KARAOKE_API_URL.'); }
  const controller = new AbortController();
  let timedOut = false;
  const abort = () => controller.abort();
  if (options.signal?.aborted) controller.abort();
  options.signal?.addEventListener('abort', abort, { once: true });
  const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, 10 * 60 * 1000);
  try {
    const form = new FormData(); form.append('file', file, file.name);
    // Do not set Content-Type: the browser supplies the multipart boundary.
    const response = await fetch(endpoint.toString(), { method: 'POST', body: form, signal: controller.signal, credentials: 'omit' });
    if (!response.ok) {
      let detail = '';
      if (response.headers.get('content-type')?.includes('application/json')) {
        const body: unknown = await response.json().catch(() => null);
        if (body && typeof body === 'object' && 'detail' in body && typeof body.detail === 'string') detail = body.detail.slice(0, 250);
      }
      throw new Error(detail ? `Audio service error (${response.status}): ${detail}` : `Audio service error (${response.status}). Please try again later.`);
    }
    const contentType = response.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase();
    if (contentType !== 'audio/mpeg' && contentType !== 'audio/mp3') throw new Error('The audio service did not return an MP3 audio file. No karaoke result was created.');
    const blob = await response.blob();
    if (!blob.size) throw new Error('The audio service returned an empty file. Please try again.');
    const bytes = await blob.arrayBuffer();
    const header = new Uint8Array(bytes, 0, Math.min(bytes.byteLength, 3));
    const isMp3 = (header[0] === 0x49 && header[1] === 0x44 && header[2] === 0x33) || (header[0] === 0xff && ((header[1] ?? 0) & 0xe0) === 0xe0);
    if (!isMp3) throw new Error('The audio service returned an invalid MP3 file. No karaoke result was created.');
    // Verify actual audio can be decoded before the UI displays a successful result.
    const context = new AudioContext();
    try {
      const decoded = await context.decodeAudioData(bytes);
      if (!Number.isFinite(decoded.duration) || decoded.duration <= 0 || decoded.length === 0) throw new Error();
    } catch { throw new Error('The returned MP3 could not be played. No karaoke result was created.'); }
    finally { await context.close().catch(() => undefined); }
    if (controller.signal.aborted) throw new DOMException('Request cancelled', 'AbortError');
    return new Blob([blob], { type: 'audio/mpeg' });
  } catch (error) {
    if (timedOut) throw new Error('Processing took too long. Please try a shorter track or try again later.');
    if (controller.signal.aborted) throw new DOMException('Request cancelled', 'AbortError');
    if (error instanceof TypeError) throw new Error('Unable to connect to the audio service. Check that it is running and allows connections from this website, then try again.');
    throw error;
  } finally { clearTimeout(timeout); options.signal?.removeEventListener('abort', abort); }
}