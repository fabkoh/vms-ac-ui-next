import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Box, IconButton } from "@mui/material";
import { useState } from "react";

const HiddenField = ({ text, ...props }) => {

    const [show, setShow] = useState(false);
    const handleShowClick = () => setShow(!show);

    return (
        <Box display="flex" { ...props }>
            <p>{show ? text : '********' }</p>
            <Box 
                ml={3}
                display="flex"
                alignItems="center"
            >
                <IconButton
                    onClick={handleShowClick}
                >
                    { show ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" /> }
                </IconButton>
            </Box>
        </Box>
    )
}

export default HiddenField;