import { useEffect, useState, useCallback } from "react";
import NextLink from "next/link";
import Head from "next/head";
import { Link, Box, Container, Typography, Stack, Button, Grid, TextField, Alert, Tooltip } from "@mui/material";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { AuthGuard } from '../../../../components/authentication/auth-guard';
import { DashboardLayout } from '../../../../components/dashboard/dashboard-layout';
import Add from "@mui/icons-material/Add";
import { accessGroupApi } from "../../../../api/access-groups";
import toast from "react-hot-toast";
import router, { useRouter } from "next/router";
import formUtils from "../../../../utils/form-utils";
import accessGroupEntranceNtoNApi from "../../../../api/access-group-entrance-n-to-n";
import EditAccGrpSchedForm from "../../../../components/dashboard/access-group-schedule/access-group-schedule-edit-form";
import MultipleSelectInput from "../../../../components/dashboard/shared/multi-select-input"
import { accessGroupScheduleApi } from "../../../../api/access-group-schedules";
import { Info } from "@mui/icons-material";
import entranceApi from "../../../../api/entrance";
import { entranceScheduleApi } from "../../../../api/entrance-schedule";
import EditEntSchedForm from "../../../../components/dashboard/entrance-schedule/entrance-schedule-edit-form";
import { controllerApi } from "../../../../api/controllers";
import { serverDownCode } from "../../../../api/api-helpers";
import { ServerDownError } from "../../../../components/dashboard/errors/server-down-error";

