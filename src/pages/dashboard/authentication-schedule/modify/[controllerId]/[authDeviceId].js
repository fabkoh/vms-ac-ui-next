import { useEffect, useState, useCallback } from "react";
import NextLink from "next/link";
import Head from "next/head";
import { Link, Box, Container, Typography, Stack, Button, Grid, TextField, Alert, Tooltip } from "@mui/material";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { AuthGuard } from '../../../../../components/authentication/auth-guard';
import { DashboardLayout } from '../../../../../components/dashboard/dashboard-layout';
import Add from "@mui/icons-material/Add";
import { accessGroupApi } from "../../../../../api/access-groups";
import toast from "react-hot-toast";
import router, { useRouter } from "next/router";
import formUtils from "../../../../../utils/form-utils";
import accessGroupEntranceNtoNApi from "../../../../../api/access-group-entrance-n-to-n";
import EditAccGrpSchedForm from "../../../../../components/dashboard/access-group-schedule/access-group-schedule-edit-form";
import MultipleSelectInput from "../../../../../components/dashboard/shared/multi-select-input"
import { accessGroupScheduleApi } from "../../../../../api/access-group-schedules";
import { Info } from "@mui/icons-material";
import { authMethodScheduleApi } from "../../../../../api/authentication-schedule";
import EditAuthSchedForm from "../../../../../components/dashboard/authentication-schedule/authentication-schedule-edit-form";
import { controllerApi } from "../../../../../api/controllers";
import AuthenticationAddOnError from "../../../../../components/dashboard/authentication-schedule/authentication-add-on-error";

