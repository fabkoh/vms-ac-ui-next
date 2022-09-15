
import * as React from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import { Alert, Box, Button, Checkbox, Dialog, DialogContent, DialogContentText, DialogTitle, Step, StepLabel, Stepper, Table, TableBody, TableCell, TableHead, TableRow, TextField } from "@mui/material"
import { eventActionInputText, eventActionOutputText } from '../../../utils/eventsManagement';

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

export default function EventsManagementAddOnError({
  errorMessages,
  handleClose,
  open,
  selectedEventsManagement,
  handleSelectFactory,
  selectedSomeEventsManagement, 
  selectedAllEventsManagement,
  handleSelectAllEventsManagement,
  deleteEventsManagement,
  ...rest
}) {
  return (
      // enable scrolling 
      // Helper text 
    <Dialog
    onBackdropClick={handleClose}
    fullWidth
    maxWidth='lg'
    open={open}>
      <DialogTitle sx={{ color: "#F44336" }}>
            Error : Failed to create new event management.
        </DialogTitle>
      <DialogContent>
            <Box marginTop={1}
                  marginBottom={5}>
                <Alert severity="info"
                    variant="outlined">The new event managements highlighted below has trigger/output configurations that clash with existing event managements.<br/><br/>Please take note that you can only use each custom trigger/action as either GEN_IN or GEN_OUT and not both. Do make the necessary changes and ensure your hardware is configured properly before pressing the <b>Add on/Replace all</b> button again.
                </Alert>
            </Box>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>New Event Management(s)</TableCell>
                        <TableCell>Event Management(s) with Clashing Trigger/Output Configurations</TableCell>
                        <TableCell padding="checkbox">
                            <Checkbox
                                checked={selectedAllEventsManagement}
                                indeterminate={selectedSomeEventsManagement}
                                onChange={handleSelectAllEventsManagement}
                            />  
                        </TableCell>
                    </TableRow> 
                </TableHead>
                <TableBody>
                    {errorMessages[0] && Object.entries(errorMessages[0]).map(([key,clashes],i) => {
                      console.log(clashes);
                        return (
                          <React.Fragment key={`row${i}`}>
                            <TableRow>
                              <TableCell rowSpan={clashes.length + 1}>{key}</TableCell>
                            </TableRow>
                            {clashes.map((clash, j) => {
                              const IsEventsManagementSelected = selectedEventsManagement.includes(clash.eventsManagementId);
                              const handleSelect = handleSelectFactory(clash.eventsManagementId);
                              return (
                                <TableRow key={`row${j}`}>
                                  <TableCell> ID {clash.eventsManagementId} : Event Management "{clash.eventsManagementName}" for {clash.entrance?.entranceName || clash.controller?.controllerName || "(linked to unknown entity)"}{" "}
                                    with the following triggers: {eventActionInputText(clash.inputEvents)} and the following output actions: {eventActionOutputText(clash.outputActions)} </TableCell>
                                  <TableCell padding="checkbox">
                                    <Checkbox
                                      checked={IsEventsManagementSelected}
                                      onChange={handleSelect}
                                      value={IsEventsManagementSelected}
                                    />
                                  </TableCell>
                                </TableRow>)
                            })}
                          </React.Fragment>
                        )
                    })}

                </TableBody>
            </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>
            Close
          </Button>
        <Button onClick={deleteEventsManagement}
                  sx={{ color: "#F44336" }}
                  autoFocus>
            Delete Selected
          </Button>
        </DialogActions>
    </Dialog>
  );
}

