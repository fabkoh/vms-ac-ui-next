import { Button, 
    CardContent,
     CardHeader, 
     Collapse, 
     Divider, 
     Grid, 
     TextField,
     Switch,
     FormControl,
     FormControlLabel,
     Typography,
     FormGroup
     } from "@mui/material";
import ErrorCard from "../shared/error-card";
import ExpandMore from "../shared/expand-more";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState, useRef } from "react";
import SingleSelect from "../shared/single-select-input";
import { isObject } from "../../../utils/utils";

const VideoRecorderEditForm = ({ recorderInfo, recorderValidations, 
    removeCard, onNameChange, 
    onPublicIpChange, onPrivateIpChange, onPortNumberChange, 
    onIWSPortChange, onUsernameChange, handleToggleDefaultIP, 
    handleToggleAutoPortForwarding,
    onPasswordChange, edit }) => {

    const {
        recorderId,
        recorderName,
        recorderPublicIp,
        recorderPrivateIp,
        recorderPortNumber,
        recorderIWSPort,
        recorderUsername,
        recorderPassword,
        autoPortForwarding,
        defaultIP
        
    } = recorderInfo;

    const {
        recorderNameBlank,
        recorderNameExists,
        recorderNameDuplicated,
        recorderPublicIpBlank,
        recorderPrivateIpBlank,
        recorderPrivateIpExists,
        recorderPrivateIpDuplicated,
        recorderPortNumberExists,
        recorderPortNumberDuplicated,
        recorderIWSPortExists,
        recorderIWSPortDuplicated,
        recorderUsernameBlank,
        recorderPasswordBlank,
        recorderNameError,
        recorderUsernameError,
        recorderPasswordError,
        recorderPublicIpError,
        recorderPrivateIpError,
        recorderPortNumberError,
        recorderIWSPortError,

        submitFailed
    } = recorderValidations;

    // expanding form
    const [expanded, setExpanded] = useState(true);
    const handleExpandClick = () => setExpanded(!expanded);

    return (
        <ErrorCard error={
            recorderNameBlank        ||
            recorderNameExists       ||
            recorderNameDuplicated ||
            recorderPublicIpBlank ||
            recorderPrivateIpBlank ||
            recorderPrivateIpExists ||
            recorderPrivateIpDuplicated ||
            recorderPortNumberExists ||
            recorderPortNumberDuplicated ||
            recorderIWSPortExists ||
            recorderIWSPortDuplicated ||
            recorderUsernameBlank ||
            recorderPasswordBlank ||
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
                title="Video Recorder"
                action={
                    // action are children flushed to the right
                    (
                        <Grid item
                            container>
                            {/* { edit && (
                                <Grid item
                                 sx={{display: "flex", justifyContent: "center", alignItems: "center", paddingRight: 1, paddingLeft: 1}}>
                                    <EditFormTooltip />
                                </Grid>
                            )} */}
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={() => removeCard(recorderId)}
                            >
                                Clear
                            </Button>
                            {/* { edit && (
                                <Box ml={2}>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        onClick={() => console.log("delete")} // put delete method here
                                    >
                                        Delete
                                    </Button>
                                </Box>
                            )} */}
                        </Grid>
                    )
                }
                sx={{ width: '100%', flexWrap: "wrap" }}
            />
            <Divider />
            <CardContent>
                <Grid container
                      spacing={3}>
                    <Grid
                        item
                        md={6}
                        xs={12}
                    >
                        <TextField
                            fullWidth
                            label="Name"
                            name="recorderName"
                            required
                            value={recorderName}
                            onChange={onNameChange}
                            helperText={ 
                                (recorderNameBlank && 'Error: Recorder name cannot be blank') ||
                                (recorderNameExists && 'Error: Recorder name taken') ||
                                (recorderNameDuplicated && 'Error: Duplicate recorder name in form') ||
                                (recorderNameError && 'Error: ' + recorderNameError)
                            }
                            error={Boolean(recorderNameBlank || recorderNameExists || recorderNameDuplicated || recorderNameError)}

                        />
                    </Grid>
                    <Grid
                                    item
                                    md={6}
                                    xs={12}
                                >
                                    <TextField
                                        fullWidth
                                        error={Boolean(recorderPrivateIpBlank || recorderPrivateIpExists || recorderPrivateIpDuplicated || recorderPrivateIpError)}
                                        helperText={
                                                (recorderPrivateIpExists && 'Error: Recorder Private IP address taken') ||
                                                (recorderPrivateIpDuplicated && 'Error: Duplicate recorder private IP address in form') ||
                                                (recorderPrivateIpError && 'Error: ' + recorderPrivateIpError) ||
                                                "Private IP address of the video recorder."
                                            }
                                        label="Private IP Address"
                                        name="recorderPrivateIp"
                                        onChange={onPrivateIpChange}
                                        value={recorderPrivateIp}
                                        required
                                    />
                </Grid>
                    <Grid
                    item
                    md={3}
                    xs={6}
                >

                    <FormControl>
                        <FormGroup>
                            <FormControlLabel
                                label={<Typography fontWeight="bold">Enable uPnP</Typography>}
                                labelPlacement="start" 
                                control={<Switch value={autoPortForwarding} checked={autoPortForwarding} onChange={handleToggleAutoPortForwarding}></Switch>}
                            />
                        </FormGroup>
                    </FormControl>
                </Grid>
                    <Grid
                        item
                        md={3}
                        xs={6}
                    >

                        <FormControl>
                            <FormGroup>
                                <FormControlLabel
                                    label={<Typography fontWeight="bold">Default Public IP</Typography>}
                                    labelPlacement="start"
                                    control={<Switch value={defaultIP} checked={defaultIP} onChange={handleToggleDefaultIP}></Switch>}
                                />
                            </FormGroup>
					    </FormControl>
                    </Grid>
                    <Grid
                        item
                        md={6}
                        xs={12}
                    >

                        <TextField
                            fullWidth
                            label="Public IP Address"
                            name="recorderPublicIp"
                            disabled={defaultIP}
                            value={recorderPublicIp}
                            onChange={onPublicIpChange}
                            error={Boolean(recorderPublicIpBlank || recorderPublicIpError)}
                            helperText={
                                    (recorderPublicIpError && 'Error: ' + recorderPublicIpError) ||
                                    "Public IP address of the video recorder."
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
                                        error={Boolean(recorderPortNumberExists || recorderPortNumberDuplicated || recorderPortNumberError)}
                                        helperText={ 
                                                (recorderPortNumberExists && 'Error: Recorder port number taken') ||
                                                (recorderPortNumberDuplicated && 'Error: Duplicate recorder port number in form') ||
                                                (recorderPortNumberError && 'Error: ' + recorderPortNumberError) ||
                                                "Public port number of the video recorder. Auto-generated if empty."
                                            }
                                        label="Public Port Number"
                                        name="recorderPortNumber"
                                        onChange={onPortNumberChange}
                                        value={recorderPortNumber}
                                    />
                                </Grid>
                                <Grid
                                    item
                                    md={6}
                                    xs={12}
                                >
                                    <TextField
                                        fullWidth
                                        error={Boolean(recorderIWSPortExists || recorderIWSPortDuplicated || recorderIWSPortError)}
                                        helperText={ 
                                                (recorderIWSPortExists && 'Error: Recorder IWS port taken') ||
                                                (recorderIWSPortDuplicated && 'Error: Duplicate port number in form') ||
                                                (recorderIWSPortError && 'Error: ' + recorderIWSPortError) ||
                                                "Public IWS Port of the video recorder. Auto-generated if empty."
                                            }
                                        label="Public IWS Port"
                                        name="recorderIWSPort"
                                        onChange={onIWSPortChange}
                                        value={recorderIWSPort}
                                    />
                                </Grid>
                                <Grid
                                    item
                                    md={6}
                                    xs={12}
                                >
                                    <TextField
                                        fullWidth
                                        label="User Name"
                                        name="recorderUsername"
                                        required
                                        value={recorderUsername}
                                        onChange={onUsernameChange}
                                        helperText={(recorderUsernameBlank && 'Error: Recorder user name cannot be blank') || (recorderUsernameError && 'Error: ' + recorderUsername)}
                                        error={Boolean(recorderUsernameBlank || recorderUsernameError)}

                                    />
                                </Grid>
                                <Grid
                                    item
                                    md={6}
                                    xs={12}
                                >
                                    <TextField
                                        type="password"
                                        fullWidth
                                        label="Password"
                                        name="recorderPassword"
                                        required
                                        value={recorderPassword}
                                        onChange={onPasswordChange}
                                        helperText={(recorderPasswordBlank && 'Error: Recorder password cannot be blank') || (recorderPasswordError && 'Error: ' + recorderPassword)}
                                        error={Boolean(recorderPasswordBlank || recorderPasswordError)}

                                    />
                                </Grid>
                            </Grid>
                        </Collapse>
                    </Grid>
                </Grid>
            </CardContent>
        </ErrorCard>
    )
}

export default VideoRecorderEditForm;