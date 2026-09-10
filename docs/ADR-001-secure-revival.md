# ADR 001: bounded private voice application

Status: accepted for v2 alpha.

The 2024 prototype had unauthenticated paid routes, a browser embedded provider credential, a development path returning the master key, unbounded provider responses, and third party recording scripts. Preserving this architecture would preserve unsafe trust boundaries.

Replace the application source with an explicit record, review, send, listen flow. Use a current patched Next release, a small dependency set, official OpenAI streaming SDK, fixed Deepgram endpoints, server credentials and a separate session access token. Retire obsolete AI SDK adapters, analytics, search enrichment and automatic microphone reconnection. No migration preserves a secret from the old deployment.

Cancellation belongs to the request and browser turn. Closing a stream aborts upstream work. A new turn pauses previous playback and rejects stale completions. Recording is explicitly initiated, stopped after 30 seconds and bounded to 1 MiB. Browser permissions and live audio need operator verification.

The MCP server provides project status, validation, benchmark and unsigned receipts. It deliberately cannot call paid providers, execute arbitrary shell commands or publish federation messages. MetaHarness orchestration and Autogenous evidence checks do not imply production promotion.

Evidence: run npm tests, build, production HTTP smoke and lockfile audits. Validation microbenchmarks establish local overhead only. There is no SOTA comparison or live provider quality claim. CI publishes the checked source as an artifact after gates; deployment credentials are intentionally external.

References: https://developers.deepgram.com/reference/auth/grant ; https://github.com/openai/openai-node ; https://nextjs.org/docs/app/guides/data-security ; https://github.com/modelcontextprotocol/typescript-sdk
