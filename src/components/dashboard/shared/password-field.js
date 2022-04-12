import { Visibility, VisibilityOff } from "@mui/icons-material";
import { FormControl, FormHelperText, IconButton, Input, InputAdornment, InputLabel, OutlinedInput } from "@mui/material"
import { useState } from "react"

const PasswordField = ({
    // required
    inputRef, // ref : ref to put in input
    // optional
    required, // Boolean : if the password is required or not
    label="Password", // String : text label of field
    handleChange, // function (event -> null) : callback to event onChange
    error,
    helperText,
    ...props 
}) => {

    const [show, setShow] = useState(false);
    const handleShowPasswordClick = () => setShow(!show);
    const handleMouseDownPassword = (e) => e.preventDefault();

    return (
        <FormControl variant="outlined" { ...props }>
            <InputLabel required={required} error={error}>{label}</InputLabel>
            <OutlinedInput
                label={label}
                type={show ? 'text' : 'password'}
                inputRef={inputRef}
                onChange={handleChange ? handleChange : false}
                endAdornment={
                    <InputAdornment position="end">
                        <IconButton
                            onClick={handleShowPasswordClick}
                            onMouseDown={handleMouseDownPassword}
                        >
                            { show ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" /> }
                        </IconButton>
                    </InputAdornment>
                }
                required={required}
                error={error}
                
            />
            <FormHelperText error={error}>{helperText}</FormHelperText>
        </FormControl>
    )
}

export { PasswordField }