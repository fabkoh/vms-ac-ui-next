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
import toast from "react-hot-toast";
import { Confirmdelete } from '../../../../components/dashboard/controllers/confirm-delete';
import { ConfirmReset } from '../../../../components/dashboard/controllers/confirm-reset';
import { set } from "date-fns";
import AccessGroupDetails from "../../../../components/dashboard/entrances/details/entrance-access-group-details";
import { BuildCircle, DoorFront, LockOpen, Refresh } from "@mui/icons-material";
import ConfirmStatusUpdate from "../../../../components/dashboard/entrances/list/confirm-status-update";
import { entranceCreateLink, entranceListLink, getEntranceEditLink } from "../../../../utils/entrance";
import EntranceSchedules from "../../../../components/dashboard/entrances/details/entrance-schedules";
import { entranceScheduleApi } from "../../../../api/entrance-schedule";
import { getEntranceScheduleEditLink } from "../../../../utils/entrance-schedule";
import { controllerApi } from "../../../../api/controllers";
import { ControllerBasicDetails } from "../../../../components/dashboard/controllers/details/controller-basic-details";
import AuthDevicePair from "../../../../components/dashboard/controllers/details/controller-auth-device-pair";
import { getControllerEditLink, getControllerListLink } from "../../../../utils/controller";
import { authDeviceApi } from "../../../../api/auth-devices";
import ControllerEventsManagement from "../../../../components/dashboard/controllers/details/controller-event-management";
import { eventsManagementCreateLink } from "../../../../utils/eventsManagement";
import { eventsManagementApi } from "../../../../api/events-management";
import { serverDownCode } from "../../../../api/api-helpers";
import { ServerDownError } from "../../../../components/dashboard/errors/server-down-error";

