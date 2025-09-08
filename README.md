                                    BUGLISTE

Fullscreen soll mittig aufklappen derzeit nach links + Jobs details übershcneiet sich mit löscjhen
leicht mittel schnell umbauen statt selbst kmh selbst angeben oder ein info ding was avg geschwi.

# Jobfinder

JobFinder is a map‑based job search platform. It combines a React front end, a Node.js/Express API and a PostGIS database. A separate data pipeline imports job postings from public APIs and geocodes them so that users can search for jobs within custom areas on a map.

## Features

- **Interactive map UI** built with React and OpenLayers for drawing search areas, displaying results and managing saved jobs.
- **REST API** written in TypeScript using Express with JWT based authentication.
- **Data pipeline** that periodically fetches job listings from the Bundesagentur für Arbeit and Adzuna APIs, geocodes them and loads them into a PostGIS database.
- **Routing / Isochrones** powered by an [OpenTripPlanner](https://www.opentripplanner.org/) service to limit search results to user defined travel times.
- **Docker first** development setup with services for the client, API, database, data pipeline and OTP router.

## Project structure

```
├── client/           # React front end
├── server/           # Express API
├── data-pipeline/    # Job import and processing scripts
├── docker-compose.yml
└── README.md
```

## Prerequisites

[Docker](https://docs.docker.com/get-docker/)

- Optional: Node.js 20+ if you want to run the services outside of Docker

## Quick start

1. Create a `.env` file in the repository root with at least:

   ```dotenv
   PG_USER=postgres
   PG_PASSWORD=dia
   PG_DATABASE=jobhunter
   JWT_SECRET=change-me
   OTP_BASE_URL=http://otp:8080
   OTP_PATH_PREFIX=/otp/routers
   OTP_ROUTER_ID=current
   ```

2. Build and start all services:

   ```bash
   docker compose up -d --build
   ```

   This starts the PostGIS database, API, client front end and an OpenTripPlanner instance.

3. Populate the database with job data (one-off run):

   ```bash
   docker compose run --rm pipeline
   ```

4. Open the application in your browser at `http://localhost:3000` (default).

## Running locally without Docker

Each component is written in TypeScript and can be run independently:

```bash
# API
cd server
npm ci
npm run dev

# Front end
cd ../client
npm ci
npm run dev
```

The data pipeline can be run with `npm run start:dev` from `data-pipeline/`.

## Testing

Unit tests are managed with Jest in the `server` package.

```bash
cd server
npm test
```

## More Docker Commands for the app

docker compose up -d
docker compose logs -f --tail=100
docker compose logs -f api # nur Backend
docker compose logs -f client # nur Frontend
docker compose logs -f otp # OTP
docker compose logs -f db # DB
docker compose ps -- ports und status angucken der container
docker compose build api client && docker compose up -d -- nach Codeänderungen
docker compose run --rm pipeline -- pipeline starten einmalig

## Starting OTP

java -Xmx8G -jar otp.jar --router current --graphs graphs --server

## License

This project is distributed under the ISC license. See the individual `package.json` files for details.
