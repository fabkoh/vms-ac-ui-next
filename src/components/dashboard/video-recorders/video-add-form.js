import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { 
    Button, 
    CardHeader, 
    Collapse, 
    Grid, 
    TextField, 
    Divider, 
    CardContent,
    Box,
} from "@mui/material";
import { useState } from "react";
import ExpandMore from "../shared/expand-more";
import ErrorCard from "../shared/error-card";
import EditFormTooltip from "../shared/edit_form_tooltip";

const VideoRecorderAddForm = ({ recorderInfo, recorderValidations, removeCard, onNameChange, onSerialNumberChange, onIpAddressChange, onPortNumberChange, onUsernameChange, onPasswordChange, edit }) => {
    const {
        recorderId,
        recorderName,
        recorderSerialNumber,
        recorderIpAddress,
        recorderPortNumber,
        recorderUsername,
        recorderPassword
    } = recorderInfo;

    const {
        recorderNameBlank,
        recorderNameExists,
        recorderNameDuplicated,
        recorderIpAddressBlank,
        recorderIpAddressExists,
        recorderIpAddressDuplicated,
        recorderPortNumberExists,
        recorderPortNumberDuplicated,
        recorderSerialNumberBlank,
        recorderSerialNumberExists,
        recorderSerialNumberDuplicated,
        recorderUsernameBlank,
        recorderPasswordBlank,
        recorderNameError,
        recorderUsernameError,
        recorderPasswordError,
        recorderSerialNumberError,
        recorderIpAddressError,
        recorderPortNumberError,

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
            recorderIpAddressExists ||
            recorderIpAddressDuplicated ||
            recorderPortNumberExists ||
            recorderPortNumberDuplicated ||
            recorderUsernameBlank ||
            recorderPasswordBlank ||
            recorderSerialNumberBlank ||
            recorderSerialNumberExists ||
            recorderSerialNumberDuplicated ||

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
                            { edit && (
                                <Grid item
                                 sx={{display: "flex", justifyContent: "center", alignItems: "center", paddingRight: 1, paddingLeft: 1}}>
                                    <EditFormTooltip />
                                </Grid>
                            )}
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={() => removeCard(recorderId)}
                            >
                                Remove
                            </Button>
                            { edit && (
                                <Box ml={2}>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        onClick={() => console.log("delete")} // put delete method here
                                    >
                                        Delete
                                    </Button>
                                </Box>
                            )}
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
                            error={Boolean(recorderSerialNumberBlank || recorderSerialNumberExists || recorderSerialNumberDuplicated || recorderSerialNumberError)}
                            helperText={ 
                                    (recorderSerialNumberBlank && 'Error: Recorder serial number cannot be blank') ||
                                    (recorderSerialNumberExists && 'Error: Recorder serial number taken') ||
                                    (recorderSerialNumberDuplicated && 'Error: Duplicate recorder serial number in form') ||
                                    (recorderSerialNumberError && 'Error: ' + recorderSerialNumberError)
                                }
                            label="Serial Number"
                            name="recorderSerialNumber"
                            onChange={onSerialNumberChange}
                            value={recorderSerialNumber}
                            required
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
                                        error={Boolean(recorderIpAddressBlank || recorderIpAddressExists || recorderIpAddressDuplicated || recorderIpAddressError)}
                                        helperText={
                                                (recorderIpAddressExists && 'Error: Recorder IP address taken') ||
                                                (recorderIpAddressDuplicated && 'Error: Duplicate recorder IP address in form') ||
                                                (recorderIpAddressError && 'Error: ' + recorderIpAddressError) ||
                                                "Private IP address of the video recorder."
                                            }
                                        label="Private IP Address"
                                        name="recorderIpAddress"
                                        onChange={onIpAddressChange}
                                        value={recorderIpAddress}
                                        required
                                    />
                                </Grid>
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

export default VideoRecorderAddForm;