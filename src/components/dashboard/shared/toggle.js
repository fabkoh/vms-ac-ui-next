import { FormControl, FormControlLabel, FormGroup, Switch, Typography } from "@mui/material";

/**
 * required params
 * checked : boolean (the value of the switch)
 * handleChange : function (insertparamshere) -> null (callback when toggle is clicked)
 * 
 * optional params
 * label : String (component label)
**/

const Toggle = ({
    label="Toggle",
    checked,
    handleChange,
}) =>(
    <FormControl>
        <FormGroup>
            <FormControlLabel
                label={<Typography fontWeight="bold">{label}</Typography>}
                labelPlacement="start"
                control={<Switch onClick={handleChange} checked={checked}/>}
            />
        </FormGroup>
    </FormControl>
)

export default Toggle;