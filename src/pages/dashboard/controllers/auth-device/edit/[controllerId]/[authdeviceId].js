import { useEffect, useState, useCallback } from "react";
import NextLink from "next/link";
import Head from "next/head";
import { Link, Box, Container, Typography, Stack, Button, Grid } from "@mui/material";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { AuthGuard } from '../../../../../../components/authentication/auth-guard';
import { DashboardLayout } from '../../../../../../components/dashboard/dashboard-layout';
import { useMounted } from "../../../../../../hooks/use-mounted";
import toast from "react-hot-toast";
import router from "next/router";
import formUtils from "../../../../../../hooks/use-mounted";
import accessGroupEntranceApi from "../../../../../../api/access-group-entrance-n-to-n";
import ControllerEditForm from "../../../../../../components/dashboard/controllers/controller-edit-form";
import AssignAuthDevice from "../../../../../../components/dashboard/controllers/assign-auth-device";
import { getAuthdeviceDetailsLink, getControllerDetailsLink, getControllerDetailsLinkWithId, getControllerListLink } from "../../../../../../utils/controller";
import { controllerApi } from "../../../../../../api/controllers";
import { authDeviceApi } from "../../../../../../api/auth-devices";
import AuthdeviceEditForm from "../../../../../../components/dashboard/controllers/auth-device/auth-device-edit-form";

const EditAuthDevice = () => {
    const isMounted = useMounted();
    const { authdeviceId }  = router.query; 
    const { controllerId }  = router.query; 
    // console.log(authdeviceId)
    const [deviceInfo, setDeviceInfo] = useState()

    const getDevice = async(authdeviceId) => {
        try{
            Promise.resolve(authDeviceApi.getAuthDevice(authdeviceId)) 
            .then( async res=>{
                if(res.status==200){
                    const data = await res.json()
                    setDeviceInfo(data)
                    console.log("getDevice",data)
                }
                else{
                    toast.error("Device info not found")
                    router.replace(getControllerListLink) //maybe go back to controller details?
                }
            })
        }catch(err){console.log(err)}
    }

    const [authMethodList, setAuthMethodList ] = useState([])
    const getAuthMethodList = async () => {
        authDeviceApi.getAllAuthMethods().then(async(res)=>{
            setAuthMethodList(await res.json())
            // console.log('a',authMethodList)
        }
        )
    }

    const getInfo = useCallback(async() => {
        getDevice(authdeviceId)
        getAuthMethodList()
    }, [isMounted])

    useEffect(() => {
        getInfo();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps 
    [])



    


    
    //change deviceInfo methods
    const changeText = (e) => {
        // console.log(controllerInfo)
        setDeviceInfo(prevState=>({...prevState,authDeviceName:e.target.value}) )
    }
    const masterpinHandler = () => {
        if(deviceInfo.masterpin==true){
            setDeviceInfo(prevState=>({...prevState,masterpin:false}))
        }
        if(deviceInfo.masterpin==false){
            setDeviceInfo(prevState=>({...prevState,masterpin:true}))
        }
    }

    const defaultAuthMethodHandler = (e) => {
        // console.log(controllerInfo)
        const newAuthMethod = {
            authMethodId:e.target.value,
        }
        setDeviceInfo(prevState=>({...prevState,defaultAuthMethod:newAuthMethod}) )
    }

        
    const [submitted, setSubmitted] = useState(false);
    const submitForm = (e) => {
        e.preventDefault();
        setSubmitted(true);
        authDeviceApi.updateAuthdevice(deviceInfo, deviceInfo.authDeviceId)
        .then(res => {
            if(res.status == 200) {
                toast.success("Update success");
                router.replace(getControllerDetailsLinkWithId(controllerId));   
            } else {
                toast.error("Failed to update authentication device");
                setSubmitted(false);
            }
        });
    }

    return(
        <>
            <Head>
                <title>
                    Etlas: Edit Auth Device
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
                            href={getControllerDetailsLinkWithId(controllerId)} 
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
                                    Controller Details
                                </Typography>
                            </Link>
                        </NextLink>
                    </Box>
                    <Box marginBottom={3}>
                        <Typography variant="h3">
                            Edit Authentication Device
                        </Typography>
                    </Box>
                    <form onSubmit={submitForm}>
                        <Stack spacing={3}>
                            <AuthdeviceEditForm
                            deviceInfo={deviceInfo}
                            changeText={changeText}
                            masterpinHandler={masterpinHandler}
                            defaultAuthMethodHandler={defaultAuthMethodHandler}
                            authMethodList={authMethodList}
                            />
                            <Grid container>
                                <Grid item marginRight={3}>
                                    <Button
                                        type="submit"
                                        size="large"
                                        variant="contained"
                                        disabled={
                                            submitted
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
                                        href={getAuthdeviceDetailsLink(authdeviceId)} 
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

EditAuthDevice.getLayout = (page) => (
    <AuthGuard>
        <DashboardLayout>
            { page }
        </DashboardLayout>
    </AuthGuard>
)

export default EditAuthDevice;