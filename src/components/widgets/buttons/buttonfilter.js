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
  Popper
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';

// const options = [
//   'Create a merge commit',
//   'Squash and merge',
//   'Rebase and merge'
// ];

export const Buttonfilter = (props) => {
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(1);
  const options = props.array

  const handleMenuItemClick = (index) => {
    setSelectedIndex(index);
    setOpen(false);
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
        <Button sg={{size:'small'}}>
          {options[selectedIndex]}
        </Button>
        <Button
          onClick={handleToggle}
          size="small"
          // sx={{ backgroundColor: 'primary.main' }}
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
