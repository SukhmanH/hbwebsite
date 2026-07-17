---
name: vigor-dashboard
description: Rebuild, verify, or extend the interactive vineyard vigor dashboard (outputs/dashboard/index.html). Use whenever the user asks to refresh the dashboard, add a chart/section/KPI to it, restyle it, fix its rendering, or after any processed parquet (timeseries, features, zones, alerts) is regenerated. Also use before editing src/vigor/webdash.py or src/vigor/_webassets.py.
---

# Vigor dashboard: rebuild and extend

The dashboard is ONE self-contained HTML file written to `outputs/dashboard/index.html`.
No server, no external hosts, works offline from a `file:` URL. Two modules produce it:

- `src/vigor/webdash.py` — reads the processed parquets + `data/blocks.geojson`,
  shapes everything into one JSON payload (`DATA`), calls `render_page`.
- `src/vigor/_webassets.py` — the CSS/JS/HTML template. Hand-rolled SVG charts in
  vanilla JS; the JSON payload is spliced in place of `__DATA__`.

## Rebuild

```
PYTHONPATH=src uv run python -m vigor.webdash
```

(The package is not installed into the venv; pytest gets `src` via pythonpath, a
plain `python -m` does not.)

## Automation and publishing (the page ships with the family website)

The dashboard is committed as `public/vigor/index.html` in
https://github.com/SukhmanH/hbwebsite (Astro, linked in the site nav as
"Vigor Data"); once that site is hosted it serves at `/vigor/` (intended
domain hbbrosvineyards.com — NOT resolving as of 2026-07-17, hosting not yet
connected; verify before quoting a live URL).

`scripts/weekly_update.py` is the Phase 6 orchestrator: incremental Earth
Engine pull (short window since the last stored date — a year-wide interactive
pull trips EE's "Too many concurrent aggregations" limit), derived-parquet
rebuild, dashboard rebuild, then a push to the website repo *only when the
data payload changed* (the generated-at timestamp is ignored). A Windows Task
Scheduler job **"Vineyard Vigor Weekly Update"** runs it Mondays 07:30 via
`scripts/weekly_update.cmd`; it logs to `outputs/logs/weekly_update.log` —
check that log first when the site looks stale. Manual run:

```
uv run python scripts/weekly_update.py [--no-extract] [--no-publish] [--force-publish]
```

After changing the dashboard's look or features, run the tests, then
`uv run python scripts/weekly_update.py --no-extract --force-publish` to ship
the new page without waiting for Monday.

The season-curve charts (`timeseries`/`ndre` payload keys) are deliberately
the **cleaned Phase 3 series** (outlier screen + Savitzky-Golay), not raw
scene readings — raw spikes are cloud/smoke artifacts the grower read as fake
stress. Keep raw readings reachable via the baseline chart and CSVs; do not
"fix" the curves back to raw.

## Hard constraints (test-enforced — breaking these fails `tests/test_dashboard.py`)

- The rendered page must contain no `src="http`, no `cdn` substring (any case),
  no `data:image/png;base64,`, and no leftover `__DATA__`/`__CSS__`/`__JS__` tokens.
- The JS must begin exactly `const DATA = <json>;\nconst $ = ...` — a test regex
  extracts and json-parses the payload from those two lines.
- Keep existing payload keys and meanings (`blocks`, `timeseries`, `baseline`,
  `zones`, `features`, `kpis` with `latest_ndvi`/`active_alerts`, ...). Add new
  keys; never rename or repurpose old ones.
- `build_dashboard` must work when optional parquets are missing: only
  `block_timeseries.parquet` is required; alerts/zones/features may be `None`.
- Every data-derived string reaches the DOM via `textContent`, never `innerHTML`
  (labels come from parquet/CSV headers and are untrusted).

## Design rules (dataviz reference palette — keep the page coherent)

- Series colors come from `THEME_LIGHT`/`THEME_DARK` (7 slots). Slot 8 (red) is
  deliberately absent: red is reserved so the freeze year and flagged readings can
  wear `--critical` without a series impersonating an alert.
- Years and blocks are identities: assign hues in fixed sorted order, never cycle
  on visibility changes. The freeze year (`DATA.freeze_year`) is always critical red.
- Dark mode is its own stepped palette, not a filter; the page re-renders on
  `prefers-color-scheme` change. Status colors (good/warn/critical) never color a
  series, and status is always icon + label, never color alone.
- One y-axis per chart. New chart = new `lineChart(...)` call or a new small
  renderer; do not add a second scale to an existing chart.
- Everything a tooltip reveals must also be reachable statically (a table, the
  stress log, the CSV downloads) — tooltips enhance, never gate.

## Adding a section (the pattern)

1. In `webdash.py`: add a `_something_json(...)` producer — plain Python types
   only, floats rounded (3–4 dp), dates as ISO strings — and wire it into the
   `data` dict in `build_dashboard`.
2. In `_webassets.py`: add the section markup to `_TEMPLATE`, a `renderX()`
   function in `_JS`, and call it from `renderAll()` (charts that depend on
   width also go in the `resize` listener).
3. Verify, in this order:
   - `uv run pytest -q` (offline suite must stay green),
   - rebuild (command above),
   - open `outputs/dashboard/index.html` in a browser: check the console for
     errors, click through block cards / legend toggles, and eyeball BOTH light
     and dark mode (emulate via devtools) for label collisions and contrast.

## Grower-facing intent

Every addition should answer a grower question ("which block needs attention,
is it weather or my irrigation, how does this season compare"), not showcase
data. Statistics before ML; the alert logic lives in `vigor_alerts.py` and the
dashboard only presents it. Pre-planting seasons (before each block's
`baseline_start` in blocks.geojson) are previous ground cover — never present
them as vine "typical" values.
