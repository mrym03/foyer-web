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


## 2026-10-01 — one bottom-corner privacy panel

Owner: Sohazur Islam; the live homepage showed duplicate consent cards and the proposed top placement was rejected. Keep one bottom-corner marketing panel and coordinate the assistant's existing choices through explicit scoped events. Marketing permission never silently grants assistant remembering or recovery permission.

- [x] Confirm overlap in the compiled widget preview with the actual marketing page.
- [x] Delete duplicate initial panels and top-placement proposal; retain a discreet Assistant choices control only after reopening from the footer and when a widget is ready.
- [x] Simplify to one concise statement, policy link and equal Accept/Decline. Footer reopening closes assistant choices, and opening assistant choices hides marketing consent.
- [x] Accelerate through a small DOM marker/event contract, preserving real PostHog behavior. Regression automation verifies the contract; no new service or scheduled job.
- [x] Add scoped explicit-choice forwarding, safe initial denial and delayed-widget replay; never transfer a saved marketing grant.
- [x] Verify contract tests and mobile CSS specificity with the existing docked launcher rule.
- [x] Root published and verified the live combined marketing/widget flow.

Single-panel review: 24 tests pass and diff check is clean. The marker and synchronous readiness handshake, one-use delayed choice, fresh-only grant, initial denial/expiry, footer/assistant panel exclusivity, malformed events, unchanged SDK gating and masking all have regression coverage. The mobile `body:has(#foyer-marketing-privacy:not([hidden])) #talklayer-root.foyer-widget-docked` rule has two IDs and wins over the existing one-ID docked bottom rule, only while the marketing panel is visible. Root owns actual compiled widget integration and production mobile verification. Changed files are limited to the consent script, its tests and these task notes.

Compiled integration review: root verified one initial prompt with exactly two visible choice buttons, a single footer link, no under-trigger strip, no top sticky surface, and mutually exclusive assistant details. At375px, prompt351x97.6px and raised launcher do not overlap; at320px prompt296x97.6px. At1469px, bar531x54px. Choice removes all floating privacy UI. Final mobile lift128px. Privacy policy wording updated to match the actual footer/linked disclosure path; processing purposes and the14-day material-change notice commitment are unchanged.

Production evidence: marketing1528003 and widget6676ec62 are live, with exact script/policy/widget byte matches. Railway code deployment93ec488a-668b-49f7-bb38-8f35986b2a31 reachedSUCCESS. Live browser confirms one initial prompt with two choices, no under-trigger strip, footer-only reopening, mutually exclusive details, analytics after acceptance and none after withdrawal/reload.24 marketing tests plus91 widget tests passed; all3 widget builds passed. Synthetic browser preferences were restored; no customer conversation or provider-account mutation occurred.
