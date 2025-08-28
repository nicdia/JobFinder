
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
  starting_date,
  search_category,
  search_address_location
)

-- Teil 1: BA
SELECT
  'BA' AS source,
  external_id,
  ad_title AS title,
  company,
  location,
  NULL AS description,          
  external_url,
  lat,
  lon,
  geom,
  published_at,
  starting_date,
  search_category,
  search_address_location
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
  NULL AS starting_date,
  search_category,
  search_address_location         -- Adzuna hat kein Startdatum
FROM base.jobs_adzuna
WHERE geom IS NOT NULL;
