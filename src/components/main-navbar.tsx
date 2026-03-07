import PropTypes from 'prop-types';
import NextLink from 'next/link';
import { AppBar, Box, Button, Container, IconButton, Link, Toolbar } from '@mui/material';
import { Menu as MenuIcon } from '../icons/menu';
import { Logo } from './logo';

export const MainNavbar = (props) => {
  const { onOpenSidebar } = props;

  return (
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
      <Container maxWidth="lg">
        <Toolbar
          disableGutters
          sx={{ minHeight: 64 }}
        >
          <NextLink
            href="/"
          >
            
              <Logo
                sx={{
                  display: {
                    md: 'inline',
                    xs: 'none'
                  },
                  height: 40,
                  width: 40
                }}
              />
           </NextLink>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton
            color="inherit"
            onClick={onOpenSidebar}
            sx={{
              display: {
                md: 'none'
              }
            }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>
          <Box
            sx={{
              alignItems: 'center',
              display: {
                md: 'flex',
                xs: 'none'
              }
            }}
          >
            
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
            
              <Link
                color="textSecondary"
                component={NextLink} href="/docs/welcome"
                sx={{ ml: 2 }}
                underline="none"
                variant="subtitle2"
              >
                Documentation
              </Link>
            <Button
              component="a"
              href="https://material-ui.com/store/items/devias-kit-pro"
              size="medium"
              sx={{ ml: 2 }}
              target="_blank"
              variant="contained"
            >
              Buy Now
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

MainNavbar.propTypes = {
  onOpenSidebar: PropTypes.func
};
