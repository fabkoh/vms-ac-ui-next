import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { 
    Button, 
    CardHeader, 
    Collapse, 
    Grid, 
    TextField, 
    Divider, 
    CardContent,
    Stack,
    Typography,
    Box,
    Select,
	MenuItem,
} from "@mui/material";
import { useEffect, useState } from "react";
import ExpandMore from "../../shared/expand-more";
import MultipleSelectInput from "../../shared/multi-select-input";
import ErrorCard from "../../shared/error-card";
import EditFormTooltip from "../../shared/edit_form_tooltip";
import Rrule from "../../shared/rrule-form";
import rruleDescription from "../../../../utils/rrule-desc";
import Add from "@mui/icons-material/Add";
import { whitespace } from "stylis";
import { WrapText } from "@mui/icons-material";

const EditEventManagementForm = ({checkUntil,changeTimeStart,changeTimeEnd,changeRrule,changeTextField,edit,removeCard,eventsManagementInfo,eventsManagementValidations,allInputEvents,allOutputEvents,eventActionInputEqual,eventActionInputFilter,getEventActionInputName,eventActionOutputEqual,eventActionOutputFilter,getEventActionOutputName, changeInputEventsWithoutTimer, changeOutputEventsWithoutTimer,changeInputEventsWithTimer, changeOutputEventsWithTimer}) => {
    const getEmptyInputWithTimer = (inputId) => ({
        inputId, // this id will not be used for anything
        timerDuration: 1,
        eventActionInputType: {
            eventActionInputId: null
        }
    });
    const getEmptyOutputWithTimer = (outputId) => ({
        outputId, // this id will not be used for anything
        timerDuration: 1,
        eventActionOutputType: {
            eventActionOutputId: null
        }
    });

    const getEmptyInputWithTimerValidation = (inputId) => ({
        inputId,
        eventActionInputIdBlank: false,
        timerDurationInputBlank: false,
        timerDurationInputNotPositive: false,
        timerDurationInputTooLarge: false,
    });

    const getEmptyOutputWithTimerValidation = (outputId) => ({
        outputId,
        eventActionOutputIdBlank: false,
        timerDurationOutputBlank: false,
        timerDurationOutputNotPositive: false,
        timerDurationOutputTooLarge: false,
    });

    const [inputWithTimerEventsManagementArr, 
        setInputWithTimerEventsManagementArr] = useState([getEmptyInputWithTimer(0)]);
    const [inputWithTimerEventsManagementValidations, 
        setInputWithTimerEventsManagementValidations] = useState([getEmptyInputWithTimerValidation(0)]);
    const [outputWithTimerEventsManagementArr, 
        setOutputWithTimerEventsManagementArr] = useState([getEmptyOutputWithTimer(0)]);
    const [outputWithTimerEventsManagementValidations, 
        setOutputWithTimerEventsManagementValidations] = useState([getEmptyOutputWithTimerValidation(0)]);

    // add card logic
    const getNewIdForInputWithTimer = () => inputWithTimerEventsManagementArr.map(info => info.inputId)
        .reduce((a, b) => Math.max(a, b), -1) + 1
    const getNewIdForOutputWithTimer = () => outputWithTimerEventsManagementArr.map(info => info.outputId)
                                             .reduce((a, b) => Math.max(a, b), -1) + 1

    const addInputWithTimerCard = () => {
        const newId = getNewIdForInputWithTimer();
        setInputWithTimerEventsManagementArr([ ...inputWithTimerEventsManagementArr, getEmptyInputWithTimer(newId) ]);
        setInputWithTimerEventsManagementValidations([ ...inputWithTimerEventsManagementValidations, getEmptyInputWithTimerValidation(newId) ]);
    }

    const removeInputWithTimerCard = (id) => {
        const newInputWithTimerEventsManagementInfoArr = inputWithTimerEventsManagementArr.filter(info => info.inputId != id);
        const newValidations = inputWithTimerEventsManagementValidations.filter(validation => validation.inputId != id);

        setInputWithTimerEventsManagementArr(newInputWithTimerEventsManagementInfoArr);
        setInputWithTimerEventsManagementValidations(newValidations);       
    }

    const addOutputWithTimerCard = () => {
        const newId = getNewIdForOutputWithTimer();
        setOutputWithTimerEventsManagementArr([ ...outputWithTimerEventsManagementArr, getEmptyOutputWithTimer(newId) ]);
        setOutputWithTimerEventsManagementValidations([ ...outputWithTimerEventsManagementValidations, getEmptyOutputWithTimerValidation(newId) ]);
    }

    const removeOutputWithTimerCard = (id) => {
        const newEventsManagementInfoArr = outputWithTimerEventsManagementArr.filter(info => info.outputId != id);
        const newValidations = outputWithTimerEventsManagementValidations.filter(validation => validation.outputId != id);

        setOutputWithTimerEventsManagementArr(newEventsManagementInfoArr);
        setOutputWithTimerEventsManagementValidations(newValidations);       
    }

    const changeInputTime = (e, inputId) => {
        const updatedInfo = [...inputWithTimerEventsManagementArr];
        updatedInfo.find(info => info.inputId == inputId)['timerDuration'] = e.target.value;
        setInputWithTimerEventsManagementArr(updatedInfo);
    }

    const changeOutputTime = (e, outputId) => {
        const updatedInfo = [...outputWithTimerEventsManagementArr];
        updatedInfo.find(info => info.outputId == outputId)['timerDuration'] = e.target.value;
        setOutputWithTimerEventsManagementArr(updatedInfo);
    }

	const changeSelectionInputWithTime = (e, inputId) => {
        const updatedInfo = [...inputWithTimerEventsManagementArr];
        updatedInfo.find(info => info.inputId == inputId)['eventActionInputType']['eventActionInputId'] = e.target.value;
        setInputWithTimerEventsManagementArr(updatedInfo);
    }
    
    const changeSelectionOutputWithTime = (e, outputId) => {
        const updatedInfo = [...outputWithTimerEventsManagementArr];
        updatedInfo.find(info => info.outputId == outputId)['eventActionOutputType']['eventActionOutputId'] = e.target.value;
        setOutputWithTimerEventsManagementArr(updatedInfo);
    }

    
    const {
        eventsManagementId,
        eventsManagementName,
        triggerSchedule,
        entrance,
        controller,
        inputEvents,
        outputActions,
    } = eventsManagementInfo;

    if (entrance) {
        const {
            entranceId,
            entranceName,
        } = entrance;
    }

    if (controller) {
        const {
            controllerId,
            controllerName,
            controllerSerialNo,
        } = controller;
    }

    if (triggerSchedule) {
        const {
            triggerScheduleId,
            rrule,
            timeStart,
            timeEnd,
        } = triggerSchedule;
    }

    const {
        eventsManagementNameBlank,
        timeStartInvalid,
        timeEndInvalid,
        untilInvalid,
        submitFailed,
    } = eventsManagementValidations;
   
    // expanding form
    const [expanded, setExpanded] = useState(true);
    const handleExpandClick = () => setExpanded(!expanded);

    //handler for name
    const [name, setName] = useState()
    const handleName = (e) => {
        // const temparray = [...accgrpschedinfoarr]
        // temparray.find(sched=>sched.accgrpschedid == id)[entranceSchedule] = e.target.value
        //
    }
    //get timestart timeend 
    const [start, setStart] = useState()
    const [end, setEnd] = useState()
    const getStart = (e) => {
        setStart(e)
    }
    const getEnd = (e) => {
        setEnd(e)
    }
    
    //get rrule string and text from rrulecomponent
    const [description, setDescription] = useState()
    const [rrulestring, setRrulestring] = useState()
    const [rule, setRule] = useState()
    const handleRrule = (e) => {
        descriptionHandler(e)
        // setDescription(e.toText())
        setRrulestring(e.toString())
        setRule(e)
    }
    //Description handler
    const descriptionHandler = (e) => { //e should be the rrule obj
        setDescription(rruleDescription(e, start, end))
    }
    useEffect(() => {
        changeRrule(rrulestring,eventsManagementId)
        changeTimeStart(start,eventsManagementId)
        changeTimeEnd(end,eventsManagementId)
        descriptionHandler(rule,eventsManagementId)
    }, [rrulestring, start, end])
    
    useEffect(() => {
        changeInputEventsWithTimer(inputWithTimerEventsManagementArr, eventsManagementId);
    }, [inputWithTimerEventsManagementArr])

    useEffect(() => {
        changeOutputEventsWithTimer(outputWithTimerEventsManagementArr, eventsManagementId);
    }, [outputWithTimerEventsManagementArr])
    
    //blocker for invalid until date
    const [untilHolder, setUntilHolder] = useState(false)
    const handleInvalidUntil = (bool) => {
        setUntilHolder(bool)
    }

    const inputEventsWithTimer = allInputEvents.filter(e => e.timerEnabled);
    const inputEventsWithoutTimer = allInputEvents.filter(e => !e.timerEnabled);
    const outputEventsWithTimer = allOutputEvents.filter(e => e.timerEnabled);
    const outputEventsWithoutTimer = allOutputEvents.filter(e => !e.timerEnabled);

    useEffect(() => {
        checkUntil(untilHolder)
    }, [untilHolder])
    
    return (
        <ErrorCard error={
            eventsManagementNameBlank ||
            timeStartInvalid ||
            timeEndInvalid ||
            untilInvalid ||
            submitFailed
        }>
            <CardHeader
                avatar={
                    // avatar are children flushed to the left
                    <ExpandMore
                        expand={expanded}
                        onClick={handleExpandClick}
                    >
                        <ExpandMoreIcon />
                    </ExpandMore>
                }
                title="Events Management"
                action={
                    // action are children flushed to the right
                    (
                        <Grid item
                            container>
                            { edit && (
                                <Grid item
                                    sx={{display: "flex", justifyContent: "center", alignItems: "center", paddingRight: 1, paddingLeft: 1}}>
                                    <EditFormTooltip />
                                </Grid>
                            )}
                            <Button
                                variant="outlined"
                                color="error"
                                sx={{mt:1}}
                                onClick={() => removeCard(eventsManagementId)}
                            >
                                Remove
                            </Button>
                            { edit && (
                                <Box ml={2}>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        onClick={() => console.log("delete")} // put delete method here
                                    >
                                        Delete
                                    </Button>
                                </Box>
                            )}
                        </Grid>
                    )
                }
                sx={{ width: '100%', flexWrap: "wrap" }}
            />
            <Divider />
            <CardContent>
                <Stack
                    spacing={3}
                >
                    <Grid
                        item
                        md={6}
                        xs={12}
                    >
                        <TextField
                            fullWidth
                            label="Name"
                            name="eventsManagementName"
                            required
                            value={eventsManagementName}
                            onChange={(e)=>{changeTextField(e,eventsManagementId)}}
                            helperText={ 
                                (eventsManagementNameBlank && 'Error: events management name cannot be blank')
                            }
                            error={ Boolean(eventsManagementNameBlank)}
                        />
                    </Grid>
                    <Collapse in={expanded}>
                        <Stack spacing={3}>
                            <Grid
                                container
                            >
                                <Grid item
                                    mr={2}
                                    mb={2}
                                    >
                                    <Typography fontWeight="bold">Input (without timer) :</Typography>
                                </Grid> 
                                <Grid
                                    item
                                    md={12}
                                    xs={12}
                                >
                                    <MultipleSelectInput
                                        options={inputEventsWithoutTimer}
                                        setSelected={(e) => changeInputEventsWithoutTimer(e,eventsManagementId)}
                                        getOptionLabel={getEventActionInputName}
                                        label="Input (without timer)"
                                        noOptionsText="No input (without timer) event found"
                                        placeholder="Search for input (without timer) name"
                                        filterOptions={eventActionInputFilter}
                                        value={inputEvents}
                                        isOptionEqualToValue={eventActionInputEqual}
                                        error={
                                            Boolean(inputEvents.length==0)
                                        }
                                        helperText={
                                            Boolean(inputEvents.length==0)&&"Error : no input event selected"
                                        }
                                    />
                                </Grid>
                            </Grid>
                            {inputWithTimerEventsManagementArr.map((info, i) => (
                                <Grid container
                                    key={info.inputId}>
                                <Grid container
                                        mt={2}
                                        mb={2}
                                        alignItems="center">
                                        <Grid item
                                            mr={2}
                                            mt={1}>
                                            <Typography fontWeight="bold">Input (with timer):</Typography>
                                        </Grid>
                                        <Grid item
                                            mt={1}
                                            mr={2}
                                        
                                        >
                                            <Select
                                                // required={repeatToggle?true:false}
                                                sx={{ maxWidth: 400, minWidth: 400 }}
                                                value={info.eventActionInputType.eventActionInputId}
                                                onChange={(e) => {changeSelectionInputWithTime(e,info.inputId)}}
                                            >
                                                {outputEventsWithTimer.map(e => {
                                                    return <MenuItem
                                                        key={e.eventActionInputId}
                                                        value={e.eventActionInputId}>{e.eventActionInputName}</MenuItem>
                                                })}
                                            </Select>
                                        </Grid>
                                        <Grid item
                                            mt={1}>
                                            <TextField
                                                type="number"
                                                sx={{ mr: 2, maxWidth: 150, minWidth: 150 }}
                                                value={info.timerDuration}
                                                required
                                                onChange={(e)=>{changeInputTime(e,info.inputId)}}
                                                helperText={""}
                                                error={ Boolean(false)}
                                            />
                                        </Grid>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            sx={{mt:1}}
                                            onClick={() => removeInputWithTimerCard(info.inputId)}
                                        >
                                            Remove
                                        </Button>
                                    </Grid>
                            </Grid>                           
                            ))}
                            <div>
                                <Button
                                    size="large"
                                    variant="outlined"
                                    startIcon={<Add />}
                                    onClick={addInputWithTimerCard}
                                >
                                    Add input events with timer
                                </Button>
                            </div>
                            <Grid
                                container
                                mb={3}
                            >
                                <Grid item
                                    md={4}
                                    xs={4}
                                    mr={2}
                                    mb={2}
                                >
                                    <Typography fontWeight="bold">Output (without timer) :</Typography>
                                </Grid>                 
                                <Grid
                                    item
                                    md={12}
                                    xs={12}
                                >
                                    <MultipleSelectInput
                                        options={outputEventsWithoutTimer}
                                        setSelected={(e) => changeOutputEventsWithoutTimer(e,eventsManagementId)}
                                        getOptionLabel={getEventActionOutputName}
                                        label="Output (without timer)"
                                        noOptionsText="No output (without timer) event found"
                                        placeholder="Search for output (without timer) name"
                                        filterOptions={eventActionOutputFilter}
                                        value={outputActions}
                                        isOptionEqualToValue={eventActionOutputEqual}
                                        error={
                                            Boolean(outputActions.length==0)
                                        }
                                        helperText={
                                            Boolean(outputActions.length==0)&&"Error : no output action selected"
                                        }
                                    />
                                </Grid>
                            </Grid>
                            {outputWithTimerEventsManagementArr.map((info, i) => (
                                <Grid container
                                    key={info.outputId}>
                                <Grid container
                                        mt={2}
                                        mb={2}
                                        alignItems="center">
                                        <Grid item
                                            mr={2}
                                            mt={1}>
                                            <Typography fontWeight="bold">Output (with timer):</Typography>
                                        </Grid>
                                        <Grid item
                                            mt={1}
                                            mr={2}
                                        
                                        >
                                            <Select
                                                // required={repeatToggle?true:false}
                                                sx={{ maxWidth: 400, minWidth: 400 }}
                                                value={info.eventActionOutputType.eventActionOutputId}
                                                onChange={(e) => {changeSelectionOutputWithTime(e,info.outputId)}}
                                            >
                                                {outputEventsWithTimer.map(e => {
                                                    return <MenuItem
                                                        key={e.eventActionOutputId}
                                                        value={e.eventActionOutputId}>{e.eventActionOutputName}</MenuItem>
                                                })}
                                            </Select>
                                        </Grid>
                                        <Grid item
                                            mt={1}>
                                            <TextField
                                                type="number"
                                                sx={{ mr: 2, maxWidth: 150, minWidth: 150 }}
                                                onChange={(e) => {changeOutputTime(e,i)}}
                                                value={info.timerDuration}
                                            />
                                        </Grid>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            sx={{mt:1}}
                                            onClick={() => removeOutputWithTimerCard(info.outputId)}
                                        >
                                            Remove
                                        </Button>
                                    </Grid>
                            </Grid>                           
                            ))}
                            <div>
                                <Button
                                    size="large"
                                    variant="outlined"
                                    startIcon={<Add />}
                                    onClick={addOutputWithTimerCard}
                                >
                                    Add output events with timer
                                </Button>
                            </div>
                            <Grid
                                item
                                md={12}
                                xs={12}
                            >
                                <TextField
                                    fullWidth
                                    name="Desc"
                                    multiline
                                    value={(description)} //add new rrule obj here. value={new RRule(string)} from rrulefrom
                                    disabled
                                />
                            </Grid>
                            <Divider />
                            <Grid
                                item
                                md={12}
                                xs={12}
                            >
                                <Rrule
                                    handleRrule={handleRrule}
                                    getStart={getStart}
                                    getEnd={getEnd}
                                    timeEndInvalid={timeEndInvalid}
                                    handleInvalidUntil={handleInvalidUntil}
                                />
                            </Grid>
                            <Divider />
                            <Grid
                                item
                                md={12}
                                xs={12}
                                container
                                alignItems="center"
                            >
                            </Grid>
                        </Stack>
                    </Collapse>
                </Stack>
            </CardContent>
        </ErrorCard>
    )
}

export default EditEventManagementForm;