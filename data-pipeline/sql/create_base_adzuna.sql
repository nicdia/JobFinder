CREATE TABLE base.jobs_adzuna (
  id SERIAL PRIMARY KEY,
  external_id TEXT,
  title TEXT,
  company TEXT,
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
  stage_id INTEGER REFERENCES stage.raw_jobs_adzuna_api(id)
);


INSERT INTO base.jobs_adzuna (
  external_id,
  title,
  company,
  location,
  country,
  region,

  description,
  external_url,
  category,
  published_at,
  fetched_at,
  stage_id
)
SELECT
  raw_data->>'id',
  raw_data->>'title',
  raw_data->'company'->>'display_name',
  
  raw_data->'location'->>'display_name',
  raw_data->'location'->'area'->>0,
  raw_data->'location'->'area'->>1
  raw_data->>'description',
  raw_data->>'redirect_url',
  raw_data->'category'->>'label',
  (raw_data->>'created')::timestamp,
  fetched_at,
  id  -- stage.id
FROM stage.raw_jobs_adzuna_api
WHERE source = 'Adzuna';
