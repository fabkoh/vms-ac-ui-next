import { Button, Grid, TextField } from "@mui/material";
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

    const TTLHelperText = (endDate != null && endDate < today) ? "Note: expiry is before today" : "Expiry is end date inclusive";
    const credentialInUse = validation.credentialInUseIds.includes(credId);
    const credentialRepeated = validation.credentialRepeatedIds.includes(credId);

    return (
        <Grid
            item
            container
            spacing={1}
        >
            <Grid
                item
                display="flex"
                justifyContent="space-between"
                alignItems="start"
                flexWrap="wrap"
                md={6}
                xs={12}
            >
                 <SingleSelect
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

                <PasswordField
                    required
                    label="Value"
                    handleChange={handleCredUidChange}
                    inputRef={credUidRef}
                    error={credentialInUse || credentialRepeated}
                    helperText={
                        (credentialInUse && "Repeated type & value") ||
                        (credentialRepeated && "Repeated type & value in form") || ' '
                    }
                    sx={{ maxWidth: '220px' }}
                />

                <Toggle 
                    checked={valid}
                    handleChange={handleCredValidChange} 
                    label="Enabled" 
                />
            </Grid>
            <Grid
                item
                display="flex"
                justifyContent="space-between"
                alignItems="start"
                flexWrap="wrap"
                md={6}
                xs={12}
            >
                 <Toggle 
                    checked={perm}
                    handleChange={handleCredPermChange} 
                    label="Permanent"
                />

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
                        />
                    )
                }

                <Button
                    variant="outlined"
                    color="error"
                    onClick={removeCredential}
                >
                    Clear
                </Button>

            </Grid>
               
 
               
        </Grid>
    )
}

export default Credential;