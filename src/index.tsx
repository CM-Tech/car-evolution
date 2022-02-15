import React from "react";
import { render } from "react-dom";
import { App } from "./app";
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
} from "@mui/material";
import { CYAN_MUL, MAGENTA_MUL, PALETTE, YELLOW_MUL } from "./colors";
import chroma from "chroma-js";
const t = createTheme({
  palette: {
    primary: { main: "#312D32", contrastText: "#EAE8E5" },
    warning: { main: chroma.blend(YELLOW_MUL,PALETTE.WHITE,'multiply').hex(), contrastText: "#EAE8E5" },
    error: { main: chroma.blend(YELLOW_MUL,chroma.blend(MAGENTA_MUL,PALETTE.WHITE,'multiply').hex(),'multiply').hex(), contrastText: "#EAE8E5" },
    info:{main: chroma.blend(CYAN_MUL,chroma.blend(MAGENTA_MUL,PALETTE.WHITE,'multiply').hex(),'multiply').hex(),contrastText: "#EAE8E5" },
    success: { main: chroma.blend(CYAN_MUL,chroma.blend(YELLOW_MUL,PALETTE.WHITE,'multiply').hex(),'multiply').hex(), contrastText: "#EAE8E5" },
    divider: "#44372f",
  },
  typography: {
    button: {
      textTransform: "capitalize",
      // fontSize: 0.875 * 1.75 + "rem",
      // lineHeight: 1.75 / 1.75,
    },
  },
  shape: { borderRadius: 0 },
});
render(
  <ThemeProvider theme={t}>
    <App />
  </ThemeProvider>,
  document.getElementById("root")
);
