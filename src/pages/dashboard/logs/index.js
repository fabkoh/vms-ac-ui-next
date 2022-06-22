import { HelpOutline } from "@mui/icons-material";
import { Box, Button, Card, Container, Divider, Grid, InputAdornment, TextField, Tooltip, Typography } from "@mui/material";
import Head from "next/head";
import { useEffect } from "react"
import { AuthGuard } from "../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import EventLogTable from "../../../components/dashboard/logs/event-log-table";
import { Download } from "../../../icons/download";
import { Search } from "../../../icons/search";
import { Upload } from "../../../icons/upload";
import { gtm } from "../../../lib/gtm"

const logs=[
    {
        eventType: 'AUTHENTICATED CARD SCAN',
        entrance: 'Main Entrance',
        person: 'Yong Ning',
        accessGroup: 'ISS GROUP',
        timestamp: (new Date()).toISOString(),
        authMethod: 'Card + Fingerprint + Pin'
    },
    {
        eventType: 'DOOR OPENED',
        entrance: 'Main Entrance',
        person: null,
        accessGroup: null,
        timestamp: (new Date()).toISOString(),
        authMethod: null
    }
]

const Logs=()=>{
    // copied
    useEffect(() => gtm.push({event: "page_view"}));

    return (
        <>
            <Head>
                <title>Etlas: Events Log</title>
            </Head>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    py: 8
                }}
            >
                <Container maxWidth="xl">
                    <Box sx={{mb: 4}}>
                        <Grid container justifyContent="space-between" spacing={3}>
                            <Grid item sx={{m:2.5}}>
                                <Typography variant="h4">Event Logs</Typography>
                            </Grid>
                        </Grid>
                        <Box
                            sx={{
                                m: -1,
                                mt: 3
                            }}
                        >
                            <Button startIcon={<Upload fontSize="small" />} sx={{m: 1}}>Import</Button>
                            <Button startIcon={<Download fontSize="small" />} sx={{m: 1}}>Export</Button>
                            <Tooltip
                                title="Excel template can be found at {}"
                                enterTouchDelay={0}
                                placement="top"
                                sx={{
                                    m: -0.5,
                                    mt: 3
                                }}
                            >
                                <HelpOutline />
                            </Tooltip>
                        </Box>
                    </Box>
                    <Card>
                        <Divider />
                        <Box
                            sx={{
                                alignItems: "center",
                                display: "flex",
                                flexWrap: "wrap",
                                m: -1.5,
                                p: 3
                            }}
                        >
                            <Box
                                sx={{
                                    flexGrow: 1,
                                    m: 1.5
                                }}
                            >
                                <TextField
                                    defaultValue=""
                                    fullWidth
                                    // inputProps={{
                                    //     // ref:
                                    // }}
                                    InputProps={{
                                        startAdornment:(
                                            <InputAdornment position="start">
                                                <Search fontSize="small" />
                                            </InputAdornment>
                                        )
                                    }}
                                    placeholder="Search by" // replace with const variable
                                />
                            </Box>
                        </Box>
                        <EventLogTable 
                            logs={logs}
                        />
                    </Card>
                </Container>
            </Box>
        </>
    )
}

Logs.getLayout=(page)=>(
    <AuthGuard>
        <DashboardLayout>{page}</DashboardLayout>
    </AuthGuard>
)

export default Logs;