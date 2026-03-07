
import * as React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import { Alert, Box, Button, Checkbox, Dialog, DialogContent, DialogContentText, DialogTitle, Step, StepLabel, Stepper, Table, TableBody, TableCell, TableHead, TableRow, TextField } from "@mui/material"
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";

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

export default function SyncUniconError({
  errorMessages,
  handleClose,
  open,
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
        	{/* {" "}
					<WarningAmberOutlinedIcon
						sx={{ color: "#F44336", marginBottom: -0.6, width: 20, marginRight: "0.5rem" }}
					/>{" "} */}
        Error : Failed to sync these unicon(s)
        </DialogTitle>
      <DialogContent>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Controller(s)</TableCell>
                        <TableCell>Controller Serial Number(s)</TableCell>
                    </TableRow> 
                </TableHead>
                <TableBody>
                    {errorMessages.map(([key,controllerSerialNo],i) => {
                      console.log(controllerSerialNo);
                        return ( 
                            <TableRow key={`row${i}`}>
                                <TableCell>{key}</TableCell>
                                <TableCell> {controllerSerialNo} </TableCell>
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
        </DialogActions>
    </Dialog>
  );
}

