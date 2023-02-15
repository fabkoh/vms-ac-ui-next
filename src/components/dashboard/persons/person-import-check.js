import * as React from "react";
import PropTypes from "prop-types";
import {
  styled,
  createMuiTheme,
  ThemeProvider,
  createTheme,
} from "@mui/material/styles";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import styles from "./person-import-check.module.css";

import {
  Avatar,
  Alert,
  AlertTitle,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Step,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { rruleDescriptionWithBr } from "../../../utils/rrule-desc";
import { rrulestr } from "rrule";

const theme = createMuiTheme({
  overrides: {
    MuiTableCell: {
      root: {
        color: "#F44336",
      },
    },
    MuiTableCell: {
      root: {
        color: "#F44336",
      },
    },
  },
});
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

const BootstrapDialogTitle = (props) => {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
};

BootstrapDialogTitle.propTypes = {
  children: PropTypes.node,
  onClose: PropTypes.func.isRequired,
};

export default function PersonImportCheck({
  errorMessages,
  handleClose,
  open,
  selectedSchedules,
  handleSelectFactory,
  selectedSomeSchedules,
  selectedAllSchedules,
  handleSelectAllSchedules,
  deleteSchedules,
  csvData,
  ...rest
}) {
  const greenCount = csvData.filter((obj) => obj.Color === "green").length;
  const redCount = csvData.filter((obj) => obj.Color === "red").length;
  const greenData = csvData.filter((obj) => obj.Color === "green");
  const redData = csvData.filter((obj) => obj.Color === "red");

  return (
    // enable scrolling
    // Helper text
    <Dialog onBackdropClick={handleClose} fullWidth maxWidth="lg" open={open}>
      <DialogTitle sx={{ color: "#111827" }} fontSize={{ fontSize: "32px" }}>
        Import Confirmation
      </DialogTitle>
      <DialogContent>
        <Box marginTop={1} marginBottom={5}>
          <Alert severity="info" variant="outlined">
            <AlertTitle>Import Check</AlertTitle>
            <p>{`We detected ${greenCount} entries which have format or validation errors and will not be added into the database. They are highlighted in red below. ${redCount} entries will be added without issues on confirmation.`}</p>
          </Alert>
        </Box>
        <ThemeProvider theme={theme}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>First Name</TableCell>
                <TableCell>Last Name</TableCell>
                <TableCell>UID</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Mobile Number</TableCell>
                <TableCell>Credential type</TableCell>
                <TableCell>Credential pin</TableCell>
                <TableCell>Credential Expiry</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {redData &&
                redData.map((item) => {
                  return (
                    <TableRow
                      key={item.UID}
                      // theme={theme}
                      // className={styles.tableRow}
                      // style={{ color: "#F44336" }}
                    >
                      <TableCell>{item["﻿First Name"]}</TableCell>
                      <TableCell>{item["Last Name"]}</TableCell>
                      <TableCell>{item.UID}</TableCell>
                      <TableCell>{item.Email}</TableCell>
                      <TableCell>{item["Mobile Number"]}</TableCell>
                      <TableCell>{item["Credential type"]}</TableCell>
                      <TableCell>{item["Credential pin"]}</TableCell>
                      <TableCell>
                        {item["Credential Expiry (YYYY-MM-DD HOUR-MIN-SEC)"]}
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
            <TableBody>
              {greenData &&
                greenData.map((item) => {
                  return (
                    <TableRow
                      key={item.UID}
                      className="tableRow"
                      // style={{ color: "#F44336" }}
                    >
                      <TableCell>{item["﻿First Name"]}</TableCell>
                      <TableCell>{item["Last Name"]}</TableCell>
                      <TableCell>{item.UID}</TableCell>
                      <TableCell>{item.Email}</TableCell>
                      <TableCell>{item["Mobile Number"]}</TableCell>
                      <TableCell>{item["Credential type"]}</TableCell>
                      <TableCell>{item["Credential pin"]}</TableCell>
                      <TableCell>
                        {item["Credential Expiry (YYYY-MM-DD HOUR-MIN-SEC)"]}
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </ThemeProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={deleteSchedules}
          // sx={{ color: "#F44336" }}
          autoFocus
          variant="contained"
          color="success"
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
