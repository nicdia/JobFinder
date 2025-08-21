CREATE TABLE account.users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  password_hash TEXT,  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE account.user_search_areas (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL,
  geom            GEOMETRY(MULTIPOLYGON, 4326) NOT NULL,
  type            TEXT NOT NULL CHECK (type IN ('direct','isochrone')),
  source_point    GEOMETRY(POINT,4326),
  label           TEXT,
  cutoff_seconds  INTEGER,
  mode            TEXT,
  drawn_req_id    INTEGER REFERENCES account.user_drawn_search_requests(id) ON DELETE CASCADE,
  address_req_id  INTEGER REFERENCES account.user_search_requests(id)      ON DELETE CASCADE,
  created_at      TIMESTAMP DEFAULT now(),
);

CREATE INDEX idx_user_isochrones_geom
  ON account.user_search_areas
  USING GIST(geom);

CREATE TABLE account.user_jobs_within_search_area (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER REFERENCES account.users(id) ON DELETE CASCADE,
  search_area_id  INTEGER REFERENCES account.user_search_areas(id) ON DELETE CASCADE,
  drawn_req_id    INTEGER REFERENCES account.user_drawn_search_requests(id) ON DELETE CASCADE,
  address_req_id  INTEGER REFERENCES account.user_search_requests(id)      ON DELETE CASCADE,
  source          TEXT,
  external_id     TEXT,
  title           TEXT,
  company         TEXT,
  location        TEXT,
  description     TEXT,
  external_url    TEXT,
  lat             DOUBLE PRECISION,
  lon             DOUBLE PRECISION,
  geom            GEOMETRY(Point,4326),
  published_at    TIMESTAMP,
  starting_date   TIMESTAMP,
);

CREATE INDEX idx_user_jobs_search_area
  ON account.user_jobs_within_search_area (search_area_id);

CREATE TABLE account.user_search_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES account.users(id) ON DELETE CASCADE,
  req_name TEXT,
  job_type TEXT NOT NULL,
  speed TEXT,
  cutoff_seconds INTEGER,
  address_display TEXT,
  address_lat DOUBLE PRECISION,
  address_lon DOUBLE PRECISION,
  house_number TEXT,
  transport_mode TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE account.user_drawn_search_requests (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER REFERENCES account.users(id) ON DELETE CASCADE,
  req_name       TEXT NOT NULL,
  job_type TEXT NOT NULL,
  speed TEXT,
  cutoff_seconds INTEGER,
  transport_mode TEXT,
  geom_type      TEXT NOT NULL CHECK (geom_type IN ('Point','LineString','Polygon')),
  geom           GEOMETRY(Geometry, 4326) NOT NULL,
  created_at     TIMESTAMP DEFAULT now()
);


CREATE INDEX idx_drawn_requests_geom
  ON account.user_drawn_search_requests
  USING GIST (geom);
