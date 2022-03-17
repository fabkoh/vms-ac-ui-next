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
import accessGroupEntranceNtoNApi from "../../../api/access-group-entrance-n-to-n";
import EditAccGrpSchedForm from "../../../components/dashboard/access-group-schedule/access-group-schedule-edit-form";

const CreateAccessGroupSchedule = () => {
    //need to get the access group ID then entrances(get from NtoN with acc grp id) from prev page AKA accgrpdetails page
    const router = useRouter();
    const accessGroupId = router.query;

    const [accGrp, setAccGrp] = useState()
    const [entranceArr, setEntranceArr] = useState([]) //contains grptoentId and ent obj

    const getEntrance = async () => {
        const res = await accessGroupEntranceNtoNApi.getEntranceWhereAccessGroupId(accessGroupId);
          if(res.status != 200) { // accgrp not found
            toast.error("Access Group not found");
            router.replace("/dashboard");
        }
        const data = await res.json();
        setEntranceArr(data);
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
        console.log(JSON.stringify(data))
    }
    useEffect(() => {
        try {
            getEntrance()
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
        
    });
    const getEmptyAccessGroupScheduleValidations = (accessGroupScheduleId) => ({
        accessGroupScheduleId,
        accessGroupNameScheduleNameBlank: false,

        //Rrule valid(might not need due to the user workflow)

        //Entrance valid(might not need as field is select. cannot custom add)

        // submit failed
        submitFailed: false
    });

    const [accessGroupScheduleInfoArr, 
        setAccessGroupScheduleInfoArr] = useState([getEmptyAccessGroupScheduleInfo(0)]);
    const [accessGroupScheduleValidationsArr, 
        setAccessGroupScheduleValidationsArr] = useState([getEmptyAccessGroupScheduleValidations(0)]);

    // persons logic (displaying in dropdown box) *REPLACE WITH ENTRANCES OF ACC GRP
    // const isMounted = useMounted();
    // const [allPersons, setAllPersons] = useState([]);

    // const getPersons = useCallback( async() => {
    //     try {
    //         const res = await personApi.getPersons();
    //         if (res.status == 200) {
    //             const body = await res.json();
    //             setAllPersons(body);
    //         } else {
    //             throw new Error("persons not loaded");
    //         }
    //     } catch(e) {
    //         console.error(e);
    //         toast.error("Persons not loaded");
    //     }
    // }, [isMounted]);

    // useEffect(() => {
    //     getPersons();
    // },
    // // eslint-disable-next-line react-hooks/exhaustive-deps
    // []);
    

    // store previous access group names
    const accessGroupNames = {};
    accessGroupApi.getAccessGroups()
        .then(async res => {
            if (res.status == 200) {
               const body = await res.json();
               body.forEach(group => accessGroupNames[group.accessGroupName] = true); 
            }
        });

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
    }
    const changeTimeEnd = (end,id) =>{
        const updatedInfo = [ ...accessGroupScheduleInfoArr ];
        updatedInfo.find(info => info.accessGroupScheduleId == id)['timeEnd']=end;
        setAccessGroupScheduleInfoArr(updatedInfo);
    }

    // error checking methods
    const changeNameCheck = async (e, id) => {
        const accessGroupName = e.target.value;
        const newValidations = [ ...accessGroupScheduleValidationsArr ];
        const validation = newValidations.find(v => v.accessGroupId == id);

        // store a temp updated access group info
        const newAccessGroupInfoArr = [ ...accessGroupScheduleInfoArr ]
        newAccessGroupInfoArr.find(group => group.accessGroupScheduleId == id).accessGroupName = accessGroupName;

        // remove submit failed
        validation.submitFailed = false;

        // check name is blank?
        validation.accessGroupNameBlank = formUtils.checkBlank(accessGroupName);

        setAccessGroupValidationsArr(newValidations);
    }

    const [submitted, setSubmitted] = useState(false);

    // const submitForm = e => {
    //     e.preventDefault(); 

    //     setSubmitted(true);
    //     Promise.all(accessGroupInfoArr.map(accessGroup => accessGroupApi.createAccessGroup(accessGroup)))
    //            .then(resArr => {
    //                 const failedAccessGroup = [];
    //                 const failedRes = [];

    //                 resArr.forEach((res, i) => {
    //                     if (res.status != 201) {
    //                         failedAccessGroup.push(accessGroupInfoArr[i])
    //                         failedRes.push(res)
    //                     }
    //                 })

    //                 const numCreated = accessGroupScheduleInfoArr.length - failedAccessGroup.length
    //                 if (numCreated) {
    //                     toast.success(`${numCreated} access groups created`); 
    //                 }

    //                 if (failedAccessGroup.length) {
    //                     // some failed
    //                     toast.error('Error creating the highlighted access groups');
    //                     Promise.all(failedRes.map(res => res.json()))
    //                            .then(failedObjArr => {
    //                                 setSubmitted(false);
    //                                 setAccessGroupValidationsArr(failedObjArr.map(obj => {
    //                                     obj.submitFailed = true;
    //                                     return obj;
    //                                 }))
    //                            })
    //                 } else {
    //                     // all passed
    //                     router.replace('/dashboard/access-groups')
    //                 }
    //            })
    // }

    return(
        <>
            <Head>
                <title>
                    Etlas: Edit Access Group Schedule
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
                            Edit Access Group Schedule
                        </Typography>
                        <Typography variant="h7">
                            {`Editing for Access Group : ${accGrp}`}
                        </Typography>
                    </Box>
                    <Grid container alignItems="center">
                        <Grid item>
                            <Typography fontWeight="bold">Entrance</Typography>
                        </Grid>
                        <Grid item>
                            <TextField value="entrances linked to acc grp" />
                        </Grid>
                    </Grid>
                    {/* <form onSubmit={submitForm}> */}
                        <Stack spacing={3}>
                            { accessGroupScheduleInfoArr.map((accessGroupScheduleInfo, i) => (
                                <EditAccGrpSchedForm
                                    key={accessGroupScheduleInfo.accessGroupScheduleId}
                                    accessGroupScheduleInfo={accessGroupScheduleInfo}
                                    removeCard={removeCard}
                                    changeTimeStart={changeTimeStart}
                                    changeTimeEnd={changeTimeEnd}
                                    accessGroupScheduleValidations={accessGroupScheduleValidationsArr[i]}
                                    changeTextField={changeTextField}
                                    changeNameCheck={changeNameCheck}
                                    changeRrule={changeRrule}
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
                                <Grid item marginRight={3}>
                                    <Button
                                        type="submit"
                                        size="large"
                                        variant="contained"
                                        // disabled={
                                        //     submitted                      ||
                                        //     accessGroupScheduleInfoArr.length == 0 || // no access groups to submit
                                        //     accessGroupScheduleValidationsArr.some( // check if validations fail
                                        //         validation => validation.accessGroupNameBlank        ||
                                        //                       validation.accessGroupNameExists       ||
                                        //                       validation.accessGroupNameDuplicated   ||
                                        //                       validation.accessGroupPersonDuplicated
                                        //     )
                                        // }
                                    >
                                        Replace all
                                    </Button>
                                </Grid>
                                <Grid item marginRight={3}>
                                    <Button
                                        type="submit"
                                        size="large"
                                        variant="contained"
                                        // disabled={
                                        //     submitted                      ||
                                        //     accessGroupScheduleInfoArr.length == 0 || // no access groups to submit
                                        //     accessGroupScheduleValidationsArr.some( // check if validations fail
                                        //         validation => validation.accessGroupNameBlank        ||
                                        //                       validation.accessGroupNameExists       ||
                                        //                       validation.accessGroupNameDuplicated   ||
                                        //                       validation.accessGroupPersonDuplicated
                                        //     )
                                        // }
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