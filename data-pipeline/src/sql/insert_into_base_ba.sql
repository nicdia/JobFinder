
INSERT INTO base.jobs_ba (
  external_id,
  title,
  ad_title,
  company,
  location,
  postal_code,
  country,
  region,
  distance_km,
  lat,
  lon,
  geom,
  external_url,
  starting_date,
  modified_at,
  published_at,
  fetched_at,
  stage_id
)
SELECT
  raw_data->>'refnr',
  raw_data->>'beruf',
  raw_data->>'titel',
  raw_data->>'arbeitgeber',
  raw_data->'arbeitsort'->>'ort',
  raw_data->'arbeitsort'->>'plz',
  raw_data->'arbeitsort'->>'land',
  raw_data->'arbeitsort'->>'region',
  raw_data->'arbeitsort'->>'entfernung',
  (raw_data->'arbeitsort'->'koordinaten'->>'lat')::double precision,
  (raw_data->'arbeitsort'->'koordinaten'->>'lon')::double precision,
  ST_SetSRID(
    ST_Point(
      (raw_data->'arbeitsort'->'koordinaten'->>'lon')::double precision,
      (raw_data->'arbeitsort'->'koordinaten'->>'lat')::double precision
    ),
    4326
  ),
  raw_data->>'externeUrl',
  (raw_data->>'eintrittsdatum')::date,
  (raw_data->>'modifikationsTimestamp')::timestamp,
  (raw_data->>'aktuelleVeroeffentlichungsdatum')::date,
  fetched_at,
  id  -- 🔁 das ist die stage.id → kommt in stage_id
FROM stage.raw_jobs_ba_api
WHERE source = 'BA';
