import { useState } from "react";
import { Button, Card, CardHeader, Collapse, Divider, FormControl, InputLabel, MenuItem, Select, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandMore from "../../shared/expand-more";
import { Box } from "@mui/system";
import { ChevronDown } from "../../../../icons/chevron-down";
import StyledMenu from "../../styled-menu";
import { Add, Delete, Edit } from "@mui/icons-material";

const accessGroupSchedules = [
    {
        text: "e",
        groupToEntranceId: 3
    }
]

export default function AccessGroupSchedules({ accessGroupEntrance }) {
    // expanding card
    const [expanded, setExpanded] = useState(true);
    const handleExpandClick = () => setExpanded(!expanded);

    // schedule actions
    const [actionAnchor, setActionAnchor] = useState(null);
    const actionOpen = Boolean(actionAnchor)
    const handleActionMenuOpen = (e) => setActionAnchor(e.currentTarget);
    const handleActionMenuClose = () => setActionAnchor(null);

    return (
        <Card>
            <Box 
                display="flex" 
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
            >
                <Box>
                    <CardHeader
                        title="Access Group Schedules"
                        subheader="Select entrance below to see schedules for selected entrance"
                        avatar={
                            <ExpandMore
                                expand={expanded}
                                onClick={handleExpandClick}
                            >
                                <ExpandMoreIcon />
                            </ExpandMore>
                        }
                    />
                </Box>
                <Box>
                    <Button
                        endIcon={(
                            <ChevronDown fontSize="small" />
                        )}
                        sx={{ m: 2 }}
                        variant="contained"
                        onClick={handleActionMenuOpen}
                    >
                        Schedule Actions
                    </Button>
                </Box>
            </Box>
            <StyledMenu
                anchorEl={actionAnchor}
                open={actionOpen}
                onClose={handleActionMenuClose}
            >
                <MenuItem disableRipple>
                    <Add />
                    &#8288;Create
                </MenuItem>
                <MenuItem disableRipple>
                    <Edit />
                    &#8288;Edit
                </MenuItem>
                <MenuItem disableRipple>
                    <Delete />
                    &#8288;Delete
                </MenuItem>
            </StyledMenu>
            <Collapse in={expanded}>
                <Divider />
                <Box
                    component="form"
                    sx={{
                        flexGrow: 1,
                        m: 1.5
                    }}
                >
                    <FormControl fullWidth>
                        <InputLabel>Select Entrance</InputLabel>
                        <Select
                            label="Select Entrance"
                            defaultValue=""
                            onChange={(e) => console.log(e)}
                            fullWidth
                        >
                            <MenuItem value="" sx={{ fontStyle: 'italic' }}>
                                CLEAR
                            </MenuItem>
                            { Array.isArray(accessGroupEntrance) && accessGroupEntrance.map((groupEntrance, i) => (
                                <MenuItem 
                                    key={i}
                                    name={groupEntrance.entrance.entranceName}
                                    value={groupEntrance.groupToEntranceId}
                                >
                                    {groupEntrance.entrance.entranceName}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </Collapse>
        </Card>
    )
}