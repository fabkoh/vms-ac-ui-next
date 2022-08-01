import { useEffect, useState, useCallback } from "react";
import NextLink from "next/link";
import Head from "next/head";
import { Link, Box, Container, Typography, Stack, Button, Grid } from "@mui/material";
import ArrowBack from "@mui/icons-material/ArrowBack";
import AccessGroupEditForm from "../../../../components/dashboard/access-groups/forms/access-group-add-form";
import { AuthGuard } from '../../../../components/authentication/auth-guard';
import { DashboardLayout } from '../../../../components/dashboard/dashboard-layout';
import { personApi } from "../../../../api/person";
import { accessGroupApi } from "../../../../api/access-groups";
import entranceApi from "../../../../api/entrance";
import { useMounted } from "../../../../hooks/use-mounted";
import toast from "react-hot-toast";
import router from "next/router";
import formUtils from "../../../../utils/form-utils";
import accessGroupEntranceApi from "../../../../api/access-group-entrance-n-to-n";
import ControllerEditForm from "../../../../components/dashboard/controllers/controller-edit-form";
import AssignAuthDevice from "../../../../components/dashboard/controllers/assign-auth-device";
import { getControllerDetailsLink, getControllerListLink } from "../../../../utils/controller";
import { controllerApi } from "../../../../api/controllers";
import { authDeviceApi } from "../../../../api/auth-devices";

