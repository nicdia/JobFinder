export interface GeocodeTableOptions {
  table: string;
  idField: string;
  addressFields: string[];
  latField: string;
  lonField: string;
  geomField: string;
  limit?: number;
}

export interface PipelineConfig {
  searchParamsInApis: [string, string]; // z. B. [job, ort]
  tablesToBeGeocoded: GeocodeTableOptions[];
}
