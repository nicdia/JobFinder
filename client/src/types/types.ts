export interface DrawToolbarProps {
  drawType: string | null;
  setDrawType: (type: string | null) => void;
}

export interface DrawToolbarProps {
  drawType: string | null;
  setDrawType: (type: string | null) => void;
  onAbortDraw: () => void;
  onSubmitDraw: () => void;
}
