import { useCallback, useEffect, useState } from "react";
import { useMounted } from "../../../../hooks/use-mounted"
import { gtm } from "../../../../lib/gtm";
import accessGroupEntranceApi from "../../../../api/access-group-entrance-n-to-n";
import entranceApi from "../../../../api/entrance";
import NextLink from 'next/link';
import Head from 'next/head';
import router from 'next/router';
import { 
    Box, 
    Grid, 
    MenuItem, 
    Typography, 
    Container, 
    Link, 
    Button 
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ChevronDown } from "../../../../icons/chevron-down";
import StyledMenu from "../../../../components/dashboard/styled-menu";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { AuthGuard } from "../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../components/dashboard/dashboard-layout";
import { EntranceBasicDetails } from "../../../../components/dashboard/entrances/details/entrance-basic-details";
import toast from "react-hot-toast";
import { Confirmdelete } from '../../../../components/dashboard/entrances/confirm-delete';
import { set } from "date-fns";
import AccessGroupDetails from "../../../../components/dashboard/entrances/details/entrance-access-group-details";
import { DoorFront, LockOpen } from "@mui/icons-material";
import ConfirmStatusUpdate from "../../../../components/dashboard/entrances/list/confirm-status-update";
import { entranceCreateLink, entranceListLink, getEntranceEditLink } from "../../../../utils/entrance";
import EntranceSchedules from "../../../../components/dashboard/entrances/details/entrance-schedules";
import { entranceScheduleApi } from "../../../../api/entrance-schedule";
import { getEntranceScheduleEditLink } from "../../../../utils/entrance-schedule";
import { controllerApi } from "../../../../api/controllers";
import EntranceEventsManagement from "../../../../components/dashboard/entrances/details/entrance-event-management";
import { eventsManagementCreateLink } from "../../../../utils/eventsManagement";
import { eventsManagementApi } from "../../../../api/events-management";
import { ServerDownError } from "../../../../components/dashboard/errors/server-down-error";
import { serverDownCode } from "../../../../api/api-helpers";

