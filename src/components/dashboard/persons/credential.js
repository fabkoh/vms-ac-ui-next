import { Box, Button, Divider, Grid, TextField } from "@mui/material";
import SingleSelect from "../shared/single-select-input";
import Toggle from "../shared/toggle";
import { getCredTypeId, getCredTypeName } from "../../../utils/credential-type";
import { useRef, useState } from "react";
import { toDateInputString } from "../../../utils/credential";
import { PasswordField } from "../shared/password-field";

const today = new Date();
today.setHours(0, 0, 0); // since expiry date is end date inclusive (until 235959)

const Credential = ({ onCredTypeChange, credTypes, credential, removeCredential, onCredUidChange, onCredTTLChange, onCredValidChange, onCredPermChange, validation }) => {

    const {
        credId,
        credTypeId,
        credUid,
        credTTL, // Date obj
        isValid,
        isPerm
    } = credential;

    // seperate but equal value states for rendering help
    const [valid, setValid] = useState(isValid);
    const [perm, setPerm] = useState(isPerm);
    const [endDate, setEndDate] = useState(credTTL); // Date obj

    const credUidRef = useRef(credUid);

    const handleCredUidChange = (e) => {
        e.preventDefault();
        onCredUidChange(credUidRef);
    }

    const handleCredTTLChange = (e) => {
        const input = e.target?.value;
        if (input == '') { // incomplete or empty date
            onCredTTLChange(null);
            setEndDate(null);
        } else {
            const date = new Date(input);
            onCredTTLChange(date);
            setEndDate(date);
        }
    }

    const handleCredValidChange = (e) => {
        const bool = e.target.checked;
        onCredValidChange(bool);
        setValid(bool);
    }

    const handleCredPermChange = (e) => {
        const bool = e.target.checked;
        onCredPermChange(bool);
        setPerm(bool);
    }

    const TTLHelperText = (endDate != null && endDate < today) ? "Note: expiry is before today" : "Expiry date is end inclusive";
    const credentialCheckFailed = validation.credentialCheckFailed[credId] !== undefined;
    const credentialRepeated = validation.credentialRepeatedIds.includes(credId);
	const credentialUidRepeatedForNotPinTypeCred = validation.credentialUidRepeatedIds.includes(credId);
    const credentialPinInvalidLength = validation.credentialPinInvalidLengthIds.includes(credId);

    return (
        <Grid
            item
            container
        >
            <Grid
                container
                item
                display="flex"
                justifyContent="space-between"
                alignItems="start"
                flexWrap="wrap"
                md={6}
                xs={12}
                spacing={1}
                mb={1}
            >   
                <Grid
                    item
                    md={3}
                >
                    <SingleSelect
                        fullWidth
                        sx={{ minWidth: '90px' }}
                        label="Type"
                        getLabel={getCredTypeName}
                        onChange={onCredTypeChange}
                        value={credTypeId ? credTypeId : '' }
                        options={credTypes}
                        getValue={getCredTypeId}
                        noclear
                        required
                        helperText=' '
                    />
                </Grid>
                <Grid item md={5}>
                    <PasswordField
                        fullWidth
                        label="Value"
                        handleChange={handleCredUidChange}
                        inputRef={credUidRef}
                        error={credentialRepeated || credentialCheckFailed || credentialUidRepeatedForNotPinTypeCred
                        || credentialPinInvalidLength}
                        helperText={
                            (credentialCheckFailed && "Error: " + validation.credentialCheckFailed[credId]) ||
                            (credentialRepeated && "Error: repeated credential type & value in form") ||
                            (credentialUidRepeatedForNotPinTypeCred && "Error: credential value for non-pin credentials must be unique") ||
                            (credentialPinInvalidLength && "Error: pin value has to be between 4 to 6 characters inclusive") ||
                            ' '
                        }
                    />
                </Grid>
                <Grid
                    item
                    md={4}
                >
                    <Toggle 
                        checked={valid}
                        handleChange={handleCredValidChange} 
                        label="Enabled" 
                    />
                </Grid>
            </Grid>
            <Grid
                item
                display="flex"
                justifyContent="space-between"
                alignItems="start"
                flexWrap="wrap"
                md={6}
                xs={12}
                mb={1}
                container
                spacing={1}
            >
                    <Grid
                        item
                        md={5}
                        mb={1}
                    >   
                        <Toggle 
                            checked={perm}
                            handleChange={handleCredPermChange} 
                            label="Permanent"
                        />
                    </Grid>
                    <Grid
                        item
                        md={5}
                    >
                        {
                            !isPerm && (
                                <TextField // ref does not work as removing and re rendering it removes the date, even though ref.current?.value still has the prev date
                                    required
                                    label="Expiry Date"
                                    type="date" 
                                    InputLabelProps={{ shrink: true }}
                                    helperText={TTLHelperText}
                                    onChange={handleCredTTLChange}
                                    value={toDateInputString(endDate)} // this takes in yyyy-mm-dd
                                    fullWidth
                                />
                            )
                        }
                    </Grid>
                <Grid
                    item
                    md={2}
                >
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={removeCredential}
                    >
                        Clear
                    </Button>
                </Grid>
            </Grid>
            <Divider sx={{ width: '100%' }} />
        </Grid>
    )
}

export default Credential;