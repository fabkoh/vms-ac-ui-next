import { Add, ArrowBack } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  RadioGroup,
  FormControl,
  FormLabel,
  Radio,
  FormControlLabel,
  Collapse,
  Divider,
  Container,
  Link,
  Stack,
  Item,
  Table,
  TableRow,
  TableCell,
  TextField,
  Typography,
  Switch,
  Grid,
} from "@mui/material";
import toast from "react-hot-toast";
import Head from "next/head";
import NextLink from "next/link";
import { AuthGuard } from "../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import formUtils, {
  createCounterObject,
  createNegativeCounterObject,
  getDuplicates,
} from "../../../utils/form-utils";
import { useCallback, useEffect, useState } from "react";
import { useMounted } from "../../../hooks/use-mounted";
import { arraySameContents, isObject } from "../../../utils/utils";
import router, { useRouter } from "next/router";
import { serverDownCode } from "../../../api/api-helpers";
import { notificationsApi } from "../../../api/notifications";
import { ServerDownError } from "../../../components/dashboard/errors/server-down-error";
import ExpandMore from "../../../components/dashboard/shared/expand-more";
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import SMTPForm from "../../../components/dashboard/notifications/SMTP-form";
import { ErrorPopUp } from "../../../components/dashboard/errors/error-popup";

