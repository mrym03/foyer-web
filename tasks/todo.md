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

## Compact consent UI — 2026-10-01

- [x] Question: owner Sohazur says the existing marketing privacy UI is too large and prominent; keep consent behavior but make the prompt compact.
- [x] Delete: remove the floating settings launcher and technical/vendor explanation from the short prompt; retain complete policy disclosure and independent assistant consent.
- [x] Simplify: one small bar with equal Accept/Decline, then an existing-footer Privacy settings link to reopen it.
- [x] Accelerate: share the compact UI script across the six existing pages; do not change analytics lifecycle or masking.
- [x] Automate last: extend existing UI regressions and verify actual desktop/mobile pages; no new automation service.
- [x] Implement compact bar and footer reopening on all six pages.
- [x] Verify tests, rendered desktop/mobile behavior and unchanged consent gating.
- [ ] Root review and scoped publication; no commit/deployment by this agent.

Compact UI review: 14 tests and diff check pass. Actual browser bar is 398×54px on desktop and 351×77px at 375px mobile, with equal 64×32px buttons; no horizontal overflow. Decline removes the whole floating UI, footer link reopens it, and saved accept/decline survive reload. Local collector was empty before choice; acceptance still produced real SDK pageview/replay requests. Only UI/status rendering changed in the script; analytics configuration and masking remain unchanged. Evidence: outputs/compact-consent/README.md.
