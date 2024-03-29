import { useCallback, useEffect, useState } from "react";
import { useMounted } from "../../../../../../hooks/use-mounted"
import { gtm } from "../../../../../../lib/gtm";
import NextLink from 'next/link';
import Head from 'next/head';
import router, { Router, useRouter } from 'next/router';
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
import { ChevronDown } from "../../../../../../icons/chevron-down";
import StyledMenu from "../../../../../../components/dashboard/styled-menu";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { AuthGuard } from "../../../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../../../components/dashboard/dashboard-layout";
import toast from "react-hot-toast";
import { BuildCircle, DoorFront, LockOpen, Refresh } from "@mui/icons-material";
import { authDeviceApi } from "../../../../../../api/auth-devices";
import { AuthDeviceBasicDetails } from "../../../../../../components/dashboard/controllers/auth-device/auth-device-basic-details";
import { getAuthdeviceEditLink, getControllerDetailsLinkWithId, getControllerListLink } from "../../../../../../utils/controller";
import AuthDeviceDelete from "../../../../../../components/dashboard/controllers/auth-device/auth-device-delete";
import AuthDeviceReset from "../../../../../../components/dashboard/controllers/auth-device/auth-device-reset";
import { controllerApi } from "../../../../../../api/controllers";
import  AuthenticationSchedules  from "../../../../../../components/dashboard/controllers/auth-device/auth-device-authentication-schedule"
import { getAuthenticationScheduleEditLink } from "../../../../../../utils/authentication-schedule";
import { authMethodScheduleApi } from "../../../../../../api/authentication-schedule";
import { serverDownCode } from "../../../../../../api/api-helpers";
import { ServerDownError } from "../../../../../../components/dashboard/errors/server-down-error";

