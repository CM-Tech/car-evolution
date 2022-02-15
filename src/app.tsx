import { Download, Upload } from "@mui/icons-material";
import {
  Grid,
  ThemeProvider,
  createTheme,
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
} from "@mui/material";
import { Box } from "@mui/system";
import React, { useEffect, useRef, useState } from "react";
import { Car } from "../car";
import { PALETTE } from "./colors";
import { go } from "./main";
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
export const App = () => {
  const [score, setScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState<
    { score: number; ticks: number; car: Car }[]
  >([]);
  const handleImportCarRef = useRef((s: string) => {});
  const [terrain, setTerrain] = useState(
    [TerrainPreset.Rocky, TerrainPreset.Hills, TerrainPreset.Sisyphus][
      Math.floor(Math.random() * 3)
    ]
  );
  const [open, setOpen] = useState(false);
  const [importCarString, setImportCarString] = useState("");
  const [exportCarString, setExportCarString] = useState("");

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
      />
      <Box sx={{ top: 0, position: "absolute", padding: 1 }}>
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{ bgcolor: PALETTE.WHITISH }}
        >
          <Table sx={{ minWidth: 104 }} aria-label="simple table">
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
              label="Car Data"
              variant="outlined"
              value={importCarString}
              onChange={(e) => setImportCarString(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button
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
            <TextField
              label="Copyable Car Data"
              variant="outlined"
              value={exportCarString}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleExportClose}>Done</Button>
          </DialogActions>
        </Dialog>
        
        <Grid container sx={{ width: 1 }} gap={1}>
          <Grid item container flex="1" alignItems="end">

            <Box sx={{ typography: "h4", color: "primary" }}>
          Score: {score.toFixed(2)}
            </Box>
          </Grid>
          <Grid item flex="1">
            <Stack gap={1} alignItems={"end"}>
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
                    transition:"padding-right 0.25s"
                  }
                }}
              >
                <Upload
                  sx={{ fontSize: "48px", marginRight: 1, marginLeft: 1 }}
                />
                <Box
                component="div"
                  sx={{
                    letterSpacing: "-0.05em",
                    bgcolor: "warning.main",
                    padding: 1,
                    color: "warning.contrastText",
                    fontSize: "48px",
                    lineHeight: 1,
                    transition:"padding-right 0.25s",
                    
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
                    transition:"padding-right 0.25s"
                  }
                }}
              >
                <Download
                  sx={{ fontSize: "48px", marginRight: 1, marginLeft: 1 }}
                />
                <Box
                  sx={{
                    letterSpacing: "-0.05em",
                    bgcolor: "error.main",
                    padding: 1,
                    color: "error.contrastText",
                    fontSize: "48px",
                    lineHeight: 1,
                    transition:"padding-right 0.25s",
                
                  }}
                >
                  Export Best
                </Box>
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};
