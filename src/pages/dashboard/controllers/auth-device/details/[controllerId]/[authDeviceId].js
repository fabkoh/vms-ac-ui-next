import { useCallback, useEffect, useState } from "react";
import { useMounted } from "../../../../../../hooks/use-mounted"
import { gtm } from "../../../../../../lib/gtm";
// import accessGroupEntranceApi from "../../../../../../api/access-group-entrance-n-to-n";
import entranceApi from "../../../../../../api/entrance";
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
// import AddIcon from '@mui/icons-material/Add';
import { AuthGuard } from "../../../../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../../../../components/dashboard/dashboard-layout";
// import { EntranceBasicDetails } from "../../../../../../components/dashboard/entrances/details/entrance-basic-details";
import toast from "react-hot-toast";
// import { Confirmdelete } from '../../../../../../components/dashboard/entrances/confirm-delete';
// import { set } from "date-fns";
// import AccessGroupDetails from "../../../../../../components/dashboard/entrances/details/entrance-access-group-details";
import { BuildCircle, DoorFront, LockOpen, Refresh } from "@mui/icons-material";
// import ConfirmStatusUpdate from "../../../../../../components/dashboard/entrances/list/confirm-status-update";
import { entranceCreateLink, entranceListLink, getEntranceEditLink } from "../../../../../../utils/entrance";
// import EntranceSchedules from "../../../../../../components/dashboard/entrances/details/entrance-schedules";
// import { entranceScheduleApi } from "../../../../../../api/entrance-schedule";
import { getEntranceScheduleEditLink } from "../../../../../../utils/entrance-schedule";
// import { controllerApi } from "../../../../../../api/controllers";
// import { ControllerBasicDetails } from "../../../../../../components/dashboard/controllers/details/controller-basic-details";
// import AuthDevicePair from "../../../../../../components/dashboard/controllers/details/controller-auth-device-pair";
import { authDeviceApi } from "../../../../../../api/auth-devices";
import { AuthDeviceBasicDetails } from "../../../../../../components/dashboard/controllers/auth-device/auth-device-basic-details";
// import { AuthDeviceBasicDetails } from "../../../../../components/dashboard/controllers/auth-devices/auth-device-basic-details";

const AuthDeviceDetails = () => {

    const router = useRouter();
    // load entrance details
    const isMounted = useMounted();
    const [entrance, setEntrance] = useState(null);
    // const { entranceId }  = router.query; //change to auth device id
    // console.log(router.query)

    useEffect(() => { // copied from original template
        gtm.push({ event: 'page_view' });
    }, [])

    const [deviceInfo, setDeviceInfo] = useState(null)

    const getAuthDevice = async(authDeviceId) => {
        try{
            const res = await authDeviceApi.getAuthDevice(router.query.authDeviceId)
            if(res.status!=200){
                toast.error("Device not found")
            }
            const data = await res.json()
            if(isMounted()){
                setDeviceInfo(data)
                console.log("getauth device",data)
            }
        }catch(err){console.log(err)}
    }
    // const getAuthDevice = async(authDeviceId) => {
    //     try{
    //         Promise.resolve(authDeviceApi.getAuthDevice(authDeviceId)) 
    //         .then( async res=>{
    //             if(res.status==200){
    //                 const data = await res.json()
    //                 setDeviceInfo(data)
    //                 console.log("auth device data",data)
    //                 // getPairs(data)
    //             }
    //             else{
    //                 toast.error("authentication device info not found")
    //             }
    //         })
    //     }catch(err){console.log(err)}
    // }
    // const getPairs = (deviceInfo) => {
    //     const E1=[]
    //     const E2=[]
    //     deviceInfo.authDevice.forEach(dev=>{
    //         if(dev.authDeviceDirection.includes('E1')){
    //             E1.push(dev)
    //         }
    //         else{E2.push(dev)}
    //     })
    //     setE1(E1)
    //     setE2(E2)
    // }


    // const link = getEntranceScheduleEditLink(entranceId);

    const [entranceSchedules, setEntranceSchedules] = useState([]);

    const [accessGroup, setAccessGroup] = useState([]);
    const [entranceIsActive, setEntranceIsActive] = useState();


    const getInfo = useCallback(async() => {
        //get entrance and access group entrance
        // getEntrance();
        // getAccessGroups();
        // getEntranceSchedules();
        // getAuthDevice(1)
    }, [isMounted])

    useEffect(() => {
        // getController(1)
        // getPairs(deviceInfo)
        getAuthDevice(1)
        // getInfo();
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





    // render view
    // if (!entrance) {
    //     return null;
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
                <Container maxWidth="md">
                    <div>
                        <Box sx={{ mb: 4 }}>
                            <NextLink
                                href={`/dashboard/controllers/details/${router.query.controllerId}`} //change to controller details view
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
                                    {/* <NextLink
                                        href={getEntranceEditLink([entrance])}
                                        passHref
                                    > */}
                                        <MenuItem disableRipple>
                                            <EditIcon />
                                            &#8288;Edit
                                        </MenuItem>
                                    {/* </NextLink> */}
                                    <MenuItem
                                        disableRipple
                                        onClick={handleDeleteOpen}
                                    >
                                        <DeleteIcon />
                                        &#8288;Delete
                                    </MenuItem>
                                    <MenuItem 
                                        disableRipple
                                        // onClick={handleMultiUnlock}
                                        // disabled={!entranceActive}
                                    >
                                        <BuildCircle />
                                        &#8288;Reset
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
                                <AuthDeviceBasicDetails
                                deviceInfo={deviceInfo}
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