import {
  Download,
  Upload,
  Terrain,
  Speed,
  FastForward,
  PlayArrow,
} from "@mui/icons-material";
import {
  Grid,
  ThemeProvider,
  createTheme,
  Typography,
  Collapse,
  Switch,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogActions,
  TextField,
  DialogContent,
  Stack,
  Slider,
} from "@mui/material";
import { Box } from "@mui/system";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Car } from "./car";
import { PALETTE } from "./colors";
import { Simulation } from "./simulation";
import { TerrainPreset } from "./terrain";

function throttle(func, timeout = 100) {
  let timer;
  return (...args) => {
    if (!timer) {
      func.apply(this, args);

      // clearTimeout(timer);
      timer = setTimeout(() => {
        timer = undefined;
      }, timeout);
    }
  };
}
const Ts = [TerrainPreset.Rocky, TerrainPreset.Hills, TerrainPreset.Sisyphus];
export const App = () => {
  const [score, setScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState<
    { score: number; ticks: number; car: Car }[]
  >([]);
  const handleImportCarRef = useRef((s: string) => {});
  const [terrain, setTerrain] = useState(Ts[Math.floor(Math.random() * 3)]);
  const [open, setOpen] = useState(false);
  const [importCarString, setImportCarString] = useState("");
  const [importCarValue, setImportCarValue] = useState<Car | null>(null);
  useEffect(() => {
    new Car().importCar(importCarString).then((v) => setImportCarValue(v));
  }, [importCarString]);
  const [exportCarString, setExportCarString] = useState("");
  const [simSpeedValue, setSimSpeedValue] = useState(5);
  const simSpeedValueRef = useRef(simSpeedValue);
  useEffect(() => {
    simSpeedValueRef.current = simSpeedValue;
  }, [simSpeedValue]);
  const [autoFastValue, setAutoFastValue] = useState(true);
  const autoFastValueRef = useRef(autoFastValue);
  useEffect(() => {
    autoFastValueRef.current = autoFastValue;
  }, [autoFastValue]);
  const [exportOpen, setExportOpen] = useState(false);
  const handleExportClose = () => {
    setExportOpen(false);
  };
  const handleClose = () => {
    setOpen(false);
  };
  return (
    <Box>
      <Simulation
        handleImportCarRef={handleImportCarRef}
        setScore={throttle((x) => setScore(x))}
        setLeaderboard={throttle((x) => setLeaderboard(x))}
        terrain={terrain}
        simSpeedValueRef={simSpeedValueRef}
        autoFastValueRef={autoFastValueRef}
      />
      <Box sx={{ top: 0, position: "absolute", padding: 1 }}>
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ bgcolor: PALETTE.WHITISH }}
        >
          <Table
            sx={{
              minWidth: 104,
              "& th, & td": { fontWeight: 600 },
              "& td": { fontFamily: "'IBM Plex Mono', monospace" },
            }}
            aria-label="simple table"
          >
            <TableHead>
              <TableRow>
                <TableCell align="right">Score</TableCell>
                <TableCell align="right">Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaderboard.map((row, i) => (
                <TableRow
                  key={row.score + "_" + row.ticks}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell align="right">{row.score.toFixed(2)}</TableCell>
                  <TableCell align="right">
                    {(row.ticks / 75).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Box sx={{ top: 0, right: 0, position: "absolute", padding: 1 }}>
        <Box
          sx={{
            typography: "h4",
            color: "primary.main",
            fontWeight: 700,
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          {score.toFixed(2)}
        </Box>
      </Box>
      <Box
        sx={{
          bottom: 0,
          position: "absolute",
          width: 1,
          padding: 1,
          boxSizing: "border-box",
        }}
      >
        <Dialog onClose={handleClose} open={open}>
          <DialogTitle>Import Car</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label=""
              variant="outlined"
              value={importCarString}
              onChange={(e) => setImportCarString(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button
              disabled={importCarValue === null}
              onClick={() => {
                handleClose();
                handleImportCarRef.current(importCarString);
              }}
            >
              Import
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog onClose={handleExportClose} open={exportOpen}>
          <DialogTitle>Export Car</DialogTitle>
          <DialogContent>
            <TextField label="" variant="outlined" value={exportCarString} />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleExportClose}>Done</Button>
          </DialogActions>
        </Dialog>

        <Grid container sx={{ width: 1 }} gap={1}>
          <Grid item container flex="1" alignItems="end">
            <Stack gap={1}>
              <Collapse in={!autoFastValue}>
                <Box sx={{ height: 128, margin: 1 }}>
                  <Slider
                    orientation="vertical"
                    value={simSpeedValue}
                    min={1}
                    max={100}
                    onChange={(e) => {
                      setSimSpeedValue(e.target.value);
                    }}
                    sx={{
                      "& .MuiSlider-track": {
                        border: "none",
                      },
                      "& .MuiSlider-thumb": {
                        borderRadius: 0,
                        "&:before": {
                          borderRadius: 0,

                          boxShadow: "none",
                        },
                        boxShadow: "none",
                        "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
                          boxShadow: "inherit",
                        },
                      },
                    }}
                  />
                </Box>
              </Collapse>
              <Box>
                <Stack
                  spacing={1}
                  direction="row"
                  alignItems="center"
                  onClick={(e) => {
                    setAutoFastValue(!autoFastValue);
                  }}
                  sx={{ color: "primary.main" }}
                >
                  {autoFastValue ? (
                    <FastForward sx={{ fontSize: "48px" }} />
                  ) : (
                    <PlayArrow sx={{ fontSize: "48px" }} />
                  )}
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{ color: "primary.main" }}
                  >
                    {autoFastValue ? (
                      <Box component="span" sx={{ fontStyle: "italic" }}>
                        Automatic
                      </Box>
                    ) : (
                      <Box component="span">Adjustable</Box>
                    )}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </Grid>
          <Grid item flex="1">
            <Stack
              gap={1}
              alignItems={"end"}
              justifyContent={"end"}
              sx={{ height: 1 }}
            >
              <Button
                disableElevation
                size="large"
                onClick={() => {
                  setOpen(true);
                  setImportCarString("");
                }}
                sx={{
                  padding: 0,
                  ":hover div": {
                    paddingRight: 3,
                    transition: "padding-right 0.25s",
                  },
                }}
              >
                <Upload
                  sx={{ fontSize: "48px", marginRight: 1, marginLeft: 1 }}
                />
                <Box
                  component="div"
                  sx={{
                    letterSpacing: "-0.044em",
                    fontWeight: 600,
                    bgcolor: "warning.main",
                    padding: 1,
                    color: "warning.contrastText",
                    fontSize: "48px",
                    lineHeight: 1,
                    transition: "padding-right 0.25s",
                    borderRadius: 1,
                  }}
                >
                  Import Car
                </Box>
              </Button>
              <Button
                disableElevation
                size="large"
                onClick={() => {
                  if (leaderboard.length > 0) {
                    let m = leaderboard[0].car;
                    setExportCarString(m.exportCar());
                    setExportOpen(true);
                  }
                }}
                sx={{
                  padding: 0,
                  ":hover div": {
                    paddingRight: 3,
                    transition: "padding-right 0.25s",
                  },
                }}
              >
                <Download
                  sx={{ fontSize: "48px", marginRight: 1, marginLeft: 1 }}
                />
                <Box
                  sx={{
                    letterSpacing: "-0.044em",
                    fontWeight: 600,
                    bgcolor: "error.main",
                    padding: 1,
                    color: "error.contrastText",
                    fontSize: "48px",
                    lineHeight: 1,
                    transition: "padding-right 0.25s",
                    borderRadius: 1,
                  }}
                >
                  Export Best
                </Box>
              </Button>
              <Button
                disableElevation
                size="large"
                onClick={() => {
                  setTerrain(Ts[(Ts.indexOf(terrain) + 1) % Ts.length]);
                }}
                sx={{
                  padding: 0,
                  ":hover div": {
                    paddingRight: 3,
                    transition: "padding-right 0.25s",
                  },
                }}
              >
                <Terrain
                  sx={{ fontSize: "48px", marginRight: 1, marginLeft: 1 }}
                />
                <Box
                  sx={{
                    letterSpacing: "-0.044em",
                    fontWeight: 600,
                    bgcolor: "success.main",
                    padding: 1,
                    color: "success.contrastText",
                    fontSize: "48px",
                    lineHeight: 1,
                    transition: "padding-right 0.25s",
                    borderRadius: 1,
                  }}
                >
                  Switch Terrain
                </Box>
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};
