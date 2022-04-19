import { Button, CardContent, CardHeader, Collapse, Divider, Grid, TextField } from "@mui/material"
import ExpandMore from "../shared/expand-more"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useRef, useState } from "react";
import SingleSelect from "../shared/single-select-input";
import Toggle from "../shared/toggle";
import { Add } from "@mui/icons-material";
import { getCredTypeId, getCredTypeName } from "../../../utils/credential-type";
import CredentialEdit from "./credential-edit";

const CredentialEditForm = ({ credentials, addCredential, removeCredentialFactory, credTypes, onCredTypeChangeFactory, onCredUidChangeFactory, onCredTTLChangeFactory, onCredValidChangeFactory, onCredPermChangeFactory, validation }) => {

    // expanded logic
    const [expanded, setExpanded] = useState(true);
    const onExpandedClick = () => setExpanded(!expanded);

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
                                // console.log("credentials",credentials)
                                const id = cred.credId;
                                // const credUidRef= useRef(cred.credUid)
                                return (
                                    <CredentialEdit
                                        key={id}
                                        onCredTypeChange={onCredTypeChangeFactory(id)}
                                        credTypes={credTypes}
                                        // credUidRef={credUidRef}
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

export default CredentialEditForm;