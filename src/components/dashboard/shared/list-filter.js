import { useState, useRef } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  ClickAwayListener,
  Grow,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  Typography,
  Grid
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import { width } from '@mui/system';

// const options = [
//   'Create a merge commit',
//   'Squash and merge',
//   'Rebase and merge'
// ];


// props:
// array = array of options (not including reset option)
// onSelect = function to run when button is selected 
//            returns the index of option chosen
//            or -1 if the reset option is chosen
// defaultLabel = string to display when reset option is chosen
export const ListFilter = (props) => {
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const options = props.array;
  const onSelect = props.onSelect;
  const defaultLabel = props.defaultLabel;

  const handleMenuItemClick = (index) => {
    setSelectedIndex(index);
    setOpen(false);
    onSelect(index);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  return (
    <Box
    >
      <ButtonGroup
        ref={anchorRef}
        variant="text"
      >
        <Grid container alignItems="center"> 
            {selectedIndex == -1 ? defaultLabel : options[selectedIndex]}
        </Grid>
        <Button
          onClick={handleToggle}
          size="small"
          sx={{ size: 'small',whiteSpace:'nowrap' }}
        >
          <FilterListIcon fontSize="small" />
        </Button>
      </ButtonGroup>
      <Popper
        anchorEl={anchorRef.current}
        open={open}
        transition
      >
        {({ TransitionProps, placement }) => (
          <Grow {...TransitionProps}
                style={{
                  transformOrigin: placement === 'bottom'
                    ? 'center top'
                    : 'center bottom'
                }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu">
                    <MenuItem 
                        key="reset"
                        onClick={() => handleMenuItemClick(-1)}
                        selected={selectedIndex == -1}
                    >
                        <Typography fontStyle="italic">
                            CLEAR 
                        </Typography>
                    </MenuItem>
                  {options.map((option, index) => (
                    <MenuItem                   
                      key={option}
                      onClick={() => handleMenuItemClick(index)}
                      selected={index === selectedIndex}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </Box>
  );
};
