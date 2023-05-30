import { Avatar, Box, Button, Card, CardActions, Divider, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { ArrowRight as ArrowRightIcon } from '../../../icons/arrow-right';
import { ChevronUp as ChevronUpIcon } from '../../../icons/chevron-up';
import { Chart } from '../../chart';

export const OverviewCryptoWallet = (props) => {
  const theme = useTheme();
  const test = 1;

  const chartOptions = {
    chart: {
      background: 'transparent',
      stacked: false,
      toolbar: {
        show: false
      }
    },
    colors: [test == 1 ? theme.palette.error.dark : theme.palette.primary.dark],
    fill: {
      opacity: 1
    },
    labels: [],
    plotOptions: {
      radialBar: {
        dataLabels: {
          show: false
        },
        hollow: {
          size: '40%'
        },
        track: {
          background: test == 1 ? theme.palette.error.light : theme.palette.primary.light
        }
      }
    },
    theme: {
      mode: theme.palette.mode
    }
  };

  const chartSeries = [30/10];

  return (
    <Card {...props}>
      <Box
        sx={{
          alignItems: {
            sm: 'center'
          },
          display: 'flex',
          flexWrap: 'wrap',
          flexDirection: {
            xs: 'column',
            sm: 'row'
          }
        }}
      >
        <Chart
          height={160}
          options={chartOptions}
          series={chartSeries}
          type="radialBar"
          width={160}
        />
        <Box
          sx={{
            display: 'flex',
            flexGrow: 1,
            pt: {
              sm: 3
            },
            pb: 3,
            pr: 4,
            pl: {
              xs: 4,
              sm: 0
            }
          }}
        >
          <Box
            sx={{
              flexGrow: 1,
              mr: 3
            }}
          >
            <Typography
              color="primary"
              variant="h4"
            >
              0.299 BTC
            </Typography>
            <Typography
              color="textSecondary"
              sx={{ mt: 1 }}
              variant="body2"
            >
              Your crypto wallet
            </Typography>
          </Box>
          <Avatar
            sx={{
              backgroundColor: alpha(theme.palette.success.main, 0.08),
              color: 'success.main'
            }}
            variant="rounded"
          >
            <ChevronUpIcon fontSize="small" />
          </Avatar>
        </Box>
      </Box>
      <Divider />
      <CardActions>
        <Button endIcon={<ArrowRightIcon fontSize="small" />}>
          See all activity
        </Button>
      </CardActions>
    </Card>
  );
};
