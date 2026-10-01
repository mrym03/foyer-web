# Lessons

- 2026-10-01 — Sohazur requires PostHog for session replay. Privacy remediation must preserve this named product requirement: gate it on explicit consent and verify real replay/masking/withdrawal. Do not remove the integration or historical recordings as a substitute for implementing consent.
- 2026-10-01 — Verify actual SDK payloads, including nested compression. PostHog's modern network masking callback also handles replay Meta navigation; preserve sanitized URL-only records and reject actual network details.