const EditController = () => {
    const isMounted = useMounted();
    const { controllerId }  = router.query; 

    const [controllerInfo, setControllerInfo] = useState()
    const [controllerValidations, setControllerValidations] = useState({
        invalidIP:false,
        invalidEntrance:false,
    })
    const [E1, setE1] = useState()
    const [E2, setE2] = useState()
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
                else{
                    toast.error("Controller info not found")
                    router.replace(getControllerListLink)
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
        getEntrances(E1,E2)
        setE1(E1)
        setE2(E2)
    }

    const [statusLoaded, setStatusLoaded] = useState(false)
    const getStatus = async() => {
            Promise.resolve(controllerApi.getAuthStatus(controllerId),toast.loading("Fetching status..."))
            .then(async res=>{
                toast.dismiss()
                if(res.status!=200){
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
                // setAuthStatus(E1)
                // setE2Status(E2)
            })
        // }catch(err){console.log(err)}
        // setStatusLoaded(true)
    }


    const getInfo = useCallback(async() => {
        setStatusLoaded(false)
        getController(controllerId)
        getStatus()
    }, [isMounted])

    useEffect(() => {
        getInfo();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps 
    [])

    // fetch all entrance info
    const [allEntrances, setAllEntrances] = useState([]);
    const getEntrances = async(E1,E2) => {
        const toUpdate =[...allEntrances]
        Promise.resolve(authDeviceApi.getAvailableEntrances())
        .then(async res=>{
            if(res.status==200){
                // toast.success("Successfully fetched entrance info")
                const data = await res.json()
                data.forEach(data=>toUpdate.push(data))
                E1?(E1[0].entrance?toUpdate.push(E1[0].entrance):false):false
                E2?(E2[0].entrance?toUpdate.push(E2[0].entrance):false):false
            }
            else{toast.error("Failed to fetch entrance data")}
        })        
       
        setAllEntrances(toUpdate)
        
    }
    
    

    const [submitted, setSubmitted] = useState(false);


    //change controllerInfo
    const changeText = (e) => {
        // console.log(controllerInfo)
        setControllerInfo(prevState=>({...prevState,controllerName:e.target.value}) )
    }
    const changeIPStatic = (e) => {
        if(controllerInfo.controllerIPStatic==true){
        setControllerInfo(prevState=>({...prevState,controllerIP:"",controllerIPStatic:false}))
        setControllerValidations(prevState=>({...prevState,invalidIP:false}))
        }
        if(controllerInfo.controllerIPStatic==false){
            setControllerInfo(prevState=>({...prevState ,controllerIPStatic:true}))
            // setControllerValidations(prevState=>({...prevState,invalidIP:true}))
        }
        console.log(controllerInfo)
    }
    const changeIP = (e) => {
        setControllerInfo(prevState=>({...prevState,controllerIP:e.target.value}))
    }
    const checkIP = (e) => {
        if(controllerInfo.controllerIPStatic){
            const invalid = !/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(e.target.value)
            setControllerValidations(prevState=>({...prevState,invalidIP:invalid}))
        }
        else{setControllerValidations(prevState=>({...prevState,invalidIP:false}))}
    }

    const e1Handler = (e) => {
        console.log("e.target.value",e.target.value)
        const newArr=[...E1]
        newArr.forEach(dev=> dev.entrance=e.target.value)
        setE1(newArr)
        entranceChecker(E1,E2)
    }
    const e2Handler = (e) => {
        const newArr=[...E2]
        newArr.forEach(dev=> dev.entrance=e.target.value)
        setE2(newArr)
        entranceChecker(E1,E2)
    }
    const entranceChecker = (e1,e2) => {
        if(e1[0].entrance&&e2[0].entrance){ //only check when got entrance. else both null is fine.
            if(e1[0].entrance==e2[0].entrance){
                setControllerValidations(prevState=>({...prevState,invalidEntrance:true}))
            }
            else{setControllerValidations(prevState=>({...prevState,invalidEntrance:false}))}
        }
        else{setControllerValidations(prevState=>({...prevState,invalidEntrance:false}))} 
    }
    useEffect(() => {
        console.log(E1,E2)
    }, [E1,E2])
    useEffect(() => {
        console.log(controllerValidations)
    }, [controllerValidations])
    
    
    const changeIPHandler = (e) => {
        changeIP(e);
        checkIP(e);
    }
    const [loading, setLoading] = useState(true)
    // const submitForm = (e) => {
    //     e.preventDefault();
       
    //     Promise.resolve(authDeviceApi.assignEntrance(E1))
    //     .then(res=>{
    //         if(res.status==200){
    //             toast.success("Entrance E1 updated")
    //         }
    //         else(toast.error("Failed to update entrance E1"))
    //     }),
    //     Promise.resolve(authDeviceApi.assignEntrance(E2))
    //     .then(res=>{
    //         if(res.status==200){
    //             toast.success("Entrance E2 updated")
    //         }
    //         else(toast.error("Failed to update entrance E2"))
    //     })
        
    // }
    const submitForm = (e) => {
        e.preventDefault();
        setSubmitted(true)
        Promise.resolve(controllerApi.updateController(controllerInfo),toast.loading("Attempting to update controller"))
        .then(res=>{
            toast.dismiss()
            if(res.status!=200){
                toast.error("Error updating controller")
            setSubmitted(false)
            }
            else{
                toast.success("Controller info updated")
                router.replace(getControllerListLink())
            }
        }).then(
        Promise.resolve(authDeviceApi.assignEntrance(E1))
        .then(res=>{
            if(res.status==200){
                toast.success("Entrance E1 updated")
            }
            else(toast.error("Failed to update entrance E1"))
        })).then(
        Promise.resolve(authDeviceApi.assignEntrance(E2))
        .then(res=>{
            if(res.status==200){
                toast.success("Entrance E2 updated")
            }
            else(toast.error("Failed to update entrance E2"))
        })).then(
            Promise.resolve(authDeviceApi.updateUnicon())
            .then(res=>{
                if(res.status==200){
                    toast.success("Updated Controllers")
                }
                else(toast.error("Failed to update entrance E1"))
            }))
    }
    return(
        <>
            <Head>
                <title>
                    Etlas: Edit Controller
                </title>
            </Head>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    py: 8
                }}
            >
                <Container maxWidth="xl">
                    <Box sx={{ mb: 4 }}>
                        <NextLink
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
                                <ArrowBack
                                    fontSize="small"
                                    sx={{ mr: 1 }}
                                />
                                <Typography variant="subtitle2">
                                    Controllers
                                </Typography>
                            </Link>
                        </NextLink>
                    </Box>
                    <Box marginBottom={3}>
                        <Typography variant="h3">
                            Edit Controller
                        </Typography>
                    </Box>
                    <form onSubmit={submitForm}>
                        <Stack spacing={3}>
                                <ControllerEditForm
                                controllerInfo={controllerInfo}
                                changeText={changeText}
                                changeIPStatic={changeIPStatic}
                                changeIPHandler={changeIPHandler}
                                controllerValidations={controllerValidations}
                                />
                                <AssignAuthDevice
                                authPair={E1}      
                                statusLoaded={statusLoaded}
                                status={authStatus}
                                allEntrances={allEntrances}
                                changeEntrance={e1Handler}
                                controllerValidations={controllerValidations}
                                />
                                <AssignAuthDevice  
                                authPair={E2}    
                                statusLoaded={statusLoaded}
                                status={authStatus}
                                allEntrances={allEntrances}
                                changeEntrance={e2Handler}
                                controllerValidations={controllerValidations}
                                />
                            <Grid container>
                                <Grid item marginRight={3}>
                                    <Button
                                        type="submit"
                                        size="large"
                                        variant="contained"
                                        disabled={
                                            submitted||
                                            controllerValidations.invalidIP||
                                            controllerValidations.invalidEntrance
                                        }
                                        // disabled={
                                        //     submitted                      ||
                                        //     accessGroupInfoArr.length == 0 || // no access groups to submit
                                        //     accessGroupValidationsArr.some( // check if validations fail
                                        //         validation => validation.accessGroupNameBlank        ||
                                        //                       validation.accessGroupNameExists       ||
                                        //                       validation.accessGroupNameDuplicated   ||
                                        //                       validation.accessGroupPersonDuplicated
                                        //     )
                                        // }
                                    >
                                        Submit
                                    </Button>
                                </Grid>
                                <Grid item>
                                    <NextLink
                                        href={getControllerDetailsLink(controllerId)} 
                                        passHref
                                    >
                                        <Button
                                            size="large"
                                            variant="outlined"
                                            color="error"
                                        >
                                            Cancel
                                        </Button>
                                    </NextLink>
                                </Grid>                              
                            </Grid>
                        </Stack>
                    </form>
                </Container>
            </Box>
        </>
    )
}

EditController.getLayout = (page) => (
    <AuthGuard>
        <DashboardLayout>
            { page }
        </DashboardLayout>
    </AuthGuard>
)

export default EditController;