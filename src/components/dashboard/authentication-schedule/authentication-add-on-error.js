
import * as React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import { Alert, Box, Button, Checkbox, Dialog, DialogContent, DialogContentText, DialogTitle, Step, StepLabel, Stepper, Table, TableBody, TableCell, TableHead, TableRow, TextField } from "@mui/material"


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
  // selectedSchedules,
  // handleSelectFactory,
  // selectedSomeSchedules, 
  // selectedAllSchedules,
  // handleSelectAllSchedules,
  // deleteSchedules,
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
                        {/* <TableCell padding="checkbox">
                            <Checkbox
                                checked={selectedAllSchedules}
                                indeterminate={selectedSomeSchedules}
                                onChange={handleSelectAllSchedules}
                            />  
                        </TableCell> */}
                    </TableRow> 
                </TableHead>
                <TableBody>
                    {errorMessages.map(([key,clashes],i) => {
                      console.log(clashes);
                        // const IsScheduleSelected = selectedSchedules.includes(clash.authMethodScheduleId);
                        // const handleSelect = handleSelectFactory(clash.authMethodScheduleId);
                        return ( 
                            <TableRow key={`row${i}`}>
                                <TableCell>{key}</TableCell>
                                <TableCell> {clashes.controller} {clashes.entrance==null?"( No Entrance ) ":clashes.entrance}
                              {clashes.authDevice.authDeviceName} ({clashes.authDevice.authDeviceDirection}) </TableCell>
                                {/* <TableCell padding="checkbox">
                                    <Checkbox
                                      checked={IsScheduleSelected}
                                      onChange={handleSelect}
                                      value={IsScheduleSelected}
                                    />
                                </TableCell> */}
                            </TableRow>
                        )
                    })}

                </TableBody>
            </Table>
        </DialogContent>
        <DialogActions>
          <Button autoFocus
                  onClick={handleClose}>
            Close
        </Button>
        {/* <Button onClick={deleteSchedules}
                  sx={{ color: "#F44336" }}
                  autoFocus>
            Delete Selected
        </Button> */}
        </DialogActions>
    </Dialog>
  );
}

