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
  // const [isDataLoaded, setIsDataLoaded] = useState(false);

  const getControllers = async () => {
    const controllersRes = await controllerApi.getControllers();
    if (controllersRes.status !== 200) {
      toast.error("Error loading controllers");
      return;
    }
    const controllersJson = await controllersRes.json();
    setControllers(controllersJson);
    };

    useEffect(() => {
      const getControllersHelper = async () => {
        await getControllers();
      }

      getControllersHelper();
    }, []);
    
    // Only called after getControllers() is called
    useEffect(() => {
      const count = async () => {
        const promises = controllers.map(async (controller) => {
          try {
              const res = await controllerApi.getAuthStatus(controller.controllerId);
              if (res.status == 200) {
                  setUpCounter(prevUpCounter => prevUpCounter + 1);
              } else {
                  throw new Error("controller not connected");
              }
          } catch(e) {
              // Handle error
              console.error(e);
          }
        });
        await Promise.all(promises);
      }
      
      count();
    }, [controllers]);

  const healthPercentage = (upCounter*100)/controllers.length;

  const chartOptions = {
    chart: {
      background: 'transparent',
      stacked: false,
      toolbar: {
        show: false
      }
    },
    colors: healthPercentage == 100 ? [theme.palette.success.light] : [theme.palette.warning.light],
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
          background: healthPercentage == 0 ? theme.palette.error.light : theme.palette.grey[100],
        }
      }
    },
    theme: {
      mode: theme.palette.mode
    }
  };

  const chartSeries = [healthPercentage];

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