import { useEffect, useState } from 'react';
import Head from 'next/head';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Divider,
  Grid,
  MenuItem,
  TextField,
  Typography
} from '@mui/material';
import { AuthGuard } from '../../components/authentication/auth-guard';
import { DashboardLayout } from '../../components/dashboard/dashboard-layout';
import { OverviewBanner } from '../../components/dashboard/overview/overview-banner';
import { NotificationImportantOutlined, VideogameAsset } from '@mui/icons-material';
import { gtm } from '../../lib/gtm';
import useExternalScripts from '../../__fake-api__/config';
import ComponentList from './dashboard-components/list-of-components';
import ControllerDeviceCondition from './dashboard-components/controller-device-condition';
import VideoRecorderDeviceCondition from './dashboard-components/video-recorder-device-condition';
import ControllerDeviceProperty from './dashboard-components/controller-device-property';
import AlertCard from './dashboard-components/alert-card';

const Overview = () => {
  const [displayBanner, setDisplayBanner] = useState(true);
  // console.log("testing external scripts");
  // console.log(useExternalScripts("http://myserver.dontexist.com/config.js"));
  useEffect(() => {
    gtm.push({ event: 'page_view' });
  }, []);

  useEffect(() => {
    // Restore the persistent state from local/session storage
    const value = globalThis.sessionStorage.getItem('dismiss-banner');

    if (value === 'true') {
      // setDisplayBanner(false);
    }
  }, []);

  const handleDismissBanner = () => {
    // Update the persistent state
    // globalThis.sessionStorage.setItem('dismiss-banner', 'true');
    setDisplayBanner(false);
  };

  return (
    <>
      <Head>
        <title>
          Dashboard: Overview | ETLAS
        </title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={4}>
              <Grid container item>
                <Grid item xs={12}>
                <Typography variant="h4">
                  Dashboard
                </Typography>
                <Divider variant="middle" sx={{marginTop: '20px'}}/>
                </Grid>
                {displayBanner && (
                  <Grid
                    item
                    xs={12}
                  >
                    <OverviewBanner onDismiss={handleDismissBanner} />
                  </Grid>
                )}
              </Grid>
            <Grid container item xs={12} spacing={4}>
              <Grid container item xs={12} md={7} spacing={4}>
                <Grid item xs={12}>
                  <Typography variant={"h5"}>
                    Alerts (24hrs)<Button endIcon={<NotificationImportantOutlined />} href="dashboard/logs/eventlog">View Alerts</Button>
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  md={4}
                >
                  <AlertCard name="Unauthenticated scans"/>
                </Grid>
                <Grid
                  item
                  xs={12}
                  md={4}
                >
                  <AlertCard name="Unauthorised door openings"/>
                </Grid>
                <Grid
                  item
                  xs={12}
                  md={4}
                >
                  <AlertCard name="Fire alarms"/>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant={"h5"}>
                    Device Conditions
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={12}
                  md={6}
                >
                  <ControllerDeviceCondition />
                </Grid>
                <Grid
                  item
                  xs={12}
                  md={6}
                >
                {/* <VideoRecorderDeviceCondition /> */}
                </Grid>
              </Grid>
                <Grid container item xs={12} md={5}>
                  <Grid item xs={12}>
                    <Typography variant={"h5"} marginBottom={"25px"}>
                      Controller Properties
                    </Typography>
                    <ControllerDeviceProperty />
                  </Grid>
                </Grid>
              </Grid>
            <Grid container item spacing={4} xs={12}>
              <Grid item xs={12}>
                  <Typography variant={"h5"}>
                    Overview
                  </Typography>
                </Grid>
              <Grid
                item
                md={3}
                xs={12}
              >
                <ComponentList name="Controllers" link="controllers"/>
              </Grid>
              <Grid
                item
                md={3}
                xs={12}
              >
                <ComponentList name="Recorders" link="video-recorders"/>
              </Grid>
              <Grid
                item
                md={3}
                xs={12}
              >
                <ComponentList name="Entrances" link="entrances"/>
              </Grid>
              <Grid
                item
                md={3}
                xs={12}
              >
                <ComponentList name="Persons" link="access-groups"/>
              </Grid>
              <Grid
                item
                md={3}
                xs={12}
              >
                <ComponentList name="Access Groups" link="persons"/>
              </Grid>
              <Grid
                item
                md={3}
                xs={12}
              >
                <ComponentList name="Events" link="logs/eventlog"/>
              </Grid>
              <Grid
                item
                md={3}
                xs={12}
              >
                <ComponentList name="Notifications" link="logs/notificationlog"/>
              </Grid>
            </Grid>
            </Grid>
        </Container>
      </Box>
    </>
  );
};

Overview.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>
      {page}
    </DashboardLayout>
  </AuthGuard>
);

export default Overview;
