import { Button, CardContent, CardHeader, Collapse, Divider, Grid, TextField, Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import ErrorCard from "../dashboard/shared/error-card";
import ExpandMore from "../dashboard/shared/expand-more";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MuiPhoneNumber from "material-ui-phone-number";
import { useState, useRef } from "react";
import { isObject } from "../../utils/utils";

const UserAddForm = ({ onClear, person, onPersonFirstNameChange, onPersonLastNameChange, onPersonMobileNumberChange, onPersonPasswordChange, onPersonEmailChange, onPersonRoleChange,  validation, cardError }) => {

    // update logic
    const personFirstNameRef = useRef(person.personFirstName);
    const personLastNameRef = useRef(person.personLastName);
    const personPasswordRef = useRef(person.personPassword);
    const personMobileNumberRef = useRef(person.personMobileNumber);
    const personEmailRef = useRef(person.personEmail);
    const personRoleRef = useRef(person.personRole);
    
    const handlePersonFirstNameChange = (e) => {
        e.preventDefault();
        onPersonFirstNameChange(personFirstNameRef);
    }

    const handlePersonLastNameChange = (e) => {
        e.preventDefault();
        onPersonLastNameChange(personLastNameRef);
    }

    const handlePersonPasswordChange = (e) => {
        e.preventDefault();
        onPersonPasswordChange(personPasswordRef);
    }

    const handlePersonMobileNumberChange = () => onPersonMobileNumberChange(personMobileNumberRef);

    const handlePersonEmailChange = (e) => {
        e.preventDefault();
        onPersonEmailChange(personEmailRef);
    }

    const handlePersonRoleChange = (e) => {
        e.preventDefault();
        onPersonRoleChange(personRoleRef);
    }

    // expanding card logic
    const [expanded, setExpanded] = useState(true);
    const onExpandedClick = () => setExpanded(!expanded);
    
    return (
        <ErrorCard error={ cardError(validation) }> 
            <CardHeader
                avatar={
                    <ExpandMore
                        expand={expanded}
                        onClick={onExpandedClick}
                    >
                        <ExpandMoreIcon />
                    </ExpandMore>
                }
                title="User"
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
                                validation.firstNameBlank && 'Error: first name cannot be blank'
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
                                validation.lastNameBlank && 'Error: last name cannot be blank'
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
                                        type="email"
                                        label="Email"
                                        name="email"
                                        inputProps={{ ref: personEmailRef }}
                                        onChange={handlePersonEmailChange}
                                        defaultValue={person.personEmail}
                                        required
                                        error={validation.emailBlank || validation.emailInUse || validation.emailRepeated}
                                        helperText={
                                            (validation.emailInUse && "Note: email taken") ||
                                            (validation.emailRepeated && "Note: duplicate email in form") ||
                                            (validation.emailBlank) && "Error: email cannot be blank"
                                        }
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
                                        error={validation.numberInvalid}
                                        helperText={
                                            (validation.numberInUse && "Note: number taken") ||
                                            (validation.numberRepeated && "Note: duplicate number in form") ||
                                            (validation.numberInvalid && "Error: Invalid Singapore phone number")
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
                                        type="password"
                                        label="Password"
                                        name="password"
                                        required
                                        inputProps={{ ref: personPasswordRef }}
                                        onChange={handlePersonPasswordChange}
                                        defaultValue={person.personPassword}
                                        error={validation.passwordBlank}
                                        helperText={
                                            (validation.passwordBlank && "Error: password cannot be blank")
                                        }
                                    />
                                </Grid>
                                <Grid
                                    item
                                    md={6}
                                    xs={12}
                                >
                                    <FormControl fullWidth>
                                    <InputLabel id="select-role"
                                    >Select Role</InputLabel>
                                    <Select
                                        labelId="select-role"
                                        label="Select Role"
                                        fullWidth
                                        id="role"
                                        error={validation.roleBlank}
                                        name="role"
                                        required
                                        onChange={handlePersonRoleChange}
                                    >
                                        <MenuItem value="System-Admin">
                                        System Admin
                                        </MenuItem>
                                        <MenuItem value="Tech-Admin">
                                        Tech Admin
                                        </MenuItem>
                                        <MenuItem value="Admin-User">
                                        Admin User
                                        </MenuItem>
                                    </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Collapse>
                    </Grid>
                </Grid>
            </CardContent>
        </ErrorCard>
    );
};

export default UserAddForm;