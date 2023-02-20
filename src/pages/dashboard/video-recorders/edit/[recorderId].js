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
import videoRecorderApi from "../../../../api/videorecorder";
import { getVideoRecorderEditLink, getVideoRecorderListLink, getVideoRecorderDetailsLink } from "../../../../utils/video-recorder";
import { authDeviceApi } from "../../../../api/auth-devices";
import { serverDownCode } from "../../../../api/api-helpers";
import { ServerDownError } from "../../../../components/dashboard/errors/server-down-error";

const EditVideoRecorder = () => {
    const isMounted = useMounted();
    const { recorderId }  = router.query; 
    const [videoRecorderInfo, setVideoRecorderInfo] = useState(null)
    const [controllerValidations, setControllerValidations] = useState({
        invalidIP:false,
        invalidEntrance:false,
    })

    const getVideoRecorder = async(recorderId) => {
        try{
            Promise.resolve(videoRecorderApi.getRecorder(recorderId)) 
            .then( async res=>{
                if(res.status==200){
                    const data = await res.json()
                    setVideoRecorderInfo(data)
                    //getPairs(data)
                }
                else {
                    if (res.status == serverDownCode) {
                        setServerDownOpen(true);
                    }
                    toast.error("Video recorder info not found")
                    //router.replace(getControllerListLink())
                }
            })
        }catch(err){console.log(err)}
    }


    const getInfo = useCallback(async() => {
        setStatusLoaded(false)
        getVideoRecorder(recorderId)
        //getStatus()
    }, [isMounted])

    useEffect(() => {
        getInfo();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps 
    [])

    const [submitted, setSubmitted] = useState(false);

    const changeText = (e) => {
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

    const submitForm = (e) => {
        e.preventDefault();
        setSubmitted(true)
        Promise.resolve(videoRecorderApi.updateController(controllerInfo),toast.loading("Attempting to update controller"))
        .then(res=>{
            toast.dismiss()
            if(res.status!=200){
                toast.error("Error updating controller")
            setSubmitted(false)
            }
            else{
                toast.success("Controller info updated")
                //router.replace(getControllerListLink())
            }
        }).then(
        Promise.resolve(authDeviceApi.assignEntrance(E1))
        .then(res=>{
            if(res.status==200){
                toast.success("Entrance E1 updated")
            }
            else(toast.error("Failed to update entrance E1"))
        }),
        Promise.resolve(authDeviceApi.assignEntrance(E2))
        .then(res=>{
            if(res.status==200){
                toast.success("Entrance E2 updated")
            }
            else(toast.error("Failed to update entrance E2"))
        })
        )
    }
    return(
        <>
            <Head>
                <title>
                    Etlas: Edit Video Recorder
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
                <Container maxWidth="xl">
                    <Box sx={{ mb: 4 }}>
                      
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
                                    Video Recorders
                                </Typography>
                            </Link>
                 
                    </Box>
                    <Box marginBottom={3}>
                        <Typography variant="h3">
                            Edit Recorders
                        </Typography>
                    </Box>
                    <form onSubmit={submitForm}>
                        <Stack spacing={3}>
                                <ControllerEditForm
                                controllerInfo={videoRecorderInfo}
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
                                <Grid item
                                marginRight={3}>
                                    <Button
                                        type="submit"
                                        size="large"
                                        variant="contained"
                                        disabled={
                                            submitted||
                                            controllerValidations.invalidIP||
                                            controllerValidations.invalidEntrance
                                        }
                                    >
                                        Submit
                                    </Button>
                                </Grid>
                                <Grid item>
                                
                                        <Button
                                            size="large"
                                            variant="outlined"
                                            color="error"
                                        >
                                            Cancel
                                        </Button>
                              
                                </Grid>                              
                            </Grid>
                        </Stack>
                    </form>
                </Container>
            </Box>
        </>
    )
}

EditVideoRecorder.getLayout = (page) => (
    <AuthGuard>
        <DashboardLayout>
            { page }
        </DashboardLayout>
    </AuthGuard>
)

export default EditVideoRecorder;