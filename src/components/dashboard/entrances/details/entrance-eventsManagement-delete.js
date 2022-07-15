import WarningAmberOutlined from "@mui/icons-material/WarningAmberOutlined";
import { Alert, Box, Button, Checkbox, Dialog, DialogContent, DialogContentText, DialogTitle, Step, StepLabel, Stepper, Table, TableBody, TableCell, TableHead, TableRow, TextField } from "@mui/material"
import { useState } from "react";
import { rrulestr } from "rrule";
import { eventActionInputDescription, eventActionOutputDescription } from "../../../../utils/eventsManagement";
import rruleDescription from "../../../../utils/rrule-desc";
import { Scrollbar } from "../../../scrollbar";

const steps = ['Select Event Managements to delete', 'Confirm delete'];

const EntranceEventsManagementDelete = ({ 
    open, 
    eventManagements, 
    handleDialogClose, 
    deleteEventManagements, }) => {

    // stepper
    const [activeStep, setActiveStep] = useState(0)
    const handleNextStep = () => {
        setValue("");
        setActiveStep(activeStep + 1);
    }
    const handlePrevStep = () => {
        setValue("");
        setActiveStep(activeStep - 1);
    }

    // table select
    const [selected, setSelected] = useState([])
    const selectedAll = Array.isArray(eventManagements) && selected.length == eventManagements.length;
    const selectedSome = selected.length > 0 && !selectedAll;
    const handleSelectAll = (e) => setSelected(e.target.checked ? eventManagements.map(eventManagement => eventManagement.eventsManagementId ) : []);
    const handleSelectFactory = (id) => () => {
        if (selected.includes(id)) {
            setSelected(selected.filter(i => i != id));
        } else {
            setSelected([ ...selected, id ]);
        }
    }
    const nextDisabled = selected.length == 0;

    // text field
    const [value, setValue] = useState("");
    const handleTextChange = (e) => setValue(e.target.value);
    const deleteDisabled = value != 'DELETE';

    // closing actions
    const handleClose = () => { 
        handleDialogClose();
        setActiveStep(0);
        setSelected([]);
    }

    // delete action
    const handleDeleteeventManagements = () => {
        deleteEventManagements(selected, selectedAll);
        handleClose();
    }


    return (
        <Dialog 
            open={open}
            onClose={handleClose}
            onBackdropClick={handleClose}
            fullWidth
        >
            <Box padding={2}>
                <Stepper activeStep={activeStep}>
                    {
                        steps.map(step => (
                            <Step key={step}>
                                <StepLabel>{step}</StepLabel>
                            </Step>
                        ))
                    }
                </Stepper>
            </Box>
            {
                activeStep == 0 ? (
                    // render schedule select
                    <>
                        <DialogTitle>
                            Select Event Managements to delete
                        </DialogTitle>
                        <DialogContent>
                            <Scrollbar>
                                <Table>
                                    <TableHead sx={{ backgroundColor: "neutral.200" }}>
                                        <TableRow>   
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={selectedAll}
                                                    indeterminate={selectedSome}
                                                    onChange={handleSelectAll}
                                                />
                                            </TableCell>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Description</TableCell>
                                            <TableCell>Trigger(s)</TableCell>
									        <TableCell>Action(s)</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {
                                            Array.isArray(eventManagements) && (
                                                eventManagements.map((eventManagement, i) => {
                                                    const {
                                                        eventsManagementId,
                                                        eventsManagementName,
                                                        inputEvents,
                                                        outputActions,
                                                        triggerSchedules,
                                                        entrance,
                                                        controller
                                                    } = eventManagement;
                                                    const iseventManagementselected = selected.includes(eventsManagementId);
                                                    const handleSelect = handleSelectFactory(eventsManagementId);
                                                        
                                                    return (
                                                        <TableRow hover key={i}>
                                                            <TableCell padding="checkbox">
                                                                <Checkbox
                                                                    checked={iseventManagementselected}
                                                                    value={iseventManagementselected}
                                                                    onChange={handleSelect}
                                                                />
                                                            </TableCell>

                                                            <TableCell sx={{minWidth: 150}}>{eventsManagementName}</TableCell>
                                                            <TableCell sx={{minWidth: 250}}>{ rruleDescription(rrulestr(triggerSchedules[0].rrule), triggerSchedules[0].timeStart, triggerSchedules[0].timeEnd) }</TableCell>
                                                            <TableCell sx={{minWidth: 300}} >{ eventActionInputDescription(inputEvents)}</TableCell>
                                                            <TableCell sx={{minWidth: 300}}>{ eventActionOutputDescription(outputActions)}</TableCell>
                                                        </TableRow>
                                                    )
                                                })
                                            )
                                        }
                                    </TableBody>
                                </Table>
                            </Scrollbar>
                            <Box display="flex" justifyContent="space-between" mt={1}>
                                <Button 
                                    variant="outlined"
                                    sx={{ borderRadius: 8 }}
                                    color="error"
                                    onClick={handleClose}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    onClick={handleNextStep} 
                                    disabled={nextDisabled}
                                    variant="contained"
                                    sx={{ borderRadius: 8 }}
                                >
                                    Next
                                </Button>
                            </Box>
                        </DialogContent>
                    </>
                ) : (
                    // render delete confirm
                    <>
                        <DialogTitle>
                            {" "}
                            <WarningAmberOutlined
                                color="error"
                                sx={{
                                    color: "F44336",
                                    m: -0.5, 
                                    width: 50
                                }}
                            />
                            {" "}
                            &#8288;Confirm delete?
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText sx={{ whiteSpace: "pre-line", mb: 1}}>
                                Are you sure you want to delete schedule(s)? This action cannot be undone.
                                {/*
                                    selectedAll && 
                                    <strong>{"\nDeleting all eventManagements would remove this entrance from the access group"}</strong>
                                */}
                            </DialogContentText>
                            <form 
                            autocomplete="off"
                            onSubmit={handleDeleteeventManagements}>
                                <TextField
                                    variant="filled"
                                    fullWidth
                                    onChange={handleTextChange}
                                    helperText="Type in DELETE to proceed"
                                    value={value}
                                    autoFocus
                                />
                                <Box display="flex" justifyContent="space-between" mt={1}>
                                    <Button 
                                        onClick={handlePrevStep}
                                        variant="outlined"
                                        sx={{ borderRadius: 8 }}
                                    >
                                        Back
                                    </Button>
                                    <Button 
                                        type="submit"
                                        color="error" 
                                        disabled={deleteDisabled}
                                        variant="contained"
                                        sx={{ borderRadius: 8 }}
                                    >
                                        Delete
                                    </Button>
                                </Box>
                            </form>
                        </DialogContent>                                    
                    </>
                )
            }
        </Dialog>
    )
}

export default EntranceEventsManagementDelete;