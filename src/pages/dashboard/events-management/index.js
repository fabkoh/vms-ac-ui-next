import { Add, Delete, DoorFront, Edit, HelpOutline, LockOpen } from "@mui/icons-material";
import { Box, Button, Card, Container, Divider, Grid, InputAdornment, MenuItem, TextField, Tooltip, Typography } from "@mui/material";
import Head from "next/head";
import NextLink from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import entranceApi from "../../../api/entrance";
import accessGroupEntrance from "../../../api/access-group-entrance-n-to-n";
import { AuthGuard } from "../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import StyledMenu from "../../../components/dashboard/styled-menu";
import { useMounted } from "../../../hooks/use-mounted";
import { ChevronDown } from "../../../icons/chevron-down";
import { gtm } from "../../../lib/gtm";
import { Upload } from "../../../icons/upload"; 
import { Download } from "../../../icons/download";
import { Search } from "../../../icons/search";
import { applyPagination, createFilter } from "../../../utils/list-utils";
import ConfirmStatusUpdate from "../../../components/dashboard/entrances/list/confirm-status-update";
import { Confirmdelete } from "../../../components/dashboard/events-management/confirm-delete";
import { filterEventsManagementByStringPlaceholder, filterEventsManagementByString,eventsManagementCreateLink } from "../../../utils/eventsManagement";
import { controllerApi } from "../../../api/controllers";
import { entranceScheduleApi } from "../../../api/entrance-schedule";
import  EventsManagementTable  from "../../../components/dashboard/events-management/list/events-management-table";
import { eventsManagementApi } from "../../../api/eventManagements";

const EventsManagement = [
    // for entrance 
    {
        "eventsManagementId":1,
        "eventsManagementName":"Events 1",
        "inputEvents":[
            // input w/o timer 
            {
                "inputEventId":1,
                "timerDuration":null,
                "eventActionInputType":{
                    "eventActionInputId":1,
                    "eventActionInputTypeName":"Authenticated Scan",
                    "timerEnabled":false
                }
            },
            // input with timer ( 30 secs )
            {
                "inputEventId":2,
                "timerDuration":30,
                "eventActionInputType":{
                    "eventActionInputId":2,
                    "eventActionInputTypeName":"Door Opened",
                    "timerEnabled":true
                }
            }
            
        ],
        "outputActions":[
            // output w/o timer 
            {
                "outputEventId":1,
                "timerDuration":null,
                "eventActionOutputType":{
                    "eventActionOutputId":1,
                    "eventActionOutputTypeName":"Authenticated Scan",
                    "timerEnabled":false
                }
            },
            // output with timer ( 30 secs )
            {
                "outputEventId":2,
                "timerDuration":30,
                "eventActionOutputType":{
                    "eventActionOutputId":2,
                    "eventActionOutputTypeName":"Buzzer buzzing",
                    "timerEnabled":true
                }
            },
            // output with timer ( but choose to let it go on indefinitely )
            {
                "outputEventId":3,
                "timerDuration":null,
                "eventActionOutputType":{
                    "eventActionOutputId":3,
                    "eventActionOutputTypeName":"LED light",
                    "timerEnabled":true
                }
            }
            
        ],
        "triggerSchedule":{
            "triggerScheduleId":1,
            "rrule":"DTSTART:20220701T000000Z\nRRULE:FREQ=DAILY;INTERVAL=1;WKST=MO", 
            "timeStart":"00:00",
            "timeEnd":"12:00",
        },
        "entrance":{
            "entranceId": 3,
            "entranceName": "Abandoned Entrance",
            "deleted": false
        },
        "controller":null},
    
        // for controller 
        {
            "eventsManagementId":2,
            "eventsManagementName":"Events 2",
            "inputEvents":[
                // input w/o timer 
                {
                    "inputEventId":4,
                    "timerDuration":null,
                    "eventActionInputType":{
                        "eventActionInputId":4,
                        "eventActionInputTypeName":"Authenticated Scan controller",
                        "timerEnabled":false
                    }
                },
                // input with timer ( 30 secs )
                {
                    "inputEventId":5,
                    "timerDuration":30,
                    "eventActionInputType":{
                        "eventActionInputId":5,
                        "eventActionInputTypeName":"Door Opened",
                        "timerEnabled":true
                    }
                }
                
            ],
            "outputActions":[
                // output w/o timer 
                {
                    "outputEventId":4,
                    "timerDuration":null,
                    "eventActionOutputType":{
                        "eventActionOutputId":4,
                        "eventActionOutputTypeName":"Authenticated Scan controller",
                        "timerEnabled":false
                    }
                },
                // output with timer ( 30 secs )
                {
                    "outputEventId":5,
                    "timerDuration":30,
                    "eventActionOutputType":{
                        "eventActionOutputId":5,
                        "eventActionOutputTypeName":"Buzzer buzzing controller",
                        "timerEnabled":true
                    }
                },
                // output with timer ( but choose to let it go on indefinitely )
                {
                    "outputEventId":6,
                    "timerDuration":null,
                    "eventActionOutputType":{
                        "eventActionOutputId":6,
                        "eventActionOutputTypeName":"LED light for controller",
                        "timerEnabled":true
                    }
                }
                
            ],
            "triggerSchedule":{
                "triggerScheduleId":2,
                "rrule":"DTSTART:20220701T000000Z\nRRULE:FREQ=DAILY;INTERVAL=1;WKST=MO", 
                "timeStart":"00:00",
                "timeEnd":"12:00",
            },
            "entrance":null,
            "controller":{
                "controllerId": 2,
                "controllerName": "100000005a46e105",
                "deleted": false,
                "controllerSerialNo": "100000005a46e105"
            }}
]


