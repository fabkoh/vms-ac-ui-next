import { HelpOutline, Refresh, VerticalAlignCenter } from "@mui/icons-material";
import { Box, Button, Card, Container, Divider, Grid, InputAdornment, TextField, Tooltip, Typography } from "@mui/material";
import Head from "next/head";
import { useCallback, useEffect, useRef, useState } from "react"
import { AuthGuard } from "../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import NotificationLogTable from "../../../components/dashboard/logs/notification-log-table";
import { Search } from "../../../icons/search";
import { gtm } from "../../../lib/gtm"
import { useMounted } from "../../../hooks/use-mounted";
import { stringIn } from "../../../utils/utils";
import { applyPagination, createFilter } from "../../../utils/list-utils";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import toast from "react-hot-toast";
import { ServerDownError } from "../../../components/dashboard/errors/server-down-error";
import { serverDownCode } from "../../../api/api-helpers";
import { notificationLogsApi } from "../../../api/notifications-log";

// fix filter, check if can import utils 
const NotificationStringFilterHelper = (notification, query) =>
                        query === ""  
                        // || (event.entrance && stringIn(query, event.entrance.entranceName)) 
                        // || (event.controller &&stringIn(query, event.controller.controllerName)) 
                        // || (event.eventActionType && stringIn(query, event.eventActionType.eventActionTypeName)) 
                        // || (event.person &&stringIn(query, event.person.personFirstName+" "+event.person.personLastName))
                        // || (event.accessGroup &&stringIn(query,event.accessGroup.accessGroupName))

    
const filterNotificationsbyString = (notification, queryString) => NotificationStringFilterHelper(notification, queryString.toLowerCase());
const applyFilter = createFilter({
    query: filterNotificationsbyString,
})

const applyDateTimeFilter = (events,start,end) => {
    return(events.filter(event=> {
        const date = new Date(event.eventTime);
        return (
            // if start is null
            (start === null && date<=end)
            // if end is null
            || (end === null && start<=date)
            // if both null
            || (start === null && end === null )
            // both non null 
            || (date>=start && date<=end))
        }))    
}

