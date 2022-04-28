import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { 
    Button, 
    CardHeader, 
    Collapse, 
    Grid, 
    TextField, 
    Divider, 
    CardContent,
    Stack,
    Typography,
    Box,
} from "@mui/material";
import { useState } from "react";
import ExpandMore from "../shared/expand-more";
import MultipleSelectInput from "../shared/multi-select-input";
import ErrorCard from "../shared/error-card";
import EditFormTooltip from "../../../components/dashboard/shared/edit_form_tooltip";


const ControllerEditForm = ({ accessGroupInfo, accessGroupValidations, removeCard, allPersons, onNameChange, onDescriptionChange, onPersonChange, duplicatedPerson, edit, allEntrances, onEntranceChange }) => {
    // const {
    //     accessGroupId,
    //     accessGroupName,
    //     accessGroupDesc,
    //     persons,
    //     originalPersonIds,
    //     entrances
    // } = accessGroupInfo;

    // const {
    //     accessGroupNameBlank,
    //     accessGroupNameExists,
    //     accessGroupNameDuplicated,
    //     accessGroupPersonHasAccessGroup,
    //     accessGroupPersonDuplicated,
    //     submitFailed
    // } = accessGroupValidations;

    // expanding form
    const [expanded, setExpanded] = useState(true);
    const handleExpandClick = () => setExpanded(!expanded);

    return (
        <ErrorCard 
        // error={
        //     accessGroupNameBlank        ||
        //     accessGroupNameExists       ||
        //     accessGroupNameDuplicated   ||
        //     accessGroupPersonDuplicated ||
        //     submitFailed
        // }
        >
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
                title="Controller"
                // action={
                //     // action are children flushed to the right
                //     (
                //         <Grid item container>
                //             { edit && (
                //                 <Grid item sx={{display: "flex", justifyContent: "center", alignItems: "center", paddingRight: 1, paddingLeft: 1}}>
                //                     <EditFormTooltip />
                //                 </Grid>
                //             )}
                //             <Button
                //                 variant="outlined"
                //                 color="error"
                //                 // onClick={() => removeCard(accessGroupId)}
                //             >
                //                 Clear
                //             </Button>
                //             { edit && (
                //                 <Box ml={2}>
                //                     <Button
                //                         variant="contained"
                //                         color="error"
                //                         onClick={() => console.log("delete")} // put delete method here
                //                     >
                //                         Delete
                //                     </Button>
                //                 </Box>
                //             )}
                //         </Grid>
                //     )
                // }
                sx={{ width: '100%', flexWrap: "wrap" }}
            />
            <Divider />
            <CardContent>
                <Stack
                    spacing={3}
                >
                    <Grid
                        item
                        md={6}
                        xs={12}
                    >
                        <TextField
                            fullWidth
                            label="Name"
                            name="accessGroupName"
                            required
                            // value={accessGroupName}
                            // onChange={onNameChange}
                            // helperText={ 
                            //     (accessGroupNameBlank && 'Error: access group name cannot be blank') ||
                            //     (accessGroupNameExists && 'Error: access group name taken') ||
                            //     (accessGroupNameDuplicated && 'Error: duplicate access group name in form')
                            // }
                            // error={ Boolean(accessGroupNameBlank || accessGroupNameExists || accessGroupNameDuplicated)}
                        />
                    </Grid>
                    <Collapse in={expanded}>
                        <Stack spacing={3}>
                            <Grid
                                item
                                md={12}
                                xs={12}
                            >
                                <TextField
                                    fullWidth
                                    label="IP Address"
                                    name="accessGroupDesc"
                                    disabled="true"
                                    value={"192.168.1.64"}
                                    // value={accessGroupDesc}
                                    // onChange={onDescriptionChange}
                                />
                            </Grid>
                        </Stack>
                    </Collapse>
                </Stack>
            </CardContent>
        </ErrorCard>
    )
}

export default ControllerEditForm;