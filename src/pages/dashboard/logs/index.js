import { HelpOutline, Refresh } from "@mui/icons-material";
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
import { createFilter } from "../../../utils/list-utils";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';


function StartDateTimePicker() {
  const [startvalue, setstartValue] = useState(null);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DateTimePicker
        renderInput={(props) => <TextField {...props} />}
        label="DateTimePicker"
        value={startvalue}
        onChange={(newValue) => {
            setstartValue(newValue);
            console.log("CHANGE")
        }}
      />
    </LocalizationProvider>
  );
}

function EndDateTimePicker() {
    const [endvalue, setendValue] = useState(null);
  
    return (
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DateTimePicker
          renderInput={(props) => <TextField {...props} />}
          label="DateTimePicker"
          value={endvalue}
          onChange={(newValue) => {
            setendValue(newValue);
          }}
        />
      </LocalizationProvider>
    );
  }


const logs=[
    {
        "eventId": 1,
        "direction": "IN",
        "eventTime": (new Date()).toISOString(),
        "deleted": false,
        "person": {
            "personId": 1,
            "personFirstName": "Paul",
            "personLastName": "Atreides",
            "deleted": false
        },
        "entrance": {
            "entranceId": 1,
            "entranceName": "Main Entrance",
            "deleted": false
        },
        "accessGroup": {
            "accessGroupId": 1,
            "accessGroupName": "Dune",
            "deleted": false
        },
        "eventActionType": {
            "eventActionTypeId": 1,
            "eventActionTypeName": "Authenticated Scans",
            "isTimerEnabled": false
        },
        "controller": {
            "controllerId": 1,
            "controllerName": "5e86805e2bafd54f66cc95c3",
            "deleted": false
        }
    },
    {
        "eventId": 2,
        "direction": "OUT",
        "eventTime": (new Date()).toISOString(),
        "deleted": false,
        "person": {
            "personId": 2,
            "personFirstName": "Leto",
            "personLastName": "Atreides",
            "deleted": false
        },
        "entrance": {
            "entranceId": 2,
            "entranceName": "Side Entrance",
            "deleted": true
        },
        "accessGroup": {
            "accessGroupId": 2,
            "accessGroupName": "Not dune",
            "deleted": false
        },
        "eventActionType": {
            "eventActionTypeId": 2,
            "eventActionTypeName": "Masterpassword used",
            "isTimerEnabled": false
        },
        "controller": {
            "controllerId": 1,
            "controllerName": "5e86805e2bafd54f66cc95c3",
            "deleted": false
        }
    }
]


// fix filter, check if can import utils 
const EventStringFilterHelper = (event, query) => query === ""  
                        || (event.entrance && stringIn(query, event.entrance.entranceName)) 
                        || (event.controller &&stringIn(query, event.controller.controllerName)) 
                        || (event.eventActionType && stringIn(query, event.eventActionType.eventActionTypeName)) 
                        || (event.person &&stringIn(query, event.person.personLastName))
                        || (event.person &&stringIn(query, event.person.personFirstName)) 
                        || (event.accessGroup &&stringIn(query,event.accessGroup.accessGroupName));



const filterEventsbyString = (event, queryString) => EventStringFilterHelper(event, queryString.toLowerCase());
const applyFilter = createFilter({
    query: filterEventsbyString
})


const Logs=()=>{

useEffect(() => {
    gtm.push({ event: 'page_view' });
    }, []);

const isMounted = useMounted();
// const [currentTab, setCurrentTab] = useState("all");
const [page, setPage] = useState(0);
const [rowsPerPage, setRowsPerPage] = useState(10);

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
const filteredEvents = applyFilter(Events, filters)



const getEvents = useCallback(async () => {
    try {
  //const data = await personApi.getFakePersons() 
    const res = await eventslogsApi.getEvents()

    const data = await res.json()
        if (isMounted()) {
            setEvents(data);
        }
    } catch (err) {
        console.error(err);
    }
}, [isMounted]);

useEffect(
    () => {
        getEvents();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
);

const getInfo = useCallback(async() => {
    const eventsRes = await eventslogsApi.getEvents();
    if (eventsRes.status !== 200) {
        toast.error("Events not loaded");
        return;
    }
    const eventsJson = await eventsRes.json();
    if (isMounted()){
        setEvents(eventsJson);
    }
}, [isMounted]);

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
                        
                            <Grid item>
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
                                    placeholder="Search by Event Type(s), Entrance(s), Controller(s), Person(s), Access group(s)" // replace with const variable
                                />
                            </Box>
                        </Box>

                        <Box
                            sx={{
                                alignItems: "center",
                                display: "flex",
                                flexWrap: "wrap",
                                m: -1.5,
                                p: 3
                            }}
                        >
                                <StartDateTimePicker></StartDateTimePicker>
                                <EndDateTimePicker></EndDateTimePicker>
    
                        </Box>

                        <EventLogTable 
                            logs={filteredEvents}
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