const ModifyauthMethodSchedule = () => {
    //need to get the access group ID then entrances(get from NtoN with acc grp id) from prev page AKA accgrpdetails page
    const router = useRouter();
    const temp = router.query;
    const controllerId = temp.controllerId;
    const authDeviceId = temp.authDeviceId;

    const [open, setOpen] = useState(false);
    

    

    // const [accGrp, setAccGrp] = useState()
    const [grpToEnt, setGrpToEnt] = useState([]) // grptoent.contains grptoentId and ent obj
    const [allAuthenticationDevices, setAllAuthenticationDevices] = useState([])

    const getControllerAuthDevices = async () => {
        const res = await controllerApi.getControllers();
          if(res.status != 200) { // entrance not found
            toast.error("Authentication Devices not found");
            // router.replace("/dashboard");
        }
        const data = await res.json()
        const authdevices = [];
        // for each controller, 
        data.forEach(c => {
            const authDeviceArr = c.authDevices;
            authDeviceArr.forEach(a => a.controllerName = c.controllerName);
            authdevices.push( ...authDeviceArr );
        })

        setAllAuthenticationDevices(authdevices)

    }
    // const getAccGrp = async() => {
    //     const res = await accessGroupApi.getAccessGroup(entranceId);
    //     if(res.status != 200) { // accgrp not found
    //         toast.error("Access Group not found");
    //         // router.replace("/dashboard");
    //     }
    //     const data = await res.json();
    //     setAccGrp(data);
    //     // console.log(JSON.stringify(data))
    // }
    useEffect(() => {
        try {
            getControllerAuthDevices()
            // getAccGrp()
        } catch (error) {
            console.log(error)
        }
    }, [])
      
    //

    // empty objects for initialisation of new card
    
    const getEmptyauthMethodScheduleInfo = (authMethodScheduleId) => ({
        authMethodScheduleId,
        authMethodScheduleName:"",
        rrule:"",
        authMethod:"",
        timeStart:"",
        timeEnd:"",
    });



    const getEmptyauthMethodScheduleValidations = (authMethodScheduleId) => ({
        authMethodScheduleId,
        authMethodScheduleNameBlank: false,

        timeEndInvalid:false,
        timeStartInvalid:false,
        //Entrance valid(might not need as field is select. cannot custom add)
        untilInvalid:false,
        // submit failed
        submitFailed: false,
        overlapped : false
    });

    const [authMethodScheduleInfoArr, 
        setauthMethodScheduleInfoArr] = useState([getEmptyauthMethodScheduleInfo(0)]);
    const [authMethodScheduleValidationsArr, 
        setauthMethodScheduleValidationsArr] = useState([getEmptyauthMethodScheduleValidations(0)]);
    
    const [errorMessages, setErrorMessages] = useState([]);
    
    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
        setErrorMessages([]);
    };

    const handleErrorMessages = (res) => {
        setErrorMessages(res);
    }

    // add card logic
    //returns largest entranceId + 1
    const getNewId = () => authMethodScheduleInfoArr.map(info => info.authMethodScheduleId)
                                             .reduce((a, b) => Math.max(a, b), -1) + 1

    const addCard = () => {
        const newId = getNewId();
        setauthMethodScheduleInfoArr([ ...authMethodScheduleInfoArr, getEmptyauthMethodScheduleInfo(newId) ]);
        setauthMethodScheduleValidationsArr([ ...authMethodScheduleValidationsArr, getEmptyauthMethodScheduleValidations(newId) ]);
    }


    // remove card logic
    const removeCard = (id) => {
        const newAuthMethodScheduleInfoArr = authMethodScheduleInfoArr.filter(info => info.authMethodScheduleId != id);
        const newValidations = authMethodScheduleValidationsArr.filter(validation => validation.authMethodScheduleId != id);

        setauthMethodScheduleInfoArr(newAuthMethodScheduleInfoArr);
        setauthMethodScheduleValidationsArr(newValidations);       
    }
    
    // update methods for form inputs
    const changeTextField = (e, id) => {
        const updatedInfo = [ ...authMethodScheduleInfoArr ];
        // this method is reliant on text field having a name field == key in info object ie accessGroupName, accessGroupDesc
        updatedInfo.find(info => info.authMethodScheduleId == id)[e.target.name] = e.target.value;
        setauthMethodScheduleInfoArr(updatedInfo);
    }

    const changeAuthMethod = (e,id) => {

        const updatedInfo = [ ...authMethodScheduleInfoArr ];
        updatedInfo.find(info => info.authMethodScheduleId == id)['authMethod']= e.target.value;
        setauthMethodScheduleInfoArr(updatedInfo);
    }

    //set rrule string
    const changeRrule = (string,id) =>{
        const updatedInfo = [ ...authMethodScheduleInfoArr ];
        updatedInfo.find(info => info.authMethodScheduleId == id)['rrule']=string;
        setauthMethodScheduleInfoArr(updatedInfo);
    }
    //set timestartend
    const changeTimeStart = (start,id) =>{
        const updatedInfo = [ ...authMethodScheduleInfoArr ];
        updatedInfo.find(info => info.authMethodScheduleId == id)['timeStart']=start;
        setauthMethodScheduleInfoArr(updatedInfo);
        checkTimeStart(start,id)
    }
    const changeTimeEnd = (end,id) =>{
        const updatedInfo = [ ...authMethodScheduleInfoArr ];
        updatedInfo.find(info => info.authMethodScheduleId == id)['timeEnd']=end;
        setauthMethodScheduleInfoArr(updatedInfo);
        checkTimeEnd(end,id)
        checkClashingWeekdays()
    }

    // check for rrule 
    // if days clash, check for time

    // if clahses, return true 
    const checkRruleAndTimeClahses = (rrule1,timeStart1,timeEnd1,rrule2,timeStart2, timeEnd2) => {
        const returnStatement = false;

        if (rrule1 != undefined && rrule2 != undefined){
            console.log("rrule1: ",typeof(rrule1),rrule1,rrule1.indexOf("BYDAY="))
            console.log("rrule2: ",typeof(rrule2),rrule2,rrule2.indexOf("BYDAY="))
    
            const Weekday1 = (rrule1.slice(rrule1.lastIndexOf("BYDAY=")+6)).split(",");
            const Weekday2 = (rrule2.slice(rrule2.lastIndexOf("BYDAY=")+6)).split(",");
            
            
            Weekday2.forEach(day2 => {
                const dayExist = day1 => {
                    return day2 === day1
                    // console.log(day1,day2,)
                    
                }
                // console.log(Weekday1.some(dayExist))
                if(Weekday1.some(dayExist)){
                    // check for time 
                    // both start1 and end 1 > end 2 or both less than start 2
                    console.log(timeStart1,timeEnd1,timeStart2,timeEnd2)
                    if (!((timeStart1 > timeEnd2 && timeEnd1 > timeEnd2 ) || (timeStart1 < timeStart2 && timeEnd1 < timeStart2 ))){
                        // console.log("OVERLAPPED");
                        returnStatement = true;
                    }
                    
                }
            })
            
            console.log("rrule check for clashes : ",Weekday1,Weekday2)
        }
        
        return returnStatement;
    }

    const checkClashingWeekdays = () => {
        
        authMethodScheduleInfoArr.map(sch => { 
            
        const id = sch.authMethodScheduleId

        const newValidations = [ ...authMethodScheduleValidationsArr ];
        const newAuthMethodScheduleInfoArr = [...authMethodScheduleInfoArr]
        

        const newRrule = newAuthMethodScheduleInfoArr.find(v => v.authMethodScheduleId == id)["rrule"]
        const NewTimeStart = newAuthMethodScheduleInfoArr.find(v => v.authMethodScheduleId == id)["timeStart"];
        const NewTimeEnd = newAuthMethodScheduleInfoArr.find(v => v.authMethodScheduleId == id)["timeEnd"];

        console.log(NewTimeStart,NewTimeEnd)

        const listOfClashes = newAuthMethodScheduleInfoArr.filter(singleAuthMethodSchedule => singleAuthMethodSchedule.authMethodScheduleId != id)
        // return id of clahses 
        // check for rrule fisrt, of true, check for time 
            .filter(singleAuthMethodSchedule => checkRruleAndTimeClahses(
                newRrule,
                NewTimeStart,
                NewTimeEnd,
                singleAuthMethodSchedule.rrule,
                singleAuthMethodSchedule.timeStart,
                singleAuthMethodSchedule.timeEnd))
        

        const listOfIds = listOfClashes.map(v => v.authMethodScheduleId);
        listOfIds.forEach(Id => {
            const validation = newValidations.find(v => v.authMethodScheduleId == Id);
            validation.overlapped = true;
            setauthMethodScheduleValidationsArr(newValidations)
        })
        
        if (listOfIds.length > 0){
            const validation = newValidations.find(v => v.authMethodScheduleId == id);
            validation.overlapped = true;
            setauthMethodScheduleValidationsArr(newValidations)
        }
        
        if (listOfIds.length === 0){
            const validation = newValidations.find(v => v.authMethodScheduleId == id);
            validation.overlapped = false;
            setauthMethodScheduleValidationsArr(newValidations)
        }})




        // validation.overlappedSchedule = (formUtils.checkBlank(starttime));
        // validation.timeEndInvalid = formUtils.checkBlank(endTime);
        // console.log(validation)
        //setauthMethodScheduleValidationsArr(newValidations)
    }

    const checkTimeEnd = (end,id) => {
        const endTime = end;
        const newValidations = [ ...authMethodScheduleValidationsArr ];
        const validation = newValidations.find(v => v.authMethodScheduleId == id);
        // store a temp updated access group info
        const newAccessGroupScheduleInfoArr = [ ...authMethodScheduleInfoArr ]
        const tempStartTime = newAccessGroupScheduleInfoArr.find(group => group.authMethodScheduleId == id)['timeStart'];

        if(tempStartTime=="00:00"){
            validation.timeEndInvalid = false;
            setauthMethodScheduleValidationsArr(newValidations)
            // console.log(newValidations)
        }
        
        validation.timeEndInvalid = (formUtils.checkBlank(endTime)||endTime<=tempStartTime);
        // validation.timeEndInvalid = formUtils.checkBlank(endTime);
        // console.log(validation)
        setauthMethodScheduleValidationsArr(newValidations)
    }
    const checkTimeStart = (start,id) => {
        const starttime = start;
        const newValidations = [ ...authMethodScheduleValidationsArr ];
        const validation = newValidations.find(v => v.authMethodScheduleId == id);

        validation.timeStartInvalid = (formUtils.checkBlank(starttime));
        // validation.timeEndInvalid = formUtils.checkBlank(endTime);
        // console.log(validation)
        setauthMethodScheduleValidationsArr(newValidations)
    }

    

    // error checking methods
    const changeNameCheck = async (e, id) => {
        const authMethodScheduleName = e.target.value;
        const newValidations = [ ...authMethodScheduleValidationsArr ];
        const validation = newValidations.find(v => v.authMethodScheduleId == id);

        // store a temp updated access group info
        const tempAuthMethodScheduleInfoArr = [ ...authMethodScheduleInfoArr ]
        tempAuthMethodScheduleInfoArr.find(group => group.authMethodScheduleId == id).authMethodScheduleName = authMethodScheduleName;

        // remove submit failed
        // validation.submitFailed = false;

        // check name is blank?
        validation.authMethodScheduleNameBlank = formUtils.checkBlank(authMethodScheduleName);

        setauthMethodScheduleValidationsArr(newValidations);
    }
    //currying for cleaner code
    const onNameChangeFactory = (id) => (e) => {
        changeTextField(e, id);
        changeNameCheck(e, id);
    }


    const checkUntil = (id) =>(e) => {
        const newValidations = [ ...authMethodScheduleValidationsArr ];
        const validation = newValidations.find(v => v.authMethodScheduleId == id);
        validation.untilInvalid = e
        // console.log("newValidations",newValidations)
        setauthMethodScheduleValidationsArr(newValidations);

    }

    const replaceAll = (e) => {
        e.preventDefault();

        const authDeviceIdArr = []
        authDevices.forEach(a=>authDeviceIdArr.push(a.authDeviceId))

        authMethodScheduleApi.replaceAuthDeviceSchedules(authMethodScheduleInfoArr,authDeviceIdArr)
        .then(res =>{
            if (res.status!=200){
                return toast.error("Error replacing all schedules")
            }
            else{
                toast.success("Successfully replaced all schedules")
                controllerApi.uniconUpdater();
                router.replace(`/dashboard/controllers/auth-device/details/${controllerId}/${authDeviceId}`)
            }
        })
        
    }
    const addOn = (e) => {
        e.preventDefault();
        const authDeviceIdArr = []
        authDevices.forEach(a=>authDeviceIdArr.push(a.authDeviceId))
        authMethodScheduleApi.addAuthDeviceSchedules(authMethodScheduleInfoArr,authDeviceIdArr)
        .then(res => 
            
            
            {
            if (res.status!=200){

                

                
                (res.json()).then(data => {
                    // console.log(data);
                    // console.log(data[0])
                    
                    const array = [];
                    Object.entries(data[0]).map(([key,value]) => {
                        value.map( singleData => 
                            // console.log(key, singleData))
                            array.push([key,singleData]))


                    })

                    handleErrorMessages(array)
                    // getClashingAuthDeviceSchedule

                })
                handleClickOpen();
                    // handleErrorMessages(data))
                

       
            }
            else{
                toast.success("Schedules successfully added");
                controllerApi.uniconUpdater();
                router.replace(`/dashboard/controllers/auth-device/details/${controllerId}/${authDeviceId}`)
            }
        })

    }

    //for MultiSelectInput
    const authdeviceEqual = (option, value) => option.authDeviceId == value.authDeviceId;
    const getAuthDeviceName = (e) => {

        if (e.entrance === null){
            return `${e.controllerName}   
            \u00a0\u00a0 \u00a0\u00a0  ( No Entrance ) 
            \u00a0\u00a0 \u00a0\u00a0  ${e.authDeviceName} 
            \u00a0\u00a0  \u00a0\u00a0  (${e.authDeviceDirection})`;
        }


        return `${e.controllerName}   
            \u00a0\u00a0 \u00a0\u00a0  ${e.entrance.entranceName} 
            \u00a0\u00a0 \u00a0\u00a0  ${e.authDeviceName} 
            \u00a0\u00a0  \u00a0\u00a0  (${e.authDeviceDirection})`;

    }
    // + " "+ e.authDevices ;
    const authDeviceFilter = (authdevice, state) => {
        // console.log(entrances)
        const text = state.inputValue.toLowerCase(); // case insensitive search
        return authdevice.filter(e => (
            e.controllerName?.toLowerCase().includes(text) 
            || e.authDeviceName?.toLowerCase().includes(text) 
            || e.authDeviceDirection?.toLowerCase().includes(text) 
        ))
    }
    const [authDevices, setAuthDevices] = useState([])
    const changeAuthDevice = (newValue) => {
        console.log(newValue,"SSSSSSSS")
        setAuthDevices(newValue)
    }
    // const [grpToEntIdArr, setGrpToEntIdArr] = useState([])
    // const getGrpToEntId = (grpToEntIdArr) => {
    //     entrances.forEach(ent => {
    //         grpToEnt.forEach(obj=>{
    //             if(obj.entrance.entranceId==ent.entranceId){
    //                 grpToEntIdArr.push(obj.groupToEntranceId)
    //             }
    //         })
    //     })
    // }

    
    return(
        <>
            <Head>
                <title>
                    Etlas: Modify Authentication Device Schedules
                </title>
            </Head>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    py: 8
                }}
            >
                <AuthenticationAddOnError
                    errorMessages={errorMessages}
                    handleClose={handleClose}
                    open={open}
                />

                <Container maxWidth="xl">
                    <Box sx={{ mb: 4 }}>
                        <NextLink
                            href={`/dashboard/controllers/auth-device/details/${controllerId}/${authDeviceId}`}
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
                                    Authentication Device
                                </Typography>
                            </Link>
                        </NextLink>
                    </Box>
                    <Box marginBottom={3}>
                        <Typography variant="h3">
                            Modify Authentication Schedule
                        </Typography>
                        {/* <Grid container>
                            <Grid item mr={1}>
                        <Typography variant="body2" color="neutral.500">
                        {"Modifying for Access Group: "}
                        </Typography>
                        </Grid>
                        <Grid item>
                        <Typography variant="body2" color="neutral.500" fontWeight="bold">
                        {accGrp?accGrp.accessGroupName:"undefined"}
                        </Typography>
                        </Grid>
                        </Grid> */}
                        {/* <Typography variant="body2" color="neutral.500">
                        {accGrp?(`Modifying for Access Group: ${accGrp.accessGroupName}`):("No access Group found")}
                        </Typography> */}
                        <Alert severity="info"variant="outlined">Quick tip : You may apply these schedules to multiple authentication devices by selecting more than one authentication device </Alert>
                    </Box>
                    <Grid container alignItems="center" mb={3}>
                        <Grid item mr={2}>
                            <Typography fontWeight="bold">Authentication Device(s) :</Typography>
                        </Grid>
                        <Grid item xs={11} md={7}>
                            <MultipleSelectInput
                                options={allAuthenticationDevices}
                                setSelected={changeAuthDevice}
                                getOptionLabel={getAuthDeviceName}
                                label="Authentication Devices"
                                noOptionsText="No authentication device found"
                                placeholder="Enter controller or auth device (name, direction) to search"
                                filterOptions={authDeviceFilter}
                                value={authDevices}
                                isOptionEqualToValue={authdeviceEqual}
                                error={
                                    Boolean(authDevices.length==0)
                                }
                                helperText={
                                    Boolean(authDevices.length==0)&&"Error : no authentication device selected"
                                }
                            />
                        </Grid>
                    </Grid>
                    <form onSubmit={(e) => { e.nativeEvent.submitter.name =="add"? (addOn(e)):(replaceAll(e))}}>
                    {/* <form onSubmit={(e) => { console.log(e.nativeEvent.submitter.name); e.preventDefault(); }}> */}
                        <Stack spacing={3}>
                            { authMethodScheduleInfoArr.map((authMethodScheduleInfo, i) => (
                                <EditAuthSchedForm
                                    key={authMethodScheduleInfo.authMethodScheduleId}
                                    changeAuthMethod={changeAuthMethod}
                                    authMethodScheduleInfo={authMethodScheduleInfo}
                                    removeCard={removeCard}
                                    changeTimeStart={changeTimeStart}
                                    changeTimeEnd={changeTimeEnd}
                                    authMethodScheduleValidations={authMethodScheduleValidationsArr[i]}
                                    changeTextField={onNameChangeFactory(authMethodScheduleInfo.authMethodScheduleId)}
                                    changeNameCheck={changeNameCheck}
                                    changeRrule={changeRrule}
                                    checkUntil={checkUntil(authMethodScheduleInfo.authMethodScheduleId)}
                                />
                            ))}
                            <div>
                                <Button
                                    size="large"
                                    variant="outlined"
                                    startIcon={<Add />}
                                    onClick={addCard}
                                >
                                    Add another
                                </Button>
                            </div>
                            <Grid container>
                                <Grid item marginRight={3} mb={2}>
                                    <Button
                                        type="submit"
                                        size="large"
                                        variant="contained"
                                        name="replace"
                                        id="replace all"
                                        // onClick={replaceAll}
                                        disabled={
                                        //     submitted                      ||
                                        //     entranceScheduleInfoArr.length == 0 || // no access groups to submit
                                        authDevices.length ==0 ||
                                            authMethodScheduleValidationsArr.some( // check if validations fail
                                                validation => validation.authMethodScheduleNameBlank        ||
                                                validation.timeEndInvalid ||
                                                validation.untilInvalid ||
                                                validation.timeStartInvalid ||
                                                validation.overlapped
                                        //                       validation.accessGroupNameExists       ||
                                        //                       validation.accessGroupNameDuplicated   ||
                                        //                       validation.accessGroupPersonDuplicated
                                            )
                                        }
                                    >
                                        Replace all
                                    </Button>
                                </Grid>
                                <Grid item marginRight={3} mb={2}>
                                    <Button
                                        type="submit"
                                        size="large"
                                        variant="contained"
                                        name="add"
                                        value="add button"
                                        // onClick={addOn}
                                        disabled={
                                        //     submitted                      ||
                                        //     entranceScheduleInfoArr.length == 0 || // no access groups to submit
                                        authDevices.length==0||
                                            authMethodScheduleValidationsArr.some( // check if validations fail
                                                validation => validation.authMethodScheduleNameBlank        ||
                                                validation.timeEndInvalid ||
                                                validation.untilInvalid ||
                                                validation.timeStartInvalid ||
                                                validation.overlapped
                                        //                       validation.accessGroupNameExists       ||
                                        //                       validation.accessGroupNameDuplicated   ||
                                        //                       validation.accessGroupPersonDuplicated
                                            )
                                        }
                                    >
                                        Add on
                                    </Button>
                                </Grid>
                                <Grid item>
                                    <NextLink
                                        href={`/dashboard/controllers/auth-device/details/${controllerId}/${authDeviceId}`}
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

ModifyauthMethodSchedule
.getLayout = (page) => (
    
    <AuthGuard>
        <DashboardLayout>
            { page }
        </DashboardLayout>
    </AuthGuard>
)

export default ModifyauthMethodSchedule
;