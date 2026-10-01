# Lessons

- 2026-10-01 — Sohazur requires PostHog for session replay. Privacy remediation must preserve this named product requirement: gate it on explicit consent and verify real replay/masking/withdrawal. Do not remove the integration or historical recordings as a substitute for implementing consent.
- 2026-10-01 — Verify actual SDK payloads, including nested compression. PostHog's modern network masking callback also handles replay Meta navigation; preserve sanitized URL-only records and reject actual network details.
- 2026-10-01 — Sohazur says privacy UI must stay compact and unobtrusive: a short equal-choice prompt once, then footer settings. Keep technical/vendor detail in the policy, preserve explicit consent, and do not combine assistant conversation disclosure with optional analytics permission.

- 2026-10-01: Test all fixed notices together with the docked voice launcher on small screens; a consent bar that looks unobtrusive alone can hide the primary control.
- 2026-10-01 — Sohazur rejected duplicate cards and top-sticky notices. Keep the homepage consent at the bottom and integrate existing privacy surfaces so only one panel is visible. Raise the docked voice control only while that panel is visible; never convert saved marketing consent into a new assistant grant.
