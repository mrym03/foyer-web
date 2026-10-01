# Optional marketing replay — 2026-10-01

- [x] Question requirements: owner Sohazur explicitly requires retaining PostHog for session replay; existing project token and US ingestion host remain unchanged. Consent, masking and withdrawal are the agreed privacy implementation constraints.
- [x] Delete unnecessary parts: keep RB2B off; do not build identification, person profiles, autocapture, console/network capture, feature flags, or an account consent system. Never delete historical recordings.
- [x] Simplify: one optional analytics/replay choice, equal Accept and Decline, persistent Privacy settings; essential site use remains available.
- [x] Accelerate: pin and self-host the official SDK to make real replay behavior repeatable; use an isolated local collector rather than live personal data.
- [x] Automate last: focused regression tests cover permission transitions and replay privacy; no scheduled automation needed.
- [x] Implement consent lifecycle, masking, privacy copy and third-party attribution.
- [x] Verify real browser replay, compressed payload contents, desktop/mobile layout, cross-tab withdrawal, reload and stale SDK completion.
- [ ] Root review, explicit scoped commit and deployment (owned by root; not performed by this agent).

Review: 11 focused tests pass. Actual PostHog 1.435.6 emitted locally collected replay, preserving public text and sanitized navigation metadata while private canaries were absent. See outputs/posthog-consent/README.md for evidence and limits. No production account mutation or historical recording deletion.