const ControllerDetails = () => {

    // load entrance details
    const isMounted = useMounted();
    const { controllerId }  = router.query; //change to controller Id
    // console.log("controllerId",controllerId)
    useEffect(() => { // copied from original template
        gtm.push({ event: 'page_view' });
    }, [])
    const [serverDownOpen, setServerDownOpen] = useState(false);

    const [controllerInfo, setControllerInfo] = useState(null)
    const [controllerEventManagements, setControllerEventManagements] = useState([]);
    const [E1, setE1] = useState()
    const [E2, setE2] = useState()
    const [currentAuth,setCurrentAuth] = useState()
    const [authStatus, setAuthStatus] = useState({})

    const getController = async(controllerId) => {
        try{
            Promise.resolve(controllerApi.getController(controllerId)) 
            .then( async res=>{
                if(res.status==200){
                    const data = await res.json()
                    setControllerInfo(data)
                    // console.log("getController",data)
                    getPairs(data)
                }
                else {
                    if (res.status == serverDownCode) {
                        toast.error("Error loading controller info due to server is down");
                    } else {
                        toast.error("Controller info not found")
                    }
                    router.replace(getControllerListLink());
                    return;
                }
            })
        }catch(err){console.log(err)}
    }

    const getControllerEventManagements = async() => {
        try {
            const eventManagements = await eventsManagementApi.getControllerEventsManagement(controllerId);

            if (eventManagements.status == 200) {
                const body = await eventManagements.json();
                if (isMounted()) {
                    setControllerEventManagements(body);
                }
            }
            else {
                if (eventManagements.status == serverDownCode) {
                    setServerDownOpen(true);
                }
                toast.error("Error loading controller event managements");
                setControllerEventManagements([]);
            }
        }
        catch (err) {
            console.error(err);
        }
    }

    const getPairs = (controllerInfo) => {
        const E1=[]
        const E2=[]
        controllerInfo.authDevices.forEach(dev=>{
            if(dev.authDeviceDirection.includes('E1')){
                E1.push(dev)
            }
            else{E2.push(dev)}
        })
        setE1(E1)
        setE2(E2)
    }
    const [statusLoaded, setStatusLoaded] = useState(false)
    const getStatus = async() => {
            toast.loading("Fetching status...")
            controllerApi.getAuthStatus(controllerId)
            .then(async res=>{
                toast.dismiss()
                if(res.status!=200){
                    setStatusLoaded(true)
                    if (res.status == serverDownCode) {
                        setServerDownOpen(true);
                    }
                    toast.error("Failed to fetch status");
                }
                else{
                    setStatusLoaded(true)
                    toast.success("Status successfully fetched")
                    const data = await res.json();
                    console.log(data)
                    setAuthStatus(data)
                }
                // setAuthStatus(E1)
                // setE2Status(E2)
            })
        // }catch(err){console.log(err)}
        // setStatusLoaded(true)
    }

    const getAllCurrentAuthMethod = async(controllerId) => {
        var authmethod = {}
        try{
            Promise.resolve(controllerApi.getAllCurrentAuthMethod(controllerId)) 
            .then( async res=>{
                if(res.status==200){
                    const data = await res.json()
                    // console.log(data)
                    setCurrentAuth(data)
                }
                else{
                    console.log("ERROR")
                }
            })
        }catch(err){console.log(err)}
    }

    const getCurrentAuthMethod = (authdeviceId) => {
        if (currentAuth){
            // console.log(typeof(currentAuth))
            // console.log()
            // current = currentAuth.authDeviceId
            console.log(currentAuth)
            console.log(authdeviceId,currentAuth[authdeviceId])
            return currentAuth[authdeviceId]
            // return currentAuth[authdeviceId]
        }


    }


    const getInfo = useCallback(async() => {
        setStatusLoaded(false)
        getController(controllerId)
        getAllCurrentAuthMethod(controllerId)
        getStatus()
        getControllerEventManagements();
    }, [isMounted])

    useEffect(() => {
        // getController(1)
        // getPairs(controllerInfo)
        getInfo();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps 
    [])

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

    //Set to true if controller is selected. controls form input visibility.
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

    const deleteController = async(e) => {
        e.preventDefault();
        toast.loading("Deleting Controller...");
        controllerApi.deleteController(controllerId)
        .then(async res =>{
            console.log(res);
            toast.dismiss();

            if (res.status != 204) {
                toast.error('Delete unsuccessful', {duration:3000})
            }
            else{                                           
                toast.success('Delete success');
                router.replace(getControllerListLink());
            }
        })
            //const res = controllerApi.deleteController(controllerId);
        
        setDeleteOpen(false);
    };

    //dk if needed - leave it here first
	/*const deleteEntrance = async() => {
        Promise.resolve(
            entranceApi.deleteEntrance(controllerId)
        ).then((res)=>{
            if (res.status == 204){
                toast.success('Delete success');
               // router.replace(controllerListLink);
            }
            else{
                toast.error('Delete unsuccessful')
            }
        })
        setDeleteOpen(false);
    }; */


    //Reset controller
    const [resetOpen, setResetOpen] = useState(false);

    const handleResetOpen = () => {        
		setResetOpen(true);                        
	};
	const handleResetClose = () => {
		setResetOpen(false);
	}
	const resetController = async() => {
        controllerApi.resetController(controllerId), toast.loading("Resetting Controller...")
        .then(async res =>{
            toast.dismiss()

            if (res.status != 204) {
                toast.error('Reset unsuccessful', {duration: 3000})
            }
            else{
                toast.success('Reset success');
                router.replace(getControllerListLink());
            }
        })

        setResetOpen(false);
    }; 

    //delete auth devices
   /* const deleteAuthDevices = async(selectedAuthDevices) => {
        //console.log(selectedAuthDevices);

        Promise.all(selectedAuthDevices.map(id=>{
            return authDeviceApi.deleteAuthdevice(id)
        }), toast.loading("Removing Selected Authentication Device(s)..."))
        .then(resArr => {
            toast.dismiss()

            resArr.filter(res=>{
                if(res.status != 200) {
                    toast.error('Remove unsuccessful')
                }
                else {
                    toast.success('Remove success', {duration:2000})
                }
            })
            getInfo();
        })
    }

    //reset auth devices
    const resetAuthDevices = async(selectedAuthDevices) => {
        Promise.all(selectedAuthDevices.map(id=>{
            return authDeviceApi.deleteAuthdevice(id)
        }), toast.loading("Resetting Selected Authentication Device(s)..."))
        .then(resArr => {
            toast.dismiss()

            resArr.filter(res=>{
                if(res.status != 200) {
                    toast.error('Reset unsuccessful')
                }
                else {
                    toast.success('Reset success', {duration:2000})
                }
            })
            getInfo();
        })
    } */

    const handleToggleMasterpinE1 = async (id,e) => {
        const bool = e.target.checked;
        const verb = bool ? 'activated' : 'deactivated';
        const newInfo = [...E1]
        try {
            const res = await (bool ? authDeviceApi.enableMasterpin(id) : authDeviceApi.disableMasterpin(id));
            if (res.status != 200) throw new Error("Failed to send req");
            toast.success(`Successfully ${verb} masterpin`);
            newInfo.filter(dev => dev.authDeviceId==id)[0]['masterpin'] = bool
            setE1(newInfo)
            console.log(newInfo.filter(dev => dev.authDeviceId==id)[0]['masterpin'] ) 
            return true
        } catch(e) {
            console.error(e);
            const errorVerb = bool ? 'activate' : 'deactivate';
            toast.error(`Failed to ${errorVerb} masterpin`);
            return false
        }
    }

    
    const handleToggleMasterpinE2 = async (id,e) => {
        const bool = e.target.checked;
        const verb = bool ? 'activated' : 'deactivated';
        const newInfo = [...E2]
        try {
            const res = await (bool ? authDeviceApi.enableMasterpin(id) : authDeviceApi.disableMasterpin(id));
            if (res.status != 200) throw new Error("Failed to send req");
            toast.success(`Successfully ${verb} masterpin`);
            newInfo.filter(dev => dev.authDeviceId==id)[0]['masterpin'] = bool
            setE2(newInfo)
            console.log(newInfo.filter(dev => dev.authDeviceId==id)[0]['masterpin'] ) 
            return true
        } catch(e) {
            console.error(e);
            const errorVerb = bool ? 'activate' : 'deactivate';
            toast.error(`Failed to ${errorVerb} masterpin`);
            return false
        }
    }

	const removeEntranceButton = (authPair) => async(e) => {
        //e.preventDefault();
        authDeviceApi.removeEntrance(authPair)
                     .then(res => {
                         if(res.status!=200) { toast.success("Error removing entrance"); }
                         else {
                            toast.success("Successfully removed entrance");
                            getInfo();
                         }
                     });
	}

    //delete entrance event managements 
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
    // render view
    return (
        <>
            <Head>
                <title>
                    Etlas: Controller Details
                </title>
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
                <Container maxWidth="md">
                    <div>
                        <Box sx={{ mb: 4 }}>
                            <NextLink
                                // href={`/dashboard/controllers/auth-device/id?=${1}`} 
                                href={getControllerListLink()} 
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
                                        fontSize="small"
                                        sx={{ mr: 1 }}
                                    />
                                    <Typography variant="subtitle2">Controllers</Typography>
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
                                        {/* hi test */}
                                        { controllerInfo? controllerInfo.controllerName: "Controller Not Found" }    
                                    </Typography>    
                                </div>    
                            </Grid>
                            <Grid
                                item
                                sx={{ m: -1 }}
                            >
                                <Button 
                                variant="contained" // add refresh fn here. refetch or refresh entire page?
                                sx={{m:1}}
                                onClick={getInfo}
                                endIcon={(
                                    <Refresh fontSize="small"/>
                                )}
                                >Refresh        
                                </Button>
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
                                        href={getControllerEditLink(controllerInfo)}
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
                                    setActionAnchor={setActionAnchor} 
                                    open={deleteOpen}
                                    message={"Are you sure you want to delete controller(s)? This action cannot be undone. Authentication devices of selected controller(s) will be deleted."}
                                    handleDialogClose={handleDeleteClose}
                                    deleteControllers={deleteController} />

                                    <MenuItem 
                                        disableRipple
                                        onClick={handleResetOpen}
                                    >
                                        <BuildCircle />
                                        &#8288;Reset
                                    </MenuItem>
                                    <ConfirmReset 
                                    setActionAnchor={setActionAnchor} 
                                    open={resetOpen}
                                    handleDialogClose={handleResetClose}
                                    resetControllers={resetController} />

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
                                <ControllerBasicDetails
                                statusLoaded={statusLoaded}
                                controller={controllerInfo}
                                authStatus={authStatus}
                                />
                            </Grid>                         
                            <Grid
                                item
                                xs={12}
                            >
                                <AuthDevicePair
                                authPair={E1}
                                controllerId={controllerId}
                                status={authStatus}
                                statusLoaded={statusLoaded}
                                getCurrentAuthMethod={getCurrentAuthMethod}
                                handleToggleMasterpin={handleToggleMasterpinE1}
                                removeEntrance={() => removeEntranceButton(E1)}
                                />
                            </Grid>                         
                            <Grid
                                item
                                xs={12}
                            >
                                <AuthDevicePair
                                removeEntrance={() => removeEntranceButton(E2)}
                                authPair={E2}
                                controllerId={controllerId}
                                status={authStatus}
                                statusLoaded={statusLoaded}
                                getCurrentAuthMethod={getCurrentAuthMethod}
                                handleToggleMasterpin={handleToggleMasterpinE2}
                                />
                            </Grid>                         
                       
                            <Grid
                                    item
                                    xs={12}
                                >
                                    <ControllerEventsManagement  
                                        controllerEventManagements={controllerEventManagements}
                                        deleteEventManagements={deleteEventManagements}
                                        eventsManagementCreateLink={eventsManagementCreateLink} 
                                    />
                            </Grid>
                            </Grid>
                    </Box>
                </Container>
            </Box>
        </>
    )
}

ControllerDetails.getLayout = (page) => (
    <AuthGuard>
        <DashboardLayout>
            { page }
        </DashboardLayout>
    </AuthGuard>
)

export default ControllerDetails;