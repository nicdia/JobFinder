CREATE TABLE account.users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  password_hash TEXT,  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE account.user_search_areas (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  geom GEOMETRY(MULTIPOLYGON, 4326) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('direct', 'isochrone')),
  source_point GEOMETRY(POINT, 4326),  -- nur bei type = 'isochrone'
  label TEXT,
  cutoff_seconds INTEGER,              -- nur bei type = 'isochrone'
  mode TEXT,                           -- WALK / BIKE / etc.
  created_at TIMESTAMP DEFAULT now()
);
CREATE INDEX idx_user_isochrones_geom
  ON account.user_search_areas
  USING GIST(geom);


CREATE TABLE account.user_jobs_within_search_area (
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
