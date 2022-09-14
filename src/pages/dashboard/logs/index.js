import { HelpOutline, Refresh, VerticalAlignCenter } from "@mui/icons-material";
import { Box, Button, Card, Container, Divider, Grid, InputAdornment, TextField, Tooltip, Typography } from "@mui/material";
import Head from "next/head";
import { useCallback, useEffect, useRef, useState } from "react"
import { AuthGuard } from "../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import EventLogTable from "../../../components/dashboard/logs/event-log-table";
import { Download } from "../../../icons/download";
import { Search } from "../../../icons/search";
import { Upload } from "../../../icons/upload";
import { gtm } from "../../../lib/gtm"
import { eventslogsApi } from "../../../api/events";
import { useMounted } from "../../../hooks/use-mounted";
import { stringIn } from "../../../utils/utils";
import { applyPagination, createFilter } from "../../../utils/list-utils";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import toast from "react-hot-toast";
import SingleSelect from "../../../components/dashboard/shared/single-select-input";
import { ServerDownError } from "../../../components/dashboard/errors/server-down-error";
import { serverDownCode } from "../../../api/api-helpers";


// fix filter, check if can import utils 
const EventStringFilterHelper = (event, query) =>
                        query === ""  
                        || (event.entrance && stringIn(query, event.entrance.entranceName)) 
                        || (event.controller &&stringIn(query, event.controller.controllerName)) 
                        || (event.eventActionType && stringIn(query, event.eventActionType.eventActionTypeName)) 
                        || (event.person &&stringIn(query, event.person.personFirstName+" "+event.person.personLastName))
                        || (event.accessGroup &&stringIn(query,event.accessGroup.accessGroupName))

    
const filterEventsbyString = (event, queryString) => EventStringFilterHelper(event, queryString.toLowerCase());
const applyFilter = createFilter({
    query: filterEventsbyString,
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


const [Events, setEvents] = useState([]);

console.log(filters)
const filteredEvents = applyDateTimeFilter(applyFilter(Events, filters),filterStart,filterEnd)

// for pagination
const [page, setPage] = useState(0);
const handlePageChange = (e, newPage) => setPage(newPage);
const [rowsPerPage, setRowsPerPage] = useState(10);
const handleRowsPerPageChange = (e) => setRowsPerPage(parseInt(e.target.value, 10));
const paginatedEvents = applyPagination(filteredEvents, page, rowsPerPage);
const eventsCount = filteredEvents.length;
const [serverDownOpen, setServerDownOpen] = useState(false);
const [firstTimeCall, setFirstTimeCall] = useState(true);
    
// for polling 
const [isPolling, setIsPolling] = useState(true);
const [pollingTime, setPollingTime] = useState(1000);
const pollingOptions = [
    { "pollingDisplay" : 1, "pollingTime" : 1000},
    { "pollingDisplay" : 2, "pollingTime" : 2000},
    { "pollingDisplay" : 5, "pollingTime" : 5000},
    { "pollingDisplay" : 10, "pollingTime" : 10000},
    { "pollingDisplay" : 30, "pollingTime" : 30000},
    { "pollingDisplay" : 60, "pollingTime" : 60000},

]
const getPollingDisplay = (e) => e.pollingDisplay
const getPollingValue = (e) => e.pollingTime
const onPollingTimeChange = (e) => {
        setPollingTime(e.target.value)}


const getEvents = useCallback(async () => {
    try {
        //const data = await personApi.getFakePersons() 
        const res = await eventslogsApi.getEvents()
        
        if (res.status === 200) {
            const data = await res.json()
            if (isMounted()) {
                setEvents(data);
            }
        } else {
            setEvents([]);
        }
    } catch (err) {
        toast.error("Some error has occurred");
    }
}, [isMounted]);
    
const getEventsWithErrorPopUps = useCallback(async () => {
    try {
        //const data = await personApi.getFakePersons() 
        const res = await eventslogsApi.getEvents()
        
        if (res.status === 200) {
            const data = await res.json()
            if (isMounted()) {
                setEvents(data);
            }
        } else {
            if (firstTimeCall) {
                if (res.status == serverDownCode) {
                    setServerDownOpen(true);
                }
                toast.error("Error loading event logs");
                setFirstTimeCall(false);
            }
            setEvents([]);
        }
    } catch (err) {
        toast.error("Some error has occurred");
    }
}, [isMounted]);


useEffect(
    () => {
        getEventsWithErrorPopUps()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
);

useEffect(
    () => {
        if (isPolling) {
            console.log(pollingTime)
            const timer = setInterval(getEvents, pollingTime);
            return () => clearInterval(timer)
        }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isPolling, pollingTime]
);

const getInfo = useCallback(async() => {
    const eventsRes = await eventslogsApi.getEvents();
    if (eventsRes.status !== 200) {
        toast.error("Failed To Refresh");
        return;
    }
    const eventsJson = await eventsRes.json();
    toast.success("Refresh Successfully");

    if (isMounted()){
        setEvents(eventsJson);
        setIsPolling(true);
    }
}, [isMounted]);

const search = async() => {
    const start = filterStart ? new Date(filterStart.getTime() - filterStart.getTimezoneOffset() * 60000).toISOString() : null;
    const end = filterEnd ? new Date(filterEnd.getTime() - filterEnd.getTimezoneOffset() * 60000).toISOString() : null;
    const eventsRes = await eventslogsApi.searchEvent(filters.query, start, end);
    if (eventsRes.status !== 200) {
        toast.error("Failed To Search");
        return;
    }
    const eventsJson = await eventsRes.json();
    toast.success("Search Successfully");
    setIsPolling(false);
    setEvents(eventsJson);
}

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
                                <Typography variant="h4">Event Logs</Typography>
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
                        <Box
                            sx={{
                                m: 2.5,
                                mt: 3
                            }}
                        >
                            <Button startIcon={<Upload fontSize="small" />}
                            sx={{m: 1}}>Import</Button>
                            <Button startIcon={<Download fontSize="small" />}
                            sx={{m: 1}}>Export</Button>
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
                            
                            <Box
                            sx={{
                                m: 2.5,
                                mt: 3,
                                mr:7.5
                            }}>
                                <SingleSelect
                                    label="seconds"
                                    getLabel={getPollingDisplay}
                                    onChange={onPollingTimeChange}
                                    value={pollingTime}
                                    options={pollingOptions}
                                    getValue={getPollingValue}
                                    noclear
                                    required
                                    helperText='Auto Refresh '
                                />
                            </Box>
                        
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
                                    placeholder="Search for Event Type(s), Entrance(s), Controller(s), Person(s) or Access group(s)" // replace with const variable
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
                        <EventLogTable 
                            page={page}
                            rowsPerPage={rowsPerPage}
                            onPageChange={handlePageChange}
                            onRowsPerPageChange={handleRowsPerPageChange}
                            eventsCount={eventsCount}
                            // paginatedEvents
                            logs={paginatedEvents}
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