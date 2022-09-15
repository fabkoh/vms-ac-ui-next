import WarningAmberOutlined from "@mui/icons-material/WarningAmberOutlined";
import { Alert, Box, Button, Checkbox, Dialog, DialogContent, DialogContentText, DialogTitle, Step, StepLabel, Stepper, Table, TableBody, TableCell, TableHead, TableRow, TextField } from "@mui/material"
import { useState } from "react";
import { rrulestr } from "rrule";
import rruleDescription from "../../../utils/rrule-desc";
import { Scrollbar } from "../../scrollbar";
import { ConfirmDeleteAuthMethodSchedules } from "./authentication-confirm-delete";

const steps = ['Select Schedules to Delete', 'Confirm Delete'];

const AuthenticationScheduleDelete = ({ open, schedules, handleDialogClose, deleteSchedules }) => {

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
    const selectedAll = Array.isArray(schedules) && selected.length == schedules.length;
    const selectedSome = selected.length > 0 && !selectedAll;
    const handleSelectAll = (e) => setSelected(e.target.checked ? schedules.map(schedule => schedule.authMethodScheduleId) : []);
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
    const handleDeleteSchedules = () => {
        deleteSchedules(selected, selectedAll);
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
                            Select Schedules to delete
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
                                            <TableCell>Authentication Method</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {
                                            Array.isArray(schedules) && (
                                                schedules.map((schedule, i) => {
                                                    const {
                                                        authMethodScheduleId,
                                                        authMethodScheduleName,
                                                        rrule,
                                                        timeStart,
                                                        timeEnd,
                                                        authMethod
                                                    } = schedule;
                                                    const isScheduleSelected = selected.includes(authMethodScheduleId);
                                                    const handleSelect = handleSelectFactory(authMethodScheduleId);
                                                        
                                                    return (
                                                        <TableRow hover key={i}>
                                                            <TableCell padding="checkbox">
                                                                <Checkbox
                                                                    checked={isScheduleSelected}
                                                                    value={isScheduleSelected}
                                                                    onChange={handleSelect}
                                                                />
                                                            </TableCell>
                                                            <TableCell>
                                                                { authMethodScheduleName }
                                                            </TableCell>
                                                            <TableCell>
                                                                { rruleDescription(rrulestr(rrule), timeStart, timeEnd) }
                                                            </TableCell>
                                                            <TableCell>
                                                                { authMethod.authMethodDesc }
                                                            </TableCell>
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
                    <ConfirmDeleteAuthMethodSchedules>
                        open = {open}
                        handleDialogClose = {handleClose}
                        deleteSchedules = {deleteSchedules}
                    </ConfirmDeleteAuthMethodSchedules>
                )
            }
        </Dialog>
    )
}

export default AuthenticationScheduleDelete;