import { ClickAwayListener, Table, TableBody, TableCell, TableHead, TableRow, Tooltip } from "@mui/material";
import { Scrollbar } from "../../scrollbar";
import { toDisplayDateString } from "../../../utils/utils";
import NextLink from "next/link";
import { Card, CardHeader, Grid, Link, Divider, Chip, TextField, Box, InputAdornment, Typography, Collapse, IconButton } from "@mui/material";
import MeetingRoom from "@mui/icons-material/MeetingRoom";
import WarningChip from "../shared/warning-chip";
import { useState } from "react";



const RenderTableCell = ({exist,deleted, id, name,link,chip}) => {

    const [open, setOpen] = useState(false);
  const handleTooltipClose = () => {
    setOpen(false);
  };
  const handleTooltipOpen = () => {
    setOpen(true);
  };
    return (<>
    
                                    {
                                        exist ?
                                        (!deleted ? 
                                            <Grid
                                            item
                                            key={id}
                                        >
                                            <NextLink
                                                href={ link }
                                                passHref
                                            >
                                                <Link component="a">
                                                    <Chip icon={chip} label={name} clickable />
                                                </Link>
                                            </NextLink>
                                            </Grid>

                                            :<ClickAwayListener onClickAway={handleTooltipClose}>
                                            <Tooltip title="This entity has been deleted"
                                        open={open}
                                        PopperProps={{
                                        disablePortal: true,
                                        }}
                                        onClick={handleTooltipOpen}
                                        onClose={handleTooltipClose}
                                        disableFocusListener
                                        disableHoverListener
                                        disableTouchListener
                                        > 
                                        <Grid item >
                                            
                                            <WarningChip text={name}/>
                                        </Grid> 
                                        </Tooltip>
                                        </ClickAwayListener>
                                        ):
                                        'N.A.'
                                    }
                                    
                                    </>)
}

export default RenderTableCell;