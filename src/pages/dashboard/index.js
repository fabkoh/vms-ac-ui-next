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
import { OverviewCryptoWallet } from '../../components/dashboard/overview/overview-crypto-wallet';
import { OverviewInbox } from '../../components/dashboard/overview/overview-inbox';
import { OverviewLatestTransactions } from '../../components/dashboard/overview/overview-latest-transactions';
import { OverviewPrivateWallet } from '../../components/dashboard/overview/overview-private-wallet';
import { OverviewTotalBalance } from '../../components/dashboard/overview/overview-total-balance';
import { OverviewTotalTransactions } from '../../components/dashboard/overview/overview-total-transactions';
import { Briefcase as BriefcaseIcon } from '../../icons/briefcase';
import { Download as DownloadIcon } from '../../icons/download';
import { ExternalLink as ExternalLinkIcon } from '../../icons/external-link';
import { InformationCircleOutlined as InformationCircleOutlinedIcon } from '../../icons/information-circle-outlined';
import { Reports as ReportsIcon } from '../../icons/reports';
import { Users as UsersIcon } from '../../icons/users';
import { gtm } from '../../lib/gtm';
import useExternalScripts from '../../__fake-api__/config';
import { ComponentList } from './dashboard-components/list-of-components';
import { ControllerDeviceCondition } from './dashboard-components/controller-device-condition';
import { VideoRecorderDeviceCondition } from './dashboard-components/video-recorder-device-condition';
import { ControllerDeviceProperty } from './dashboard-components/controller-device-property';
import { AlertCard } from './dashboard-components/alert-card';

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
          <Box sx={{ mb: 4 }}>
            <Grid
              container
              justifyContent="space-between"
              spacing={3}
            >
              <Grid item>
                <Typography variant="h4">
                  Good Morning
                </Typography>
              </Grid>
              <Grid
                item
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  m: -1
                }}
              >
                <Button
                  startIcon={<ReportsIcon fontSize="small" />}
                  sx={{ m: 1 }}
                  variant="outlined"
                >
                  Reports
                </Button>
                <TextField
                  defaultValue="week"
                  label="Period"
                  select
                  size="small"
                  sx={{ m: 1 }}
                >
                  <MenuItem value="week">
                    Last week
                  </MenuItem>
                  <MenuItem value="month">
                    Last month
                  </MenuItem>
                  <MenuItem value="year">
                    Last year
                  </MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Box>
          <Grid
            container
            spacing={4}
          >
            {displayBanner && (
              <Grid
                item
                xs={12}
              >
                <OverviewBanner onDismiss={handleDismissBanner} />
              </Grid>
            )}
            <Grid
              item
              md={4}
              xs={12}
            >
              <AlertCard name="Unauthenticated scans"/>
            </Grid>
            <Grid
              item
              md={4}
              xs={12}
            >
              <AlertCard name="Unauthorised door openings"/>
            </Grid>
            <Grid
              item
              md={4}
              xs={12}
            >
              <ControllerDeviceCondition />
            </Grid>
            <Grid
              item
              md={4}
              xs={12}
            >
              <VideoRecorderDeviceCondition />
            </Grid>
            <Grid
              item
              md={4}
              xs={12}
            >
              <ControllerDeviceProperty />
            </Grid>
            {/* <Grid
              item
              md={8}
              xs={12}
            >
              <OverviewTotalTransactions />
            </Grid> */}
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
              {/* <OverviewLatestTransactions /> */}
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
            {/* <Grid
              item
              md={6}
              xs={12}
            >
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      alignItems: 'center',
                      display: 'flex'
                    }}
                  >
                    <BriefcaseIcon
                      color="primary"
                      fontSize="small"
                    />
                    <Typography
                      color="primary.main"
                      sx={{ pl: 1 }}
                      variant="subtitle2"
                    >
                      Jobs
                    </Typography>
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{ mt: 2 }}
                  >
                    Find your dream job
                  </Typography>
                  <Typography
                    color="textSecondary"
                    variant="body2"
                  >
                    Lorem ipsum dolor sit amet, consectetur adipiscing
                    elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  </Typography>
                </CardContent>
                <Divider />
                <CardActions>
                  <Button
                    endIcon={<ArrowRightIcon fontSize="small" />}
                    size="small"
                  >
                    Search Jobs
                  </Button>
                </CardActions>
              </Card>
                  </Grid> */}
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
