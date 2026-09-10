# Security model

Assets are provider credentials, microphone audio, transcripts, and paid API capacity. Every paid route requires a constant time token comparison and exact configured browser Origin. Configuration missing means unavailable. Client supplied system messages, arbitrary provider hosts, redirects, and raw error details are prohibited. The app has no analytics or transcript logging.

Request streams have byte, frame, and time ceilings. JSON accepts at most 32 KiB, 4096 frames and 5 seconds. Provider operations have deadlines and a shared per process concurrency limit of four. Text output is capped at 64 KiB and 512 model tokens; audio output at 2 MiB. Audio input is at most 1 MiB. A hostile authenticated user can still consume budget over time. Deploy shared quotas and provider spend caps before multiuser Internet service.

MCP only runs fixed local commands with a scrubbed environment, a 30 second deadline and 128 KiB output ceiling. Evaluation requires explicit operator configuration. It never forwards provider keys. Local hashes are unsigned evidence, not promotion authorization.

Urgent owner action: revoke the provider credential previously committed in browser source. This change removes it but cannot revoke it. Never paste replacement secrets into issues. Report privately through GitHub security reporting where available. Issue 3 tracks deployment qualification without secret values.