const NotificationSettings = () => {
  const router = useRouter();
  const [serverDownOpen, setServerDownOpen] = useState(false);
  const [enableEmail, setEmailEnablementStatus] = useState(false);
  const [enableSMS, setSMSEnablementStatus] = useState(false);
  const [expandedEmail, setExpandedEmail] = useState(false);
  const [expandedSMS, setExpandedSMS] = useState(false);
  const [SMSCredits, setSMSCredits] = useState(0);
  const [enableCustom, setEnableCustom] = useState(false);
  const [emailSettings, setEmailSettings] = useState({ isTLS: false });
  const [isUpdated, setIsUpdated] = useState(false);
  const [smsSettings, setSMSSettings] = useState([]);
  const [disableSubmit, setDisableSubmit] = useState(false);
  const [portNumberValue, setPortNumberValue] = useState("");
  const [errorPopUp, setErrorPopUp] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorMessageValue, setErrorMessageValue] = useState("");
  const [recipentUser, setRecipentUser] = useState("");
  const [recipentEmail, setRecipentEmail] = useState("");
  const [recipentSMS, setRecipentSMS] = useState("");
  const [SMSApiKey, setSMSApiKey] = useState("");

  const handleExpandedEmail = () => setExpandedEmail(!expandedEmail);
  const handleExpandedSMS = () => setExpandedSMS(!expandedSMS);

  const handleEnableCustom = async () => {
    if (enableCustom) {
      setToDefault();
    } else {
      emailSettings.custom = true;
      setEnableCustom(true);
    }
  };

  const isMounted = useMounted();

  const getEmailEnablementStatus = async () => {
    try {
      const res = await notificationsApi.getEmailSettings();
      const body = await res.json();
      if (body.enabled) {
        setEmailEnablementStatus(true);
        setExpandedEmail(true);
      } else {
        setEmailEnablementStatus(false);
        setExpandedEmail(false);
      }
      //temporary
      if (body.username != "DefaultName") {
        setEnableCustom(true);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const getSMSCredits = async () => {
    try {
      const res = await notificationsApi.getSMSCredits();
      const body = await res.json();
      console.log(body);
      setSMSCredits(body);
    } catch (err) {
      console.log(err);
    }
  };

  const getSMSEnablementStatus = async () => {
    try {
      const res = await notificationsApi.getSMSSettings();
      const body = await res.json();
      if (body.enabled) {
        setSMSEnablementStatus(true);
        setExpandedSMS(true);
      } else {
        setSMSEnablementStatus(false);
        setExpandedSMS(false);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const changeEmailEnablementStatus = async () => {
    try {
      const res = await notificationsApi.changeEmailEnablement(!enableEmail);
      if (enableEmail) {
        toast.success("Successfully deactivated Email Notifications");
      }
      getEmailEnablementStatus();
      setEnableCustom(false);
    } catch (err) {
      console.log(err);
    }
  };

  const changeSMSEnablementStatus = async () => {
    try {
      const res = await notificationsApi.changeSMSEnablement(!enableSMS);
      if (enableSMS) {
        toast.success("Successfully deactivated SMS Notifications");
      } else {
        toast.success("Successfully activated SMS Notifications");
      }
      getSMSEnablementStatus();
    } catch (err) {
      console.log(err);
      toast.error("Unable to change SMS Notifications");
    }
  };

  const setToDefault = async () => {
    try {
      const res = await notificationsApi.backToDefault();
      if (res) {
        setEnableCustom(false);
        setIsUpdated(false);
        toast.success("Successfully set to Default");
        getEmailSettings();
      }
    } catch (err) {
      toast.error("Unable to set to Default");
    }
  };

  const getEmailSettings = async () => {
    try {
      const res = await notificationsApi.getEmailSettings();
      if (isMounted()) {
        if (res.status == 200) {
          const body = await res.json();
          const settings = { ...body };
          setEmailSettings(settings);
          setEnableCustom(settings.custom);
          setPortNumberValue(settings.portNumber);
          setIsUpdated(true);
        } else {
          if (res.status == serverDownCode) {
            setServerDownOpen(true);
          }
          const settings = { ...body };
          setEmailSettings({});
          setEnableCustom(false);
          setPortNumberValue(0);
          setIsUpdated(false);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const getSMSSettings = async () => {
    try {
      const res = await notificationsApi.getSMSSettings();
      const body = await res.json();
      if (isMounted()) {
        const settings = { ...body };
        setSMSSettings(settings);
        console.log(settings.smsAPI);
        setSMSApiKey(settings.smsAPI);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const getInfo = useCallback(() => {
    getEmailEnablementStatus();
    getSMSEnablementStatus();
    getEmailSettings();
    getSMSSettings();
    getSMSCredits();
  }, [isMounted]);

  useEffect(() => {
    getInfo();
  }, []);

  const onUsernameChange = (e) => {
    emailSettings.username = e.target.value;
  };

  const onEmailChange = (e) => {
    emailSettings.email = e.target.value;
  };

  const onTLSSSLChange = (e) => {
    emailSettings.isTLS = e.target.value === "true";
    emailSettings.portNumber = e.target.value === "true" ? "587" : "465";
    setPortNumberValue(emailSettings.portNumber);
    console.log(emailSettings);
  };

  const onEmailPasswordChange = (e) => {
    emailSettings.emailPassword = e.target.value;
  };

  const onRecipentUserChange = (e) => {
    setRecipentUser(e.target.value);
    console.log(recipentUser);
  };

  const onRecipentEmailChange = (e) => {
    setRecipentEmail(e.target.value);
    console.log(recipentEmail);
  };

  const onSMSApiKeyChange = (e) => {
    setSMSApiKey(e.target.value);
    console.log(SMSApiKey);
  };

  const onRecipentSMSChange = (e) => {
    setRecipentSMS(e.target.value);
    console.log(recipentSMS);
  };

  const onProtocolchange = (e) => {
    // emailSettings.hostAddress = e.target.value;
    //console.log(1234)
  };

  const onHostAddressChange = (e) => {
    emailSettings.hostAddress = e.target.value;
  };

  const onPortNumberChange = (e) => {
    emailSettings.portNumber = e.target.value;
    setPortNumberValue(e.target.value);
    console.log(emailSettings);
  };

  const onSubmitEmailSetting = async (e) => {
    e.preventDefault();
    setDisableSubmit(true);
    try {
      const res = await notificationsApi.updateEmail(emailSettings);
      if (res) {
        toast.success("Successfully saved Notification Settings");
        setErrorMessage("");
        getEmailSettings();
      } else {
        toast.error("SMTP settings are not valid");
      }
    } catch {
      toast.error("Unable to save settings");
    }
    setDisableSubmit(false);
  };

  const onSubmitSMSSetting = async (e) => {
    e.preventDefault();
    setDisableSubmit(true);
    try {
      // console.log(SMSApiKey);
      const res = await notificationsApi.updateSMS(SMSApiKey);
      if (res) {
        toast.success("Successfully saved Notification Settings");
        setErrorMessage("");
        getSMSSettings();
      } else {
        toast.error("SMS settings are not valid");
      }
    } catch {
      toast.error("Unable to save settings");
    }
    setDisableSubmit(false);
  };

  const testSMTP = async (e) => {
    e.preventDefault();
    setDisableSubmit(true);
    try {
      const res = await notificationsApi.testSMTP(
        emailSettings,
        recipentUser,
        recipentEmail
      );
      const message = await res.text();
      if (res.status == 200) {
        toast.success(message);
      } else {
        console.log(res);
        setErrorMessageValue(
          `SMTP settings test failed with status ${res.status}. \n Ensure that email notifications are enabled.`
        );
        setErrorPopUp(true);
      }
    } catch {
      toast.error("Unable to test SMTP settings");
    } finally {
      setErrorMessage("");
    }
    setDisableSubmit(false);
  };

  const testSMS = async (e) => {
    e.preventDefault();
    setDisableSubmit(true);
    try {
      console.log(recipentSMS);
      const res = await notificationsApi.testSMS(recipentSMS);
      const message = await res.text();
      if (res.status == 200) {
        toast.success("Test SMS successfully sent");
      } else {
        console.log(res);
        setErrorMessageValue(
          `SMS settings test failed with status ${res.status}. \n Ensure that SMS notifications are enabled.`
        );
        setErrorPopUp(true);
        toast.error("Unable to test SMS settings");
      }
    } catch {
      toast.error("Unable to test SMS settings");
    }  finally {
      // Attempt to get SMS credits, with error handling
      try {
        await getSMSCredits();
      } catch (error) {
        console.error("Error getting SMS credits:", error);
        // Optionally, inform the user that fetching SMS credits failed
        toast.error("Failed to retrieve SMS credits.");
      }}
    setDisableSubmit(false);
  };

  return (
    <>
      <Head>
        <title>Etlas: Notifications</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <ErrorPopUp
          open={errorPopUp}
          errorMessage={errorMessageValue}
          handleDialogClose={() => setErrorPopUp(false)}
        />
        <Container maxWidth="xl">
          <Box sx={{ mb: 4 }}>
            <ServerDownError
              open={serverDownOpen}
              handleDialogClose={() => setServerDownOpen(false)}
            />
          </Box>
          <div>
            <Typography variant="h3">Notification Settings</Typography>
          </div>
          <Stack spacing={4} sx={{ mt: 4 }}>
            <Card>
              <CardHeader
                title="Email SMTP Settings"
                avatar={
                  <ExpandMore
                    expand={expandedEmail}
                    onClick={handleExpandedEmail}
                  >
                    <ExpandMoreIcon />
                  </ExpandMore>
                }
              />
              <Collapse in={expandedEmail}>
                <CardContent sx={[{ mx: 7 }, { mt: -4 }]}>
                  <Grid
                    container
                    alignItems="center"
                    spacing={3}
                    justifyContent="flex-start"
                    padding="10px"
                  >
                    <Grid item>
                      <Typography variant="body1">
                        Enable Email Notifications
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Switch
                        onClick={changeEmailEnablementStatus}
                        checked={enableEmail}
                      ></Switch>
                    </Grid>
                  </Grid>
                  <Grid
                    container
                    alignItems="center"
                    spacing={3}
                    justifyContent="flex-start"
                    padding="10px"
                  >
                    <Grid item>
                      <Typography variant="body">
                        Switch to Custom SMTP Email Server
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Switch
                        onClick={handleEnableCustom}
                        checked={enableCustom}
                      ></Switch>
                    </Grid>
                    <ExpandMore expand={emailSettings}></ExpandMore>
                    {emailSettings && isUpdated && (
                      <CardContent>
                        <Grid container spacing={3} fluid>
                          <Grid item xs={8}>
                            <Typography variant="body">
                              SMTP Protocol
                            </Typography>
                          </Grid>
                          <Grid item xs={8}>
                            <FormControl>
                              <RadioGroup
                                row
                                aria-labelledby="tls-or-ssl"
                                name="tls-or-ssl"
                                defaultValue={emailSettings.isTLS}
                                value={emailSettings.isTLS}
                                onChange={onTLSSSLChange}
                              >
                                <FormControlLabel
                                  value={true}
                                  disabled={!enableCustom}
                                  control={<Radio />}
                                  label="TLS"
                                />
                                <FormControlLabel
                                  value={false}
                                  disabled={!enableCustom}
                                  control={<Radio />}
                                  label="SSL"
                                />
                              </RadioGroup>
                            </FormControl>
                          </Grid>
                          <Grid item xs={8}>
                            <TextField
                              fullWidth
                              label="Sender Name"
                              name="Sender Name"
                              required
                              defaultValue={emailSettings.username}
                              onChange={onUsernameChange}
                              disabled={!enableCustom}
                            />
                          </Grid>
                          <Grid item xs={8}>
                            <TextField
                              fullWidth
                              label="Sender Email"
                              name="Sender Email"
                              required
                              defaultValue={emailSettings.email}
                              onChange={onEmailChange}
                              disabled={!enableCustom}
                            />
                          </Grid>
                          <Grid item xs={8}>
                            <TextField
                              fullWidth
                              label="Sender Password"
                              name="Sender Password"
                              type="password"
                              required
                              defaultValue={emailSettings.emailPassword}
                              onChange={onEmailPasswordChange}
                              disabled={!enableCustom}
                            />
                          </Grid>
                          <Grid item xs={8}>
                            <TextField
                              fullWidth
                              label="Sender SMTP Host Address"
                              name="Host Address"
                              required
                              defaultValue={emailSettings.hostAddress}
                              onChange={onHostAddressChange}
                              disabled={!enableCustom}
                            />
                          </Grid>
                          <Grid item xs={8}>
                            <TextField
                              fullWidth
                              label="Sender SMTP Port Number"
                              name="Port Number"
                              required
                              defaultValue={emailSettings.portNumber}
                              value={portNumberValue}
                              onChange={onPortNumberChange}
                              disabled={!enableCustom}
                            />
                          </Grid>
                          <Grid item xs={8}>
                            <Grid item>
                              <Button
                                variant="contained"
                                onClick={onSubmitEmailSetting}
                                disabled={!enableCustom}
                              >
                                Save Settings
                              </Button>
                            </Grid>
                          </Grid>
                          <Grid item xs={8}>
                            <FormLabel id="test-email">
                              Test Email Settings
                            </FormLabel>
                          </Grid>
                          <Grid item xs={8}>
                            <TextField
                              fullWidth
                              label="Recipent Name"
                              name="Recipent Name"
                              required
                              defaultValue={recipentUser}
                              value={recipentUser}
                              onChange={onRecipentUserChange}
                              // disabled={!enableCustom}
                            />
                          </Grid>
                          <Grid item xs={8}>
                            <TextField
                              fullWidth
                              label="Recipent Email"
                              name="Recipent Email"
                              required
                              defaultValue={recipentEmail}
                              value={recipentEmail}
                              onChange={onRecipentEmailChange}
                              // disabled={!enableCustom}
                            />
                          </Grid>
                          <Grid item xs={8}>
                            <Grid item>
                              <Button variant="outlined" onClick={testSMTP}>
                                Send Test Email
                              </Button>
                            </Grid>
                          </Grid>
                        </Grid>
                      </CardContent>
                    )}
                  </Grid>
                </CardContent>
              </Collapse>
            </Card>
            <Card>
              <CardHeader
                title="SMS Settings"
                avatar={
                  <ExpandMore expand={expandedSMS} onClick={handleExpandedSMS}>
                    <ExpandMoreIcon />
                  </ExpandMore>
                }
              />
              <Collapse in={expandedSMS}>
                <Grid
                  container
                  sx={[{ ml: 7 }, { mb: 4 }]}
                  alignItems="center"
                  spacing={3}
                  justifyContent="flex-start"
                >
                  <Grid item>
                    <Typography variant="body1">
                      Enable SMS Notifications
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Switch
                      onClick={changeSMSEnablementStatus}
                      checked={enableSMS}
                    ></Switch>
                  </Grid>
                </Grid>
                <Grid
                  container
                  sx={[{ ml: 7 }, { mb: 4 }]}
                  alignItems="center"
                  spacing={3}
                  justifyContent="flex-start"
                >
                  <Grid item xs={8}>
                    <TextField
                      fullWidth
                      label="SMS Apikey"
                      name="SMS Apikey"
                      required
                      defaultValue={SMSApiKey}
                      value={SMSApiKey}
                      onChange={onSMSApiKeyChange}
                      // disabled={!enableCustom}
                    />
                  </Grid>
                  <Grid item xs={8}>
                    <Grid item>
                      <Button
                        variant="contained"
                        onClick={onSubmitSMSSetting}
                        // disabled={!enableCustom}
                      >
                        Save Settings
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
                {/* <Grid
                  container
                  sx={[{ ml: 7 }, { mb: 4 }]}
                  alignItems="center"
                  spacing={3}
                  justifyContent="flex-start"
                > */}
                {/* </Grid> */}
                <Grid
                  container
                  sx={[{ ml: 7 }, { mb: 4 }]}
                  alignItems="center"
                  spacing={3}
                  justifyContent="flex-start"
                >
                  <Grid item xs={8}>
                    <FormLabel id="test-email">Test SMS Settings</FormLabel>
                  </Grid>
                  <Grid
                    item
                    xs={8}
                    style={{
                      padding: "5px",
                      paddingLeft: "24px",
                    }}
                  >
                    <p className="paragraph" padding="100%">
                      Mobile Number requires country code. Example: +65 for
                      Singapore
                    </p>
                    <TextField
                      fullWidth
                      label="Recipent Mobile Number"
                      name="Recipent Mobile Number"
                      required
                      defaultValue={recipentSMS}
                      value={recipentSMS}
                      onChange={onRecipentSMSChange}
                      // disabled={!enableCustom}
                    />
                  </Grid>
                  <Grid item xs={8}>
                    <Grid item>
                      <Button variant="outlined" onClick={testSMS}>
                        Send Test SMS
                      </Button>
                    </Grid>
                  </Grid>
                  <Grid
                    container
                    spacing={3}
                    margin="0"
                    // sx={[{ ml: 7 }, { mb: 4 }]}
                    // alignItems="center"
                    // justifyContent="flex-start"
                  >
                    <Grid item>
                      <Typography variant="body">
                        Number of SMS Credits Left: {SMSCredits}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Collapse>
            </Card>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

NotificationSettings.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

export default NotificationSettings;
