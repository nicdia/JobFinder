
INSERT INTO mart.jobs (
  source,
  external_id,
  title,
  company,
  location,
  description,
  external_url,
  lat,
  lon,
  geom,
  published_at,
  starting_date
)

-- Teil 1: BA
SELECT
  'BA' AS source,
  external_id,
  ad_title AS title,
  company,
  location,
  NULL AS description,            -- BA hat kein description-Feld direkt
  external_url,
  lat,
  lon,
  geom,
  published_at,
  starting_date
FROM base.jobs_ba
WHERE geom IS NOT NULL

UNION ALL

-- Teil 2: Adzuna
SELECT
  'Adzuna' AS source,
  external_id,
  title,
  company,
  location,
  description,
  external_url,
  lat,
  lon,
  geom,
  published_at,
  NULL AS starting_date          -- Adzuna hat kein Startdatum
FROM base.jobs_adzuna
WHERE geom IS NOT NULL;