const EntranceDetails = () => {

    // load entrance details
    const isMounted = useMounted();
    const [entrance, setEntrance] = useState(null);
    const { entranceId } = router.query;
    const [serverDownOpen, setServerDownOpen] = useState(false);

    useEffect(() => { // copied from original template
        gtm.push({ event: 'page_view' });
    }, [])

    const link = getEntranceScheduleEditLink(entranceId);

    const [entranceSchedules, setEntranceSchedules] = useState([]);
    const [entranceEventManagements, setEntranceEventManagements] = useState([]);
    const [accessGroup, setAccessGroup] = useState([]);
    const [entranceIsActive, setEntranceIsActive] = useState();
    const [entranceController, setEntranceController] = useState({}); // map entranceId to controller

    const getControllers = async() => {
        try {
            const res = await controllerApi.getControllers();
            if (res.status != 200) {
                if (res.status == serverDownCode) {
                    setServerDownOpen(true);
                }
                throw 'cannot load controllers'
            };
            const body = await res.json();
            const temp = {};
            body.forEach(con => {
                const authArr = con.authDevices;
                if (Array.isArray(authArr)) {
                    authArr.forEach(auth => {
                        const entranceId = auth.entrance?.entranceId;
                        if (entranceId) temp[entranceId] = con;
                    });
                }
            });
            setEntranceController(temp);
        } catch(e) {
            console.error(e);
            toast.error("Entrance controllers failed to load");
        }
    };

    const getAccessGroups = async () => {
        try {
            const res = await accessGroupEntranceApi.getAccessGroupWhereEntranceId(entranceId);
            if (res.status == 200) {
                const body = await res.json();
                if (isMounted()) {
                    setAccessGroup(body);
                }
            } else {
                if (res.status == serverDownCode) {
                    setServerDownOpen(true);
                }
                toast.error('Error loading access group info');
                setAccessGroup([]);
                throw new Error('Access Group info not loaded');
            }
        } catch(err) {
            console.error(err);
        }
    }


    const getEntrance = useCallback(async() => {
        try {
            const res = await entranceApi.getEntrance(entranceId);
            if (res.status != 200) {
                if (res.status == serverDownCode) {
                    toast.error("Entrance not found due to server is down. Please try again later")
                } else {
                    toast.error('Entrance not found');
                }
                router.replace(entranceListLink);
                return;
            }
            const body = await res.json();

            if (isMounted()) {
                setEntrance(body);
                getAccessGroups(body.entranceId);
                setEntranceIsActive(body.isActive);
            }
        } catch(err) {
            console.error(err);
        }
    });

    const getEntranceSchedules = async() => {
        try {
            const scheduleRes = await entranceScheduleApi.getEntranceSchedulesWhereEntranceIdsIn(entranceId);

            if (scheduleRes.status == 200) {
                const body = await scheduleRes.json();
                if (isMounted()) {
                    setEntranceSchedules(body);
                }
            }
            else {
                if (res.status == serverDownCode) {
                    setServerDownOpen(true);
                }
                toast.error("Error loading entrance schedule info");
                setEntranceSchedules([]);
            }
        }
        catch (err) {
            console.error(err);
        }
    }

    
const getEntranceEventsManagement = useCallback(async () => {
    try {
        //const data = await personApi.getFakePersons() 
        const res = await eventsManagementApi.getEntranceEventsManagement(entranceId);

        if (res.status == 200) {
            const data = await res.json()
            if (isMounted()) {
                console.log(data)
                setEntranceEventManagements(data);
            }
        } else {
            if (res.status == serverDownCode) {
                setServerDownOpen(true);
            }
            toast.error("Error loading entrance events management info");
            setEntranceEventManagements([]);
        }
    } catch (err) {
        console.error(err);
    }
}, [isMounted]);



    const getInfo = useCallback(async() => {
        //get entrance and access group entrance
        getEntrance();
        getAccessGroups();
        getEntranceSchedules();
        getEntranceEventsManagement();
        getControllers();
    }, [isMounted])

    useEffect(() => {
        getInfo();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps 
    [entranceIsActive])

    // actions menu open/close
  /*  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState(null) // which component to anchor action menu to
    const actionMenuOpen = Boolean(actionMenuAnchorEl);
    const handleActionMenuOpen = (e) => { setActionMenuAnchorEl(e.currentTarget); }
    const handleActionMenuClose = () => { setActionMenuAnchorEl(null); } */

    const [actionAnchor, setActionAnchor] = useState(null);
    const open = Boolean(actionAnchor);
    const handleActionClick = (e) => { setActionAnchor(e.currentTarget); }
    const handleActionClose = () => { setActionAnchor(null); }

    //for delete button
    const [deleteOpen, setDeleteOpen] = useState(false);

    //Set to true if an entrance is selected. controls form input visibility.
	const [selectedState, setselectedState] = useState(false);
	const checkSelected = () => {
		setselectedState(true)
	};
	useEffect(() => {
		checkSelected()
	});

	const handleDeleteOpen = () => {        
		setDeleteOpen(true);                        
	};
	const handleDeleteClose = () => {
		setDeleteOpen(false);
	}
	const deleteEntrance = async() => {
        Promise.resolve(
            entranceApi.deleteEntrance(entranceId)
        ).then((res)=>{
        if (res.status == 204){
            toast.success('Delete success');
            router.replace(entranceListLink);
        }
        else{
            toast.error('Delete unsuccessful')
        }
        })
        setDeleteOpen(false);
    }; 
    
    //delete entrance schedule 
     const deleteSchedules = async(ids) => {
        const resArr = await Promise.all(ids.map(entranceScheduleApi.deleteEntranceSchedule));
    
        if (resArr.some(res => res.status != 204)) {
            toast.error('Failed to delete some entrance schedules')
        }

        const numSuccess = resArr.filter(res => res.status == 204).length
        if (numSuccess) {
            toast.success(`Deleted ${numSuccess} entrance schedules`)
        }

        getInfo();
    }

    // delete entrance Event Managements
    const deleteEventManagements = async(ids) => {
        console.log(ids)
        const resArr = await Promise.all(ids.map(eventsManagementApi.deleteEventsManagement));
    
        if (resArr.some(res => res.status != 200)) {
            toast.error('Failed to delete some Events Managements')
        }

        const numSuccess = resArr.filter(res => res.status == 200).length
        if (numSuccess) {
            toast.success(`Deleted ${numSuccess} Events Managements`)
        }

        getInfo();
    }

    // for updating status
    const [statusUpdateId, setStatusUpdateId] = useState([]);
    const [updateStatus, setUpdateStatus] = useState(null);
    const [statusUpdateDialogOpen, setStatusUpdateDialogOpen] = useState(false);
    const openStatusUpdateDialog = (entranceId, updatedStatus) => {
        setStatusUpdateId(entranceId);
        setUpdateStatus(updatedStatus);
        setStatusUpdateDialogOpen(true);
    }
    const handleStatusUpdateDialogClose = () => {
        setStatusUpdateDialogOpen(false);
        handleActionClose();
    }

    //entrance IsActive now
    const entranceActive = entranceIsActive == true;

    const handleMultiEnable = () => openStatusUpdateDialog(entranceId, true);
    const handleMultiUnlock = () => openStatusUpdateDialog(entranceId, false);
    const handleStatusUpdate = async (entranceId, updatedStatus) => {
        handleStatusUpdateDialogClose();

        Promise.resolve(
            entranceApi.updateEntranceStatus(entranceId, updatedStatus)
        ).then((res)=>{
            if (res.status == 200) {
                toast.success("Successfully " + (updatedStatus ? "activated" : "unlocked") + " entrance");
            } else {
                toast.error("Failed to " + (updatedStatus ? "activate" : "unlock") + " entrance");
            }
        })

        const newEntrance = () => {
            if (entranceId.includes(entrance.entranceId)) {
                entrance.isActive = updatedStatus;
                setEntranceIsActive(updatedStatus);
            }
        };
        setEntrance(newEntrance);
    }

    // render view
    if (!entrance) {
        return null;
    }
    return (
        <>
            <Head>
                <title>
                    Etlas: Entrance Details
                </title>
            </Head>
            <ConfirmStatusUpdate
                entranceIds={statusUpdateId}
                open={statusUpdateDialogOpen}
                handleDialogClose={handleStatusUpdateDialogClose}
                updateStatus={updateStatus}
                handleStatusUpdate={handleStatusUpdate}
            />
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
                <Container maxWidth="md">
                    <div>
                        <Box sx={{ mb: 4 }}>
                            <NextLink
                                href={entranceListLink}
                                passHref
                            >
                                <Link
                                    color="textPrimary"
                                    component="a"
                                    sx={{
                                        alignItems: 'center',
                                        display: 'flex'
                                    }}
                                >
                                    <ArrowBackIcon
                                        fontSize="smal"
                                        sx={{ mr: 1 }}
                                    />
                                    <Typography variant="subtitle2">Entrances</Typography>
                                </Link>
                            </NextLink>
                        </Box>
                        <Grid
                            container
                            justifyContent="space-between"
                            spacing={3}
                        >
                            <Grid
                                item
                                sx={{
                                    alignItems: 'center',
                                    display: 'flex',
                                    overflow: 'hidden'
                                }}
                            >
                                <div>
                                    <Typography variant="h4">
                                        { entrance.entranceName || "Entrance Not Found" }    
                                    </Typography>    
                                </div>    
                            </Grid>
                            <Grid
                                item
                                sx={{ m: -1 }}
                            >
                                <Button
                                    endIcon={(
                                        <ChevronDown fontSize="small" />
                                    )}
                                    sx={{ m: 1 }}
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
                                    <NextLink
                                        href={entranceCreateLink}
                                        passHref
                                    >
                                        <MenuItem disableRipple>
                                            <AddIcon />
                                            &#8288;Create
                                        </MenuItem>
                                    </NextLink>
                                    <NextLink
                                        href={getEntranceEditLink([entrance])}
                                        passHref
                                    >
                                        <MenuItem disableRipple>
                                            <EditIcon />
                                            &#8288;Edit
                                        </MenuItem>
                                    </NextLink>
                                    <MenuItem
                                        disableRipple
                                        onClick={handleDeleteOpen}
                                    >
                                        <DeleteIcon />
                                        &#8288;Delete
                                    </MenuItem>
                                   <Confirmdelete 
                                    selectedState={selectedState}
                                    setActionAnchor={setActionAnchor}
                                    open={deleteOpen}
                                    handleDialogClose={handleDeleteClose}
                                    deleteEntrances={deleteEntrance}/>
                                    
                                    <MenuItem 
                                        disableRipple
                                        onClick={handleMultiEnable}
                                        disabled={entranceActive}
                                    >
                                        <DoorFront />
                                        &#8288;Activate
                                    </MenuItem>
                                    <MenuItem 
                                        disableRipple
                                        onClick={handleMultiUnlock}
                                        disabled={!entranceActive}
                                    >
                                        <LockOpen />
                                        &#8288;Unlock
                                    </MenuItem>
                                </StyledMenu>
                            </Grid>
                        </Grid>
                    </div>
                    <Box sx={{ mt: 3 }}>
                        <Grid
                            container
                            spacing={3}
                        >
                            <Grid
                                item
                                xs={12}
                            >
                                <EntranceBasicDetails entrance={entrance}
                                    entranceController={entranceController} />
                            </Grid>
                            <Grid
                                item
                                xs={12}
                            >
                                <AccessGroupDetails accessGroupEntrance ={accessGroup} />
                            </Grid>
                            <Grid
                                item
                                xs={12}
                            >
                                <EntranceSchedules 
                                    entrance={entrance}
                                    entranceSchedules={entranceSchedules}
                                    deleteSchedules={deleteSchedules}
                                    link={link} 
                                />
                            </Grid>
                            <Grid
                                item
                                xs={12}
                            >
                                <EntranceEventsManagement  
                                    entrance={entrance}
                                    entranceEventManagements={entranceEventManagements}
                                    deleteEventManagements={deleteEventManagements}
                                    eventsManagementCreatelink={eventsManagementCreateLink} 
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </Container>
            </Box>
        </>
    )
}

EntranceDetails.getLayout = (page) => (
    <AuthGuard>
        <DashboardLayout>
            { page }
        </DashboardLayout>
    </AuthGuard>
)

export default EntranceDetails;