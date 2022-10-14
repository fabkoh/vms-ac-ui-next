import { Add, ArrowBack } from "@mui/icons-material";
import { Box, Button, Card, CardContent, CardHeader, Collapse, Divider, Container, Link, Stack, Item, Typography, Switch, Grid } from "@mui/material";
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

    const handleExpandedEmail= () => setExpandedEmail(!expandedEmail);
    const handleExpandedSMS = () => setExpandedSMS(!expandedSMS);
    const handleEnableCustom = () => setEnableCustom(!enableCustom);

    const isMounted = useMounted(); 

    const SMTPInfo = {
        emailSettingsId: 1,
        username: "lawson",
        email: "a",
        emailPassword: 'x',
        hostAddress: "asd",
        portNumber: "sadasdf",
        enabled: 'true'
    }

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
            if (body.username!="EtlasHost"){
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
                handleEnableCustom()
                setIsUpdated(false)
                getEmailSettings()
            }
        } catch(err) {
            console.log(err);
            }
    }

    const getEmailSettings = async() => {
        try {
            const res = await notificationsApi.getEmailSettings();
            const body = await res.json();
            if (isMounted()) {
                const settings = {...body}
                setEmailSettings(settings);
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
                            <Grid container sx={{m:4}} alignItems="center">
                                <Grid item xs={3}>
                                    <Typography variant="body">Enable Email Notifications</Typography>
                                </Grid>
                                <Grid item>
                                    <Switch onClick={changeEmailEnablementStatus} checked={enableEmail}></Switch>
                                </Grid>
                            </Grid>
                            <Grid container sx={{m:4}} alignItems="center">
                                <Grid item xs={3}>
                                    <Typography variant="body">Enable SMS Notifications</Typography>
                                </Grid>
                                <Grid item>
                                    <Switch onClick={changeSMSEnablementStatus} checked={enableSMS}></Switch>
                                </Grid>
                            </Grid>
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
                            action={
                                <Button variant="outlined" color="error" onClick={setToDefault} sx={{mr:3}}>Set to Default</Button>
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
                                    <ExpandMore expand={emailSettings && enableCustom}>
                                    </ExpandMore>
                                    <Collapse in={enableCustom}>
                                        {emailSettings && isUpdated &&
                                            <SMTPForm
                                                SMTPInfo={emailSettings}
                                            />
                                        }
                                    </Collapse>
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


