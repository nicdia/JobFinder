import { Feature } from "ol";
import { Geometry } from "ol/geom";
import { Map } from "ol";
import { Dispatch, SetStateAction } from "react";

export interface MapComponentProps {
  fetchFunction: () => Promise<any>;
  onFeatureClick?: (feature: Feature<Geometry>) => void;
  mapRef?: React.RefObject<Map | null>; // <— NEU!
  disableFeatureInfo?: boolean;
}

export type DrawType = "Polygon" | "Point" | "LineString" | null;
export interface DrawToolbarProps {
  isDrawMode: boolean;
  setIsDrawMode: Dispatch<SetStateAction<boolean>>;
  drawType: DrawType;
  setDrawType: Dispatch<SetStateAction<DrawType>>;
  onAbortDraw: () => void;
  onSubmitDraw: () => void;
}

export interface FeatureCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Record<string, string>) => void;
}

export interface NominatimResult {
  display_name: string;
  lon: string;
  lat: string;
}

export interface Props {
  value: string;
  setValue: (val: string) => void;
  onSelectLocation: (coords: { lon: number; lat: number }) => void;
}
