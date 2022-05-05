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

const ControllerDetails = () => {

    // load entrance details
    const isMounted = useMounted();
    const [entrance, setEntrance] = useState(null);
    const { controllerId }  = router.query; //change to controller Id
    // console.log("controllerId",controllerId)
    useEffect(() => { // copied from original template
        gtm.push({ event: 'page_view' });
    }, [])

    const [controllerInfo, setControllerInfo] = useState(null)
    const [E1, setE1] = useState()
    const [E1Status, setE1Status] = useState([])
    const [E2, setE2] = useState()
    const [E2Status, setE2Status] = useState([])

    const getController = async(controllerId) => {
        try{
            Promise.resolve(controllerApi.getController(controllerId)) 
            .then( async res=>{
                if(res.status==200){
                    const data = await res.json()
                    setControllerInfo(data)
                    console.log("getController",data)
                    getPairs(data)
                }
                else{
                    toast.error("Controller info not found")
                    router.replace(getControllerListLink())
                }
            })
        }catch(err){console.log(err)}
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
        const E1 = []
        const E2 = []
        // try{
        //     const res = await controllerApi.getAuthStatus(controllerId);
        //     const data = await res.json();
        //     data.forEach(status =>{
        //         if(status.includes("E1")){
        //             E1.push(status)
        //         }
        //         else{E2.push(status)}
        //     })
        // }catch(err){console.log(err)}
        try{
            Promise.resolve(controllerApi.getAuthStatus(controllerId))
            .then(async res=>{
                toast.dismiss()
                if(res.status!=200){
                    setStatusLoaded(true)
                    // toast.error("Failed to fetch status")
                }
                else{
                    setStatusLoaded(true)
                    // toast.success("Status successfully fetched")
                    const data = await res.json();
                    data.forEach(status=>{
                        if(status.includes("E1")){
                            E1.push(status)
                        }
                        else{E2.push(status)}
                    })
            }
            })
        }catch(err){console.log(err)}
        // setStatusLoaded(true)
        setE1Status(E1)
        setE2Status(E2)
        console.log("E1,E2",E1,E2)
    }


    const getInfo = useCallback(async() => {
        getController(controllerId)
        getStatus()
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
            entranceApi.deleteEntrance(controllerId)
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
    if (!controllerInfo) {
        return null;
    }
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
                                <ControllerBasicDetails
                                statusLoaded={statusLoaded}
                                controller={controllerInfo}
                                E1Status={E1Status}
                                E2Status={E2Status}
                                />
                            </Grid>                         
                            <Grid
                                item
                                xs={12}
                            >
                                <AuthDevicePair
                                authPair={E1}
                                controllerId={controllerId}
                                status={E1Status}
                                statusLoaded={statusLoaded}
                                />
                            </Grid>                         
                            <Grid
                                item
                                xs={12}
                            >
                                <AuthDevicePair
                                authPair={E2}
                                controllerId={controllerId}
                                status={E2Status}
                                statusLoaded={statusLoaded}
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