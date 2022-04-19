import { Visibility, VisibilityOff } from "@mui/icons-material";
import { FormControl, FormHelperText, IconButton, Input, InputAdornment, InputLabel, OutlinedInput, TextField } from "@mui/material"
import { useState } from "react"

const PasswordField = ({
    ...props 
}) => {

    const [show, setShow] = useState(false);
    const handleShowPasswordClick = () => setShow(!show);
    const handleMouseDownPassword = (e) => e.preventDefault();

    return (
        <TextField
            type={ show ? 'text' : 'password' }
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton
                            onClick={handleShowPasswordClick}
                            onMouseDown={handleMouseDownPassword}
                        >
                            { show ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" /> }
                        </IconButton>
                    </InputAdornment>
                )
            }}
            { ...props }
        />
    )
}

export default PasswordField;