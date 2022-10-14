import { Button, Card, CardContent, CardHeader, Collapse, Divider, Grid, TextField } from "@mui/material";
import ErrorCard from "../shared/error-card";
import { useState, useRef } from "react";
import SingleSelect from "../shared/single-select-input";
import { isObject } from "../../../utils/utils";
import { notificationsApi } from "../../../api/notifications";
import toast from "react-hot-toast";


const SMTPForm = ({SMTPInfo}) => {

    const [disableSubmit, setDisableSubmit] = useState(false);

    const onUsernameChange = (e) => {
        SMTPInfo.username = e.target.value;
    }

    const onEmailChange = (e) => {
        SMTPInfo.email = e.target.value;
    }

    const onEmailPasswordChange = (e) => {
        SMTPInfo.emailPassword = e.target.value;
    }

    const onHostAddressChange = (e) => {
        SMTPInfo.hostAddress = e.target.value;
    }

    const onPortNumberChange = (e) => {
        SMTPInfo.portNumber = e.target.value;
        console.log(SMTPInfo);
    }

    const onSubmit = async(e) => {
        e.preventDefault();
        setDisableSubmit(true);
        try {
            const res = await notificationsApi.updateEmail(SMTPInfo);
            if (res) { 
                toast.success("Successfully saved Notification Settings");
            }
        } catch {
            toast.error("Unable to save settings");
        }        
        setDisableSubmit(false);
    }


    return (
        // <ErrorCard error={ cardError(validation) }> 
            <CardContent>
                <Grid
                    container
                    spacing={3}
                    fluid
                >
                    <Grid item xs={8}>
                        <TextField
                            fullWidth
                            label="Username"
                            name="Username"
                            required
                            defaultValue={SMTPInfo.username}
                            onChange={onUsernameChange}
                            // helperText={ 
                            //     (accessGroupNameBlank && 'Error: access group name cannot be blank') ||
                            //     (accessGroupNameExists && 'Error: access group name taken') ||
                            //     (accessGroupNameDuplicated && 'Error: duplicate access group name in form')
                            // }
                            // error={ Boolean(accessGroupNameBlank || accessGroupNameExists || accessGroupNameDuplicated)}
                        />
                    </Grid>
                    <Grid
                        item
                        xs={8}
                    >
                        <TextField
                            fullWidth
                            label="Email"
                            name="Email"
                            required
                            defaultValue={SMTPInfo.email}
                            onChange={onEmailChange}
                            // helperText={ 
                            //     (accessGroupNameBlank && 'Error: access group name cannot be blank') ||
                            //     (accessGroupNameExists && 'Error: access group name taken') ||
                            //     (accessGroupNameDuplicated && 'Error: duplicate access group name in form')
                            // }
                            // error={ Boolean(accessGroupNameBlank || accessGroupNameExists || accessGroupNameDuplicated)}
                        />
                    </Grid>
                    <Grid
                        item
                        xs={8}
                    >
                        <TextField
                            fullWidth
                            label="Password"
                            name="Password"
                            required
                            defaultValue={SMTPInfo.emailPassword}
                            onChange={onEmailPasswordChange}
                            // helperText={ 
                            //     (accessGroupNameBlank && 'Error: access group name cannot be blank') ||
                            //     (accessGroupNameExists && 'Error: access group name taken') ||
                            //     (accessGroupNameDuplicated && 'Error: duplicate access group name in form')
                            // }
                            // error={ Boolean(accessGroupNameBlank || accessGroupNameExists || accessGroupNameDuplicated)}
                        />
                    </Grid>
                    <Grid
                        item
                        xs={8}
                    >
                        <TextField
                            fullWidth
                            label="Host Address"
                            name="Host Address"
                            required
                            defaultValue={SMTPInfo.hostAddress}
                            onChange={onHostAddressChange}
                            // helperText={ 
                            //     (accessGroupNameBlank && 'Error: access group name cannot be blank') ||
                            //     (accessGroupNameExists && 'Error: access group name taken') ||
                            //     (accessGroupNameDuplicated && 'Error: duplicate access group name in form')
                            // }
                            // error={ Boolean(accessGroupNameBlank || accessGroupNameExists || accessGroupNameDuplicated)}
                        />
                    </Grid>
                    <Grid
                        item
                        xs={8}
                    >
                        <TextField
                            fullWidth
                            label="Port Number"
                            name="Port Number"
                            required
                            defaultValue={SMTPInfo.portNumber}
                            onChange={onPortNumberChange}
                            // helperText={ 
                            //     (accessGroupNameBlank && 'Error: access group name cannot be blank') ||
                            //     (accessGroupNameExists && 'Error: access group name taken') ||
                            //     (accessGroupNameDuplicated && 'Error: duplicate access group name in form')
                            // }
                            // error={ Boolean(accessGroupNameBlank || accessGroupNameExists || accessGroupNameDuplicated)}
                        />
                    </Grid>
                    <Grid
                        item
                        xs={8}>
                        <Grid container alignItems="center" justifyContent="flex-start">
                            <Grid item>
                                <Button variant="contained" onClick={onSubmit}>Save Settings</Button>
                            </Grid>
                            <Grid item sx={{mx:2}}>
                                <Button variant="outlined">Test SMTP Email</Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
                
            </CardContent>
        // </ErrorCard>
    );
};

export default SMTPForm;