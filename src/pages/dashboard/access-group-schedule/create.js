import { useEffect, useState, useCallback } from "react";
import NextLink from "next/link";
import Head from "next/head";
import { Link, Box, Container, Typography, Stack, Button, Grid, TextField } from "@mui/material";
import ArrowBack from "@mui/icons-material/ArrowBack";
import AccessGroupAddForm from "../../../components/dashboard/access-groups/forms/access-group-add-form";
import { AuthGuard } from '../../../components/authentication/auth-guard';
import { DashboardLayout } from '../../../components/dashboard/dashboard-layout';
import Add from "@mui/icons-material/Add";
import { personApi } from "../../../api/person";
import { accessGroupApi } from "../../../api/access-groups";
import { useMounted } from "../../../hooks/use-mounted";
import toast from "react-hot-toast";
import router, { useRouter } from "next/router";
import formUtils from "../../../utils/form-utils";
import AddAccGrpSchedForm from "../../../components/dashboard/access-group-schedule/access-group-schedule-add-form";
import accessGroupEntranceNtoNApi from "../../../api/access-group-entrance-n-to-n";
import { TabPanel } from "@mui/lab";
import { accessGroupScheduleApi } from "../../../api/access-group-schedules";

const CreateAccessGroupSchedule = () => {
    //need to get the access group ID then entrances(get from NtoN with acc grp id) from prev page AKA accgrpdetails page
    const router = useRouter();
    const accessGroupId = router.query[""];
    // console.log("here", Number(accessGroupId));

    const [accGrp, setAccGrp] = useState() //accGrp obj to get accGrpName
    const [grpToEnt, setGrpToEnt] = useState([]) // grptoent.contains grptoentId and ent obj
    const [allEntrances, setAllEntrances] = useState([])
    // useEffect(() => {
    //    // use accessGroupId(from the query) & entrance Id from user selection
    //    // to obtain groupToEntId. which will be added to all scheds before submit
    // }, [change whenever entrance selection change])
    // const getAllEntrances = () => {
    //     const tempEntArray = [];
    //     grpToEnt.forEach(grp=>{
    //         tempEntArray.push(grp.entrance)
    //     })
    //     console.log("entrance array",tempEntArray)
    //     setAllEntrances(allEntrances)
    // }
    const getGrpToEnt = async () => {
        const res = await accessGroupEntranceNtoNApi.getEntranceWhereAccessGroupId(accessGroupId);
          if(res.status != 200) { //no entrances
            toast.error("Entrance not found");
            // router.replace("/dashboard");
        }
        const data = await res.json();
        setGrpToEnt(data);
        const tempEntArray =[]
        data.forEach(grp=>{tempEntArray.push(grp.entrance)})
        setAllEntrances(tempEntArray)
        console.log(JSON.stringify(data))
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
            getGrpToEnt()
            getAccGrp()
        } catch (error) {
            console.log(error)
        }
    }, [])

    // empty objects for initialisation of new card
    const getEmptyAccessGroupScheduleInfo = (accessGroupScheduleId) => ({
        accessGroupScheduleId,
        accessGroupScheduleName:"",
        rrule:"",
        timeStart:"",
        timeEnd:"",
        groupToEntranceId:[],
        entrances:[],
    });
    const getEmptyAccessGroupScheduleValidations = (accessGroupScheduleId) => ({
        accessGroupScheduleId,
        accessGroupNameScheduleNameBlank: false,
        entrancesBlank:false,

        //Rrule valid(might not need due to the user workflow)

        //Entrance valid(might not need as field is select. cannot custom add)

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
    const removeCard = (id) => {x
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
        // setAccessGroupScheduleInfoArr(updatedInfo);
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
    }
    const changeTimeEnd = (end,id) =>{
        const updatedInfo = [ ...accessGroupScheduleInfoArr ];
        updatedInfo.find(info => info.accessGroupScheduleId == id)['timeEnd']=end;
        setAccessGroupScheduleInfoArr(updatedInfo);
    }

    // error checking methods
    const changeNameCheck = async (e, id) => {
        const newname = e.target.value;
        const newValidations = [ ...accessGroupScheduleValidationsArr ];
        const validation = newValidations.find(v => v.accessGroupScheduleId == id);

        // store a temp updated access group info
        const newAccessGroupInfoArr = [ ...accessGroupScheduleInfoArr ]
        newAccessGroupInfoArr.find(group => group.accessGroupScheduleId == id).accessGroupScheduleName = newname;

        // remove submit failed
        validation.submitFailed = false;

        // check name is blank?
        validation.accessGroupScheduleNameBlank = formUtils.checkBlank(newname);
        console.log(validation)
        setAccessGroupScheduleValidationsArr(newValidations);
    }
    const changeEntranceCheck = (newValue,id) => {
        const newentrance = newValue;
        const newValidations = [ ...accessGroupScheduleValidationsArr ];
        const validation = newValidations.find(v => v.accessGroupScheduleId == id);
        // store a temp updated access group info
        const newAccessGroupInfoArr = [ ...accessGroupScheduleInfoArr ]
        const oldentrance = newAccessGroupInfoArr.find(group => group.accessGroupScheduleId == id).entrances;
        oldentrance.length == 0? (validation.entrancesBlank=true):(validation.entrancesBlank=false);
        // console.log(validation)
    }

    // entrance logic
    const changeEntrance = (newValue, id) => {
        console.log(newValue,"SSSSSSSS",id)
        const updatedInfo = [...accessGroupScheduleInfoArr ];
        updatedInfo.find(info => info.accessGroupScheduleId == id).entrances = newValue;
        setAccessGroupScheduleInfoArr(updatedInfo);
        // console.log("onchangeinfoarr",accessGroupScheduleInfoArr)
    }

    // currying for cleaner code
    const onEntranceChangeFactory = (id) => (newValue) =>{ 
        changeEntrance(newValue, id);
        changeEntranceCheck(newValue,id)
    }
    const onNameChangeFactory = (id) => (e) => {
        changeTextField(e, id);
        changeNameCheck(e, id);
    }

    const testdate = new Date();
    const newdate = testdate.setDate(testdate.getDate()+14)
    console.log(new Date(newdate))

    const [submitted, setSubmitted] = useState(false);
    //entranceid assignment
    const grpToEntAssignment = () => {
        const newarr =[...accessGroupScheduleInfoArr]
        newarr.forEach(sched =>{
            sched.entrances.forEach(ent =>{
                grpToEnt.forEach(obj=>{
                    console.log(ent,"objhereee",obj)
                    if(obj.entrance.entranceId==ent.entranceId){
                        sched.groupToEntranceId.push(obj.groupToEntranceId);
                    }
                })
            })
        })
        setAccessGroupScheduleInfoArr(newarr)
    }

    const submitForm = async e => {
        e.preventDefault(); 

        grpToEntAssignment()
        setSubmitted(true);
        // accessGroupScheduleInfoArr.forEach(accGrpSched =>(accGrpSched["groupToEntranceId"]= grpToEnt["groupToEntranceId"]));
        Promise.all(accessGroupScheduleInfoArr.map(accGrpSched => accessGroupScheduleApi.createAccessGroupSchedule(accGrpSched,accGrpSched.groupToEntranceId)))
               .then(resArr => {
                    const failedAccessGroup = [];
                    const failedRes = [];
                    const temparr = [...accessGroupScheduleInfoArr]
                    temparr.forEach(sched=>sched.groupToEntranceId=[])
                    setAccessGroupScheduleInfoArr(temparr) //reset grptoentId in case fail
                    console.log("after submit",accessGroupScheduleInfoArr)
                    resArr.forEach((res, i) => {
                        if (res.status != 201) {
                            failedAccessGroup.push(accessGroupScheduleInfoArr[i])
                            failedRes.push(res)
                        }
                    })

                    const numCreated = accessGroupScheduleInfoArr.length - failedAccessGroup.length
                    if (numCreated) {
                        toast.success(`${numCreated} access groups created`); 
                    }

                    if (failedAccessGroup.length) {
                        // some failed
                        toast.error('Error creating the highlighted schedules');
                        Promise.all(failedRes.map(res => res.json()))
                               .then(failedObjArr => {
                                    setSubmitted(false);
                                    setAccessGroupScheduleValidationsArr(failedObjArr.map(obj => {
                                        obj.submitFailed = true;
                                        return obj;
                                    }))
                               })
                    } else {
                        // all passed
                        // router.replace(`/dashboard/access-groups/details/${accessGroupId}`)
                        console.warn("yay success")
                    }
               })
    }

    return(
        <>
            <Head>
                <title>
                    Etlas: Create Access Group Schedule
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
                            href="/dashboard/access-groups"
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
                                    Access group
                                </Typography>
                            </Link>
                        </NextLink>
                    </Box>
                    <Box marginBottom={3}>
                        <Typography variant="h3">
                            Create Access Group Schedule
                        </Typography>
                        <Typography variant="h7">
                            {accGrp?(`Creating for Access Group: ${accGrp.accessGroupName}`):"No access Group found"}
                        </Typography>
                    </Box>
                    {/* <form onSubmit={submitForm}> */}
                        <Stack spacing={3}>
                            { accessGroupScheduleInfoArr.map((accessGroupScheduleInfo, i) => {
                                const id = accessGroupScheduleInfo.accessGroupScheduleId
                                return(
                                <AddAccGrpSchedForm
                                    key={accessGroupScheduleInfo.accessGroupScheduleId}
                                    accessGroupScheduleInfo={accessGroupScheduleInfo}
                                    removeCard={removeCard}
                                    changeTimeStart={changeTimeStart}
                                    changeTimeEnd={changeTimeEnd}
                                    accessGroupScheduleValidations={accessGroupScheduleValidationsArr[id]}
                                    changeTextField={onNameChangeFactory(id)}
                                    changeNameCheck={changeNameCheck}
                                    changeRrule={changeRrule}
                                    onEntranceChange={onEntranceChangeFactory(id)}
                                    allEntrances={allEntrances}
                                />)
                                })}
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
                                <Grid item marginRight={3}>
                                    <Button
                                        type="submit"
                                        size="large"
                                        variant="contained"
                                        onClick={submitForm}
                                        // disabled={
                                        //     submitted                     ||
                                        // //     accessGroupScheduleInfoArr.length == 0 || // no access groups to submit
                                        //     accessGroupScheduleValidationsArr.some( // check if validations fail
                                        //         validation => validation.accessGroupScheduleNameBlank        ||
                                        //         validation.entrancesBlank
                                        // //                       validation.accessGroupNameExists       ||
                                        // //                       validation.accessGroupNameDuplicated   ||
                                        // //                       validation.accessGroupPersonDuplicated
                                        //     )
                                        // }
                                    >
                                        Submit
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
                    {/* </form> */}
                </Container>
            </Box>
        </>
    )
}

CreateAccessGroupSchedule.getLayout = (page) => (
    <AuthGuard>
        <DashboardLayout>
            { page }
        </DashboardLayout>
    </AuthGuard>
)

export default CreateAccessGroupSchedule;