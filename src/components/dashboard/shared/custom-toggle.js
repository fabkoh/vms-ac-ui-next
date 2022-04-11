import { Switch } from "@mui/material";
import { useState } from "react";

const CustomToggle = (
    { 
        onChange, // function : (event) => bool (runs when toggle is clicked. returns true if successful, returns false otherwise)
        defaultChecked 
    }
) => {
    const [initialValue, setInitialValue] = useState(defaultChecked); // tries to mirror db state, only changed when fetch is successful
    const [checked, setChecked] = useState(defaultChecked); // for renderer
    
    const handleChange = async (e) => {
        const changedValue = e.target.checked;
        setChecked(changedValue);
        if (await onChange(e)) {
            setInitialValue(changedValue);
        } else {
            setChecked(initialValue);
        }
    }

    return (
        <Switch onChange={handleChange} checked={checked} />
    )
}

export default CustomToggle;