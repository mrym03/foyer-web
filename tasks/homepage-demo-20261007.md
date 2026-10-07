# Public demo controls - 2026-10-07

## Decisions
1. Owners: Sohazur requests a working demo after Jesse260's pre-purchase report. Live verification found the demo agent failed after a refresh, and the homepage hides chat/end-call controls at the top of the page.
2. Delete: do not build another widget, custom call toolbar, provider, or billing exception. Reuse the working standard widget controls.
3. Simplify: dock the existing widget whenever a call or text panel is open. Make the existing hero launch button accessible.
4. Accelerate: verify the state transition with focused tests before publishing, then test live desktop/mobile controls.
5. Automate last: add regression tests only for the confirmed control visibility defect; no new scheduled jobs.

## Plan
- [x] Reproduce hidden controls during a connected production session.
- [x] Keep active conversation controls visible and remove incorrect accessibility hiding.
- [ ] Run regression tests, publish the scoped change, and verify the live website.
- [ ] Record outcome and limitations.
