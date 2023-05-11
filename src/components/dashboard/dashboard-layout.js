import { createContext, useState } from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import { DashboardNavbar } from './dashboard-navbar';
import { DashboardSidebar } from './dashboard-sidebar';
import { Box } from '@mui/material';

const DashboardLayoutRoot = styled('div')(({ theme }) => ({
  display: 'flex',
  flex: '1 1 auto',
  maxWidth: '100%',
  paddingTop: 64,
  [theme.breakpoints.up('lg')]: {
    paddingLeft: 280
  }
}));

export const TheaterModeContext = createContext(false);

export const DashboardLayout = (props) => {
  const { children } = props;
  const [theaterMode, setTheaterMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <DashboardLayoutRoot style={ theaterMode ? { paddingLeft: 0 } : {}}>
        <TheaterModeContext.Provider value={{ theaterMode, setTheaterMode}}>
          <Box
            sx={{
              display: 'flex',
              flex: '1 1 auto',
              flexDirection: 'column',
              width: '100%'
            }}
          >
            {children}
          </Box>
        </TheaterModeContext.Provider>
      </DashboardLayoutRoot>
      <DashboardNavbar 
        theaterMode={theaterMode} 
        onOpenSidebar={() => {
          if(theaterMode) { 
            setTheaterMode(false); 
          } else setIsSidebarOpen(true)}} 
      />
      <DashboardSidebar
        theaterMode={theaterMode}
        onClose={() => setIsSidebarOpen(false)}
        open={isSidebarOpen}
      />
    </>
  );
};

DashboardLayout.propTypes = {
  children: PropTypes.node
};
