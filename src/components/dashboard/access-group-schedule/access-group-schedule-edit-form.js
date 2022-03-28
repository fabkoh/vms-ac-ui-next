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
} from "@mui/material";
import { useEffect, useState } from "react";
import ExpandMore from "../shared/expand-more";
import MultipleSelectInput from "../shared/multi-select-input";
import ErrorCard from "../shared/error-card";
import EditFormTooltip from "../shared/edit_form_tooltip";
import Rrule from "./rrule-form";
import rruleDescription from "../../../utils/rrule-desc";
import { whitespace } from "stylis";
import { WrapText } from "@mui/icons-material";

const EditAccGrpSchedForm = ({checkUntil,changeTimeStart,changeTimeEnd,changeRrule,changeTextField,edit,removeCard,accessGroupScheduleInfo,accessGroupScheduleValidations}) => {
    const {
        accessGroupScheduleId,
        accessGroupScheduleName,
        rrule,
        timeStart,
        timeEnd,
    } = accessGroupScheduleInfo;

    const {
        accessGroupScheduleNameBlank,
        timeEndInvalid,
        untilInvalid,
        accessGroupNameDuplicated,
        accessGroupPersonHasAccessGroup,
        accessGroupPersonDuplicated,
        submitFailed
    } = accessGroupScheduleValidations;
   
    // expanding form
    const [expanded, setExpanded] = useState(true);
    const handleExpandClick = () => setExpanded(!expanded);

    //handler for name
    const [name, setName] = useState()
    const handleName = (e) => {
        // const temparray = [...accgrpschedinfoarr]
        // temparray.find(sched=>sched.accgrpschedid == id)[accessGroupScheduleName] = e.target.value
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
<<<<<<< HEAD
        console.log(e.toString())
    }
    //Description handler
    const descriptionHandler = (e) => { //e should be the rrule obj
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        console.log(rruleDescription(e, start, end)); // HERE
        //capitalize 1st letter
        console.log(e)
        try{
            if(e.origOptions.dtstart==null||e.origOptions.dtstart==""){
                return setDescription("Please select start date")
            }
        const setpos = e.origOptions.bysetpos;
        const temp = e.toText()
        const caps = temp.charAt(0).toUpperCase() + temp.slice(1)
        //if "every day for 1 time", change entire string to "once on DD/MM/YYYY""
        const date = new Date(e.origOptions.dtstart)
        const datestring = JSON.stringify(date)
        const year = datestring.slice(1,5)
        const month = datestring.slice(6,8)
        const day = datestring.slice(9,11)
        // console.log("year",year)
        // console.log("month",month)
        // console.log("day",day)
        if(setpos.length>0){
        const intervalmonth = caps.slice(0,14)
        const remainingstring = caps.slice(14,caps.length)
        return setDescription(`${intervalmonth} ${setPosHandler(setpos)}${remainingstring}`)
        }
        }catch(e){console.log(e)}
        if(caps == "Every day for 1 time"){
            const special = `Once on ${day}/${month}/${year}`
            return setDescription(special)
        }
        // const date = new Date(rule.dtstart)
        // console.log("rrulehere",JSON.stringify(e.origOptions.dtstart))
        // console.log("DTSRTHERE",typeof(date))
        // console.log("DTSRTHERE",JSON.stringify(date).slice(0,11))
        // console.log("DTSRTHERE",new Date(rule.dtstart))
        setDescription(caps)
=======
        // console.log(e)
>>>>>>> 70699ca70a88e3988f97e9a0eabe38cda8f9aa70
=======
        setDescription(rruleDescription(e, start, end))
>>>>>>> Stashed changes
=======
        setDescription(rruleDescription(e, start, end))
>>>>>>> Stashed changes
=======
        setDescription(rruleDescription(e, start, end))
>>>>>>> Stashed changes
=======
        setDescription(rruleDescription(e, start, end))
>>>>>>> Stashed changes
    }
    useEffect(() => {
        changeRrule(rrulestring,accessGroupScheduleId)
        changeTimeStart(start,accessGroupScheduleId)
        changeTimeEnd(end,accessGroupScheduleId)
        descriptionHandler(rule)
    }, [rrulestring,start,end])
    
    //blocker for invalid until date
    const [untilHolder, setUntilHolder] = useState(false)
    const handleInvalidUntil = (bool) => {
        setUntilHolder(bool)
    }
    useEffect(() => {
        checkUntil(untilHolder)
    }, [untilHolder])
    
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< Updated upstream

<<<<<<< HEAD
    const setPosHandler = (setpos) => {
		if(setpos == 1){
            return "the 1st"
        }
		if(setpos == 2){
            return "the 2nd"
        }
		if(setpos == 3){
            return "the 3rd"
        }
		if(setpos == 4){
            return "the 4th"
        }
        return "the 5th"
	}
=======
>>>>>>> 70699ca70a88e3988f97e9a0eabe38cda8f9aa70
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
    return (
        <ErrorCard error={
            // accessGroupScheduleNameBlank        ||
            // accessGroupNameExists       ||
            // accessGroupNameDuplicated   ||
            // accessGroupPersonDuplicated ||
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
                title="Access Group Schedule"
                action={
                    // action are children flushed to the right
                    (
                        <Grid item container>
                            { edit && (
                                <Grid item sx={{display: "flex", justifyContent: "center", alignItems: "center", paddingRight: 1, paddingLeft: 1}}>
                                    <EditFormTooltip />
                                </Grid>
                            )}
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={() => removeCard(accessGroupScheduleId)}
                            >
                                Clear
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
                            name="accessGroupScheduleName"
                            required
                            value={accessGroupScheduleName}
                            onChange={(e)=>{changeTextField(e,accessGroupScheduleId)}}
                            helperText={ 
                                (accessGroupScheduleNameBlank && 'Error: access group schedule name cannot be blank')
                                // (accessGroupScheduleNameBlank && 'Error: access group name cannot be blank') ||
                            //     (accessGroupNameExists && 'Error: access group name taken') ||
                            //     (accessGroupNameDuplicated && 'Error: duplicate access group name in form')
                            }
                            error={ Boolean(accessGroupScheduleNameBlank)}
                        />
                    </Grid>
                    <Collapse in={expanded}>
                        <Stack spacing={3}>
                            <Grid
                                item
                                md={12}
                                xs={12}
                            >
                                <TextField
                                    fullWidth
                                    // label="Description"
                                    name="accessGroupDesc"
                                    multiline
                                    value={(description)} //add new rrule obj here. value={new RRule(string)} from rrulefrom
                                    disabled
                                    // value={accessGroupDesc}
                                    // onChange={onDescriptionChange}
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

export default EditAccGrpSchedForm;