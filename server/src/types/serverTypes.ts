import { Request } from "express";

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
  center: [number, number]; // [lon, lat]
  geojsonPolygon: any;
  drawnReqId?: number | null; // optional
  addressReqId?: number | null; // optional
}

export interface AuthRequest extends Request {
  user?: { id: number };
}

export interface ProcessPointsParams {
  userId: number;
  coordinates: [number, number][]; // Array von Punkten (Latitude, Longitude)
  params: {
    cutoff?: number;
    mode?: string;
    speed?: number;
    date?: string;
    time?: string;
    req_name?: string;
    drawnReqId?: number | null;
    addressReqId?: number | null;
    reqName?: string;
  };
}