const Logs=()=>{

    const [filterStart, setfilterStart] = useState(null);
    const [filterEnd, setfilterEnd] = useState(null);

    const handleStartDate = (e) => {
        setfilterStart(e);
        console.log(filterStart);
    }

    const handleEndDate = (value) => {
        setfilterEnd(value);
        console.log(filterEnd);
    }
    
    function onClear() {
        setfilterStart(null)
        setfilterEnd(null)
        
    }

useEffect(() => {
    gtm.push({ event: 'page_view' });
    }, []);

const isMounted = useMounted();
// const [currentTab, setCurrentTab] = useState("all");
const [filters, setFilters] = useState({
    query: ""
});
const queryRef = useRef(null);
const handleQueryChange = (e) => {

        e.preventDefault();
        setFilters((prevState) => ({
            ...prevState,
            query: queryRef.current?.value
        }));
    };


const [Notifications, setNotifications] = useState([]);

console.log(filters)
const [searchedNotifications, setSearchedNotifications] = useState([]);
const filteredNotifications = searchedNotifications.length <= 0 ? applyDateTimeFilter(applyFilter(Notifications, filters),filterStart,filterEnd) : searchedNotifications;

// for pagination
const [page, setPage] = useState(0);
const handlePageChange = async (e, newPage) => {
    setPage(newPage);
    if ((newPage + 1) * rowsPerPage >= filteredNotifications.length && Notifications.length < notifsCount) {
        const res = await notificationLogsApi.getNotifLogs(Math.floor(Notifications.length / 500));

        if (res.status == 200) {
            const data = await res.json();
            if (isMounted())
                setNotifications(Notifications.concat(data));
        } else
            if (res.status == serverDownCode) {
                setServerDownOpen(true);
            }
            toast.error("Some error has occurred");
    }
}
const [rowsPerPage, setRowsPerPage] = useState(10);
const handleRowsPerPageChange = (e) => setRowsPerPage(parseInt(e.target.value, 10));
const paginatedNotifications = applyPagination(filteredNotifications, page, rowsPerPage);
const [notifsCount, setNotifsCount] = useState(0);
const [serverDownOpen, setServerDownOpen] = useState(false);

const getNotifications = useCallback(async () => {
    try {
        const res = await notificationLogsApi.getNotifLogs(Math.floor(Notifications.length / 500))
        
        if (res.status === 200) {
            const data = await res.json()
            if (isMounted()) {
                setNotifications(data);
            }
        } else {
            if (res.status == serverDownCode) {
                    setServerDownOpen(true);
                }
            toast.error("Error loading notification logs");
            setNotifications([]);
        }
    } catch (err) {
        toast.error("Some error has occurred");
    }
}, [isMounted]);


useEffect(
    () => {
        getNotifications()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
);

const getInfo = useCallback(async() => {
    const notifsCountRes = await notificationLogsApi.getNotifsCount();
    if (notifsCountRes.status !== 200) {
        if (res.status == serverDownCode) {
            setServerDownOpen(true);
        }
        toast.error("Failed to get total notifs count");
        return;
    }
    const notifsCountJson = await notifsCountRes.json();
    setNotifsCount(notifsCountJson);
    if (Notifications.length < notifsCountJson) {
        const notifsRes = await notificationLogsApi.getNotifLogs(Math.floor(Notifications.length / 500));
        if (notifsRes.status !== 200) {
            toast.error("Failed To fetch the next 500 notifications");
            return;
        }
        const notifsJson = await notifsRes.json();
        toast.success("Fetched notifications successfully");
    
        if (isMounted()){
            setNotifications(notifsJson);
            console.log("Notifications arr length is " + Notifications.length);
        }
    }
}, [isMounted]);

const search = async() => {
    const start = filterStart ? new Date(filterStart.getTime() - filterStart.getTimezoneOffset() * 60000).toISOString() : null;
    const end = filterEnd ? new Date(filterEnd.getTime() - filterEnd.getTimezoneOffset() * 60000).toISOString() : null;
    const notifsRes = await notificationLogsApi.searchNotifLogs(Math.floor(searchedNotifications.length / 500), filters.query, start, end);
    if (notifsRes.status !== 200) {
        toast.error("Failed To Search");
        return;
    }
    const notifsJson = await notifsRes.json();
    toast.success("Search Successfully");
    setSearchedNotifications(notifsJson);
}

    return (
        <>
            <Head>
                <title>Etlas: Notification Log</title>
            </Head>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    py: 8
                }}
            >
                <ServerDownError
                    open={serverDownOpen} 
                    handleDialogClose={() => setServerDownOpen(false)}
                />
                <Container maxWidth="xl">
                    <Box sx={{mb: 4}}>
                        <Grid container
                            justifyContent="space-between"
                            spacing={3}>
                            <Grid item
                                sx={{m:2.5}}>
                                <Typography variant="h4">Notification Logs</Typography>
                            </Grid>
                            <Grid item
                                sx={{m:2.5}}>
                                <Button
                                    variant="contained"
                                    sx={{ m: 1 , mr : 5 }}
                                    endIcon={<Refresh fontSize="small"/>}
                                    onClick={getInfo}
                                >
                                    Refresh
                                </Button>
                            </Grid>
                            </Grid>
                        
                        <Grid container
                            justifyContent="space-between"
                            spacing={3}>
                        
                        </Grid>
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
                                onChange={handleQueryChange}
                                sx={{
                                    flexGrow: 1,
                                    m: 1.5
                                }}
                            >
                                <TextField
                                    defaultValue=""
                                    fullWidth
                                    inputProps={{
                                        ref: queryRef
                                    }}
                                    InputProps={{
                                        startAdornment:(
                                            <InputAdornment position="start">
                                                <Search fontSize="small" />
                                            </InputAdornment>
                                        )
                                    }}
                                    placeholder="Search for Event(s), Notification Type or Recipients(s)" // replace with const variable
                                />
                            </Box>
                        </Box>
                        
                            <Box
                            sx={{
                                p: 3,
                                pt:0,
                                flexGrow: 1,
                            }}
                        >
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DateTimePicker
                                    renderInput={(props) => <TextField {...props} />}
                                    label="Start Date Time"
                                    value={filterStart}
                                    onChange={(e)=> {}}
                                    onAccept={handleStartDate}
                                />
                            </LocalizationProvider>

                            <span> &nbsp; &nbsp;</span>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DateTimePicker
                                renderInput={(props) => <TextField {...props} />}
                                label="End Date Time"
                                value={filterEnd}
                                onChange={(e)=> {}}
                                    onAccept={handleEndDate}
                                />
                            </LocalizationProvider>
                            <span> &nbsp; &nbsp;</span>

                            <Button
                                sx={{m: 1}}
                                variant="outlined"
                                color="error"
                                onClick={onClear}
                            >
                                Clear Dates
                            </Button>
                            <Button
                                    variant="contained"
                                    sx={{ m: 1 , mr : 5 }}
                                    onClick={search}
                                >
                                    Search
                            </Button>
                        
                        </Box>
                        <NotificationLogTable 
                            page={page}
                            rowsPerPage={rowsPerPage}
                            onPageChange={handlePageChange}
                            onRowsPerPageChange={handleRowsPerPageChange}
                            eventsCount={notifsCount}
                            // paginatedEvents
                            logs={paginatedNotifications}
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