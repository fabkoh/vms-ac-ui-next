import { Button, CardContent, CardHeader, Collapse, Divider, Grid, TextField } from "@mui/material"
import ExpandMore from "../shared/expand-more"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState } from "react";
import SingleSelect from "../shared/single-select-input";
import Toggle from "../shared/toggle";
import { Add } from "@mui/icons-material";
import { getCredTypeId, getCredTypeName } from "../../../utils/credential-type";
import Credential from "./credential";

const CredentialForm = ({ credentials, addCredential, removeCredentialFactory, credTypes, originalCredTypes, onCredTypeChangeFactory, onCredUidChangeFactory, onCredTTLChangeFactory, onCredValidChangeFactory, onCredPermChangeFactory, validation }) => {

    // expanded logic
    const [expanded, setExpanded] = useState(true);
    const onExpandedClick = () => setExpanded(!expanded);

    console.log("original2", originalCredTypes)
    console.log("credentials", credentials)

    const PIN_CRED_TYPE = { id: 4, name: 'Pin' };

    const hasPinCred = (personCredentials) => {
        return personCredentials.some(cred => cred.credTypeId === PIN_CRED_TYPE.id);
    };

    return (
        <>
            <CardHeader
                avatar={
                    <ExpandMore
                        expand={expanded}
                        onClick={onExpandedClick}
                    >
                        <ExpandMoreIcon />
                    </ExpandMore>
                }
                title="Credentials"
                sx={{ width: '100%' }}
            />
            <Divider />
            <CardContent>
                <Collapse in={expanded}>
                    <Grid 
                        container
                        spacing={3}
                    >
                        {
                            credentials.map(cred => {
                                const id = cred.credId;
                                return (
                                    <Credential
                                        key={id}
                                        onCredTypeChange={onCredTypeChangeFactory(id)}
                                        // Only the cred that is of type Pin will have Pin in its list of credTypes
                                        credTypes={cred.credTypeId === 4 || !hasPinCred(credentials) ? originalCredTypes : credTypes}
                                        credential={cred}
                                        removeCredential={removeCredentialFactory(id)}
                                        onCredUidChange={onCredUidChangeFactory(id)}
                                        onCredTTLChange={onCredTTLChangeFactory(id)}
                                        onCredValidChange={onCredValidChangeFactory(id)}
                                        onCredPermChange={onCredPermChangeFactory(id)}
                                        validation={validation}
                                    />
                                )        
                            })                
                        }
                        <Grid item>
                            <Button
                                variant="outlined"
                                startIcon={<Add />}
                                onClick={addCredential}
                            >
                                Add credential
                            </Button>
                        </Grid>
                    </Grid>
                </Collapse>
            </CardContent>
        </>
    )
}

export default CredentialForm;