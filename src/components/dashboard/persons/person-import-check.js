import * as React from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";

import {
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
  ...rest
}) {
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
            We detected 2 entries which have format or validation errors and
            will not be added into the database. They are highlighted in red
            below. 20 entries will be added without issues on confirmation.
          </Alert>
        </Box>

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
            {console.log("ERROR   ", errorMessages)}
            {errorMessages
              ? errorMessages.map((singleError) => {
                  return Object.entries(singleError).map(
                    ([newScheduleName, clashes], i) => {
                      console.log(newScheduleName, clashes);
                      return (
                        <React.Fragment key={`row${i}`}>
                          <TableRow>
                            <TableCell rowSpan={clashes.length + 1}>
                              {newScheduleName}
                            </TableCell>
                          </TableRow>
                          {clashes.map((clash, j) => {
                            console.log(clash);
                            const isAuthMethodScheduleSelected =
                              selectedSchedules.includes(
                                clash.authMethodSchedule.authMethodScheduleId
                              );
                            const handleSelect = handleSelectFactory(
                              clash.authMethodSchedule.authMethodScheduleId
                            );
                            return (
                              <TableRow key={`row${j}`}>
                                <TableCell>
                                  {" "}
                                  ID{" "}
                                  {
                                    clash.authMethodSchedule
                                      .authMethodScheduleId
                                  }{" "}
                                  : Existing Authentication Schedule "
                                  {
                                    clash.authMethodSchedule
                                      .authMethodScheduleName
                                  }
                                  " for {clash.controller}
                                  {clash.authDevice.entrance == null
                                    ? " (No Entrance) "
                                    : clash.authDevice.entrance.entranceName}
                                  {clash.authDevice.authDeviceName} (
                                  {clash.authDevice.authDeviceDirection})
                                </TableCell>
                                <TableCell>
                                  {" "}
                                  {rruleDescriptionWithBr(
                                    rrulestr(clash.authMethodSchedule.rrule),
                                    clash.authMethodSchedule.timeStart,
                                    clash.authMethodSchedule.timeEnd
                                  )}{" "}
                                </TableCell>
                                <TableCell>
                                  {" "}
                                  {
                                    clash.authMethodSchedule.authMethod
                                      .authMethodDesc
                                  }{" "}
                                </TableCell>
                                <TableCell padding="checkbox">
                                  <Checkbox
                                    checked={isAuthMethodScheduleSelected}
                                    onChange={handleSelect}
                                    value={isAuthMethodScheduleSelected}
                                  />
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </React.Fragment>
                      );
                    }
                  );
                })
              : null}
          </TableBody>
        </Table>
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
