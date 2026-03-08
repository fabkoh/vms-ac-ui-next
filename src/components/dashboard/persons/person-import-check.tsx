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
import { useState } from "react";

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
  TablePagination,
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
  csvData,
  submitGreenData,
  ...rest
}) {
  const greenData = csvData.filter((obj) => obj.Color === "green");
  const redData = csvData.filter((obj) => obj.Color === "red");
  const greenCount = greenData.length;
  const redCount = redData.length;

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    console.log(page);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  // for submit button
  const [showButton, setShowButton] = useState(false);

  function handleSubmitClick() {
    const filteredObj = {};
    Object.keys(csvData).forEach((key) => {
      if (greenData[key] !== undefined) {
        filteredObj[key.toString()] = greenData[key];
      }
    });
    const myString = JSON.stringify(filteredObj);
    submitGreenData(myString);
    // submitGreenData(myString.replace(/\s/g, "").replace(/[-()]/g, ""));
    handleClose();
    window.location.reload();
  }

  return (
    // enable scrolling
    // Helper text
    <Dialog onBackdropClick={handleClose} fullWidth maxWidth="lg" open={open}>
      <DialogTitle sx={{ color: "#111827" }} fontSize={{ fontSize: "32px" }}>
        Import Confirmation
      </DialogTitle>
      <DialogContent>
        <Box marginTop={1} marginBottom={5}>
          {redCount != 0 && (
            <Alert severity="error" variant="outlined">
              <AlertTitle>Import Check</AlertTitle>
              <p>{`We detected ${redCount} entries which have format or validation errors. They are highlighted in red below. Please fix them to submit the import. Persons require first name, last name and unique mobile number. Credentials require unique pin.`}</p>
            </Alert>
          )}
          {redCount == 0 && (
            <Alert severity="success" variant="outlined">
              <AlertTitle>Import Check</AlertTitle>
              <p>{`${greenCount} entries will be added without issues on confirmation. Credentials are only added if the type, pin and expiry is formatted properly.`}</p>
            </Alert>
          )}
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>First Name</TableCell>
              <TableCell>personLastName</TableCell>
              <TableCell>UID</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>personMobileNumber</TableCell>
              <TableCell>credentialType</TableCell>
              <TableCell>credentialPin</TableCell>
              <TableCell>Credential Expiry</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {redData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((item, index) => {
                return (
                  <TableRow key={item["personUid"] + index}>
                    <TableCell
                      sx={{
                        color: "#F44336",
                      }}
                    >
                      {item["personFirstName"]}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#F44336",
                      }}
                    >
                      {item["personLastName"]}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#F44336",
                      }}
                    >
                      {item["personUid"]}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#F44336",
                      }}
                    >
                      {item["personEmail"]}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#F44336",
                      }}
                    >
                      {item["personMobileNumber"]}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#F44336",
                      }}
                    >
                      {item["credentialType"]}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#F44336",
                      }}
                    >
                      {item["credentialPin"]}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "#F44336",
                      }}
                    >
                      {item["credentialExpiry"]}
                    </TableCell>
                  </TableRow>
                );
              })}
            {redCount == 0 &&
              greenData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((item, index) => {
                  return (
                    <TableRow key={index}>
                      <TableCell
                        sx={{
                          color: "#00994C",
                        }}
                      >
                        {item["personFirstName"]}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "#00994C",
                        }}
                      >
                        {item["personLastName"]}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "#00994C",
                        }}
                      >
                        {item["personUid"]}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "#00994C",
                        }}
                      >
                        {item["personEmail"]}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "#00994C",
                        }}
                      >
                        {item["personMobileNumber"]}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "#00994C",
                        }}
                      >
                        {item["credentialType"]}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "#00994C",
                        }}
                      >
                        {item["credentialPin"]}
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "#00994C",
                        }}
                      >
                        {item["credentialExpiry"]}
                      </TableCell>
                    </TableRow>
                  );
                })}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={csvData.length}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
        {redCount == 0 && (
          <Button
            onClick={handleSubmitClick}
            autoFocus
            variant="contained"
            color="success"
          >
            Submit
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
