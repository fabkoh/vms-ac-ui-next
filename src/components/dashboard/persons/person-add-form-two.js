import { Button, CardContent, CardHeader, Collapse, Divider, Grid, TextField } from "@mui/material";
import ErrorCard from "../shared/error-card";
import ExpandMore from "../shared/expand-more";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MuiPhoneNumber from "material-ui-phone-number";
import { useState, useRef } from "react";
import SingleSelect from "../shared/single-select-input";
import { getAccessGroupLabel } from "../../../utils/access-group";

const PersonAddFormTwo = ({ onClear, person, onPersonFirstNameChange, onPersonLastNameChange, onPersonMobileNumberChange, onPersonUidChange, onPersonEmailChange, accessGroups, handleAccessGroupChange, validation }) => {

    // update logic
    const personFirstNameRef = useRef(person.personFirstName);
    const personLastNameRef = useRef(person.personLastName);
    const personUidRef = useRef(person.personUid);
    const personMobileNumberRef = useRef(person.personMobileNumber);
    const personEmailRef = useRef(person.personEmail);
    
    const handlePersonFirstNameChange = (e) => {
        e.preventDefault();
        onPersonFirstNameChange(personFirstNameRef);
    }

    const handlePersonLastNameChange = (e) => {
        e.preventDefault();
        onPersonLastNameChange(personLastNameRef);
    }

    const handlePersonUidChange = (e) => {
        e.preventDefault();
        onPersonUidChange(personUidRef);
    }

    const handlePersonMobileNumberChange = () => onPersonMobileNumberChange(personMobileNumberRef);

    const handlePersonEmailChange = (e) => {
        e.preventDefault();
        onPersonEmailChange(personEmailRef);
    }

    // expanding card logic
    const [expanded, setExpanded] = useState(true);
    const onExpandedClick = () => setExpanded(!expanded);
    
    return (
        <ErrorCard>
            <CardHeader
                avatar={
                    <ExpandMore
                        expand={expanded}
                        onClick={onExpandedClick}
                    >
                        <ExpandMoreIcon />
                    </ExpandMore>
                }
                title="Person"
                action={
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={onClear}
                    >
                        Clear
                    </Button>
                }
                sx={{ width: '100%' }}
            />
            <Divider />
            <CardContent>
                <Grid
                    container
                    spacing={3}
                >
                    <Grid
                        item
                        md={6}
                        xs={12}
                    >
                        <TextField
                            fullWidth
                            label="First Name"
                            name="personFirstName"
                            inputProps={{ ref: personFirstNameRef }}
                            onChange={handlePersonFirstNameChange}
                            defaultValue={person.personFirstName}
                            required
                            error={validation.firstNameBlank}
                            helperText={
                                validation.firstNameBlank && 'First Name cannot be blank'
                            }
                        />
                    </Grid>
                    <Grid
                        item
                        md={6}
                        xs={12}
                    >
                        <TextField
                            fullWidth
                            label="Last Name"
                            name="personLastName"
                            inputProps={{ ref: personLastNameRef }}
                            onChange={handlePersonLastNameChange}
                            defaultValue={person.personLastName}
                            required
                            error={validation.lastNameBlank}
                            helperText={
                                validation.lastNameBlank && 'Last Name cannot be blank'
                            }
                        />
                    </Grid>
                    <Grid
                        item
                        md={12}
                        xs={12}
                    >
                        <Collapse in={expanded}>
                            <Grid
                                container
                                spacing={3}
                            >
                                <Grid
                                    item
                                    md={6}
                                    xs={12}
                                >
                                    <TextField
                                        fullWidth
                                        label="UID"
                                        name="personUid"
                                        inputProps={{ ref: personUidRef }}
                                        onChange={handlePersonUidChange}
                                        defaultValue={person.personUid}
                                    />
                                </Grid>
                                <Grid
                                    item
                                    md={6}
                                    xs={12}
                                >
                                    <MuiPhoneNumber
                                        fullWidth
                                        label="Mobile Number"
                                        name="personMobileNumber"
                                        defaultCountry="sg"
                                        onChange={handlePersonMobileNumberChange}
                                        inputProps={{ ref: personMobileNumberRef }}
                                        value={person.personMobileNumber} 
                                        variant="outlined"   
                                    />
                                </Grid>
                                <Grid
                                    item
                                    md={6}
                                    xs={12}
                                >
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        name="email"
                                        inputProps={{ ref: personEmailRef }}
                                        onChange={handlePersonEmailChange}
                                        defaultValue={person.personEmail}
                                    />
                                </Grid>
                                <Grid
                                    item
                                    md={6}
                                    xs={12}
                                >
                                    <SingleSelect
                                        fullWidth
                                        label="Access Group"
                                        getLabel={getAccessGroupLabel}
                                        onChange={handleAccessGroupChange}
                                        value={person.accessGroup}
                                        options={accessGroups}
                                    />
                                </Grid>
                            </Grid>
                        </Collapse>
                    </Grid>
                </Grid>
            </CardContent>
        </ErrorCard>
    );
};

export default PersonAddFormTwo;