CREATE TABLE account.users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  password_hash TEXT,  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE account.user_isochrones (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES account.users(id) ON DELETE CASCADE,
  label TEXT,  -- z. B. "Zuhause", "Arbeit", "Test Hamburg"
  cutoff_seconds INTEGER NOT NULL,  -- z. B. 900
  mode TEXT NOT NULL,               -- z. B. "WALK", "BICYCLE"
  center GEOMETRY(Point, 4326) NOT NULL,  -- Startpunkt
  polygon GEOMETRY(MultiPolygon, 4326) NOT NULL, -- Isochrone
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE account.user_saved_jobs (
  user_id INT REFERENCES account.users(id),
  job_id INT REFERENCES mart.jobs(id),
  saved_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, job_id)
);

CREATE TABLE account.user_visible_jobs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES account.users(id) ON DELETE CASCADE,
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

CREATE INDEX idx_user_isochrones_geom
  ON account.user_isochrones
  USING GIST(polygon);

