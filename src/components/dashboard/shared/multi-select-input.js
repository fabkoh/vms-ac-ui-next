import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { useState } from 'react';
import { Chip } from '@mui/material';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

/*
TODO: complete docs
(required params)
// options (array of objects)
// the options in the drop down list

// setSelected (function)
// setSelected will be called with 1 arguments, newValue, an array of objects, representing the selected objects in the input

// getOptionLabel(function)
// called with 1 argument, the object in 
(optional params)
see mui docs https://mui.com/api/autocomplete/
*/
export default function CheckboxesTags({  
    label = "Select",
    placeholder = "Enter text to search",
    getOptionLabel,
    setSelected,
    filterOptions,
    helperText,
    isWarning,
    isError,
    error,
    value,
    isOptionEqualToValue,
    ...other
}) {

    // search bar value
    const [inputValue, setInputValue] = useState('');

    return (
        <Autocomplete
            multiple
            disableCloseOnSelect
            renderOption={(listProps, option, { selected }) => (
                <li {...listProps}>
                    <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        style={{ marginRight: 8 }}
                        checked={selected}
                    />
                    { getOptionLabel(option) }
                </li>
            )}
            fullWidth
            renderInput={(params) => (
                <TextField {...params} label={label} placeholder={placeholder} helperText={helperText} error={error} />
            )}
            onChange={(e, newValue) => setSelected(newValue)}
            { ...other }
            filterOptions={filterOptions}
            inputValue={inputValue}
            onInputChange={(event, value, reason) => {
                // on exit
                if (event && event.type=='blur') {
                    setInputValue('')
                } 
                // on every event other than reset (clicking on clear button)
                else if (reason != 'reset') {
                    setInputValue(value)
                }
            }}
            renderTags={(value, getTagProps) => 
                value.map((option, index) => (
                    <Chip
                        color={
                            isError(option) ? "error" :
                            isWarning(option) ? "warning" : "default"
                        }
                        label={getOptionLabel(option)}
                        { ...getTagProps({ index })}
                        key={index}
                    />
                ))}
            getOptionLabel={getOptionLabel}
            value={value}
            isOptionEqualToValue={isOptionEqualToValue}
        />
    );
}
