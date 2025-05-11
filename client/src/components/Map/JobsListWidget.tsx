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
  coord: [number, number]; // [lon,lat] WGS84
}

interface Props {
  jobs: JobItem[];
  onSelect: (job: JobItem) => void;
}

export default function JobsListWidget({ jobs, onSelect }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip title="Job‑Liste">
        <Fab
          color="primary"
          sx={{ position: "absolute", bottom: 24, right: 24, zIndex: 1100 }}
          onClick={() => setOpen((p) => !p)}
        >
          {open ? <CloseIcon /> : <WorkIcon />}
        </Fab>
      </Tooltip>

      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 320, p: 2 }}>
          <List dense>
            {jobs.map((j) => (
              <ListItemButton
                key={j.id}
                onClick={() => {
                  onSelect(j);
                  setOpen(false);
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
