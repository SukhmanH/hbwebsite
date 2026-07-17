# CLAUDE.md

## Project
Satellite vigor mapping for family vineyard blocks (Naramata to Oliver, South Okanagan, BC). Per-block Sentinel-2 NDVI/NDRE time series from 2019 to present. Extraction runs through Google Earth Engine; all analysis runs locally. Goal: surface irrigation failures, virus decline, and nutrient stress as below-baseline seasons against each block's own multi-year baseline, plus within-block vigor zoning.

## Config
- GEE_PROJECT_ID: vineyard-vigor
- Working CRS for all reductions: EPSG:32611 (UTM 11N). Never reproject silently.
- Season window: April 1 to October 31.
- Baseline years start 2019 (the 2017-18 L2A archive is thin).
- Block polygons: `data/blocks.geojson`, WGS84, planted extents drawn on a high-res basemap.

## Stack
Python 3.12 managed with uv. Dependencies: earthengine-api, geemap, geopandas, pandas, pyarrow, scikit-learn, scipy, matplotlib, jupyter.

All Earth Engine calls live in `src/vigor/extract.py` and nowhere else. Everything downstream (`clean.py`, `features.py`, `zones.py`, `vigor_alerts.py`) is pure pandas/sklearn and must run offline.

## Data contract
Single parquet table at `data/processed/block_timeseries.parquet` with columns:

`block_id, date, scene_id, ndvi_median, ndvi_p10, ndvi_p90, ndre_median, valid_frac`

- `valid_frac` = unmasked pixel count / total pixel count of the buffered block. Store every row; analysis drops rows with `valid_frac < 0.8`.
- `blocks.geojson` feature properties: `block_id` (required, e.g. `oliver-b1`), `site` (required), `variety`, `planting_year`. Area is computed in code, not stored as a property.

## Earth Engine rules
- Imagery: `COPERNICUS/S2_SR_HARMONIZED`. Reflectance = DN / 10000. No 2022 baseline-offset handling needed; the harmonized collection already aligns it.
- Cloud mask: `GOOGLE/CLOUD_SCORE_PLUS/V1/S2_HARMONIZED`, attached via `s2.linkCollection(csp, ['cs_cdf'])`, mask pixels with `cs_cdf < 0.60`.
- NDVI = (B8 - B4) / (B8 + B4) at 10 m. NDRE = (B8A - B5) / (B8A + B5) at 20 m; NDRE is a block-level statistic only, never used for zoning.
- Always server-side: `ImageCollection.map` plus `reduceRegions` with a combined reducer (median, percentiles [10, 90], count). Never a Python for-loop over scenes. Never `getInfo` inside a loop.
- Every `reduceRegions` / `sampleRegions` call sets `scale=10` and `crs='EPSG:32611'` explicitly (scale=20 for NDRE bands).
- Everything is lazy; errors only surface at `getInfo` or export time. Develop on one block and a two-week window first, then widen.
- Exports: `ee.batch.Export.table.toDrive` as CSV into `data/raw/`, then convert to parquet in `data/processed/`. For results under ~3000 rows, `getInfo` on a FeatureCollection is acceptable instead of an export.

## Geometry rules
- Load `blocks.geojson` (WGS84), project to EPSG:32611, apply `buffer(-1)` metres, and use the buffered geometry for every reduction. This trims immediate edge pixels while retaining nearly all of each block.
- Warn and skip any block that falls under 10 pixels after buffering.

## Phases and acceptance criteria
1. **Single-scene check.** One clear July 2024 scene, one block, Cloud Score+ masked NDVI displayed on a geemap map clipped to the buffered block with the outline overlaid. Pass: midsummer canopy NDVI sits in 0.5-0.75 (10 m pixels blend canopy and inter-row cover; values near 0.9 indicate a bug), and the spatial pattern matches ground knowledge.
2. **Full extraction.** All blocks, 2019 to present, into the parquet. Pass: curves show correct phenology (dormant 0.15-0.25, May green-up, July-August plateau, October decline), and 2024 shows delayed green-up or depressed peaks exactly in the blocks with known January 2024 freeze damage. This freeze check is the most important validation in the project.
3. **Cleaning and seasonal features.** Rolling-median outlier screen (wildfire smoke depresses NDVI without being flagged as cloud; expect it in August 2018, 2021, 2023), then Savitzky-Golay smoothing, then per-season per-block features: peak NDVI, May-September integral, green-up date.
4. **Vigor zones.** Per-pixel seasonal profiles via `toBands` plus a single `sampleRegions` call, k-means (k = 2-3) locally, zone maps per season. Pass: zones stable across years read as soil or rootstock; zones appearing in one year read as management, irrigation, or damage.
5. **Low-vigor alerts.** Per block: day-of-year baseline (median and IQR across prior seasons in a +/-10 day window), raise an alert when the current season sits below the 10th percentile for two consecutive observations. Compare against same-variety blocks in the same season: all down means weather, one down means a single-block cause. Statistics before ML; no model upgrades until this works.
6. **Automation.** Weekly local scheduled run (cron or Task Scheduler): pull new scenes, refresh the parquet, regenerate a static HTML dashboard in `outputs/dashboard/` with curves, zone maps, and active flags. No server.

## Testing
- Mock the `extract.py` boundary. Fixture: a cached exported CSV in `tests/fixtures/`. The full test suite must run offline.

## Conventions
- Dates are ISO, timezone-naive, using the scene sensing date.
- No hidden state: every output must be re-derivable from `blocks.geojson` plus the parquet.
- Figures go to `outputs/figures/`, named `{phase}_{block_id}_{description}.png`.
