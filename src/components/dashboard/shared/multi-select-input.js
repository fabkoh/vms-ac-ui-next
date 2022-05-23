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
(required params)
    getOptionLabel : function (entity) => string
    setSelected : function (list of entities) => null
    filterOptions : function (list of entities, state*) => list of entitites
    value : list of entities
    isOptionEqualToValue : function (entity, entity) => boolea
    options : list of entities

    * state is an object (check mui docs for state structure)

(optional params)
    label : string
    placeholder : string
    helperText : string
    isWarning : function (entity) => boolean
    isError : function (entity) => boolean
    error : boolean

see mui docs https://mui.com/api/autocomplete/
*/
export default function CheckboxesTags({  
    label = "Select",
    placeholder = "Enter text to search",
    authschedule = false,
    getOptionLabel,
    setSelected,
    filterOptions,
    helperText,
    isWarning,
    isError,
    error,
    value,
    isOptionEqualToValue,
    options,
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
                <TextField {...params} label={label} placeholder={placeholder} helperText={Boolean(helperText) && helperText} error={Boolean(error)} />
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
                // on every event other than reset (reset is clicking on clear button)
                else if (reason != 'reset') {
                    setInputValue(value)
                }
            }}
            renderTags={(value, getTagProps) => 
                value.map((option, index) => (
                    <Chip
                        color={
                            (!!isError && isError(option)) ? "error" : // doing this allows isError and isWarning to be optional arguments
                            (!!isWarning && isWarning(option)) ? "warning" : "default"
                        }
                        label={getOptionLabel(option)}
                        { ...getTagProps({ index })}
                        key={index}
                    />
                ))}
            getOptionLabel={getOptionLabel}
            value={value}
            isOptionEqualToValue={isOptionEqualToValue}
            options={options}
        />
    );
}
