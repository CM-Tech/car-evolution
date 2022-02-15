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
const t = createTheme({
  palette: {
    primary: { main: "#312D32", contrastText: "#EAE8E5" },
    warning: { main: "#D6BC5C", contrastText: "#EAE8E5" },
    error: { main: "#DD424E", contrastText: "#EAE8E5" },
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
