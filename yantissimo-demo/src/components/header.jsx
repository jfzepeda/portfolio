import { Box, Stack, Typography } from "@mui/material";

const Header = ({
  title,
  subtitle,
  actions,
  startIcon,
  children,
  sx,
  titleSx,
  subtitleSx,
}) => {
  return (
    <Box
      sx={{
        mb: 2,
        pt: 1,
        pl: { xs: 0, md: "56px" },
        ...sx,
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "flex-start" }}
        spacing={2}
      >
        <Stack direction="row" spacing={1.25} alignItems="flex-start">
          {startIcon ? (
            <Box sx={{ display: "flex", pt: 0.4, color: "primary.main" }}>
              {startIcon}
            </Box>
          ) : null}
          <Box>
            <Typography variant="h4" sx={titleSx}>
              {title}
            </Typography>
            {subtitle ? (
              <Typography
                variant="subtitle1"
                color="text.secondary"
                sx={subtitleSx}
              >
                {subtitle}
              </Typography>
            ) : null}
          </Box>
        </Stack>

        {actions ? <Box sx={{ flexShrink: 0 }}>{actions}</Box> : null}
      </Stack>

      {children ? <Box sx={{ mt: 1.5 }}>{children}</Box> : null}
    </Box>
  );
};

export default Header;
