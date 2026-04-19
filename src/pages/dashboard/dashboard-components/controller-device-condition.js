import { Avatar, Box, Button, Card, CardActions, Divider, Skeleton, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { ArrowRight as ArrowRightIcon } from '@mui/icons-material';
import { ChevronUp as ChevronUpIcon } from '../../../icons/chevron-up';
import { Chart } from '../../../components/chart';
import { controllerApi } from '../../../api/controllers';
import { React, useState, useEffect } from 'react';
import toast from "react-hot-toast";

const ControllerDeviceCondition = () => {
  const theme = useTheme();

  const [upCounter,        setUpCounter]        = useState(0);
  const [controllers,      setControllers]      = useState([]);
  const [healthPercentage, setHealthPercentage] = useState(0);
  const [loading,          setLoading]          = useState(true);

  useEffect(() => {
    const fetchAndCheck = async () => {
      const controllersRes = await controllerApi.getControllers();
      if (controllersRes.status !== 200) {
        toast.error("Error loading controllers");
        setLoading(false);
        return;
      }

      const controllersJson = await controllersRes.json();
      setControllers(controllersJson);

      let up = 0;
      if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || process.env.NODE_ENV === 'development') {
        up = controllersJson.length;
      } else {
        const promises = controllersJson.map(async (controller) => {
          try {
            const res = await controllerApi.getAuthStatus(controller.controllerId);
            if (res.status === 200) up++;
          } catch (e) {
            console.error(e);
          }
        });
        await Promise.all(promises);
      }

      setUpCounter(up);
      if (controllersJson.length !== 0) {
        setHealthPercentage((up * 100) / controllersJson.length);
      }
      setLoading(false);
    };

    fetchAndCheck();
  }, []);

  const chartOptions = {
    chart: {
      background: 'transparent',
      stacked: false,
      toolbar: {
        show: false
      }
    },
    colors: controllers.length == 0 ? [theme.palette.text.primary]
            : healthPercentage == 100 ? [theme.palette.success.light] 
            : healthPercentage < 100 ? [theme.palette.warning.light]
            : [theme.palette.text.primary],
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
          background: controllers.length == 0 ? theme.palette.grey[100]
                    : healthPercentage == 0 ? theme.palette.error.light 
                    : theme.palette.grey[100],
        }
      }
    },
    theme: {
      mode: theme.palette.mode
    }
  };

  const chartSeries = [healthPercentage];

  if (loading) {
    return (
      <Card>
        <Box
          sx={{
            alignItems: { sm: 'center' },
            display: 'flex',
            flexWrap: 'wrap',
            flexDirection: 'column',
            alignItems: 'center',
            p: 3
          }}
        >
          <Skeleton variant="circular" width={200} height={200} sx={{ mb: 2 }} />
          <Divider sx={{ width: '100%' }} />
          <Skeleton variant="text" width={120} height={40} sx={{ mt: 1 }} />
          <Divider sx={{ width: '100%' }} />
          <Skeleton variant="text" width={160} height={24} sx={{ mt: 1 }} />
        </Box>
      </Card>
    );
  }

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

export default ControllerDeviceCondition;