const applyFilter = createFilter({
    query: filterEventsManagementByString,
})

const EventsManagementList = () => {
    // copied
    useEffect(() => {
        gtm.push({ event: "page_view" });
    })

    const isMounted = useMounted();
    const [EventsManagement, setEventsManagement] = useState([]);

    const getEventsManagement = useCallback(async () => {
        try {

        const res = await eventsManagementApi.getAllEventsManagement()
    
        const data = await res.json()
            if (isMounted()) {
                setEventsManagement(data);
            }
        } catch (err) {
            console.error(err);
        }
    }, [isMounted]);
    
    
    useEffect(
        () => {
            getEventsManagement()
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    // for filtering
    const [filters, setFilters] = useState({
        query: ""
    })
    // query filter
    const queryRef = useRef(null);
    const handleQueryChange = (e) => {
        e.preventDefault();
        setFilters((prevState) => ({
            ...prevState,
            query: queryRef.current?.value
        }));
    }
    const filteredEventsManagement = applyFilter(EventsManagement, filters);

    // for selection of checkboxes
    const [selectedEventsManagement, setSelectedEventsManagement] = useState([]);
    const selectedAllEventsManagement = selectedEventsManagement.length == EventsManagement.length;
    const selectedSomeEventsManagement = selectedEventsManagement.length > 0 && !selectedAllEventsManagement;
    const handleSelectAllEventsManagement = (e) => setSelectedEventsManagement(e.target.checked ? EventsManagement.map(e => e.eventsManagementId) : []);
    const handleSelectFactory = (eventsManagementId) => () => {
        if (selectedEventsManagement.includes(eventsManagementId)) {
            setSelectedEventsManagement(selectedEventsManagement.filter(id => id !== eventsManagementId));
        } else {
            setSelectedEventsManagement([ ...selectedEventsManagement, eventsManagementId ]);
        }
    }


    


    // for pagination
    const [page, setPage] = useState(0);
    const handlePageChange = (e, newPage) => setPage(newPage);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const handleRowsPerPageChange = (e) => setRowsPerPage(parseInt(e.target.value, 10));
    const paginatedEventsManagement = applyPagination(filteredEventsManagement, page, rowsPerPage);


    useEffect(() => {
		console.log(filters)
        console.log(paginatedEventsManagement)
	}, [filters]);


    // for actions button
    const [actionAnchor, setActionAnchor] = useState(null);
    const open = Boolean(actionAnchor);
    const handleActionClick = (e) => setActionAnchor(e.currentTarget);
    const handleActionClose = () => setActionAnchor(null);
    const actionDisabled = selectedEventsManagement.length == 0;
             
    //for delete action button
	const [deleteOpen, setDeleteOpen] = useState(false); 

    const handleDeleteOpen = () => {        
		setDeleteOpen(true);           
	};
	const handleDeleteClose = () => {
		setDeleteOpen(false);
	}
	const deleteEventsManagement = async(e) => {
        e.preventDefault();
		Promise.all(selectedEventsManagement.map(id=>{
			return eventsManagementApi.deleteEventsManagement(id)
		})).then( resArr => {
			resArr.filter(res=>{
				if(res.status == 200){
					toast.success('Delete success',{duration:2000},);
				}
				else{
					toast.error('Delete unsuccessful' )
				}
			})
			getEventsManagement();
		})
		setDeleteOpen(false);
        setSelectedEventsManagement([])
	};

    // useEffect(() => {
	// 	checkSelected()
	// }, [selectedEventsManagement]);


    // // Reset selectedEventsManagement when EventsManagement change
	// useEffect(
	// 	() => {
	// 		if (selectedEventsManagement.length) {
	// 			setSelectedEventsManagement([]);
	// 		}
	// 	},
	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// 	[EventsManagement]
	// );

    return(
        <>
            <Head>
                <title>Etlas: Events Management</title>
            </Head>
            
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    py:8
                }}
            >
                <Container maxWidth="xl">
                    <Box sx={{ mb: 4 }}>
                        <Grid container justifyContent="space-between" spacing={3}>
                            <Grid item sx={{ m: 2.5 }}>
                                <Typography variant="h4">Events Management</Typography>    
                            </Grid>    
                            <Grid item>
                                <Button
                                    endIcon={<ChevronDown fontSize="small" />}
                                    sx={{ m: 2 }}
                                    variant="contained"
                                    onClick={handleActionClick}
                                >
                                    Actions
                                </Button>
                                <StyledMenu
                                    anchorEl={actionAnchor}
                                    open={open}
                                    onClose={handleActionClose}
                                >
                                    <NextLink href={eventsManagementCreateLink} passHref>
                                        <MenuItem disableRipple>
                                            <Add />
                                            &#8288;Modify
                                        </MenuItem>
                                    </NextLink>
                                    <MenuItem 
                                        disableRipple 
                                        disabled={actionDisabled}
                                        onClick={handleDeleteOpen}

                                    >
                                        <Delete />
                                        &#8288;Delete
                                    </MenuItem>
                                    <Confirmdelete
                                        setActionAnchor={setActionAnchor}
                                        open={deleteOpen} 
                                        handleDialogClose={handleDeleteClose}
                                        selectedEventsManagement={selectedEventsManagement}
                                        deleteEventsManagement={deleteEventsManagement}
                                    />    
                                </StyledMenu>
                            </Grid> 
                        </Grid>
                        <Box
                            sx={{
                                m: -1,
                                mt: 3
                            }}
                        >
                            <Button startIcon={<Upload fontSize="small" />} sx={{ m: 1 }}>Import</Button>    
                            <Button startIcon={<Download fontSize="small" />} sx={{ m: 1 }}>Export</Button>
                            <Tooltip
                                title="Excel template can be found at {}"
                                enterTouchDelay={0}
                                placement="top"
                                sx={{
                                    m: -0.5,
                                    mt: 3
                                }}>
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
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search fontSize="small" />    
                                            </InputAdornment>
                                        )
                                    }}
                                    placeholder={filterEventsManagementByStringPlaceholder}
                                />                                   
                            </Box>
                        </Box>
                        
                        <EventsManagementTable 
                            eventsManagements={paginatedEventsManagement}
                            selectedAllEventsManagement={selectedAllEventsManagement}
                            selectedSomeEventsManagement={selectedSomeEventsManagement}
                            handleSelectAllEventsManagement={handleSelectAllEventsManagement}
                            handleSelectFactory={handleSelectFactory}
                            selectedEventsManagement={selectedEventsManagement}
                            eventsManagementCount={EventsManagement.length}
                            onPageChange={handlePageChange}
                            onRowsPerPageChange={handleRowsPerPageChange}
                            page={page}
                            rowsPerPage={rowsPerPage}
                        />

                    </Card>
                </Container>    
            </Box>
        </>
    )
}

EventsManagementList.getLayout = (page) => (
    <AuthGuard>
        <DashboardLayout>{page}</DashboardLayout>
    </AuthGuard>
);

export default EventsManagementList;
