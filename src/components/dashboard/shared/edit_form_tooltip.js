import { useState } from "react";
import { ClickAwayListener, Tooltip } from "@mui/material";
import Info from "@mui/icons-material/Info";

const EditFormToolTIp = () => {
    
    const [open, setOpen] = useState(false);
    const handleTooltipOpen = () => setOpen(true);
    const handleTooltipClose = () => setOpen(false);

    return (
        <ClickAwayListener onClickAway={handleTooltipClose}>
            <Tooltip 
                title={<span style={{lineHeight:0.2}}><p>Clear would discard changes.</p><p>Delete would delete the entity.</p></span>}
                onClose={handleTooltipClose}
                open={open}
                onClick={handleTooltipOpen}
            >
                <Info fontSize="small"/>
            </Tooltip>
        </ClickAwayListener>
    )
}

export default EditFormToolTIp;