<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## AI "Learn More" Feature — Infrastructure Setup

The app has a "Learn More" button that appears after answering a trivia question. It streams an AI-generated explanation from a local Ollama instance. This only works when the following components are all active:

### Prerequisites

1. **Ollama** must be running on the MacBook (default: `localhost:11434`)
   - Download from https://ollama.com
   - Model used: `qwen3.5` (configured in `src/hooks/use-ollama-stream.ts`)
   - CORS must be enabled: `launchctl setenv OLLAMA_ORIGINS "*"` then restart Ollama

2. **Tailscale** must be active on both the MacBook and the phone
   - The MacBook's MagicDNS name: `prashants-macbook-pro-2.tail5b59b0.ts.net`

3. **Tailscale Serve** must be running to proxy Ollama over HTTPS:
   ```bash
   /Applications/Tailscale.app/Contents/MacOS/Tailscale serve --bg http://localhost:11434
   ```
   This exposes Ollama at `https://prashants-macbook-pro-2.tail5b59b0.ts.net/`

### How it works

- The app is deployed on Vercel (HTTPS) at `https://trivia-lime-one.vercel.app`
- The "Learn More" button makes a **client-side** fetch from the user's phone browser
- The phone is on the Tailscale network, so it can reach the MacBook's HTTPS endpoint
- The fetch goes to `https://prashants-macbook-pro-2.tail5b59b0.ts.net/api/generate`
- Ollama streams back NDJSON which is rendered as markdown via Streamdown in a shadcn Drawer
- No server-side proxy needed — the request flows directly from phone to MacBook

### When it won't work

- Ollama app is not running
- Tailscale is disconnected on either device
- `tailscale serve` is not active (run the command above to re-enable)
- The phone is not on the Tailscale network (e.g., different WiFi without Tailscale)
- The "Learn More" drawer will show an error with a Retry button in these cases

### Key files

- `src/hooks/use-ollama-stream.ts` — Streaming hook with AbortController cleanup
- `src/components/learn-more-sheet.tsx` — Drawer UI with Streamdown markdown rendering
- `src/components/quiz-engine.tsx` — Integrates the "Learn More" button in the result card
