type Coord = [number, number];

type CoordDict = {
  [table: string]: { coord: Coord }[];
};

export interface FetchOtpParams {
  corDict: CoordDict;
  url: string;
  precision: number;
  cutoff: number;
  mode: string;
  speed: number;
  date: string;
  time: string;
}

export interface ImportIsochroneParams {
  userId: number;
  label: string;
  cutoff: number;
  mode: string;
  center: [number, number];
  geojsonPolygon: any;
}
