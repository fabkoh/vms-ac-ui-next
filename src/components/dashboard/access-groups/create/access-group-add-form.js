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
    Typography
} from "@mui/material";
import { useState } from "react";
import { ExpandMore } from "../../person/person-add-form";
import MultipleSelectInput from "../../shared/multi-select-input";
import ErrorCard from "../../shared/error-card";

export const AccessGroupAddForm = ({ accessGroupInfo, accessGroupValidations, removeCard, allPersons, changeTextField, changePerson, changeNameCheck, changePersonCheck, duplicatedPerson }) => {
    const {
        cardId,
        accessGroupName,
        accessGroupDesc,
        person
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
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={() => removeCard(cardId)}
                    >
                        Remove
                    </Button>
                }
                sx={{ width: '100%' }}
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
                            onChange={(e) => { changeTextField(e, cardId); changeNameCheck(e, cardId); }}
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
                                    onChange={ (e) => changeTextField(e, cardId) }
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
                                    <Grid>
                                        <Typography 
                                            variant="body" 
                                            fontWeight="bold"
                                        >
                                            Add Persons:
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
                                        setSelected={(newValue) => { changePerson(newValue, cardId); changePersonCheck(newValue, cardId); }}
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
                                        isWarning={person => person.accessGroup}
                                        isError={person => duplicatedPerson[person.personId]}
                                        error={accessGroupPersonDuplicated}
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