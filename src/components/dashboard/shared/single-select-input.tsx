import { FormControl, FormHelperText, InputLabel, MenuItem, Select } from "@mui/material"
import { isObject } from "../../../utils/utils"
/**
 *  required props
 *  value : entity (the selected entity)
 *  getLabel : function (entity) -> String (get the string label to display)
 *  getValue : function (entity) -> Value (primitive) (get value to put in the menuitem, this will be event.target.value for onChange)
 *  onChange : function (event) -> null (onChange handler that executes everytime somethings occurs)
 *                                      (note that e.target.value will be string [getLabel(entity)] due to mui select restrictions)
 *  options : array of entities (the options)
 * 
 *  optional props
 *  label : String (the label on field)
 *  noclear : boolean (if true, no clear option)
 *  required : boolean (if true, select is required)
**/
const SingleSelect = ({
    label = "Select",
    getLabel,
    onChange,
    value,
    options,
    noclear,
    required,
    getValue,
    helperText,
    ...props
}) => {

    return (
        <FormControl {...props}>
            <InputLabel required={required}>{label}</InputLabel>
            <Select 
                label={label} 
                value={value}
                onChange={onChange}
                required={required}
            >
                { !noclear && 
                    <MenuItem // clear field
                        value={null} 
                        sx={{ fontStyle: 'italic' }}
                    >
                        clear
                    </MenuItem>
                }
                {
                    Array.isArray(options) && options.map(option => {
                        const label=getLabel(option);
                        const value=getValue(option);
                        return (
                            <MenuItem
                                key={value}
                                value={value}
                                name={label}
                            >
                                {label}
                            </MenuItem>
                        );
                    })
                }
            </Select>
            <FormHelperText>{helperText}</FormHelperText>
        </FormControl>
    )
}

export default SingleSelect;