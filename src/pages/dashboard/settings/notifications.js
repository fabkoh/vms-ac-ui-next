import { Add, ArrowBack } from "@mui/icons-material";
import { Box, Button, Card, CardContent, CardHeader, Collapse, Divider, Container, Link, Stack, Item, Table, TableRow, TableCell, TextField, Typography, Switch, Grid } from "@mui/material";
import toast from "react-hot-toast";
import Head from "next/head";
import NextLink from "next/link";
import { AuthGuard } from "../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import formUtils, { createCounterObject, createNegativeCounterObject, getDuplicates } from "../../../utils/form-utils";
import { useCallback, useEffect, useState } from 'react';
import { useMounted } from "../../../hooks/use-mounted";
import { arraySameContents, isObject } from "../../../utils/utils";
import router, { useRouter } from "next/router";
import { serverDownCode } from "../../../api/api-helpers";
import { notificationsApi } from "../../../api/notifications";
import { ServerDownError } from "../../../components/dashboard/errors/server-down-error";
import ExpandMore from "../../../components/dashboard/shared/expand-more";
import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import SMTPForm from "../../../components/dashboard/notifications/SMTP-form"


const NotificationSettings = () => {
    
    const router = useRouter();
    const [serverDownOpen, setServerDownOpen] = useState(false);
    const [enableEmail, setEmailEnablementStatus] = useState(false);
    const [enableSMS, setSMSEnablementStatus] = useState(false);
    const [expandedEmail, setExpandedEmail] = useState(false);
    const [expandedSMS, setExpandedSMS] = useState(false);
    const [enableCustom, setEnableCustom] = useState(false);
    const [emailSettings, setEmailSettings] = useState(false);
    const [isUpdated, setIsUpdated] = useState(false)
    const [smsSettings, setSMSSettings] = useState([]);
    const [disableSubmit, setDisableSubmit] = useState(false);

    const handleExpandedEmail= () => setExpandedEmail(!expandedEmail);
    const handleExpandedSMS = () => setExpandedSMS(!expandedSMS);

    const handleEnableCustom = async() => {
        if(enableCustom){
            setToDefault();     
        }
        else{
            emailSettings.custom = true
            setEnableCustom(true)
        }
    }

    const isMounted = useMounted(); 

    const getEmailEnablementStatus = async() => {
        try {
            const res = await notificationsApi.getEmailSettings();
            const body = await res.json();
            if (body.enabled){
                setEmailEnablementStatus(true)
                setExpandedEmail(true)
            }
            else{
                setEmailEnablementStatus(false)
                setExpandedEmail(false)
            }
            //temporary 
            if (body.username!="DefaultName"){
                setEnableCustom(true)
            }

        } catch(err) {
            console.log(err);
            }
    }

    const getSMSEnablementStatus = async() => {
        try {
            const res = await notificationsApi.getSMSSettings();
            const body = await res.json();
            if (body.enabled){
                setSMSEnablementStatus(true)
                setExpandedSMS(true)
            }
            else{
                setSMSEnablementStatus(false)
                setExpandedSMS(false)
            }

        } catch(err) {
            console.log(err);
            }
    }

    const changeEmailEnablementStatus = async() => {
        try {
            const res = await notificationsApi.changeEmailEnablement(!enableEmail);
            getEmailEnablementStatus()
        } catch(err) {
            console.log(err);
            }
    }

    const changeSMSEnablementStatus = async() => {
        try {
            const res = await notificationsApi.changeSMSEnablement(!enableSMS);
            getSMSEnablementStatus()
        } catch(err) {
            console.log(err);
            }
    }

    const setToDefault = async() => {
        try {
            const res = await notificationsApi.backToDefault();
            if (res){
                setEnableCustom(false)
                setIsUpdated(false)
                toast.success("Successfully set to Default");
                getEmailSettings()
            }
        } catch(err) {
            toast.error("Unable to set to Default");
            }
    }

    const getEmailSettings = async() => {
        try {
            const res = await notificationsApi.getEmailSettings();
            const body = await res.json();
            if (isMounted()) {
                const settings = {...body}
                setEmailSettings(settings);
                setEnableCustom(settings.custom)
                setIsUpdated(true)
            }
        } catch(err) {
            console.log(err);
            }
    }

    const getSMSSettings = async() => {
        try {
            const res = await notificationsApi.getSMSSettings();
            const body = await res.json();
            if (isMounted()) {
                const settings = {...body}
                setSMSSettings(settings);
            }
        } catch(err) {
            console.log(err);
            }
    }

    const getInfo = useCallback( () => {
        getEmailEnablementStatus();
        getSMSEnablementStatus();
        getEmailSettings();
    }, [isMounted]);
    
    useEffect(() => {
    getInfo();
    }, 
    []);


    const onUsernameChange = (e) => {
        emailSettings.username = e.target.value;
    }

    const onEmailChange = (e) => {
        emailSettings.email = e.target.value;
    }

    const onEmailPasswordChange = (e) => {
        emailSettings.emailPassword = e.target.value;
    }

    const onHostAddressChange = (e) => {
        emailSettings.hostAddress = e.target.value;
    }

    const onPortNumberChange = (e) => {
        emailSettings.portNumber = e.target.value;
        console.log(emailSettings);
    }

    const onSubmit = async(e) => {
        e.preventDefault();
        setDisableSubmit(true);
        try {
            const res = await notificationsApi.updateEmail(emailSettings);
            if (res) { 
                toast.success("Successfully saved Notification Settings");
                getEmailSettings();
            }
        } catch {
            toast.error("Unable to save settings");
        }        
        setDisableSubmit(false);
    }

    return (
        <>
            <Head>
                <title>Etlas: Notifications</title>
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
                        <ServerDownError
                            open={serverDownOpen} 
                            handleDialogClose={() => setServerDownOpen(false)}
					/>
                    </Box>
                    <div>
                        <Typography variant="h3">Notification Settings</Typography>
                    </div>
                    <Stack spacing={4} sx={{mt:4}}>
                        <Card>
                            <Table sx={[{ "& td": { border: 0 }},{m:4}]}>
                                <TableRow>
                                    <TableCell width="40%"><Typography variant="body1">Enable Email Notifications</Typography></TableCell>
                                    <TableCell><Switch onClick={changeEmailEnablementStatus} checked={enableEmail}></Switch></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell><Typography variant="body1">Enable SMS Notifications</Typography></TableCell>
                                    <TableCell><Switch onClick={changeSMSEnablementStatus} checked={enableSMS}></Switch></TableCell>
                                </TableRow>
                            </Table>
                        </Card>
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
                            <CardContent sx={[{mx:7},{mt:-4},]}>
                                <Grid container alignItems="center" spacing={3} justifyContent="flex-start">
                                    <Grid item>
                                        <Typography variant="body">Switch to Custom SMTP Email Server</Typography>
                                    </Grid>
                                    <Grid item>
                                        <Switch onClick={handleEnableCustom} checked={enableCustom}></Switch>
                                    </Grid>
                                    <ExpandMore expand={emailSettings}>
                                    </ExpandMore>
                                        {/* {emailSettings && isUpdated &&
                                            <SMTPForm
                                                emailSettings={emailSettings}
                                                isEnableCustom={enableCustom}
                                                setToDefault={setToDefault}
                                                getEmailSettings={getEmailSettings}
                                            />
                                        } */}
                                        {emailSettings && isUpdated &&
                                        <CardContent>
                                            <Grid
                                                container
                                                spacing={3}
                                                fluid
                                            >
                                                <Grid item xs={8}>
                                                    <TextField
                                                        fullWidth
                                                        label="Username"
                                                        name="Username"
                                                        required
                                                        defaultValue={emailSettings.username}
                                                        onChange={onUsernameChange}
                                                        disabled={!enableCustom}
                                                    />
                                                </Grid>
                                                <Grid
                                                    item
                                                    xs={8}
                                                >
                                                    <TextField
                                                        fullWidth
                                                        label="Email"
                                                        name="Email"
                                                        required
                                                        defaultValue={emailSettings.email}
                                                        onChange={onEmailChange}
                                                        disabled={!enableCustom}
                                                    />
                                                </Grid>
                                                <Grid
                                                    item
                                                    xs={8}
                                                >
                                                    <TextField
                                                        fullWidth
                                                        label="Password"
                                                        name="Password"
                                                        required
                                                        defaultValue={emailSettings.emailPassword}
                                                        onChange={onEmailPasswordChange}
                                                        disabled={!enableCustom}
                                                    />
                                                </Grid>
                                                <Grid
                                                    item
                                                    xs={8}
                                                >
                                                    <TextField
                                                        fullWidth
                                                        label="Host Address"
                                                        name="Host Address"
                                                        required
                                                        defaultValue={emailSettings.hostAddress}
                                                        onChange={onHostAddressChange}
                                                        disabled={!enableCustom}
                                                    />
                                                </Grid>
                                                <Grid
                                                    item
                                                    xs={8}
                                                >
                                                    <TextField
                                                        fullWidth
                                                        label="Port Number"
                                                        name="Port Number"
                                                        required
                                                        defaultValue={emailSettings.portNumber}
                                                        onChange={onPortNumberChange}
                                                        disabled={!enableCustom}
                                                    />
                                                </Grid>
                                                <Grid
                                                    item
                                                    xs={8}>
                                                    <Grid container alignItems="center" justifyContent="flex">
                                                        <Grid item>
                                                            <Button variant="contained" onClick={onSubmit} disabled={!enableCustom}>Save Settings</Button>
                                                        </Grid>
                                                        <Grid item sx={{mx:2}}>
                                                            <Button variant="outlined">Test SMTP Email</Button>
                                                        </Grid>
                                                        <Grid>
                                                        <Button variant="outlined" color="error" onClick={setToDefault} sx={{mr:3}} >Set to Default</Button>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                        }
                                </Grid>
                                </CardContent>
                            </Collapse>                            
                        </Card>
                        <Card>
                            <CardHeader
                                title="SMS Settings"
                                avatar={
                                    <ExpandMore
                                        expand={expandedSMS}
                                        onClick={handleExpandedSMS}
                                    >
                                        <ExpandMoreIcon />
                                    </ExpandMore>
                                    }
                                />
                            <Collapse in={expandedSMS}>
                                

                                <Grid container sx={[{ml:7},{mb:4}]} alignItems="center" spacing={3} justifyContent="flex-start">
                                    <Grid item>
                                        <Typography variant="body">Number of SMS Credits Used</Typography>
                                    </Grid>
                                    <Grid item xs={1}>
                                        10
                                    </Grid>
                                    <Grid item xs={1}>
                                        out of 
                                    </Grid>
                                    <Grid item xs={1}>
                                        100
                                    </Grid>
                                </Grid>
                            </Collapse>
                        </Card>
                    </Stack>
                </Container>
            </Box>
        </>
    )
}

NotificationSettings.getLayout = (page) => (
    <AuthGuard>
        <DashboardLayout>
            {page}
        </DashboardLayout>
    </AuthGuard>
);

export default NotificationSettings;


