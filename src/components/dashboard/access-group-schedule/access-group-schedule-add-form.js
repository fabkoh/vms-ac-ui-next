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

const AddAccGrpSchedForm = ({changeTimeStart,changeTimeEnd,changeRrule,changeTextField,edit,removeCard,accessGroupScheduleInfo,accessGroupScheduleValidations,allEntrances,onEntranceChange}) => {
    const {
        accessGroupScheduleId,
        accessGroupScheduleName,
        rrule,
        timeStart,
        timeEnd,
        entrances,
    } = accessGroupScheduleInfo;

    const {
        accessGroupScheduleNameBlank,
        entrancesBlank,
        accessGroupNameDuplicated,
        accessGroupPersonHasAccessGroup,
        accessGroupPersonDuplicated,
        submitFailed
    } = accessGroupScheduleValidations;
   

    // expanding form
    const [expanded, setExpanded] = useState(true);
    const handleExpandClick = () => setExpanded(!expanded);

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
    const handleRrule = (e) => {
        setDescription(e.toText())
        setRrulestring(e.toString())
    }
    useEffect(() => {
        changeRrule(rrulestring,accessGroupScheduleId)
        changeTimeStart(start,accessGroupScheduleId)
        changeTimeEnd(end,accessGroupScheduleId)
    }, [rrulestring,start,end])
    
    // entrance logic
    const getEntranceName = (e) => e.entranceName;
    const entranceFilter = (entrances, state) => {
        const text = state.inputValue.toLowerCase(); // case insensitive search
        return entrances.filter(e => (
            e.entranceName.toLowerCase().includes(text)
        ))
    }
    const entranceEqual = (option, value) => option.entranceId == value.entranceId;
    
    return (
        <ErrorCard error={
            accessGroupScheduleNameBlank        ||
            entrancesBlank                      ||
            submitFailed
            // accessGroupScheduleNameBlank        ||
            // accessGroupNameExists       ||
            // accessGroupNameDuplicated   ||
            // accessGroupPersonDuplicated ||
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
                                (accessGroupScheduleNameBlank && 'Error: access group name cannot be blank') 
                                // (accessGroupScheduleNameBlank && 'Error: access group name cannot be blank') ||
                            //     (accessGroupNameExists && 'Error: access group name taken') ||
                            //     (accessGroupNameDuplicated && 'Error: duplicate access group name in form')
                            }
                            // error={ accessGroupScheduleName?false:true}
                            error={ Boolean(accessGroupScheduleNameBlank) }
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
                                    label="Description"
                                    name="accessGroupDesc"
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
                                />
                            </Grid>
                            <Divider />
                            <Grid
                                md={12}
                                xs={12}
                                container
                                alignItems="center"
                                >
                        <Grid item mr={2}>
                            <Typography fontWeight="bold">Entrance:</Typography>
                        </Grid>
                        <Grid item mt={2} md={6} xs={12} fullwidth>
                            <MultipleSelectInput 
                                        options={allEntrances}
                                        setSelected={onEntranceChange}
                                        getOptionLabel={getEntranceName}
                                        label="Entrances"
                                        noOptionsText="No entrance found"
                                        placeholder="Enter entrance details (name, description) to search"
                                        filterOptions={entranceFilter}
                                        value={entrances}
                                        isOptionEqualToValue={entranceEqual}
                                        helperText={
                                            entrancesBlank&&"Error: entrance cannot be blank"
                                        }
                                        error={Boolean(entrancesBlank)}
                            />
                        </Grid>
                            </Grid>
                        </Stack>
                    </Collapse>
                </Stack>
            </CardContent>
        </ErrorCard>
    )
}

export default AddAccGrpSchedForm;