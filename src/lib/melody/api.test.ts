import { afterEach, describe, expect, it, vi } from 'vitest';
import { generateKaraoke } from './api';
import { maxAudioBytes, validateAudio } from './types';
const file = () => new File(['audio'], 'song.wav', { type: 'audio/wav' });
afterEach(() => vi.unstubAllGlobals());
describe('audio validation', () => {
  it('accepts supported formats case-insensitively', () => {
    for (const extension of ['MP3', 'wav', 'flac', 'm4a']) expect(validateAudio(new File(['a'], `song.${extension}`))).toBeNull();
  });
  it('rejects unsupported, empty and oversized files', () => {
    expect(validateAudio(new File(['a'], 'song.txt'))).toContain('MP3');
    expect(validateAudio(new File([], 'song.mp3'))).toContain('empty');
    const large = file(); Object.defineProperty(large, 'size', { value: maxAudioBytes + 1, configurable: true });
    expect(validateAudio(large)).toContain('50 MB');
    Object.defineProperty(large, 'size', { value: maxAudioBytes });
    expect(validateAudio(large)).toBeNull();
  });
});
describe('generateKaraoke', () => {
  it('does not call an unconfigured service', async () => {
    const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher);
    await expect(generateKaraoke(file(), { baseUrl: '' })).rejects.toThrow('not connected');
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('sends multipart file and returns only decoded MP3', async () => {
    const bytes = new Uint8Array([0x49, 0x44, 0x33, 1, 2, 3]);
    const fetcher = vi.fn().mockResolvedValue({ ok: true, headers: new Headers({ 'content-type': 'audio/mpeg' }), blob: async () => ({ size: bytes.length, arrayBuffer: async () => bytes.buffer }) });
    vi.stubGlobal('fetch', fetcher);
    vi.stubGlobal('AudioContext', class { decodeAudioData = async () => ({ duration: 2, length: 100 }); close = async () => {}; });
    const result = await generateKaraoke(file(), { baseUrl: 'https://audio.example.test/' });
    expect(result.type).toBe('audio/mpeg');
    const call = fetcher.mock.calls[0];
    if (!call) throw new Error('Expected a request');
    expect(call[0]).toBe('https://audio.example.test/generate');
    const options = call[1];
    expect(options.method).toBe('POST'); expect(options.body.get('file').name).toBe('song.wav');
    expect(options.headers).toBeUndefined();
  });
  it('rejects network failures, API errors, JSON success, and corrupt audio', async () => {
    const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher);
    fetcher.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await expect(generateKaraoke(file(), { baseUrl: 'https://audio.example.test' })).rejects.toThrow('Unable to connect');
    fetcher.mockResolvedValueOnce({ ok: false, status: 503, headers: new Headers({ 'content-type': 'application/json' }), json: async () => ({ detail: 'Busy' }) });
    await expect(generateKaraoke(file(), { baseUrl: 'https://audio.example.test' })).rejects.toThrow('503');
    fetcher.mockResolvedValueOnce({ ok: true, headers: new Headers({ 'content-type': 'application/json' }) });
    await expect(generateKaraoke(file(), { baseUrl: 'https://audio.example.test' })).rejects.toThrow('did not return an MP3');
    fetcher.mockResolvedValueOnce({ ok: true, headers: new Headers({ 'content-type': 'audio/mpeg' }), blob: async () => ({ size: 3, arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer }) });
    await expect(generateKaraoke(file(), { baseUrl: 'https://audio.example.test' })).rejects.toThrow('invalid MP3');
  });
});