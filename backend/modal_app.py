
import modal

app = modal.App("melodyai-backend")

demucs_image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("ffmpeg")
    .pip_install("demucs", "soundfile", "fastapi", "python-multipart")
)

MAX_UPLOAD_BYTES = 20 * 1024 * 1024


@app.function(image=demucs_image, timeout=1200, cpu=2)
def remove_vocals(audio_bytes: bytes, extension: str = ".mp3"):
    import subprocess
    import tempfile
    from pathlib import Path

    if extension not in (".mp3", ".wav"):
        raise ValueError("Only MP3 and WAV files are supported.")

    with tempfile.TemporaryDirectory() as tmp:
        input_path = Path(tmp) / f"song{extension}"
        output_dir = Path(tmp) / "output"
        input_path.write_bytes(audio_bytes)

        subprocess.run(
            [
                "python", "-m", "demucs",
                "--two-stems", "vocals",
                "-n", "htdemucs",
                "-o", str(output_dir),
                str(input_path),
            ],
            check=True,
            timeout=1100,
        )

        instrumental = (
            output_dir / "htdemucs" / "song" / "no_vocals.wav"
        )

        if not instrumental.exists():
            raise RuntimeError("Demucs did not produce an instrumental track.")

        mp3_path = Path(tmp) / "instrumental.mp3"

        subprocess.run(
            [
                "ffmpeg", "-y",
                "-i", str(instrumental),
                "-codec:a", "libmp3lame",
                "-b:a", "192k",
                str(mp3_path),
            ],
            check=True,
            capture_output=True,
            timeout=120,
        )

        return mp3_path.read_bytes()


@app.function(image=demucs_image, timeout=1200)
@modal.asgi_app()
def web():
    from fastapi import FastAPI, File, HTTPException, UploadFile
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import Response

    api = FastAPI()

    # Local development only. Restrict this before public deployment.
    api.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:8080",
            "http://127.0.0.1:8080",
        ],
        allow_methods=["POST", "OPTIONS"],
        allow_headers=["*"],
    )

    @api.post("/generate")
    async def generate(file: UploadFile = File(...)):
        import asyncio
        from pathlib import Path

        extension = Path(file.filename or "").suffix.lower()

        if extension not in (".mp3", ".wav"):
            raise HTTPException(
                status_code=400,
                detail="Please upload an MP3 or WAV file.",
            )

        if file.content_type not in (
            "audio/mpeg",
            "audio/mp3",
            "audio/wav",
            "audio/x-wav",
            "audio/wave",
            "application/octet-stream",
        ):
            raise HTTPException(
                status_code=400,
                detail="Unsupported audio content type.",
            )

        audio_bytes = await file.read(MAX_UPLOAD_BYTES + 1)

        if not audio_bytes:
            raise HTTPException(status_code=400, detail="The audio file is empty.")

        if len(audio_bytes) > MAX_UPLOAD_BYTES:
            raise HTTPException(
                status_code=413,
                detail="The audio file exceeds the 20 MB limit.",
            )

        try:
            result = await asyncio.to_thread(
                remove_vocals.remote,
                audio_bytes,
                extension,
            )
        except Exception:
            raise HTTPException(
                status_code=500,
                detail="Audio processing failed. Please try a shorter file.",
            )

        return Response(
            content=result,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": 'attachment; filename="instrumental.mp3"',
                "Cache-Control": "no-store",
            },
        )

    return api


@app.local_entrypoint()
def main():
    print("MelodyAI backend is ready for deployment.")
