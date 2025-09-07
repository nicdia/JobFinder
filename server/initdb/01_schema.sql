--
-- PostgreSQL database dump
--

-- Dumped from database version 17.0 (Debian 17.0-1.pgdg110+1)
-- Dumped by pg_dump version 17.0 (Debian 17.0-1.pgdg110+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: account; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA account;


--
-- Name: base; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA base;


--
-- Name: mart; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA mart;


--
-- Name: stage; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA stage;


--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: user_drawn_search_requests; Type: TABLE; Schema: account; Owner: -
--

CREATE TABLE account.user_drawn_search_requests (
    id integer NOT NULL,
    req_name text NOT NULL,
    user_id integer,
    job_type text,
    transport_mode text,
    geom_type text NOT NULL,
    geom public.geometry(Geometry,4326) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    speed text,
    cutoff_seconds integer,
    CONSTRAINT user_drawn_search_requests_geom_type_check CHECK ((geom_type = ANY (ARRAY['Point'::text, 'LineString'::text, 'Polygon'::text])))
);


--
-- Name: user_drawn_search_requests_id_seq; Type: SEQUENCE; Schema: account; Owner: -
--

CREATE SEQUENCE account.user_drawn_search_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_drawn_search_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: account; Owner: -
--

ALTER SEQUENCE account.user_drawn_search_requests_id_seq OWNED BY account.user_drawn_search_requests.id;


--
-- Name: user_jobs_within_search_area; Type: TABLE; Schema: account; Owner: -
--

CREATE TABLE account.user_jobs_within_search_area (
    id integer NOT NULL,
    user_id integer,
    search_area_id integer,
    drawn_req_id integer,
    address_req_id integer,
    source text,
    external_id text,
    title text,
    company text,
    location text,
    description text,
    external_url text,
    lat double precision,
    lon double precision,
    geom public.geometry(Point,4326),
    published_at timestamp without time zone,
    starting_date timestamp without time zone,
    search_category text
);


--
-- Name: user_jobs_within_search_area_id_seq; Type: SEQUENCE; Schema: account; Owner: -
--

CREATE SEQUENCE account.user_jobs_within_search_area_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_jobs_within_search_area_id_seq; Type: SEQUENCE OWNED BY; Schema: account; Owner: -
--

ALTER SEQUENCE account.user_jobs_within_search_area_id_seq OWNED BY account.user_jobs_within_search_area.id;


--
-- Name: user_saved_jobs; Type: TABLE; Schema: account; Owner: -
--

CREATE TABLE account.user_saved_jobs (
    id integer NOT NULL,
    user_id integer NOT NULL,
    job_id integer NOT NULL,
    search_area_id integer,
    drawn_req_id integer,
    address_req_id integer,
    source text,
    external_id text,
    title text,
    company text,
    location text,
    description text,
    external_url text,
    lat double precision,
    lon double precision,
    geom public.geometry(Point,4326),
    published_at timestamp without time zone,
    starting_date timestamp without time zone,
    search_category text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: user_saved_jobs_id_seq; Type: SEQUENCE; Schema: account; Owner: -
--

CREATE SEQUENCE account.user_saved_jobs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_saved_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: account; Owner: -
--

ALTER SEQUENCE account.user_saved_jobs_id_seq OWNED BY account.user_saved_jobs.id;


--
-- Name: user_search_areas; Type: TABLE; Schema: account; Owner: -
--

CREATE TABLE account.user_search_areas (
    id integer NOT NULL,
    user_id integer NOT NULL,
    geom public.geometry(MultiPolygon,4326) NOT NULL,
    type text NOT NULL,
    source_point public.geometry(Point,4326),
    label text,
    cutoff_seconds integer,
    mode text,
    drawn_req_id integer,
    address_req_id integer,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT user_search_areas_type_check CHECK ((type = ANY (ARRAY['direct'::text, 'isochrone'::text])))
);


--
-- Name: user_search_areas_id_seq; Type: SEQUENCE; Schema: account; Owner: -
--

CREATE SEQUENCE account.user_search_areas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_search_areas_id_seq; Type: SEQUENCE OWNED BY; Schema: account; Owner: -
--

ALTER SEQUENCE account.user_search_areas_id_seq OWNED BY account.user_search_areas.id;


--
-- Name: user_search_requests; Type: TABLE; Schema: account; Owner: -
--

CREATE TABLE account.user_search_requests (
    id integer NOT NULL,
    user_id integer NOT NULL,
    req_name text,
    job_type text NOT NULL,
    speed text,
    address_display text,
    address_lat double precision,
    address_lon double precision,
    house_number text,
    transport_mode text,
    created_at timestamp without time zone DEFAULT now(),
    cutoff_seconds integer
);


--
-- Name: user_search_requests_id_seq; Type: SEQUENCE; Schema: account; Owner: -
--

CREATE SEQUENCE account.user_search_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_search_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: account; Owner: -
--

ALTER SEQUENCE account.user_search_requests_id_seq OWNED BY account.user_search_requests.id;


--
-- Name: users; Type: TABLE; Schema: account; Owner: -
--

CREATE TABLE account.users (
    id integer NOT NULL,
    email text NOT NULL,
    username text,
    password_hash text,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: account; Owner: -
--

CREATE SEQUENCE account.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: account; Owner: -
--

ALTER SEQUENCE account.users_id_seq OWNED BY account.users.id;


--
-- Name: jobs_adzuna; Type: TABLE; Schema: base; Owner: -
--

CREATE TABLE base.jobs_adzuna (
    id integer NOT NULL,
    external_id text,
    title text,
    company text,
    location text,
    country text,
    region text,
    lat double precision,
    lon double precision,
    geom public.geometry(Point,4326),
    description text,
    external_url text,
    category text,
    published_at timestamp without time zone,
    fetched_at timestamp without time zone,
    stage_id integer,
    search_category text,
    search_address_location text
);


--
-- Name: jobs_adzuna_id_seq; Type: SEQUENCE; Schema: base; Owner: -
--

CREATE SEQUENCE base.jobs_adzuna_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: jobs_adzuna_id_seq; Type: SEQUENCE OWNED BY; Schema: base; Owner: -
--

ALTER SEQUENCE base.jobs_adzuna_id_seq OWNED BY base.jobs_adzuna.id;


--
-- Name: jobs_ba; Type: TABLE; Schema: base; Owner: -
--

CREATE TABLE base.jobs_ba (
    id integer NOT NULL,
    external_id text,
    title text,
    ad_title text,
    company text,
    location text,
    postal_code text,
    country text,
    region text,
    distance_km text,
    lat double precision,
    lon double precision,
    external_url text,
    starting_date date,
    modified_at timestamp without time zone,
    published_at date,
    fetched_at timestamp without time zone,
    stage_id integer,
    geom public.geometry(Point,4326),
    search_category text,
    search_address_location text
);


--
-- Name: jobs_ba_id_seq; Type: SEQUENCE; Schema: base; Owner: -
--

CREATE SEQUENCE base.jobs_ba_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: jobs_ba_id_seq; Type: SEQUENCE OWNED BY; Schema: base; Owner: -
--

ALTER SEQUENCE base.jobs_ba_id_seq OWNED BY base.jobs_ba.id;


--
-- Name: jobs; Type: TABLE; Schema: mart; Owner: -
--

CREATE TABLE mart.jobs (
    id integer NOT NULL,
    source text,
    external_id text,
    title text,
    company text,
    location text,
    description text,
    external_url text,
    lat double precision,
    lon double precision,
    geom public.geometry(Point,4326),
    published_at timestamp without time zone,
    starting_date timestamp without time zone,
    search_category text,
    search_address_location text
);


--
-- Name: jobs_archive; Type: TABLE; Schema: mart; Owner: -
--

CREATE TABLE mart.jobs_archive (
    archive_id integer NOT NULL,
    snapshot_at timestamp without time zone NOT NULL,
    mart_id integer,
    source text,
    external_id text,
    title text,
    company text,
    search_category text,
    search_address_location text,
    location text,
    description text,
    external_url text,
    lat double precision,
    lon double precision,
    geom public.geometry(Point,4326),
    published_at timestamp without time zone,
    starting_date timestamp without time zone
);


--
-- Name: jobs_archive_archive_id_seq; Type: SEQUENCE; Schema: mart; Owner: -
--

CREATE SEQUENCE mart.jobs_archive_archive_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: jobs_archive_archive_id_seq; Type: SEQUENCE OWNED BY; Schema: mart; Owner: -
--

ALTER SEQUENCE mart.jobs_archive_archive_id_seq OWNED BY mart.jobs_archive.archive_id;


--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: mart; Owner: -
--

CREATE SEQUENCE mart.jobs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: mart; Owner: -
--

ALTER SEQUENCE mart.jobs_id_seq OWNED BY mart.jobs.id;


--
-- Name: jobs; Type: TABLE; Schema: stage; Owner: -
--

CREATE TABLE stage.jobs (
    id integer NOT NULL,
    title text NOT NULL,
    company text NOT NULL,
    description text,
    location text,
    lat double precision,
    lon double precision,
    geom public.geometry(Point,4326)
);


--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: stage; Owner: -
--

CREATE SEQUENCE stage.jobs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: stage; Owner: -
--

ALTER SEQUENCE stage.jobs_id_seq OWNED BY stage.jobs.id;


--
-- Name: raw_jobs_adzuna_api; Type: TABLE; Schema: stage; Owner: -
--

CREATE TABLE stage.raw_jobs_adzuna_api (
    id integer NOT NULL,
    source text NOT NULL,
    raw_data jsonb NOT NULL,
    fetched_at timestamp without time zone DEFAULT now(),
    external_id text,
    status text DEFAULT 'new'::text,
    search_address_location text,
    search_category text
);


--
-- Name: raw_jobs_adzuna_api_id_seq; Type: SEQUENCE; Schema: stage; Owner: -
--

CREATE SEQUENCE stage.raw_jobs_adzuna_api_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: raw_jobs_adzuna_api_id_seq; Type: SEQUENCE OWNED BY; Schema: stage; Owner: -
--

ALTER SEQUENCE stage.raw_jobs_adzuna_api_id_seq OWNED BY stage.raw_jobs_adzuna_api.id;


--
-- Name: raw_jobs_ba_api; Type: TABLE; Schema: stage; Owner: -
--

CREATE TABLE stage.raw_jobs_ba_api (
    id integer NOT NULL,
    source text NOT NULL,
    raw_data jsonb NOT NULL,
    fetched_at timestamp without time zone DEFAULT now(),
    external_id text,
    status text DEFAULT 'new'::text,
    search_address_location text,
    search_category text
);


--
-- Name: raw_jobs_ba_api_id_seq; Type: SEQUENCE; Schema: stage; Owner: -
--

CREATE SEQUENCE stage.raw_jobs_ba_api_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: raw_jobs_ba_api_id_seq; Type: SEQUENCE OWNED BY; Schema: stage; Owner: -
--

ALTER SEQUENCE stage.raw_jobs_ba_api_id_seq OWNED BY stage.raw_jobs_ba_api.id;


--
-- Name: user_drawn_search_requests id; Type: DEFAULT; Schema: account; Owner: -
--

ALTER TABLE ONLY account.user_drawn_search_requests ALTER COLUMN id SET DEFAULT nextval('account.user_drawn_search_requests_id_seq'::regclass);


--
-- Name: user_jobs_within_search_area id; Type: DEFAULT; Schema: account; Owner: -
--

ALTER TABLE ONLY account.user_jobs_within_search_area ALTER COLUMN id SET DEFAULT nextval('account.user_jobs_within_search_area_id_seq'::regclass);


--
-- Name: user_saved_jobs id; Type: DEFAULT; Schema: account; Owner: -
--

ALTER TABLE ONLY account.user_saved_jobs ALTER COLUMN id SET DEFAULT nextval('account.user_saved_jobs_id_seq'::regclass);


--
-- Name: user_search_areas id; Type: DEFAULT; Schema: account; Owner: -
--

ALTER TABLE ONLY account.user_search_areas ALTER COLUMN id SET DEFAULT nextval('account.user_search_areas_id_seq'::regclass);


--
-- Name: user_search_requests id; Type: DEFAULT; Schema: account; Owner: -
--

ALTER TABLE ONLY account.user_search_requests ALTER COLUMN id SET DEFAULT nextval('account.user_search_requests_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: account; Owner: -
--

ALTER TABLE ONLY account.users ALTER COLUMN id SET DEFAULT nextval('account.users_id_seq'::regclass);


--
-- Name: jobs_adzuna id; Type: DEFAULT; Schema: base; Owner: -
--

ALTER TABLE ONLY base.jobs_adzuna ALTER COLUMN id SET DEFAULT nextval('base.jobs_adzuna_id_seq'::regclass);


--
-- Name: jobs_ba id; Type: DEFAULT; Schema: base; Owner: -
--

ALTER TABLE ONLY base.jobs_ba ALTER COLUMN id SET DEFAULT nextval('base.jobs_ba_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: mart; Owner: -
--

ALTER TABLE ONLY mart.jobs ALTER COLUMN id SET DEFAULT nextval('mart.jobs_id_seq'::regclass);


--
-- Name: jobs_archive archive_id; Type: DEFAULT; Schema: mart; Owner: -
--

ALTER TABLE ONLY mart.jobs_archive ALTER COLUMN archive_id SET DEFAULT nextval('mart.jobs_archive_archive_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: stage; Owner: -
--

ALTER TABLE ONLY stage.jobs ALTER COLUMN id SET DEFAULT nextval('stage.jobs_id_seq'::regclass);


--
-- Name: raw_jobs_adzuna_api id; Type: DEFAULT; Schema: stage; Owner: -
--

ALTER TABLE ONLY stage.raw_jobs_adzuna_api ALTER COLUMN id SET DEFAULT nextval('stage.raw_jobs_adzuna_api_id_seq'::regclass);


--
-- Name: raw_jobs_ba_api id; Type: DEFAULT; Schema: stage; Owner: -
--

ALTER TABLE ONLY stage.raw_jobs_ba_api ALTER COLUMN id SET DEFAULT nextval('stage.raw_jobs_ba_api_id_seq'::regclass);


--
-- Name: user_drawn_search_requests user_drawn_search_requests_pkey; Type: CONSTRAINT; Schema: account; Owner: -
--

ALTER TABLE ONLY account.user_drawn_search_requests
    ADD CONSTRAINT user_drawn_search_requests_pkey PRIMARY KEY (id);


--
-- Name: user_jobs_within_search_area user_jobs_within_search_area_pkey; Type: CONSTRAINT; Schema: account; Owner: -
--

ALTER TABLE ONLY account.user_jobs_within_search_area
    ADD CONSTRAINT user_jobs_within_search_area_pkey PRIMARY KEY (id);


--
-- Name: user_saved_jobs user_saved_jobs_pkey; Type: CONSTRAINT; Schema: account; Owner: -
--

ALTER TABLE ONLY account.user_saved_jobs
    ADD CONSTRAINT user_saved_jobs_pkey PRIMARY KEY (id);


--
-- Name: user_saved_jobs user_saved_jobs_unique; Type: CONSTRAINT; Schema: account; Owner: -
--

ALTER TABLE ONLY account.user_saved_jobs
    ADD CONSTRAINT user_saved_jobs_unique UNIQUE (user_id, job_id);


--
-- Name: user_search_areas user_search_areas_pkey; Type: CONSTRAINT; Schema: account; Owner: -
--

ALTER TABLE ONLY account.user_search_areas
    ADD CONSTRAINT user_search_areas_pkey PRIMARY KEY (id);


--
-- Name: user_search_requests user_search_requests_pkey; Type: CONSTRAINT; Schema: account; Owner: -
--

ALTER TABLE ONLY account.user_search_requests
    ADD CONSTRAINT user_search_requests_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: account; Owner: -
--

ALTER TABLE ONLY account.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: account; Owner: -
--

ALTER TABLE ONLY account.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: account; Owner: -
--

ALTER TABLE ONLY account.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: jobs_adzuna jobs_adzuna_pkey; Type: CONSTRAINT; Schema: base; Owner: -
--

ALTER TABLE ONLY base.jobs_adzuna
    ADD CONSTRAINT jobs_adzuna_pkey PRIMARY KEY (id);


--
-- Name: jobs_ba jobs_ba_pkey; Type: CONSTRAINT; Schema: base; Owner: -
--

ALTER TABLE ONLY base.jobs_ba
    ADD CONSTRAINT jobs_ba_pkey PRIMARY KEY (id);


--
-- Name: jobs_archive jobs_archive_pkey; Type: CONSTRAINT; Schema: mart; Owner: -
--

ALTER TABLE ONLY mart.jobs_archive
    ADD CONSTRAINT jobs_archive_pkey PRIMARY KEY (archive_id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: mart; Owner: -
--

ALTER TABLE ONLY mart.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: stage; Owner: -
--

ALTER TABLE ONLY stage.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: raw_jobs_adzuna_api raw_jobs_adzuna_api_pkey; Type: CONSTRAINT; Schema: stage; Owner: -
--

ALTER TABLE ONLY stage.raw_jobs_adzuna_api
    ADD CONSTRAINT raw_jobs_adzuna_api_pkey PRIMARY KEY (id);


--
-- Name: raw_jobs_ba_api raw_jobs_ba_api_pkey; Type: CONSTRAINT; Schema: stage; Owner: -
--

ALTER TABLE ONLY stage.raw_jobs_ba_api
    ADD CONSTRAINT raw_jobs_ba_api_pkey PRIMARY KEY (id);


--
-- Name: idx_drawn_requests_geom; Type: INDEX; Schema: account; Owner: -
--

CREATE INDEX idx_drawn_requests_geom ON account.user_drawn_search_requests USING gist (geom);


--
-- Name: idx_user_isochrones_geom; Type: INDEX; Schema: account; Owner: -
--

CREATE INDEX idx_user_isochrones_geom ON account.user_search_areas USING gist (geom);


--
-- Name: idx_user_jobs_search_area; Type: INDEX; Schema: account; Owner: -
--

CREATE INDEX idx_user_jobs_search_area ON account.user_jobs_within_search_area USING btree (search_area_id);


--
-- Name: user_drawn_search_requests user_drawn_search_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: account; Owner: -
--

ALTER TABLE ONLY account.user_drawn_search_requests
    ADD CONSTRAINT user_drawn_search_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES account.users(id) ON DELETE CASCADE;


--
-- Name: user_jobs_within_search_area user_jobs_within_search_area_address_req_id_fkey; Type: FK CONSTRAINT; Schema: account; Owner: -
--

ALTER TABLE ONLY account.user_jobs_within_search_area
    ADD CONSTRAINT user_jobs_within_search_area_address_req_id_fkey FOREIGN KEY (address_req_id) REFERENCES account.user_search_requests(id) ON DELETE CASCADE;


--
-- Name: user_jobs_within_search_area user_jobs_within_search_area_drawn_req_id_fkey; Type: FK CONSTRAINT; Schema: account; Owner: -
--

ALTER TABLE ONLY account.user_jobs_within_search_area
    ADD CONSTRAINT user_jobs_within_search_area_drawn_req_id_fkey FOREIGN KEY (drawn_req_id) REFERENCES account.user_drawn_search_requests(id) ON DELETE CASCADE;


--
-- Name: user_jobs_within_search_area user_jobs_within_search_area_search_area_id_fkey; Type: FK CONSTRAINT; Schema: account; Owner: -
--

ALTER TABLE ONLY account.user_jobs_within_search_area
    ADD CONSTRAINT user_jobs_within_search_area_search_area_id_fkey FOREIGN KEY (search_area_id) REFERENCES account.user_search_areas(id) ON DELETE CASCADE;


--
-- Name: user_jobs_within_search_area user_jobs_within_search_area_user_id_fkey; Type: FK CONSTRAINT; Schema: account; Owner: -
--

ALTER TABLE ONLY account.user_jobs_within_search_area
    ADD CONSTRAINT user_jobs_within_search_area_user_id_fkey FOREIGN KEY (user_id) REFERENCES account.users(id) ON DELETE CASCADE;


--
-- Name: user_saved_jobs user_saved_jobs_address_req_id_fkey; Type: FK CONSTRAINT; Schema: account; Owner: -
--

ALTER TABLE ONLY account.user_saved_jobs
    ADD CONSTRAINT user_saved_jobs_address_req_id_fkey FOREIGN KEY (address_req_id) REFERENCES account.user_search_requests(id) ON DELETE CASCADE;


--
-- Name: user_saved_jobs user_saved_jobs_drawn_req_id_fkey; Type: FK CONSTRAINT; Schema: account; Owner: -
--

ALTER TABLE ONLY account.user_saved_jobs
    ADD CONSTRAINT user_saved_jobs_drawn_req_id_fkey FOREIGN KEY (drawn_req_id) REFERENCES account.user_drawn_search_requests(id) ON DELETE CASCADE;


--
-- Name: user_saved_jobs user_saved_jobs_job_id_fkey; Type: FK CONSTRAINT; Schema: account; Owner: -
--

ALTER TABLE ONLY account.user_saved_jobs
    ADD CONSTRAINT user_saved_jobs_job_id_fkey FOREIGN KEY (job_id) REFERENCES account.user_jobs_within_search_area(id) ON DELETE CASCADE;


--
-- Name: user_saved_jobs user_saved_jobs_search_area_id_fkey; Type: FK CONSTRAINT; Schema: account; Owner: -
--

ALTER TABLE ONLY account.user_saved_jobs
    ADD CONSTRAINT user_saved_jobs_search_area_id_fkey FOREIGN KEY (search_area_id) REFERENCES account.user_search_areas(id) ON DELETE CASCADE;


--
-- Name: user_saved_jobs user_saved_jobs_user_id_fkey; Type: FK CONSTRAINT; Schema: account; Owner: -
--

ALTER TABLE ONLY account.user_saved_jobs
    ADD CONSTRAINT user_saved_jobs_user_id_fkey FOREIGN KEY (user_id) REFERENCES account.users(id) ON DELETE CASCADE;


--
-- Name: user_search_areas user_search_areas_address_req_id_fkey; Type: FK CONSTRAINT; Schema: account; Owner: -
--

ALTER TABLE ONLY account.user_search_areas
    ADD CONSTRAINT user_search_areas_address_req_id_fkey FOREIGN KEY (address_req_id) REFERENCES account.user_search_requests(id) ON DELETE CASCADE;


--
-- Name: user_search_areas user_search_areas_drawn_req_id_fkey; Type: FK CONSTRAINT; Schema: account; Owner: -
--

ALTER TABLE ONLY account.user_search_areas
    ADD CONSTRAINT user_search_areas_drawn_req_id_fkey FOREIGN KEY (drawn_req_id) REFERENCES account.user_drawn_search_requests(id) ON DELETE CASCADE;


--
-- Name: user_search_requests user_search_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: account; Owner: -
--

ALTER TABLE ONLY account.user_search_requests
    ADD CONSTRAINT user_search_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES account.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

