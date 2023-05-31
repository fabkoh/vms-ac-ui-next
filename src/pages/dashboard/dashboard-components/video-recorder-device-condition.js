import { Avatar, Box, Button, Card, CardActions, Divider, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { ArrowRight as ArrowRightIcon } from '@mui/icons-material';
import { ChevronUp as ChevronUpIcon } from '../../../icons/chevron-up';
import { Chart } from '../../../components/chart';
import { React, useState, useEffect } from 'react';
import videoRecorderApi from '../../../api/videorecorder';

export const VideoRecorderDeviceCondition = () => {
  const theme = useTheme();
  const test = 1;

  const [deviceStatus, setDeviceStatus] = useState({});
  const [statusLoaded, setStatusLoaded] = useState(false);
  const [connected,    setConnected]    = useState(false);
  const [upCounter,   setUpCounter]    = useState(0);
  const [recorders, setRecorders] = useState([]);

  const getRecorders = async () => {
    const recordersRes = await videoRecorderApi.getRecorders();
    if (recordersRes.status !== 200) {
        toast.error("Recorders info failed to load");
        return;
    }
    const data = await recordersRes.json();
    setRecorders(data);
  }
  
  useEffect(async() => {
    getRecorders();
    // setStatusLoaded(false);
        recorders.map(async (recorder) => {
            if (recorder.isActive) {
                setUpCounter(upCounter + 1);
            }
        });
        console.log(upCounter);
    // setStatusLoaded(true);
    }, []);


  const chartOptions = {
    chart: {
      background: 'transparent',
      stacked: false,
      toolbar: {
        show: false
      }
    },
    colors: [theme.palette.text.secondary],
    fill: {
      opacity: 1
    },
    labels: ["Health"],
    plotOptions: {
      radialBar: {
        dataLabels: {
          show: true,
        },
        hollow: {
          size: '50%'
        },
        track: {
          background: theme.palette.grey[100]
        }
      }
    },
    theme: {
      mode: theme.palette.mode
    }
  };

  const chartSeries = [(upCounter*100)/recorders.length];

  return (
    <Card>
      <Box
        sx={{
          alignItems: {
            sm: 'center'
          },
          display: 'flex',
          flexWrap: 'wrap',
          flexDirection: 'column',
          p: 3
        }}
      >
        <Chart
          height={250}
          options={chartOptions}
          series={chartSeries}
          type="radialBar"
          width={250}
        />
        <Divider />
            <Typography
              color="primary"
              variant="h4"
            >
              {upCounter} of {recorders.length}
            </Typography>
            <Divider />
            <Typography
              color="textSecondary"
              sx={{ mt: 1 }}
              variant="body1"
            >
              Recorders Healthy
            </Typography>
      </Box>
    </Card>
  );
};