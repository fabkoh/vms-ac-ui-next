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
import { useState } from "react";
import ExpandMore from "../../shared/expand-more";
import MultipleSelectInput from "../../shared/multi-select-input";
import ErrorCard from "../../shared/error-card";
import EditFormTooltip from "../../shared/edit_form_tooltip";

const EntranceForm = ({ entranceInfo, entranceValidations, removeCard, onNameChange, onDescriptionChange, onAccessGroupChange, edit, allAccessGroups }) => {
    const {
        entranceId,
        entranceName,
        entranceDesc,
        accessGroups
    } = entranceInfo;

    const {
        entranceNameBlank,
        entranceNameExists,
        entranceNameDuplicated,
        //accessGroupPersonHasAccessGroup,
        //accessGroupPersonDuplicated,
        submitFailed
    } = entranceValidations;

    // expanding form
    const [expanded, setExpanded] = useState(true);
    const handleExpandClick = () => setExpanded(!expanded);

    // access group logic
    const getAccessGroupName = (e) => e.accessGroupName;
    const accessGroupFilter = (accGroup, state) => {
        const text = state.inputValue.toLowerCase(); // case insensitive search
        return accGroup.filter(e => (
            e.accessGroupName.toLowerCase().includes(text)
        ))
    }
    const accessGroupEqual = (option, value) => option.accessGroupId == value.accessGroupId;


    return (
        <ErrorCard error={
            entranceNameBlank        ||
            entranceNameExists       ||
            entranceNameDuplicated   ||
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
                title="Entrance"
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
                                onClick={() => removeCard(entranceId)}
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
                            name="entranceName"
                            required
                            value={entranceName}
                            onChange={onNameChange}
                            helperText={ 
                                (entranceNameBlank && 'Error: entrance name cannot be blank') ||
                                (entranceNameExists && 'Error: entrance name taken') ||
                                (entranceNameDuplicated && 'Error: duplicate entrance name in form')
                            }
                            error={ Boolean(entranceNameBlank || entranceNameExists || entranceNameDuplicated)}
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
                                    name="entranceDesc"
                                    value={entranceDesc}
                                    onChange={onDescriptionChange}
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
                                <Grid
                                    item
                                    md={2}
                                >
                                    <Grid mb={1}>
                                        <Typography 
                                            variant="body" 
                                            fontWeight="bold"
                                        >
                                            Assign Access Groups:
                                        </Typography>
                                    </Grid>
                                </Grid>
                                <Grid
                                    item
                                    md={10}
                                    xs={12}
                                >
                                    <MultipleSelectInput 
                                        options={allAccessGroups}
                                        setSelected={onAccessGroupChange}
                                        getOptionLabel={getAccessGroupName}
                                        label="Access Groups"
                                        noOptionsText="No access group found"
                                        placeholder="Enter access group details (name, description) to search"
                                        filterOptions={accessGroupFilter}
                                        value={accessGroups}
                                        isOptionEqualToValue={accessGroupEqual}
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

export default EntranceForm;