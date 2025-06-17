CREATE TABLE stage.raw_jobs_ba_api (
  id SERIAL PRIMARY KEY,
  source TEXT NOT NULL,
  raw_data JSONB NOT NULL,
  fetched_at TIMESTAMP DEFAULT NOW(),
  external_id TEXT,
  search_category TEXT,
  search_address_location TEXT,
  status TEXT DEFAULT 'new'
);

CREATE TABLE stage.raw_jobs_adzuna_api (
  id SERIAL PRIMARY KEY,
  source TEXT NOT NULL,
  raw_data JSONB NOT NULL,
  fetched_at TIMESTAMP DEFAULT NOW(),
  external_id TEXT,
  search_category TEXT,
  search_address_location TEXT,
  status TEXT DEFAULT 'new'
);

CREATE TABLE base.jobs_ba (
  id SERIAL PRIMARY KEY,
  external_id TEXT,
  title TEXT,
  ad_title TEXT,
  company TEXT,
  search_category TEXT,
  search_address_location TEXT,
  location TEXT,
  postal_code TEXT,
  country TEXT,
  region TEXT,
  distance_km TEXT,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  external_url TEXT,
  starting_date DATE,
  modified_at TIMESTAMP,
  published_at DATE,
  fetched_at TIMESTAMP,
  stage_id INTEGER,
  geom GEOMETRY(Point, 4326)
);

CREATE TABLE base.jobs_adzuna (
  id SERIAL PRIMARY KEY,
  external_id TEXT,
  title TEXT,
  company TEXT,
  search_category TEXT,
  search_address_location TEXT,
  location TEXT,
  country TEXT,
  region TEXT,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  geom GEOMETRY(Point, 4326),
  description TEXT,
  external_url TEXT,
  category TEXT,
  published_at TIMESTAMP,
  fetched_at TIMESTAMP,
  stage_id INTEGER
);

CREATE TABLE mart.jobs (
  id SERIAL PRIMARY KEY,
  source TEXT,
  external_id TEXT,
  title TEXT,
  company TEXT,
  search_category TEXT,
  search_address_location TEXT,
  location TEXT,
  description TEXT,
  external_url TEXT,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  geom GEOMETRY(Point, 4326),
  published_at TIMESTAMP,
  starting_date TIMESTAMP
);

-- Erstellt die Archivtabelle einmalig, falls noch nicht vorhanden
CREATE TABLE IF NOT EXISTS mart.jobs_archive (
  archive_id  SERIAL PRIMARY KEY,           -- eigenes PK für das Archiv
  snapshot_at TIMESTAMP NOT NULL,           -- Zeitstempel der Übernahme
  mart_id     INTEGER,                      -- ursprüngliche ID aus mart.jobs

  source  TEXT,
  external_id TEXT,
  title   TEXT,
  company TEXT,
  search_category TEXT,
  search_address_location TEXT,
  location TEXT,
  description TEXT,
  external_url TEXT,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  geom GEOMETRY(Point, 4326),
  published_at TIMESTAMP,
  starting_date TIMESTAMP
);
