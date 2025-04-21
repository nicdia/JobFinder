import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { EditLocationAlt, ShowChart, CropSquare } from "@mui/icons-material";

interface DrawToolbarProps {
  drawType: string | null;
  setDrawType: (type: string | null) => void;
}

const DrawToolbar = ({ drawType, setDrawType }: DrawToolbarProps) => {
  const handleChange = (_: any, newType: string | null) => {
    setDrawType(newType); // null = deaktivieren
  };

  return (
    <ToggleButtonGroup
      value={drawType}
      exclusive
      onChange={handleChange}
      sx={{
        position: "absolute",
        top: 16,
        right: 16,
        backgroundColor: "white",
        zIndex: 1000,
      }}
    >
      <ToggleButton value="Point" title="Punkt zeichnen">
        <EditLocationAlt />
      </ToggleButton>
      <ToggleButton value="LineString" title="Linie zeichnen">
        <ShowChart />
      </ToggleButton>
      <ToggleButton value="Polygon" title="Polygon zeichnen">
        <CropSquare />
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default DrawToolbar;
