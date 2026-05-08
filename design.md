# Foyer Design

## Overview

This repo is a static marketing site for Foyer. There is no framework, no bundler, and no component system. The site is built around a single source-of-truth file, `index.html`, plus a small set of SVG and metadata assets.

The design goal is a premium, cinematic landing page for a voice sales product:

- dark, high-contrast foundation
- restrained palette with one warm accent
- large editorial type
- purposeful motion instead of decorative motion
- product demo embedded directly into the hero instead of a fake app shell

If you change the site, preserve that feeling. Avoid generic SaaS UI patterns.

## Repo Structure

- `index.html`: entire site layout, CSS, structured data, and JavaScript
- `posthog-analytics.js`: custom analytics events layered on top of the inline PostHog init
- `og-image.svg`: social preview image
- `logo.svg`, `logo-inv.svg`, `foyer.svg`, `favicon.svg`: brand assets
- `1.svg`, `2.svg`, `5.svg`: source vector assets used for brand mark / wordmark path extraction
- `llms.txt`: machine-readable product summary
- `_redirects`: static hosting redirect rules from `foyer.ink` to `tryfoyer.ai`
- `robots.txt`, `sitemap.xml`, `site.webmanifest`, `ads.txt`: SEO / metadata support files

## Architecture

### Rendering model

The page is serverless static HTML. All styling is embedded in the `<style>` block inside `index.html`, and all interactions live in inline `<script>` blocks plus `posthog-analytics.js`.

There is no separation between template, styles, and behavior. That means changes should be made carefully:

- visual changes usually touch CSS and markup in the same file
- copy changes often need matching updates in JSON-LD FAQ data
- widget-related changes can affect both hero styling and docked behavior

### External dependencies

The page depends on:

- Google Fonts for `Inter`
- PostHog for analytics
- `https://app.tryfoyer.ai/static/widget.js` for the live Foyer widget embed

There is no package manager dependency graph in this repo.

## Page Anatomy

Top-to-bottom, the page is organized as:

1. Fixed nav
2. Hero with live widget anchor
3. Scrolling ticker
4. Problem section
5. Product / features section
6. How-it-works section with embed snippet
7. Browser mockup section
8. Dashboard section
9. Pricing section
10. FAQ section
11. Final CTA
12. Footer

Use the existing order and cadence unless there is a strong product reason to change it.

## Visual System

### Core tokens

The main design tokens live in `:root` inside `index.html`.

- `--bg`: `#1b1b1b`
- `--fg`: `#eeede9`
- `--surface`: `#252525`
- `--amber`: `#F59E0B`
- opacity tokens: `--fg72`, `--fg65`, `--fg40`, `--fg30`, `--fg24`, `--fg16`, `--fg08`
- motion curve: `--ease: cubic-bezier(0.16,1,0.3,1)`

The palette is intentionally narrow. Most of the personality comes from contrast, translucency, blur, and motion rather than from many colors.

### Typography

- Primary font: `Inter`
- Code font: SF Mono / Fira Code / Roboto Mono fallbacks
- Hero type is large, dense, and slightly tight-tracked
- Section titles are broad and calm, not overly compressed
- Supporting copy stays muted and readable, usually `var(--fg65)` or `var(--fg72)`

Avoid adding novelty fonts or extra weights unless the whole page direction is being reconsidered.

### Spacing

The site uses shared layout primitives:

- `.container`: max-width `1160px`
- `.section`: vertical rhythm `clamp(7rem,12vw,10rem)`
- `.section-tag`: small uppercase bracketed label
- `.section-title`: shared section headline style

New sections should use these primitives by default. One-off spacing is the main way a section starts to feel disconnected from the rest of the page.

### Surfaces

Most UI is built from:

- transparent or near-transparent backgrounds
- subtle borders using low-opacity foreground values
- soft blur / glass treatment on featured cards
- restrained shadows, mostly to separate cards from the animated background

Do not switch individual sections to flat light cards or brightly colored panels unless the whole site is being redesigned.

## Background and Atmosphere

The page’s visual identity depends heavily on the fixed background system:

- a WebGL gradient canvas
- a low-opacity noise canvas layered on top
- mouse-reactive distortion and chromatic separation in the gradient effect

The brand color mix is:

- warm orange
- deep teal
- near-black blue-gray

This background is not decorative filler. It is the main atmospheric layer of the site. Changes here affect every section.

