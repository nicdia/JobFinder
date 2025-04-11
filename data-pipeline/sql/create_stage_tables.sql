CREATE TABLE stage.raw_jobs_ba_api (
  id SERIAL PRIMARY KEY,
  source TEXT NOT NULL,
  raw_data JSONB NOT NULL,
  fetched_at TIMESTAMP DEFAULT NOW(),
  external_id TEXT,          -- z. B. job->>'refnr' bei BA
  status TEXT DEFAULT 'new'  -- später nützlich für Verarbeitung
);


CREATE TABLE stage.raw_jobs_adzuna_api (
  id SERIAL PRIMARY KEY,
  source TEXT NOT NULL,
  raw_data JSONB NOT NULL,
  fetched_at TIMESTAMP DEFAULT NOW(),
  external_id TEXT,          -- z. B. job->>'refnr' bei BA
  status TEXT DEFAULT 'new'  -- später nützlich für Verarbeitung
);
