import { Stack, Typography, Box, Button, SxProps } from "@mui/material";
import { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  title: string;
  description: string;
  buttonLabel: string;
  onClick: () => void;
  sx?: SxProps;
};

const DashboardSection = ({
  icon,
  title,
  description,
  buttonLabel,
  onClick,
  sx = {},
}: Props) => {
  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      justifyContent="space-between"
    >
      <Stack direction="row" spacing={1} alignItems="center">
        {icon}
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>
            {title}
          </Typography>
          <Typography variant="body2">{description}</Typography>
        </Box>
      </Stack>
      <Button variant="outlined" onClick={onClick} sx={{ minWidth: 140 }}>
        {buttonLabel}
      </Button>
    </Stack>
  );
};

export default DashboardSection;
