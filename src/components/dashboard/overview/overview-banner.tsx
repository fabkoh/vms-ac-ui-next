import PropTypes from 'prop-types';
import { Box, Button, Card, Chip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export const OverviewBanner = (props) => {
  const { onDismiss, ...other } = props;
  const theme = useTheme();
  const isDarkMode = theme.palette.mode == 'dark';

  const bannerForDark = {
    main: '#29313D',
    hover: '#1B2028',
    contrastText: '#FFFFFF'
  };

  return (
    <Card
      sx={{
        alignItems: 'center',
        backgroundColor: 'primary.main',
        color: 'primary.contrastText',
        display: 'flex',
        flexDirection: {
          xs: 'column',
          md: 'row'
        },
        p: 4
      }}
      {...other}>
      <Box
        sx={{
          mr: 4,
          width: 200,
          height: 200,
          '& img': {
            height: 200,
            width: 'auto'
          }
        }}
      >
        <img
          alt=""
          src="/static/banner-illustration.png"
        />
      </Box>
      <div>
        <div>
          {isDarkMode ? (
            <Chip
              label="New"
              sx={{
                backgroundColor: bannerForDark.main,
                color: bannerForDark.contrastText
              }}
            />
          ) : (
          <Chip
            color="secondary"
            label="New"
          />
          )}
        </div>
        <Typography
          color="inherit"
          sx={{ mt: 2 }}
          variant="h4"
        >
          Welcome to ETLAS!
        </Typography>
        <Typography
          color="inherit"
          sx={{ mt: 1 }}
          variant="subtitle2"
        >
          Your dashboard has been improved!
        </Typography>
        <Box sx={{ mt: 2 }}>
          {isDarkMode ? (
            <Button
              onClick={onDismiss}
              variant="contained"
              sx={{
                backgroundColor: bannerForDark.main,
                color: bannerForDark.contrastText,
                '&:hover': {
                  backgroundColor: bannerForDark.hover
                }
              }}
            >
              Dismiss Banner
            </Button>
          ) : (
            <Button
            color="secondary"
            onClick={onDismiss}
            variant="contained"
          >
            Dismiss Banner
          </Button>
          )}
        </Box>
      </div>
    </Card>
  );
};

OverviewBanner.propTypes = {
  onDismiss: PropTypes.func
};