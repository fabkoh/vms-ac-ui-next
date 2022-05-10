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
import { getControllerListLink } from "../../../../utils/controller";
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
    const [authStatus, setAuthStatus] = useState(null)

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
    // const initialEntrance = (E1,E2) => {
    //     const toUpdate = [...allEntrances]
    //     E1[0]?.entrance? toUpdate.push(E1[0].entrance):false
    //     E2[0]?.entrance? toUpdate.push(E2[0].entrance):false
    //     setAllEntrances(toUpdate)
    // }
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
    // useEffect(() => {
    //     console.log("controllerValidations",controllerValidations)
    // }, [controllerValidations])
    
    // const getController = useCallback( async() => {
    //     try {
    //         const res = await controllerApi.getController(router.query.controllerId);
    //         if (res.status == 200) {
    //             const body = await res.json();
    //             setControllerInfo(body);
    //             console.log("getcontroller",body)
    //         } else {
    //             throw new Error("Controller info not loaded");
    //         }
    //     } catch(e) {
    //         console.error(e);
    //         toast.error("Controller info not loaded");
    //     }
    // }, [isMounted]);

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
    const isEntranceMounted = useMounted();
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
    // const getEntrances = useCallback( async() => {
    //     const toUpdate =[...allEntrances]
    //     Promise.resolve(authDeviceApi.getAvailableEntrances())
    //     .then(async res=>{
    //         if(res.status==200){
    //             const data = await res.json()
    //             toUpdate.push(data)
    //         }
    //     })
    //     .then(
    //         E1?(E1[0].entrance?toUpdate.push(E1[0].entrance):false):false,
    //         E2?(E2[0].entrance?toUpdate.push(E2[0].entrance):false):false,
    //     )
    //     .then(setAllEntrances(toUpdate))
    // }, [isEntranceMounted]);
    // const getEntrances = useCallback( async() => {
    //     try {
    //         const res = await authDeviceApi.getAvailableEntrances();
    //         if (res.status == 200) {
    //             const body = await res.json();
    //             setAllEntrances(body)
    //             // console.log("avail ent",body)
    //         } else {
    //             throw new Error("Entrances not loaded");
    //         }
    //     } catch(e) {
    //         console.error(e);
    //         toast.error("Entrances info not loaded")
    //     }
    // }, [isEntranceMounted]);


    // useEffect(() => {
    //     getEntrances();    
    // },
    // // eslint-disable-next-line react-hooks/exhaustive-deps
    // [])

    useEffect(() => {
        console.log('allEntrances',allEntrances)
    }, [allEntrances])
    
    // store previous access group names
    // const [accessGroupNames, setAccessGroupNames] = useState({});
    // useEffect(() => {
    //     accessGroupApi.getAccessGroups()
    //         .then(async res => {
    //             const newAccessGroupNames = {}
    //             if (res.status == 200) {
    //                 const body = await res.json();
    //                 body.forEach(group => newAccessGroupNames[group.accessGroupName] = true); 
    //                 setAccessGroupNames(newAccessGroupNames);
    //             }
    //         })
    // }, []);
    

    // helper for remove card and changeNameCheck
    // directly modifies validationArr

    
    // update methods for form inputs
    const changeTextField = (e, id) => {
        const updatedInfo = [ ...accessGroupInfoArr ];
        // this method is reliant on text field having a name field == key in info object ie accessGroupName, accessGroupDesc
        updatedInfo.find(info => info.accessGroupId == id)[e.target.name] = e.target.value;
        setAccessGroupInfoArr(updatedInfo);
    }

    const changePerson = (newValue, id) => {
        const updatedInfo = [ ...accessGroupInfoArr ];
        updatedInfo.find(info => info.accessGroupId == id).persons = newValue;
        setAccessGroupInfoArr(updatedInfo);
    }

    // entrance logic
    // const changeEntrance = (newValue, id) => {
    //     const updatedInfo = [ ...accessGroupInfoArr ];
    //     updatedInfo.find(info => info.accessGroupId == id).entrances = newValue;
    //     setAccessGroupInfoArr(updatedInfo);
    // }

    // currying for cleaner code
    const onEntranceChangeFactory = (id) => (newValue) => changeEntrance(newValue, id);
    const onNameChangeFactory = (id) => (e) => {
        changeTextField(e, id);
        changeNameCheck(e, id);
    }

    const [submitted, setSubmitted] = useState(false);

    // const submitForm = async e => {
    //     e.preventDefault(); 

    //     setSubmitted(true);

    //     const resArr = await Promise.all(accessGroupInfoArr.map(group => accessGroupApi.updateAccessGroup(group)));
        
    //     const successStatus = [];
    //     const successfulResIndex = [];

    //     resArr.forEach((res, i) => {
    //         if(res.status == 200) {
    //             successStatus.push(true);
    //             successfulResIndex.push(i);
    //         } else {
    //             successStatus.push(false);
    //         }
    //     });

    //     const entranceResArr = await Promise.all(
    //         successfulResIndex.map(i => {
    //             const accessGroup = accessGroupInfoArr[i];
    //             return accessGroupEntranceApi.assignEntrancesToAccessGroup(
    //                 accessGroup.entrances.map(e => e.entranceId),
    //                 accessGroup.accessGroupId
    //             );
    //         })
    //     )
    //     entranceResArr.forEach((res, i) => {
    //         if (res.status != 204) {
    //             successStatus[successfulResIndex[i]] = false;
    //         }
    //     })

    //     const numEdited = successStatus.filter(status => status).length;
    //     if (numEdited) {
    //         toast.success(`${numEdited} access groups edited`);
    //         if (numEdited == resArr.length) { // all success
    //             router.replace('/dashboard/access-groups');
    //             return;
    //         }
    //     }

    //     toast.error('Error updating the below access groups');
    //     setAccessGroupInfoArr(accessGroupInfoArr.filter((e, i) => !(successStatus[i])));
    //     setAccessGroupValidationsArr(accessGroupValidationsArr.filter((e, i) => !(successStatus[i])));
    //     setSubmitted(false);
    // }

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
                router.replace('/dashboard/controllers')
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
                                        href={getControllerListLink()} 
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