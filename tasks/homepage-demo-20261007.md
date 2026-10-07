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
- [x] Run regression tests, publish the scoped change, and verify the live website.
- [x] Record outcome and limitations.

## Review
- Published `ccd72a5` to main. Live HTML matches the committed file exactly (SHA-256 `6041b0aeed4d9c6c42da8f8522376bb854cb34fff6d205bf583cc20bf5dd2590`).
- Seven new controller tests plus 24 existing consent tests pass; all inline JavaScript parses and git diff check passes. Test dependencies were reused from the Talklayer worktree, with no package or environment-file changes here.
- Live desktop: speech recognized, relevant English answer returned, pricing request scrolled to pricing, chat opened, call ended and microphone tracks stopped.
- Live mobile emulation at 390x844: speech recognized and answered, chat and end-call controls fit the viewport without horizontal overflow; ending the call returned READY. Returning to page top restored the hero launcher.
- Tests used generated speech through a synthetic microphone, never room audio. Physical mobile microphone permissions, Safari and Firefox were not tested in this task.
- Initial conversation-save 503 responses recovered through the existing retries after provider metadata became available; no privacy gates were changed. Fresh page load without the synthetic test harness has no console errors.
- No customer settings, plans or billing were changed. Separate production-data recovery restored only Foyer's own demo agent; broader pipeline recovery is outside this small homepage code patch.