## Key Components

### Nav

The nav is fixed and becomes blurred/opaque on scroll. Desktop shows inline links and CTA. Mobile swaps to a burger and full-screen overlay menu.

### Hero

The hero is the signature section of the site.

- The real product widget is staged in the hero, not a static mock.
- A custom `heroAgentShell` mirrors widget state visually.
- The shell can appear idle, listening, speaking, thinking, muted, or docked.
- On scroll, the widget transitions from hero presentation to bottom-docked mode.

This hero should feel like product theater, not a screenshot with copy above it.

### Ticker

The ticker gives motion and quick product framing. It supports the hero and should stay lightweight.

### Problem / Product / How-It-Works

These sections are the narrative spine:

- problem framing
- capability breakdown
- installation / onboarding clarity

They should read cleanly and sequentially. Avoid copy that becomes too dense or too technical here.

### Browser mockup

This is a stylized demonstration layer that reinforces page navigation and conversational UI. It should remain diagrammatic, not photorealistic.

### Dashboard

This section translates product value into outcomes:

- transcripts
- lead capture
- analytics
- returning visitor memory

Cards here should stay simple and information-heavy.

### Pricing

Pricing uses a three-card grid with one featured plan. The featured plan should remain visually clear without becoming louder than the hero.

### FAQ

The FAQ now follows the same section rhythm as the rest of the page and uses a split intro + accordion layout.

Important constraints:

- no emoji flags
- no noisy plus/minus glyph treatment
- no uneven card spacing
- no multiple open cards at once
- copy should stay plainspoken and clean

The FAQ is intentionally calmer than before. Keep it that way.

### Final CTA

The final CTA returns to a more open, atmospheric presentation. It should feel like a confident closing beat, not a pricing repeat.

## Motion and Interaction

The site uses motion in a few specific places:

- nav state on scroll
- hero title entrance
- hero widget shell pulsing / waveform / dock transition
- reveal-on-scroll for section elements
- background gradient response to mouse velocity
- FAQ accordion

Motion should communicate state and energy. Do not add generic microinteractions everywhere.

## Responsive System

The main breakpoints are:

- `900px`
- `768px`
- `640px`
- `480px`
- `360px`

Key responsive behaviors:

- nav collapses to burger on smaller screens
- multi-column sections collapse to single-column layouts
- hero widget anchor changes position and size aggressively on mobile
- docked widget width is constrained for narrow screens
- FAQ intro/layout collapses to a single column

Any new layout work should be tested against those same breakpoint tiers.

## Content and SEO

`index.html` includes:

- standard meta description and social tags
- JSON-LD for organization, website, software application, offers, and FAQ
- canonical URL
- sitemap and robots references

When changing product claims, pricing, FAQ wording, or supported features, update:

1. visible page copy
2. JSON-LD structured data
3. `llms.txt` if the product summary changed materially

## Analytics

Analytics are split across two places:

- inline PostHog initialization in `index.html`
- event wiring in `posthog-analytics.js`

Tracked actions currently include:

- landing page load
- CTA clicks
- nav anchor clicks
- hero agent shell click
- embed snippet copy

If new interactive elements are added, decide whether they are product-significant enough to track.

## Deployment Model

This repo is suitable for any static host. `_redirects` suggests Netlify-style redirect handling is expected for production domain forwarding.

There is no build step. In practice, shipping means publishing the static files as-is.

## Editing Guidance

### Preserve

- single-file simplicity unless there is a strong reason to split
- shared `.section` / `.container` rhythm
- narrow color palette
- premium dark visual language
- real widget-first hero presentation

### Avoid

- framework-specific assumptions
- random spacing overrides per section
- bright accent colors beyond the established amber
- emoji or novelty iconography inside body copy
- placeholder-ish SaaS patterns that flatten the brand
- copy punctuation that feels harsher or noisier than the rest of the page

### Before changing copy

Check whether the same claim appears in:

- hero / body copy
- pricing
- FAQ
- JSON-LD
- `llms.txt`

### Before changing interactions

Check whether the same behavior touches:

- hero shell state classes
- widget dock/hero CSS selectors
- scroll listeners
- MutationObserver sync with the embedded widget
- analytics event capture

## Practical Rule

If a change makes the page feel more like a generic SaaS template and less like a polished product film with a live voice widget, it is probably the wrong change.
