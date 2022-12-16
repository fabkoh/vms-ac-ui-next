import { Button, CardContent, CardHeader, Collapse, Divider, Grid, TextField, MenuItem, InputLabel, FormControl } from "@mui/material";
import ErrorCard from "../dashboard/shared/error-card";
import SingleSelect from "../dashboard/shared/single-select-input";
import ExpandMore from "../dashboard/shared/expand-more";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MuiPhoneNumber from "material-ui-phone-number";
import { useState, useRef } from "react";
import { getRoleLabel } from "../../utils/users";
import { useAuth } from '../../hooks/use-auth';

const UserAddForm = ({ onClear, person, onPersonFirstNameChange, onPersonLastNameChange, onPersonMobileNumberChange, onPersonPasswordChange, onPersonEmailChange, handlePersonRoleChange,  validation, cardError }) => {

    // update logic
    const personFirstNameRef = useRef(person.personFirstName);
    const personLastNameRef = useRef(person.personLastName);
    const personPasswordRef = useRef(person.personPassword);
    const personMobileNumberRef = useRef(person.personMobileNumber);
    const personEmailRef = useRef(person.personEmail);
    const personRoleRef = useRef(person.personRole);
    const { user } = useAuth();
    const roles1 = [
        { value: 'System-Admin', label: 'System Admin' },
        { value: 'Tech-Admin', label: 'Tech Admin' },
        { value: 'User-Admin', label: 'User Admin' }
    ]

    const roles2 = [
        { value: 'Tech-Admin', label: 'Tech Admin' },
        { value: 'User-Admin', label: 'User Admin' }
    ]


    const handlePersonFirstNameChange = (e) => {
        e.preventDefault();
        onPersonFirstNameChange(personFirstNameRef);
    }

    const handlePersonLastNameChange = (e) => {
        e.preventDefault();
        onPersonLastNameChange(personLastNameRef);
        console.log(person, 8877, e)
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
                                        required
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
                                    <SingleSelect
                                        fullWidth
                                        label="Select Role"
                                        getLabel={(role) => role.label}
                                        onChange={handlePersonRoleChange}
                                        options={((user!=null) && user.authorities.includes("ROLE_SYSTEM_ADMIN"))? roles1 : roles2}
                                        getValue={(role) => role.value}
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

export default UserAddForm;