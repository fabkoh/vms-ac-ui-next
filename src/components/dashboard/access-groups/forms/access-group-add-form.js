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
    Box
} from "@mui/material";
import { useState } from "react";
import ExpandMore from "../../shared/expand-more";
import MultipleSelectInput from "../../shared/multi-select-input";
import ErrorCard from "../../shared/error-card";

const AccessGroupForm = ({ accessGroupInfo, accessGroupValidations, removeCard, allPersons, changeTextField, changePerson, changeNameCheck, changePersonCheck, duplicatedPerson, edit }) => {
    const {
        accessGroupId,
        accessGroupName,
        accessGroupDesc,
        person,
        originalPersonIds
    } = accessGroupInfo;

    const {
        accessGroupNameBlank,
        accessGroupNameExists,
        accessGroupNameDuplicated,
        accessGroupPersonHasAccessGroup,
        accessGroupPersonDuplicated,
        submitFailed
    } = accessGroupValidations;

    // expanding form
    const [expanded, setExpanded] = useState(true);
    const handleExpandClick = () => setExpanded(!expanded);

    const getName = (p) => p.personFirstName + ' ' + p.personLastName;
    return (
        <ErrorCard error={
            accessGroupNameBlank        ||
            accessGroupNameExists       ||
            accessGroupNameDuplicated   ||
            accessGroupPersonDuplicated ||
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
                title="Access group"
                action={
                    // action are children flushed to the right
                    (
                        <Grid item container>
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={() => removeCard(accessGroupId)}
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
                            name="accessGroupName"
                            required
                            value={accessGroupName}
                            onChange={(e) => { changeTextField(e, accessGroupId); changeNameCheck(e, accessGroupId); }}
                            helperText={ 
                                (accessGroupNameBlank && 'Error: access group name cannot be blank') ||
                                (accessGroupNameExists && 'Error: access group name taken') ||
                                (accessGroupNameDuplicated && 'Error: duplicate access group name in form')
                            }
                            error={ Boolean(accessGroupNameBlank || accessGroupNameExists || accessGroupNameDuplicated)}
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
                                    value={accessGroupDesc}
                                    onChange={ (e) => changeTextField(e, accessGroupId) }
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
                                            Assign persons:
                                        </Typography>
                                    </Grid>
                                </Grid>
                                <Grid
                                    item
                                    md={10}
                                    xs={12}
                                >
                                    <MultipleSelectInput 
                                        options={allPersons}
                                        setSelected={(newValue) => { changePerson(newValue, accessGroupId); changePersonCheck(newValue, accessGroupId); }}
                                        getOptionLabel={getName}
                                        label="Persons"
                                        noOptionsText="No persons found"
                                        placeholder="Enter person details (name, org/dept) to search"
                                        filterOptions={
                                            (persons, state) => {
                                                const text = state.inputValue.toLowerCase();
                                                return persons.filter(p => (
                                                    (p.personFirstName.toLowerCase().includes(text) ||
                                                     p.personLastName.toLowerCase().includes(text) ||
                                                     p.personUid.toLowerCase().includes(text) ||
                                                     (p.personEmail && p.personEmail.toLowerCase().includes(text)) ||
                                                     (p.personMobileNumber && p.personMobileNumber.toLowerCase().includes(text)) ||
                                                     // full name check
                                                     getName(p).toLowerCase().includes(text)) ||
                                                     //access group name check
                                                     (p.accessGroup && p.accessGroup.accessGroupName.toLowerCase().includes(text))
                                                ))
                                            }
                                        }
                                        helperText={
                                            (accessGroupPersonDuplicated && "Error: person(s) in red are present in another access group form") ||
                                            (accessGroupPersonHasAccessGroup && "Note: person(s) in yellow already has an access group. Submitting the form would update their access group.")}
                                        isWarning={p => p.accessGroup && !(originalPersonIds && originalPersonIds.includes(p.personId)) }
                                        isError={person => duplicatedPerson[person.personId]}
                                        error={accessGroupPersonDuplicated}
                                        value={person}
                                        isOptionEqualToValue={(option, value) => option.personId == value.personId}
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

export default AccessGroupForm;