
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
  search_category,
  search_address_location,
  stage_id
)
SELECT
  raw_data->>'id',
  raw_data->>'title',
  raw_data->'company'->>'display_name',
  raw_data->'location'->>'display_name',
  raw_data->'location'->'area'->>0,
  raw_data->'location'->'area'->>1,
  raw_data->>'description',
  raw_data->>'redirect_url',
  raw_data->'category'->>'label',
  (raw_data->>'created')::timestamp,
  fetched_at,
  search_category,
  search_address_location,
  id  -- stage.id
FROM stage.raw_jobs_adzuna_api
WHERE source = 'Adzuna';
  