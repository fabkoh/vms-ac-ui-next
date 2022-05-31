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
import WeeklyRrule from "../shared/weekly-Rrule";
import rruleDescription from "../../../utils/rrule-desc";
import { whitespace } from "stylis";
import { WrapText } from "@mui/icons-material";
import SingleSelect from "../controllers/single-select-input";
import { authDeviceApi } from "../../../api/auth-devices";

const EditAuthSchedForm = ({
    changeAuthMethod,checkUntil,changeTimeStart,changeTimeEnd,changeRrule,changeTextField,edit,removeCard,authMethodScheduleInfo,authMethodScheduleValidations}) => {
    const {
        authMethodScheduleId,
        authMethodSchedule,
        rrule,
        timeStart,
        timeEnd,
    } = authMethodScheduleInfo;

    const {
        authMethodScheduleBlank,
        timeEndInvalid,
        overlapped,
    } = authMethodScheduleValidations;
   
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

    const [authMethodList, setAuthMethodList ] = useState([])
    const getAuthMethodList = async () => {
        authDeviceApi.getAllAuthMethods().then(async(res)=>{
            setAuthMethodList(await res.json())
            // console.log('a',authMethodList)
        }
        )
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
        console.log(e.toString())
    }
    //Description handler
    const descriptionHandler = (e) => { //e should be the rrule obj
        setDescription(rruleDescription(e, start, end))
        console.log(rruleDescription(e, start, end));
    }

    useEffect(() => {
        getAuthMethodList()
    }, [])

    useEffect(() => {
        changeRrule(rrulestring,authMethodScheduleId)
        changeTimeStart(start,authMethodScheduleId)
        changeTimeEnd(end,authMethodScheduleId)
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
    
    return (
        <ErrorCard error={
            // entranceScheduleBlank        ||
            // accessGroupNameExists       ||
            // accessGroupNameDuplicated   ||
            // accessGroupPersonDuplicated ||
            overlapped
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
                title="Authentication Schedule"
                subheader = {overlapped?"Error: Clashes detected in highlighted schedules":""}
                subheaderTypographyProps = {{
                                            color: "error",
                                            margin:0,}}
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
                                sx={{mt:1}}
                                onClick={() => removeCard(authMethodScheduleId)}
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
                            name="authSchedule"
                            required
                            value={authMethodSchedule}
                            onChange={(e)=>{changeTextField(e,authMethodScheduleId)}}
                            helperText={ 
                                (authMethodScheduleBlank && 'Error: authentication schedule name cannot be blank')
                                // (entranceScheduleBlank && 'Error: access group name cannot be blank') ||
                            //     (accessGroupNameExists && 'Error: access group name taken') ||
                            //     (accessGroupNameDuplicated && 'Error: duplicate access group name in form')
                            }
                            error={ Boolean(authMethodScheduleBlank)}
                        />
                    </Grid>
                    <Collapse in={expanded}>
                        <Stack spacing={3}>
                            <Grid
                                item
                                xs={12}
                            >
                                <TextField
                                    fullWidth
                                    // label="Description"
                                    name="Desc"
                                    multiline
                                    value={(description)} //add new rrule obj here. value={new RRule(string)} from rrulefrom
                                    disabled
                                />
                            </Grid>
                                
                            <Grid
                                item
                                xs={12}
                            >
                                <SingleSelect
								label="Authentication Method"
								getLabel={(authMethod)=>authMethod.authMethodDesc}
								getValue={(authMethod)=>authMethod.authMethodId}
								onChange={(e)=>{changeAuthMethod(e,authMethodScheduleId)}}
								options={authMethodList}
								noclear
								required
								fullWidth
							/>
                            </Grid>

                            <Divider />
                            <Grid
                                item
                                xs={12}
                            >
                                <WeeklyRrule
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
                                xs={12}
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

export default EditAuthSchedForm;