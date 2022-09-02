
import * as React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import { Alert, Box, Button, Checkbox, Dialog, DialogContent, DialogContentText, DialogTitle, Step, StepLabel, Stepper, Table, TableBody, TableCell, TableHead, TableRow, TextField } from "@mui/material"
import { rruleDescriptionWithBr } from '../../../utils/rrule-desc';
import { rrulestr } from "rrule";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

const BootstrapDialogTitle = (props) => {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 2 }}
{...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
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

export default function AuthenticationAddOnError({
  errorMessages,
  handleClose,
  open,
  selectedSchedules,
  handleSelectFactory,
  selectedSomeSchedules, 
  selectedAllSchedules,
  handleSelectAllSchedules,
  deleteSchedules,
  ...rest }) {
  

  return (
      // enable scrolling 
      // Helper text 
    <Dialog
    onBackdropClick={handleClose}
    fullWidth
    maxWidth='lg'
    open={open}>
        <DialogTitle sx={{ color: "#F44336" }}>
          Error : Failed to create new schedules.
        </DialogTitle>
      <DialogContent>
            <Box marginTop={1}
                  marginBottom={5}>
                <Alert severity="info"
                    variant="outlined">The new schedules highlighted below clashes with existing schedules. Do make the necessary changes before pressing the <b>Add on</b> button again.
                </Alert>
            </Box>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>New Schedule(s)</TableCell>
                        <TableCell>Auth Device with Existing Schedule(s)</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Auth Method</TableCell>
                        <TableCell padding="checkbox">
                            <Checkbox
                                checked={selectedAllSchedules}
                                indeterminate={selectedSomeSchedules}
                                onChange={handleSelectAllSchedules}
                            />  
                        </TableCell>
                    </TableRow> 
                </TableHead>
                <TableBody>
                {/* {console.log("ERROR   ",errorMessages)} */}
                {errorMessages.map(singleError => { return Object.entries(singleError).map(([newScheduleName,clashes],i) => {
                      console.log(newScheduleName,clashes);
                        return (
                          <React.Fragment key={`row${i}`}>
                            <TableRow>
                              <TableCell rowSpan={clashes.length + 1}>{newScheduleName}</TableCell>
                            </TableRow>
                            {clashes.map((clash, j) => {
                              console.log(clash)
                              const isAuthMethodScheduleSelected = selectedSchedules.includes(clash.authMethodSchedule.authMethodScheduleId);
                              const handleSelect = handleSelectFactory(clash.authMethodSchedule.authMethodScheduleId);
                              return (
                                <TableRow key={`row${j}`}>
                                  <TableCell> ID {clash.authMethodSchedule.authMethodScheduleId} : Existing Authentication Schedule 
                                    "{clash.authMethodSchedule.authMethodScheduleName}" for {clash.controller} 
                                    {clash.authDevice.entrance==null?" (No Entrance) ":clash.authDevice.entrance}
                                    {clash.authDevice.authDeviceName} ({clash.authDevice.authDeviceDirection}) </TableCell>
                                  <TableCell> {rruleDescriptionWithBr(rrulestr(clash.authMethodSchedule.rrule), clash.authMethodSchedule.timeStart, clash.authMethodSchedule.timeEnd)} </TableCell>
                                  <TableCell> {clash.authMethodSchedule.authMethod.authMethodDesc} </TableCell>
                                  <TableCell padding="checkbox">
                                    <Checkbox
                                      checked={isAuthMethodScheduleSelected}
                                      onChange={handleSelect}
                                      value={isAuthMethodScheduleSelected}
                                    />
                                  </TableCell>
                                </TableRow>)
                        })}
                          </React.Fragment>
                        )
                    })})}
                  

                </TableBody>
            </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>
              Close
            </Button>
          <Button onClick={deleteSchedules}
                    sx={{ color: "#F44336" }}
                    autoFocus>
              Delete Selected
            </Button>
        </DialogActions>
    </Dialog>
  );
}

