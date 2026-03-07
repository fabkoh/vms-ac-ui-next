import NextLink from 'next/link';
import PropTypes from 'prop-types';
import { AppBar, Box, IconButton, Link, Toolbar } from '@mui/material';
import { Menu as MenuIcon } from '../../icons/menu';
import { Logo } from '../logo';

export const DocsNavbar = ({ onOpenSidebar }) => (
  <AppBar
    elevation={0}
    sx={{
      backgroundColor: 'background.paper',
      borderBottomColor: 'divider',
      borderBottomStyle: 'solid',
      borderBottomWidth: 1,
      color: 'text.secondary'
    }}
  >
    <Toolbar sx={{ height: 64 }}>
      <NextLink
        href="/"
      >
        
          <Logo
            sx={{
              height: 40,
              width: 40
            }}
          />
       </NextLink>
      <Box sx={{ flexGrow: 1 }} />
      
        <Link component={NextLink} href="/dashboard"
          color="textSecondary"
          underline="none"
          variant="subtitle2"
        >
          Live Demo
        </Link>
      
        <Link component={NextLink} href="/browse"
          color="textSecondary"
          sx={{ ml: 2 }}
          underline="none"
          variant="subtitle2"
        >
          Components
        </Link>
      <IconButton
        color="inherit"
        onClick={onOpenSidebar}
        sx={{
          display: {
            lg: 'none'
          },
          ml: 2
        }}
      >
        <MenuIcon fontSize="small" />
      </IconButton>
    </Toolbar>
  </AppBar>
);

DocsNavbar.propTypes = {
  onOpenSidebar: PropTypes.func
};
