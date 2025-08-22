import {
  Fab,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Tooltip,
  Box,
} from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";

export interface JobItem {
  id: string | number;
  title: string;
  company?: string;
  coord: [number, number]; // [lon,lat] WGS84
}

interface Props {
  jobs: JobItem[];
  onSelect: (job: JobItem) => void; // z.B. zoomTo(job.coord)
  onOpenPopup?: (job: JobItem) => void; // optional: Popup öffnen
}

export default function JobsListWidget({ jobs, onSelect, onOpenPopup }: Props) {
  const [open, setOpen] = useState(false);

  const handlePick = (j: JobItem) => {
    onSelect(j); // Zoom (bestehendes Verhalten)
    onOpenPopup?.(j); // zusätzlich: Popup öffnen (falls übergeben)
    setOpen(false);
  };

  return (
    <>
      <Tooltip title="Job-Liste">
        <Fab
          color="primary"
          sx={{ position: "absolute", bottom: 24, left: 24, zIndex: 1100 }}
          onClick={() => setOpen((p) => !p)}
          aria-label={open ? "Job-Liste schließen" : "Job-Liste öffnen"}
        >
          {open ? <CloseIcon /> : <WorkIcon />}
        </Fab>
      </Tooltip>

      <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 320, p: 2 }}>
          <List dense>
            {jobs.map((j) => (
              <ListItemButton
                key={j.id}
                onClick={() => handlePick(j)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handlePick(j);
                }}
              >
                <ListItemText primary={j.title} secondary={j.company} />
              </ListItemButton>
            ))}
            {jobs.length === 0 && (
              <ListItemText primary="Keine Jobs gefunden" />
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
