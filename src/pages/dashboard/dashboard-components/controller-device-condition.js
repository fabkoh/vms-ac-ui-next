import { Avatar, Box, Button, Card, CardActions, Divider, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { ArrowRight as ArrowRightIcon } from '@mui/icons-material';
import { ChevronUp as ChevronUpIcon } from '../../../icons/chevron-up';
import { Chart } from '../../../components/chart';
import { controllerApi } from '../../../api/controllers';
import { React, useState, useEffect } from 'react';

export const ControllerDeviceCondition = () => {
  const theme = useTheme();
  const test = 1;

  const [deviceStatus, setDeviceStatus] = useState({});
  const [statusLoaded, setStatusLoaded] = useState(false);
  const [connected,    setConnected]    = useState(false);
  const [upCounter,   setUpCounter]    = useState(0);
  const [controllers, setControllers] = useState([]);

  const getControllers = async () => {
    const controllersRes = await controllerApi.getControllers();
    if (controllersRes.status !== 200) {
      toast.error("Error loading controllers");
      return;
    }
    const controllersJson = await controllersRes.json();
    setControllers(controllersJson);
    };
  
  useEffect(async() => {
    getControllers();
    // setStatusLoaded(false);
        controllers.map(async (controller) => {
            try {
                const res = await controllerApi.getAuthStatus(controller.controllerId);
                if(res.status == 200) {
                    const body = await res.json();
                    // setDeviceStatus(body);
                    // setConnected(true);
                    setUpCounter(upCounter + 1);
                } else {
                    throw new Error("controller not connected");
                }
            } catch(e) {
                // setConnected(false);
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

  const chartSeries = [(upCounter*100)/controllers.length];

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
              {upCounter} of {controllers.length}
            </Typography>
            <Divider />
            <Typography
              color="textSecondary"
              sx={{ mt: 1 }}
              variant="body1"
            >
              Controllers Healthy
            </Typography>
      </Box>
    </Card>
  );
};