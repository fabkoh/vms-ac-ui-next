
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
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
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

export default function AuthenticationAddOnError({errorMessages,handleClose,open, ...rest}) {
  

  return (
      // enable scrolling 
      // Helper text 
    <Dialog
    onBackdropClick={handleClose}
    fullWidth
    open={open}>
        <DialogTitle>
            Error : Failed to create new schedules.      
            The new schedules highlighted below clashes with existing schedules. Do make the necessary changes before pressing the "Add on" button again.
        </DialogTitle>
        <DialogContent>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>New Schedule(s)</TableCell>
                        <TableCell>Auth Device with Existing Schedule(s)</TableCell>
                    </TableRow> 
                </TableHead>
                <TableBody>
                    {errorMessages.map(([key,clashes],i) => {
                        console.log(clashes)
                        return ( 
                            <TableRow key={`row${i}`}>
                                <TableCell>{key}</TableCell>
                                <TableCell> {clashes.controller} {clashes.entrance==null?"( No Entrance ) ":clashes.entrance}
                                    {clashes.authDevice.authDeviceName} ({clashes.authDevice.authDeviceDirection}) </TableCell>
                            </TableRow>

                            
                        )
                    })}

                </TableBody>
            </Table>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose}>
            Close
          </Button>
        </DialogActions>
    </Dialog>
  );
}

