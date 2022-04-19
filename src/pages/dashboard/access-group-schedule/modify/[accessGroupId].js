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

const ModifyAccessGroupSchedule = () => {
    //need to get the access group ID then entrances(get from NtoN with acc grp id) from prev page AKA accgrpdetails page
    const router = useRouter();
    const temp = router.query;
    const accessGroupId = temp.accessGroupId;

    const [accGrp, setAccGrp] = useState()
    const [grpToEnt, setGrpToEnt] = useState([]) // grptoent.contains grptoentId and ent obj
    const [allEntrances, setAllEntrances] = useState([])

    const getEntrance = async () => {
        const res = await accessGroupEntranceNtoNApi.getEntranceWhereAccessGroupId(accessGroupId);
          if(res.status != 200) { // accgrp not found
            toast.error("Access Group not found");
            router.replace("/dashboard");
        }
        const data = await res.json();
        setGrpToEnt(data);
        const tempEntArray = []
        data.forEach(grp=>{tempEntArray.push(grp.entrance)})
        setAllEntrances(tempEntArray)
        console.log("all entrances here",JSON.stringify(tempEntArray))
    }
    const getAccGrp = async() => {
        const res = await accessGroupApi.getAccessGroup(accessGroupId);
        if(res.status != 200) { // accgrp not found
            toast.error("Access Group not found");
            router.replace("/dashboard");
        }
        const data = await res.json();
        setAccGrp(data);
        // console.log(JSON.stringify(data))
    }
    useEffect(() => {
        try {
            getEntrance()
            getAccGrp()
        } catch (error) {
            console.log(error)
        }
    }, [])
      
    //

    // empty objects for initialisation of new card
    const getEmptyAccessGroupScheduleInfo = (accessGroupScheduleId) => ({
        accessGroupScheduleId,
        accessGroupScheduleName:"",
        rrule:"",
        timeStart:"",
        timeEnd:"",
        
    });
    const getEmptyAccessGroupScheduleValidations = (accessGroupScheduleId) => ({
        accessGroupScheduleId,
        accessGroupScheduleNameBlank: false,

        timeEndInvalid:false,
        timeStartInvalid:false,
        //Entrance valid(might not need as field is select. cannot custom add)
        untilInvalid:false,
        // submit failed
        submitFailed: false
    });

    const [accessGroupScheduleInfoArr, 
        setAccessGroupScheduleInfoArr] = useState([getEmptyAccessGroupScheduleInfo(0)]);
    const [accessGroupScheduleValidationsArr, 
        setAccessGroupScheduleValidationsArr] = useState([getEmptyAccessGroupScheduleValidations(0)]);


    // add card logic
    //returns largest accessGroupId + 1
    const getNewId = () => accessGroupScheduleInfoArr.map(info => info.accessGroupScheduleId)
                                             .reduce((a, b) => Math.max(a, b), -1) + 1

    const addCard = () => {
        const newId = getNewId();
        setAccessGroupScheduleInfoArr([ ...accessGroupScheduleInfoArr, getEmptyAccessGroupScheduleInfo(newId) ]);
        setAccessGroupScheduleValidationsArr([ ...accessGroupScheduleValidationsArr, getEmptyAccessGroupScheduleValidations(newId) ]);
    }


    // remove card logic
    const removeCard = (id) => {
        const newAccessGroupScheduleInfoArr = accessGroupScheduleInfoArr.filter(info => info.accessGroupScheduleId != id);
        const newValidations = accessGroupScheduleValidationsArr.filter(validation => validation.accessGroupScheduleId != id);

        setAccessGroupScheduleInfoArr(newAccessGroupScheduleInfoArr);
        setAccessGroupScheduleValidationsArr(newValidations);       
    }
    
    // update methods for form inputs
    const changeTextField = (e, id) => {
        const updatedInfo = [ ...accessGroupScheduleInfoArr ];
        // this method is reliant on text field having a name field == key in info object ie accessGroupName, accessGroupDesc
        updatedInfo.find(info => info.accessGroupScheduleId == id)[e.target.name] = e.target.value;
        setAccessGroupScheduleInfoArr(updatedInfo);
    }

    //set rrule string
    const changeRrule = (string,id) =>{
        const updatedInfo = [ ...accessGroupScheduleInfoArr ];
        updatedInfo.find(info => info.accessGroupScheduleId == id)['rrule']=string;
        setAccessGroupScheduleInfoArr(updatedInfo);
        console.log(accessGroupScheduleInfoArr)
    }
    //set timestartend
    const changeTimeStart = (start,id) =>{
        const updatedInfo = [ ...accessGroupScheduleInfoArr ];
        updatedInfo.find(info => info.accessGroupScheduleId == id)['timeStart']=start;
        setAccessGroupScheduleInfoArr(updatedInfo);
        checkTimeStart(start,id)
    }
    const changeTimeEnd = (end,id) =>{
        const updatedInfo = [ ...accessGroupScheduleInfoArr ];
        updatedInfo.find(info => info.accessGroupScheduleId == id)['timeEnd']=end;
        setAccessGroupScheduleInfoArr(updatedInfo);
        checkTimeEnd(end,id)
    }
    const checkTimeEnd = (end,id) => {
        const endTime = end;
        const newValidations = [ ...accessGroupScheduleValidationsArr ];
        const validation = newValidations.find(v => v.accessGroupScheduleId == id);
        // store a temp updated access group info
        const newAccessGroupScheduleInfoArr = [ ...accessGroupScheduleInfoArr ]
        const tempStartTime = newAccessGroupScheduleInfoArr.find(group => group.accessGroupScheduleId == id)['timeStart'];

        if(tempStartTime=="00:00"){
            validation.timeEndInvalid = false;
            setAccessGroupScheduleValidationsArr(newValidations)
            // console.log(newValidations)
        }
        
        validation.timeEndInvalid = (formUtils.checkBlank(endTime)||endTime<tempStartTime);
        // validation.timeEndInvalid = formUtils.checkBlank(endTime);
        // console.log(validation)
        setAccessGroupScheduleValidationsArr(newValidations)
    }
    const checkTimeStart = (start,id) => {
        const starttime = start;
        const newValidations = [ ...accessGroupScheduleValidationsArr ];
        const validation = newValidations.find(v => v.accessGroupScheduleId == id);

        validation.timeStartInvalid = (formUtils.checkBlank(starttime));
        // validation.timeEndInvalid = formUtils.checkBlank(endTime);
        // console.log(validation)
        setAccessGroupScheduleValidationsArr(newValidations)
    }

    // error checking methods
    const changeNameCheck = async (e, id) => {
        const accessGroupScheduleName = e.target.value;
        const newValidations = [ ...accessGroupScheduleValidationsArr ];
        const validation = newValidations.find(v => v.accessGroupScheduleId == id);

        // store a temp updated access group info
        const newAccessGroupScheduleInfoArr = [ ...accessGroupScheduleInfoArr ]
        newAccessGroupScheduleInfoArr.find(group => group.accessGroupScheduleId == id).accessGroupScheduleName = accessGroupScheduleName;

        // remove submit failed
        // validation.submitFailed = false;

        // check name is blank?
        validation.accessGroupScheduleNameBlank = formUtils.checkBlank(accessGroupScheduleName);

        setAccessGroupScheduleValidationsArr(newValidations);
    }
    //currying for cleaner code
    const onNameChangeFactory = (id) => (e) => {
        changeTextField(e, id);
        changeNameCheck(e, id);
    }
    const checkUntil = (id) =>(e) => {
        const newValidations = [ ...accessGroupScheduleValidationsArr ];
        const validation = newValidations.find(v => v.accessGroupScheduleId == id);
        validation.untilInvalid = e
        // console.log("newValidations",newValidations)
        setAccessGroupScheduleValidationsArr(newValidations);

    }
    const [submitted, setSubmitted] = useState(false);


    const replaceAll = (e) => {
        e.preventDefault();

        const grpToEntIdArr = []
        getGrpToEntId(grpToEntIdArr);

        Promise.resolve(accessGroupScheduleApi.replaceAccessGroupSchedules(accessGroupScheduleInfoArr,grpToEntIdArr))
        .then(res =>{
            if (res.status!=200){
                return toast.error("Error replacing all schedules")
            }
            else{
                toast.success("Successfully replaced all schedules")
                router.replace(`/dashboard/access-groups/details/${accessGroupId}`)
            }
        })
        
    }
    const addOn = (e) => {
        e.preventDefault();
        const grpToEntIdArr = []
        getGrpToEntId(grpToEntIdArr);
        
        Promise.resolve(accessGroupScheduleApi.addAccessGroupSchedules(accessGroupScheduleInfoArr,grpToEntIdArr))
        .then(res =>{
            if (res.status!=200){
                return toast.error("Error adding schedules")
            }
            else{
                toast.success("Schedules successfully added")
                router.replace(`/dashboard/access-groups/details/${accessGroupId}`)
            }
        })

    }

    //for MultiSelectInput
    const entranceEqual = (option, value) => option.entranceId == value.entranceId;
    const getEntranceName = (e) => e.entranceName;
    const entranceFilter = (entrances, state) => {
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
    const getGrpToEntId = (grpToEntIdArr) => {
        entrances.forEach(ent => {
            grpToEnt.forEach(obj=>{
                if(obj.entrance.entranceId==ent.entranceId){
                    grpToEntIdArr.push(obj.groupToEntranceId)
                }
            })
        })
    }

    
    return(
        <>
            <Head>
                <title>
                    Etlas: Modify Access Group Schedule
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
                            href={`/dashboard/access-groups/details/${accessGroupId}`}
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
                                    Access Group Details
                                </Typography>
                            </Link>
                        </NextLink>
                    </Box>
                    <Box marginBottom={3}>
                        <Typography variant="h3">
                            Modify Access Group Schedule
                        </Typography>
                        <Grid container>
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
                        </Grid>
                        {/* <Typography variant="body2" color="neutral.500">
                        {accGrp?(`Modifying for Access Group: ${accGrp.accessGroupName}`):("No access Group found")}
                        </Typography> */}
                        <Alert severity="info"variant="outlined">Quick tip : You may select more than one entrance to apply these schedules to multiple entrances </Alert>
                    </Box>
                    <Grid container alignItems="center" mb={3}>
                        <Grid item mr={2}>
                            <Typography fontWeight="bold">Entrance :</Typography>
                        </Grid>
                        <Grid item xs={11} md={7}>
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
                            { accessGroupScheduleInfoArr.map((accessGroupScheduleInfo, i) => (
                                <EditAccGrpSchedForm
                                    key={accessGroupScheduleInfo.accessGroupScheduleId}
                                    accessGroupScheduleInfo={accessGroupScheduleInfo}
                                    removeCard={removeCard}
                                    changeTimeStart={changeTimeStart}
                                    changeTimeEnd={changeTimeEnd}
                                    accessGroupScheduleValidations={accessGroupScheduleValidationsArr[i]}
                                    changeTextField={onNameChangeFactory(accessGroupScheduleInfo.accessGroupScheduleId)}
                                    changeNameCheck={changeNameCheck}
                                    changeRrule={changeRrule}
                                    checkUntil={checkUntil(accessGroupScheduleInfo.accessGroupScheduleId)}
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
                                        //     accessGroupScheduleInfoArr.length == 0 || // no access groups to submit
                                        entrances.length ==0 ||
                                            accessGroupScheduleValidationsArr.some( // check if validations fail
                                                validation => validation.accessGroupScheduleNameBlank        ||
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
                                        //     accessGroupScheduleInfoArr.length == 0 || // no access groups to submit
                                            entrances.length==0||
                                            accessGroupScheduleValidationsArr.some( // check if validations fail
                                                validation => validation.accessGroupScheduleNameBlank        ||
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
                                        href="/dashboard/access-groups/"
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

ModifyAccessGroupSchedule.getLayout = (page) => (
    <AuthGuard>
        <DashboardLayout>
            { page }
        </DashboardLayout>
    </AuthGuard>
)

export default ModifyAccessGroupSchedule;