import { FormControl, InputLabel, MenuItem, Select } from "@mui/material"
import { isObject } from "../../../utils/utils"
/**
 *  required props
 *  value : entity (the selected entity)
 *  getLabel : function (entity) -> String (get the string label to display)
 *  onChange : function (event) -> null (onChange handler that executes everytime somethings occurs)
 *                                      (note that e.target.value will be string [getLabel(entity)] due to mui select restrictions)
 *  options : array of entities (the options)
 * 
 *  optional props
 *  label : String (the label on field)
**/
const SingleSelect = ({
    label = "Select",
    getLabel,
    onChange,
    value,
    options,
    ...props
}) => {

    return (
        <FormControl {...props}>
            <InputLabel>{label}</InputLabel>
            <Select 
                label={label} 
                value={isObject(value) ? getLabel(value) : ''}
                onChange={onChange}
            >
                <MenuItem // clear field
                    value={null} 
                    sx={{ fontStyle: 'italic' }}
                >
                    clear
                </MenuItem>
                {
                    Array.isArray(options) && options.map(option => {
                        const label=getLabel(option);
                        return (
                            <MenuItem
                                key={label}
                                value={label}
                            >
                                {label}
                            </MenuItem>
                        );
                    })
                }
            </Select>
        </FormControl>
    )
}

export default SingleSelect;