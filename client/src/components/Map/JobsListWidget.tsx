import {
  Fab,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Tooltip,
  Box,
  IconButton,
} from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import CloseIcon from "@mui/icons-material/Close";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useState } from "react";
import { saveUserJob, deleteUserSavedJob } from "../../services/savedJobs";

export interface JobItem {
  id: string | number;
  title: string;
  company?: string;
  coord: [number, number];
}

interface Props {
  jobs: JobItem[];
  onSelect: (job: JobItem) => void;
  onOpenPopup?: (job: JobItem) => void;
  userId?: number;
  initialSavedIds?: (string | number)[]; // 👈 neu
}

function ensureSet<T>(val: unknown): Set<T> {
  return val instanceof Set ? (val as Set<T>) : new Set<T>();
}

export default function JobsListWidget({
  jobs,
  onSelect,
  onOpenPopup,
  userId,
  initialSavedIds = [],
}: Props) {
  const [open, setOpen] = useState(false);

  const [savedIds, setSavedIds] = useState<Set<string | number>>(
    new Set(initialSavedIds) // 👈 direkt setzen
  );
  const [loadingIds, setLoadingIds] = useState<Set<string | number>>(new Set());

  const handlePick = (j: JobItem) => {
    onSelect(j);
    onOpenPopup?.(j);
    setOpen(false);
  };

  const handleToggleSave = async (j: JobItem) => {
    // schon in Arbeit? raus
    if (ensureSet(loadingIds).has(j.id)) return;

    const isSavedNow = ensureSet(savedIds).has(j.id);

    // optimistic on
    setLoadingIds((prev) => {
      const p = ensureSet<string | number>(prev);
      const n = new Set(p);
      n.add(j.id);
      return n;
    });
    setSavedIds((prev) => {
      const p = ensureSet<string | number>(prev);
      const n = new Set(p);
      isSavedNow ? n.delete(j.id) : n.add(j.id);
      return n;
    });

    try {
      if (isSavedNow) {
        const res = await deleteUserSavedJob(Number(j.id), { id: userId });
        if (!res?.deleted) throw new Error("Delete failed");
      } else {
        const res = await saveUserJob(Number(j.id), { id: userId });
        if (!res?.saved) throw new Error("Save failed");
      }
    } catch (err) {
      console.error("[JobsListWidget] toggle save error:", err);
      // rollback
      setSavedIds((prev) => {
        const p = ensureSet<string | number>(prev);
        const n = new Set(p);
        isSavedNow ? n.add(j.id) : n.delete(j.id);
        return n;
      });
      alert(
        isSavedNow
          ? "Konnte Job nicht entfernen."
          : "Konnte Job nicht speichern."
      );
    } finally {
      setLoadingIds((prev) => {
        const p = ensureSet<string | number>(prev);
        const n = new Set(p);
        n.delete(j.id);
        return n;
      });
    }
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
        <Box sx={{ width: 360, p: 2 }}>
          <List dense>
            {jobs.map((j) => {
              const isSaved = ensureSet(savedIds).has(j.id);
              const isLoading = ensureSet(loadingIds).has(j.id);
              return (
                <ListItem
                  key={j.id}
                  disablePadding
                  secondaryAction={
                    <Tooltip
                      title={isSaved ? "Gespeichert – entfernen" : "Merken"}
                    >
                      <span>
                        <IconButton
                          edge="end"
                          size="small"
                          aria-label={isSaved ? "Gespeichert" : "Merken"}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSave(j);
                          }}
                          disabled={isLoading}
                        >
                          {isSaved ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                        </IconButton>
                      </span>
                    </Tooltip>
                  }
                >
                  <ListItemButton
                    onClick={() => handlePick(j)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") handlePick(j);
                    }}
                    sx={{ pr: 9 }} // Platz für secondaryAction
                  >
                    <ListItemText primary={j.title} secondary={j.company} />
                  </ListItemButton>
                </ListItem>
              );
            })}
            {jobs.length === 0 && (
              <ListItemText primary="Keine Jobs gefunden" />
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