const AuthDeviceDetails = () => {

    const router = useRouter();
    // load entrance details
    const isMounted = useMounted();
    const { authDeviceId }  = router.query; //change to auth device id
    const { controllerId }  = router.query; //change to auth device id
    const [serverDownOpen, setServerDownOpen] = useState(false);
    const [currentAuth,setCurrentAuth] = useState()

    const link = getAuthenticationScheduleEditLink(controllerId,authDeviceId);
    const [authenticationSchedules, setauthenticationSchedules] = useState([]);

    useEffect(() => { // copied from original template
        gtm.push({ event: 'page_view' });
    }, [])

    const [deviceInfo, setDeviceInfo] = useState(null)

    const getAuthDevice = async() => {
        try{
            const res = await authDeviceApi.getAuthDevice(authDeviceId)
            if (res.status != 200) {
                if (res.status == serverDownCode) {
                    toast.error("Error loading auth devices due to server is down");
                } else {
                    toast.error("Device not found");
                }
                router.replace(getControllerListLink());
                return;
            }
            const data = await res.json()
            if(isMounted()){
                setDeviceInfo(data)
                // console.log("getauth device",data)
            }
        }catch(err){console.log(err),router.replace(getControllerListLink())}
    }

    const getAuthenticationSchedules = async () => {
        authDeviceApi.getAuthenticationSchedules(authDeviceId).then(async (res) => {
            if (res.status == 200) {
                setauthenticationSchedules(await res.json())
            } else {
                if (res.status == serverDownCode) {
                    setServerDownOpen(true);
                }
                toast.error("Error loading authentication schedules");
                setauthenticationSchedules([]);
            }
            // console.log('a',authMethodList)
        }
        )
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

    const [authStatus, setAuthStatus] = useState({})
    const [statusLoaded, setStatusLoaded] = useState(false)
    const getStatus = async() => {
        setStatusLoaded(false)
            Promise.resolve(controllerApi.getAuthStatus(controllerId),toast.loading("Fetching status..."))
            .then(async res=>{
                toast.dismiss()
                if (res.status != 200) {
                    if (res.status == serverDownCode) {
                        setServerDownOpen(true);
                    }
                    setStatusLoaded(true)
                    toast.error("Failed to fetch status")
                }
                else{
                    setStatusLoaded(true)
                    toast.success("Status successfully fetched")
                    const data = await res.json();
                    console.log(data)
                    setAuthStatus(data)
                }
            })
    }

    //delete entrance schedules
   /* const deleteSchedules = async(ids) => {
        const resArr = await Promise.all(ids.map(entranceScheduleApi.deleteEntranceSchedule));
    
        if (resArr.some(res => res.status != 204)) {
            toast.error('Failed to delete some entrance schedules')
        }

        const numSuccess = resArr.filter(res => res.status == 204).length
        if (numSuccess) {
            toast.success(`Deleted ${numSuccess} entrance schedules`)
        }

        getInfo();
    } */

    //delete authDevice Schedules
    const deleteAuthDeviceSchedules = async(ids) => {
        const resArr = await Promise.all(ids.map(id => authMethodScheduleApi.deleteAuthDeviceSchedule(id)));
    
        if (resArr.some(res => res.status != 204)) {
            toast.error('Failed to delete some authentication schedules')
        }

        const numSuccess = resArr.filter(res => res.status == 204).length
        if (numSuccess) {
            toast.success(`Deleted ${numSuccess} authentication schedules`);
        }

        getInfo();
    }

    const getInfo = useCallback(async() => {
        //get authDevice info and controller status
        getStatus()
        getAuthDevice()
        getAllCurrentAuthMethod(controllerId)
        getAuthenticationSchedules()
    }, [isMounted])

    useEffect(() => {
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
	}
	const handleDeleteClose = () => {
		setDeleteOpen(false);
	}
	const deleteAuthDevice = async() => {
        toast.loading("Removing Authentication Device...");
        Promise.resolve(authDeviceApi.deleteAuthdevice(authDeviceId))
        .then(res => {
            toast.dismiss();
            if(res.status != 200) {
                toast.error("Remove unsuccessful");
            } else {
                toast.success("Successfully removed Authentication Device");
                router.replace(getControllerDetailsLinkWithId(controllerId));
            }
        });
        setDeleteOpen(false);
    }

    //for reset auth devices
    const [resetOpen, setResetOpen] = useState(false);

    const handleResetOpen = () => {        
		setResetOpen(true);                        
	}
	const handleResetClose = () => {
		setResetOpen(false);
	}
	const resetAuthDevice = async() => {
        toast.loading("Resetting Authentication Device...");
        authDeviceApi.resetAuthDevice(authDeviceId)
        .then(res => {
            toast.dismiss();
            if(res.status != 200) {
                toast.error('Reset unsuccessful');
            } else {
                toast.success("Reset Authentication Device success");
                getInfo();
            }
        });
        setResetOpen(false);
    }

    const handleToggleMasterpin = async (e) => {
        const bool = e.target.checked;
        const verb = bool ? 'activated' : 'deactivated';
        try {
            const res = await (bool ? authDeviceApi.enableMasterpin(authDeviceId) : authDeviceApi.disableMasterpin(authDeviceId));
            if (res.status != 200) throw new Error("Failed to send req");
            toast.success(`Successfully ${verb} masterpin`);
            setDeviceInfo(prevState=>({...prevState,masterpin:bool}));
            return true
        } catch(e) {
            console.error(e);
            const errorVerb = bool ? 'activate' : 'deactivate';
            toast.error(`Failed to ${errorVerb} masterpin`);
            return false
        }
    }



    // render view
    // if (!deviceInfo) {
    //     return router.replace(getControllerListLink());
    // }
    return (
        <>
            <Head>
                <title>
                    Etlas: Auth Device Details
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
                    handleDialogClose={() => { setServerDownOpen(false) }}
                />
                <Container maxWidth="md">
                    <div>
                        <Box sx={{ mb: 4 }}>
                            <NextLink
                                href={getControllerDetailsLinkWithId(controllerId)} //change to controller details view
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
                                    <Typography variant="subtitle2">Controller Details</Typography>
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
                                        { deviceInfo? deviceInfo.authDeviceName: "Device Not Found" }    
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
                                endIcon={(
                                    <Refresh fontSize="small"/>
                                )}
                                onClick={getInfo}
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
                                        href={getAuthdeviceEditLink(controllerId,authDeviceId)}
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
                                   <AuthDeviceDelete
                                        setActionAnchor={setActionAnchor}
                                        open={deleteOpen}
                                        handleDialogClose={handleDeleteClose}
                                        deleteAuthDevices={deleteAuthDevice}
                                    />

                                    <MenuItem 
                                        disableRipple
                                        onClick={handleResetOpen}
                                    >
                                        <BuildCircle />
                                        &#8288;Reset
                                    </MenuItem>
                                    <AuthDeviceReset
                                        setActionAnchor={setActionAnchor}
                                        open={resetOpen}
                                        handleDialogClose={handleResetClose}
                                        resetAuthDevices={resetAuthDevice}
                                    />
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
                                <AuthDeviceBasicDetails
                                deviceInfo={deviceInfo}
                                statusLoaded={statusLoaded}
                                authStatus={authStatus}
                                getCurrentAuthMethod={getCurrentAuthMethod}
                                handleToggleMasterpin={handleToggleMasterpin}
                                />
                            </Grid>   
                            <Grid
                                item
                                xs={12}
                            >
                                <AuthenticationSchedules 
                                    deviceInfo={deviceInfo}
                                    authenticationSchedules={authenticationSchedules}
                                    deleteSchedules={deleteAuthDeviceSchedules}
                                    link={link} 
                                />
                            </Grid>                       
                        </Grid>
                    </Box>
                </Container>
            </Box>
        </>
    )
}

AuthDeviceDetails.getLayout = (page) => (
    <AuthGuard>
        <DashboardLayout>
            { page }
        </DashboardLayout>
    </AuthGuard>
)

export default AuthDeviceDetails;