const ModifyEntranceSchedule = () => {
    //need to get the access group ID then entrances(get from NtoN with acc grp id) from prev page AKA accgrpdetails page
    const router = useRouter();
    const temp = router.query;
    const entranceId = temp.entranceId;

    // const [accGrp, setAccGrp] = useState()
    const [grpToEnt, setGrpToEnt] = useState([]) // grptoent.contains grptoentId and ent obj
    const [allEntrances, setAllEntrances] = useState([])
    
    const [serverDownOpen, setServerDownOpen] = useState(false);

    const getEntrance = async () => {
        const res = await entranceApi.getEntrances();
        if (res.status != 200) { // entrance not found
            if (res.status == serverDownCode) {
                setServerDownOpen(true);
              }
              toast.error("Error loading entrances");
              setAllEntrances([]);
              return;
            // router.replace("/dashboard");
        }
        const data = await res.json();
        setAllEntrances(data)
        console.log(JSON.stringify(data))
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
            getEntrance()
            // getAccGrp()
        } catch (error) {
            console.log(error)
        }
    }, [])
      
    //

    // empty objects for initialisation of new card
    const getEmptyEntranceScheduleInfo = (entranceScheduleId) => ({
        entranceScheduleId,
        entranceScheduleName:"",
        rrule:"",
        timeStart:"",
        timeEnd:"",
        
    });
    const getEmptyEntranceScheduleValidations = (entranceScheduleId) => ({
        entranceScheduleId,
        entranceScheduleNameBlank: false,

        timeEndInvalid:false,
        timeStartInvalid:false,
        //Entrance valid(might not need as field is select. cannot custom add)
        untilInvalid:false,
        // submit failed
        submitFailed: false
    });

    const [entranceScheduleInfoArr, 
        setEntranceScheduleInfoArr] = useState([getEmptyEntranceScheduleInfo(0)]);
    const [entranceScheduleValidationsArr, 
        setEntranceScheduleValidationsArr] = useState([getEmptyEntranceScheduleValidations(0)]);


    // add card logic
    //returns largest entranceId + 1
    const getNewId = () => entranceScheduleInfoArr.map(info => info.entranceScheduleId)
                                             .reduce((a, b) => Math.max(a, b), -1) + 1

    const addCard = () => {
        const newId = getNewId();
        setEntranceScheduleInfoArr([ ...entranceScheduleInfoArr, getEmptyEntranceScheduleInfo(newId) ]);
        setEntranceScheduleValidationsArr([ ...entranceScheduleValidationsArr, getEmptyEntranceScheduleValidations(newId) ]);
    }


    // remove card logic
    const removeCard = (id) => {
        const newAccessGroupScheduleInfoArr = entranceScheduleInfoArr.filter(info => info.entranceScheduleId != id);
        const newValidations = entranceScheduleValidationsArr.filter(validation => validation.entranceScheduleId != id);

        setEntranceScheduleInfoArr(newAccessGroupScheduleInfoArr);
        setEntranceScheduleValidationsArr(newValidations);       
    }
    
    // update methods for form inputs
    const changeTextField = (e, id) => {
        const updatedInfo = [ ...entranceScheduleInfoArr ];
        // this method is reliant on text field having a name field == key in info object ie accessGroupName, accessGroupDesc
        updatedInfo.find(info => info.entranceScheduleId == id)[e.target.name] = e.target.value;
        setEntranceScheduleInfoArr(updatedInfo);
    }

    //set rrule string
    const changeRrule = (string,id) =>{
        const updatedInfo = [ ...entranceScheduleInfoArr ];
        updatedInfo.find(info => info.entranceScheduleId == id)['rrule']=string;
        setEntranceScheduleInfoArr(updatedInfo);
        console.log(entranceScheduleInfoArr)
    }
    //set timestartend
    const changeTimeStart = (start,id) =>{
        const updatedInfo = [ ...entranceScheduleInfoArr ];
        updatedInfo.find(info => info.entranceScheduleId == id)['timeStart']=start;
        setEntranceScheduleInfoArr(updatedInfo);
        checkTimeStart(start,id)
    }
    const changeTimeEnd = (end,id) =>{
        const updatedInfo = [ ...entranceScheduleInfoArr ];
        updatedInfo.find(info => info.entranceScheduleId == id)['timeEnd']=end;
        setEntranceScheduleInfoArr(updatedInfo);
        checkTimeEnd(end,id)
    }
    const checkTimeEnd = (end,id) => {
        const endTime = end;
        const newValidations = [ ...entranceScheduleValidationsArr ];
        const validation = newValidations.find(v => v.entranceScheduleId == id);
        // store a temp updated access group info
        const newAccessGroupScheduleInfoArr = [ ...entranceScheduleInfoArr ]
        const tempStartTime = newAccessGroupScheduleInfoArr.find(group => group.entranceScheduleId == id)['timeStart'];

        if(tempStartTime=="00:00"){
            validation.timeEndInvalid = false;
            setEntranceScheduleValidationsArr(newValidations)
            // console.log(newValidations)
        }
        
        validation.timeEndInvalid = (formUtils.checkBlank(endTime)||endTime<=tempStartTime);
        // validation.timeEndInvalid = formUtils.checkBlank(endTime);
        // console.log(validation)
        setEntranceScheduleValidationsArr(newValidations)
    }
    const checkTimeStart = (start,id) => {
        const starttime = start;
        const newValidations = [ ...entranceScheduleValidationsArr ];
        const validation = newValidations.find(v => v.entranceScheduleId == id);

        validation.timeStartInvalid = (formUtils.checkBlank(starttime));
        // validation.timeEndInvalid = formUtils.checkBlank(endTime);
        // console.log(validation)
        setEntranceScheduleValidationsArr(newValidations)
    }

    // error checking methods
    const changeNameCheck = async (e, id) => {
        const entranceScheduleName = e.target.value;
        const newValidations = [ ...entranceScheduleValidationsArr ];
        const validation = newValidations.find(v => v.entranceScheduleId == id);

        // store a temp updated access group info
        const newAccessGroupScheduleInfoArr = [ ...entranceScheduleInfoArr ]
        newAccessGroupScheduleInfoArr.find(group => group.entranceScheduleId == id).entranceScheduleName = entranceScheduleName;

        // remove submit failed
        // validation.submitFailed = false;

        // check name is blank?
        validation.entranceScheduleNameBlank = formUtils.checkBlank(entranceScheduleName);

        setEntranceScheduleValidationsArr(newValidations);
    }
    //currying for cleaner code
    const onNameChangeFactory = (id) => (e) => {
        changeTextField(e, id);
        changeNameCheck(e, id);
    }
    const checkUntil = (id) =>(e) => {
        const newValidations = [ ...entranceScheduleValidationsArr ];
        const validation = newValidations.find(v => v.entranceScheduleId == id);
        validation.untilInvalid = e
        // console.log("newValidations",newValidations)
        setEntranceScheduleValidationsArr(newValidations);

    }
    const [submitted, setSubmitted] = useState(false);


    const replaceAll = (e) => {
        e.preventDefault();

        const entIdArr = []
        entrances.forEach(ent=>entIdArr.push(ent.entranceId))

        Promise.resolve(entranceScheduleApi.replaceEntranceSchedules(entranceScheduleInfoArr,entIdArr))
        .then(res =>{
            if (res.status!=200){
                return toast.error("Error replacing all schedules")
            }
            else{
                toast.success("Successfully replaced all schedules")
                router.replace(`/dashboard/entrances/details/${entranceId}`)
            }
        })
        
    }
    const addOn = (e) => {
        e.preventDefault();
        const entIdArr = []
        entrances.forEach(ent=>entIdArr.push(ent.entranceId))
        Promise.resolve(entranceScheduleApi.addEntranceSchedules(entranceScheduleInfoArr,entIdArr))
        .then(res =>{
            if (res.status!=200){
                return toast.error("Error adding schedules")
            }
            else{
                toast.success("Schedules successfully added")
                router.replace(`/dashboard/entrances/details/${entranceId}`)
            }
        })

    }

    //for MultiSelectInput
    const entranceEqual = (option, value) => option.entranceId == value.entranceId;
    const getEntranceName = (e) => e.entranceName;
    const entranceFilter = (entrances, state) => {
        // console.log(entrances)
        const text = state.inputValue.toLowerCase(); // case insensitive search
        return entrances.filter(e => (
            e.entranceName.toLowerCase().includes(text)
        ))
    }
    const [entrances, setEntrances] = useState([])
    const changeEntrance = (newValue) => {
        console.log(newValue,"SSSSSSSS")
        setEntrances(newValue)
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
                    Etlas: Modify Entrance Schedule
                </title>
            </Head>
            <ServerDownError
                open={serverDownOpen}
                handleDialogClose={() => setServerDownOpen(false)}
            />
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
                            href={`/dashboard/entrances/details/${entranceId}`}
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
                                    Entrance Details
                                </Typography>
                            </Link>
                        </NextLink>
                    </Box>
                    <Box marginBottom={3}>
                        <Typography variant="h3">
                            Modify Entrance Schedule
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
                        <Alert severity="info"
                                variant="outlined">Quick tip : You may apply these schedules to multiple entrances by selecting more than one entrance</Alert>
                    </Box>
                    <Grid container
                        alignItems="center"
                        mb={3}>
                        <Grid item
                            mr={2}>
                            <Typography fontWeight="bold">Entrance(s) :</Typography>
                        </Grid>
                        <Grid item
                            xs={11}
                            md={7}>
                            <MultipleSelectInput
                                options={allEntrances}
                                setSelected={changeEntrance}
                                getOptionLabel={getEntranceName}
                                label="Entrances"
                                noOptionsText="No entrance found"
                                placeholder="Enter entrance details (name, description) to search"
                                filterOptions={entranceFilter}
                                value={entrances}
                                isOptionEqualToValue={entranceEqual}
                                error={
                                    Boolean(entrances.length==0)
                                }
                                helperText={
                                    Boolean(entrances.length==0)&&"Error : no entrance selected"
                                }
                            />
                        </Grid>
                    </Grid>
                    <form onSubmit={(e) => { e.nativeEvent.submitter.name =="add"? (addOn(e)):(replaceAll(e))}}>
                    {/* <form onSubmit={(e) => { console.log(e.nativeEvent.submitter.name); e.preventDefault(); }}> */}
                        <Stack spacing={3}>
                            { entranceScheduleInfoArr.map((accessGroupScheduleInfo, i) => (
                                <EditEntSchedForm
                                    key={accessGroupScheduleInfo.entranceScheduleId}
                                    accessGroupScheduleInfo={accessGroupScheduleInfo}
                                    removeCard={removeCard}
                                    changeTimeStart={changeTimeStart}
                                    changeTimeEnd={changeTimeEnd}
                                    accessGroupScheduleValidations={entranceScheduleValidationsArr[i]}
                                    changeTextField={onNameChangeFactory(accessGroupScheduleInfo.entranceScheduleId)}
                                    changeNameCheck={changeNameCheck}
                                    changeRrule={changeRrule}
                                    checkUntil={checkUntil(accessGroupScheduleInfo.entranceScheduleId)}
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
                                <Grid item
                                    marginRight={3}
                                    mb={2}>
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
                                        entrances.length ==0 ||
                                            entranceScheduleValidationsArr.some( // check if validations fail
                                                validation => validation.entranceScheduleNameBlank        ||
                                                validation.timeEndInvalid ||
                                                validation.untilInvalid ||
                                                validation.timeStartInvalid
                                        //                       validation.accessGroupNameExists       ||
                                        //                       validation.accessGroupNameDuplicated   ||
                                        //                       validation.accessGroupPersonDuplicated
                                            )
                                        }
                                    >
                                        Replace all
                                    </Button>
                                </Grid>
                                <Grid item
                                    marginRight={3}
                                    mb={2}>
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
                                            entrances.length==0||
                                            entranceScheduleValidationsArr.some( // check if validations fail
                                                validation => validation.entranceScheduleNameBlank        ||
                                                validation.timeEndInvalid ||
                                                validation.untilInvalid ||
                                                validation.timeStartInvalid
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
                                        href={`/dashboard/entrances/details/${entranceId}`}
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

ModifyEntranceSchedule
.getLayout = (page) => (
    <AuthGuard>
        <DashboardLayout>
            { page }
        </DashboardLayout>
    </AuthGuard>
)

export default ModifyEntranceSchedule
;