# Connecting the real karaoke service

## Frontend configuration

Set `VITE_KARAOKE_API_URL` to your external FastAPI base address, without `/generate`, query parameters or credentials. An empty value deliberately prevents generation. `.env.example` contains the setting; set it in the project's environment and restart local Vite or rebuild the deployment after changing it. It is public browser configuration, not a secret. Use HTTPS when the website uses HTTPS.

The browser sends the selected file directly to the external backend. No Lovable server, model deployment, authentication, database, or paid API has been added.

## Required backend API

- **Method/path:** `POST /generate` (appended to the configured base address).
- **Request:** `multipart/form-data` with exactly one audio upload in the field named `file`. The browser sets the multipart boundary automatically.
- **Accepted input:** MP3, WAV, FLAC, M4A; at most 50 × 1024 × 1024 bytes. Independently verify size and actual media contents on the backend, not only the filename.
- **Processing:** run open-source Demucs outside Lovable, separate vocals, combine the non-vocal stems, and encode the instrumental as MP3. This frontend does not implement any of these steps.
- **Success:** HTTP `200`, `Content-Type: audio/mpeg`, and the actual non-empty MP3 binary as the response body. Do not return JSON, a URL, an original vocal track, or an acknowledgement as success. Optional `Content-Disposition: attachment; filename="instrumental.mp3"`.
- **Failure:** a non-2xx status, preferably JSON such as `{ "detail": "Unable to decode this audio file." }`. Examples: `413` too large, `415` unsupported media, `422` invalid audio, `503` processing temporarily unavailable. Avoid returning private traces.
- **CORS:** allow the exact website origins that will call the service (including `http://localhost:8080` for local testing), `POST` and `OPTIONS`, and request headers required by the browser. Support preflight. The frontend sends no credentials.
- **Infrastructure:** keep the request/proxy alive for long-running separation; frontend timeout is 10 minutes. Enforce rate/concurrency limits and clean up temporary input/output files. Browser cancellation stops waiting, but the backend must arrange its own processing cleanup/cancellation.

The client checks successful status, MP3 media type, nonempty data, MP3 header and browser audio decoding before displaying any result. The returned audio is played through the existing HTML audio element/custom controls and downloaded via a temporary object URL. Old URLs are revoked when replacing files, starting a new attempt, or leaving the page.

Song search and library previews remain clearly labeled demos. Demo search cannot generate karaoke; an uploaded file is required. The sample player remains explicitly separate from real generated results. Waveform graphics are illustrative, and speed/pitch remain disabled. No YouTube or Spotify audio downloads are implemented.

Until the external backend is running and its URL is configured, real vocal separation cannot be verified; the frontend reports the missing connection instead of pretending processing succeeded.