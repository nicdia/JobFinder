
WITH snap AS (SELECT CURRENT_TIMESTAMP AS ts)
INSERT INTO mart.jobs_archive (
  snapshot_at,
  mart_id,
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
SELECT
  (SELECT ts FROM snap),        
  id,                           
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
FROM mart.jobs;
