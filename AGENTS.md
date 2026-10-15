<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep MelodyAI's shared navigation in the root route and each named view in its own route so URLs remain independently accessible.
- Keep frontend audio types and direct external-service requests in src/lib/melody, separate from presentation components; only request generation when a base URL is configured, and validate returned audio before exposing results.
- The generator owns request cancellation and result object-URL cleanup; the parent passes a result to the existing player so sample and generated audio are never confused.
- Preview audio is an original locally generated instrumental, not a separated commercial song; keep preview labels explicit.
