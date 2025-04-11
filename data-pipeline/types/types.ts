export interface GeocodeTableOptions {
  table: string;
  idField: string;
  addressFields: string[];
  latField: string;
  lonField: string;
  geomField: string;
  limit?: number;
}
