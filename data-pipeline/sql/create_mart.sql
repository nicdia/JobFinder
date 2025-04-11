-- common fields
BA
id, externalid, title, adtitle, company, location, postalcode, country, region, lat, lon, exernalurl, starting_date, modified_at, published_at, fetched_at, geom

Adzuna
id, external_id, title, company, location, country, region, lat, lon, description, externalurl, geom, publishedat, fetched_at

mart

CREATE TABLE mart.jobs (
  id SERIAL PRIMARY KEY,
  source TEXT,
  external_id TEXT,
  title TEXT,
  company TEXT,
  location TEXT,
  description TEXT,
  external_url TEXT,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  geom GEOMETRY(Point, 4326),
  published_at TIMESTAMP,
  starting_date TIMESTAMP
);


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
  publishedat,
  NULL AS starting_date          -- Adzuna hat kein Startdatum
FROM base.jobs_adzuna
WHERE geom IS NOT NULL;
