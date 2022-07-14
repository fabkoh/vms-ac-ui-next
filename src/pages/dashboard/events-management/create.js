import { useEffect, useState, useCallback } from "react";
import NextLink from "next/link";
import { useMounted } from "../../../hooks/use-mounted";
import Head from "next/head";
import { Link, Box, Container, Typography, Stack, Button, Grid, TextField, Alert, Tooltip } from "@mui/material";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { AuthGuard } from '../../../components/authentication/auth-guard';
import { DashboardLayout } from '../../../components/dashboard/dashboard-layout';
import Add from "@mui/icons-material/Add";
import { accessGroupApi } from "../../../api/access-groups";
import toast from "react-hot-toast";
import router, { useRouter } from "next/router";
import formUtils from "../../../utils/form-utils";
import EditEventManagementForm from "../../../components/dashboard/events-management/edit/events-management-edit-form";
import MultipleSelectInput from "../../../components/dashboard/shared/multi-select-input"
import { accessGroupScheduleApi } from "../../../api/access-group-schedules";
import { Info } from "@mui/icons-material";
import { controllerApi } from "../../../api/controllers";
import entranceApi from "../../../api/entrance";
import { eventsManagementApi } from "../../../api/events-management";

const CreateEventManagement = () => {
    //need to get the access group ID then entrances(get from NtoN with acc grp id) from prev page AKA accgrpdetails page
    const router = useRouter();
    const isMounted = useMounted();
    const temp = router.query;
    const accessGroupId = temp.accessGroupId;

    const [allEntrances, setAllEntrances] = useState([]);
    const [allControllers, setAllControllers] = useState([]);
    const [entrancesControllers, setEntrancesControllers] = useState([]);
    const [entrances, setEntrances] = useState([]);
    const [controllers, setControllers] = useState([]);
    const [inputEvents, setInputEvents] = useState([]);
    const [outputEvents, setOutputEvents] = useState([]);
    const [inputEventsWithoutTimer, setInputEventsWithoutTimer] = useState([]);
    const [outputEventsWithoutTimer, setOutputEventsWithoutTimer] = useState([]);
    const [inputEventsWithTimer, setInputEventsWithTimer] = useState([]);
    const [outputEventsWithTimer, setOutputEventsWithTimer] = useState([]);

    const getAllControllers = useCallback(async() => {
        const controllersRes = await controllerApi.getControllers();
        if (controllersRes.status !== 200) {
            toast.error("Controllers not loaded");
            return [];
        }
        const controllersJson = await controllersRes.json();
        if (isMounted()){
            setAllControllers(controllersJson);
        }
    }, [isMounted]);

    const getAllInputEvents = useCallback(async() => {
        const inputEventsRes = await eventsManagementApi.getInputEvents();
        if (inputEventsRes.status !== 200) {
            toast.error("Input events option not loaded");
            return [];
        }
        const inputEventsJson = await inputEventsRes.json();
        if (isMounted()){
            setInputEvents(inputEventsJson);
        }
    }, [isMounted]);

    const getAllOutputEvents = useCallback(async() => {
        const outputEventsRes = await eventsManagementApi.getOutputEvents();
        if (outputEventsRes.status !== 200) {
            toast.error("Output events option not loaded");
            return [];
        }
        const outputEventsJson = await outputEventsRes.json();
        if (isMounted()){
            setOutputEvents(outputEventsJson);
        }
    }, [isMounted]);

    const getAllEntrances = useCallback(async () => {
        const res = await entranceApi.getEntrances();
        if (res.status != 200) {
            toast.error("Entrances info failed to load");
            return [];
        }
        const data = await res.json();
        if (isMounted()) {
            setAllEntrances(data);
        }
        return data;
    }, [isMounted]);
    useEffect(() => {
        try {
            getAllControllers();
            getAllEntrances();
            getAllInputEvents();
            getAllOutputEvents();
        } catch (error) {
            console.log(error)
        }
    }, [])
      
    //

    // empty objects for initialisation of new card
    const getEmptyEventsManagementInfo = (eventsManagementId) => ({
        eventsManagementId,
        eventsManagementName:"",
        rrule:"",
        timeStart:"",
        timeEnd: "",
        inputEvents: [],
        outputActions: [],
    });
    const getEmptyEventsManagementValidations = (eventsManagementId) => ({
        eventsManagementId,
        eventsManagementNameBlank: false,

        timeEndInvalid:false,
        timeStartInvalid:false,
        untilInvalid:false,
        submitFailed: false
    });

    const [eventsManagementInfoArr, 
        setEventsManagementInfoArr] = useState([getEmptyEventsManagementInfo(0)]);
    const [eventsManagementValidationsArr, 
        setEventsManagementValidationsArr] = useState([getEmptyEventsManagementValidations(0)]);


    // add card logic
    const getNewId = () => eventsManagementInfoArr.map(info => info.eventsManagementId)
                                             .reduce((a, b) => Math.max(a, b), -1) + 1

    const addCard = () => {
        const newId = getNewId();
        setEventsManagementInfoArr([ ...eventsManagementInfoArr, getEmptyEventsManagementInfo(newId) ]);
        setEventsManagementValidationsArr([ ...eventsManagementValidationsArr, getEmptyEventsManagementValidations(newId) ]);
    }


    // remove card logic
    const removeCard = (id) => {
        const newEventsManagementInfoArr = eventsManagementInfoArr.filter(info => info.eventsManagementId != id);
        const newValidations = eventsManagementValidationsArr.filter(validation => validation.eventsManagementId != id);

        setEventsManagementInfoArr(newEventsManagementInfoArr);
        setEventsManagementValidationsArr(newValidations);       
    }
    
    // update methods for form inputs
    const changeTextField = (e, id) => {
        const updatedInfo = [ ...eventsManagementInfoArr ];
        // this method is reliant on text field having a name field == key in info object ie accessGroupName, accessGroupDesc
        updatedInfo.find(info => info.eventsManagementId == id)[e.target.name] = e.target.value;
        setEventsManagementInfoArr(updatedInfo);
    }

    //set rrule string
    const changeRrule = (string,id) =>{
        const updatedInfo = [ ...eventsManagementInfoArr ];
        updatedInfo.find(info => info.eventsManagementId == id)['rrule']=string;
        setEventsManagementInfoArr(updatedInfo);
        console.log(eventsManagementInfoArr)
    }
    //set timestartend
    const changeTimeStart = (start,id) =>{
        const updatedInfo = [ ...eventsManagementInfoArr ];
        updatedInfo.find(info => info.eventsManagementId == id)['timeStart']=start;
        setEventsManagementInfoArr(updatedInfo);
        checkTimeStart(start,id)
    }
    const changeTimeEnd = (end,id) =>{
        const updatedInfo = [ ...eventsManagementInfoArr ];
        updatedInfo.find(info => info.eventsManagementId == id)['timeEnd']=end;
        setEventsManagementInfoArr(updatedInfo);
        checkTimeEnd(end,id)
    }
    const checkTimeEnd = (end,id) => {
        const endTime = end;
        const newValidations = [ ...eventsManagementValidationsArr ];
        const validation = newValidations.find(v => v.eventsManagementId == id);
        // store a temp updated access group info
        const newAccessGroupScheduleInfoArr = [ ...eventsManagementInfoArr ]
        const tempStartTime = newAccessGroupScheduleInfoArr.find(group => group.eventsManagementId == id)['timeStart'];

        if(tempStartTime=="00:00"){
            validation.timeEndInvalid = false;
            setEventsManagementValidationsArr(newValidations)
        }
        
        validation.timeEndInvalid = (formUtils.checkBlank(endTime)||endTime<=tempStartTime);
        setEventsManagementValidationsArr(newValidations)
    }
    const checkTimeStart = (start,id) => {
        const starttime = start;
        const newValidations = [ ...eventsManagementValidationsArr ];
        const validation = newValidations.find(v => v.eventsManagementId == id);

        validation.timeStartInvalid = (formUtils.checkBlank(starttime));
        setEventsManagementValidationsArr(newValidations)
    }

    // error checking methods
    const changeNameCheck = async (e, id) => {
        const eventsManagementName = e.target.value;
        const newValidations = [ ...eventsManagementValidationsArr ];
        const validation = newValidations.find(v => v.eventsManagementId == id);

        // store a temp updated access group info
        const newEventsManagementInfoArr = [ ...eventsManagementInfoArr ]
        newEventsManagementInfoArr.find(group => group.eventsManagementId == id).eventsManagementName = eventsManagementName;

        // remove submit failed
        validation.submitFailed = false;

        // check name is blank?
        validation.eventsManagementNameBlank = formUtils.checkBlank(eventsManagementName);

        setEventsManagementValidationsArr(newValidations);
    }
    //currying for cleaner code
    const onNameChangeFactory = (id) => (e) => {
        changeTextField(e, id);
        changeNameCheck(e, id);
    }
    const checkUntil = (id) =>(e) => {
        const newValidations = [...eventsManagementValidationsArr];
        console.log("newValidations", newValidations);
        const validation = newValidations.find(v => v.eventsManagementId == id);
        console.log("validation", id);
        validation.untilInvalid = e
        // console.log("newValidations",newValidations)
        setEventsManagementValidationsArr(newValidations);

    }

    const replaceAll = (e) => {
        e.preventDefault();

        Promise.resolve(eventsManagementApi.replaceEventsManagement(eventsManagementInfoArr, entrances, controllers))
        .then(res =>{
            if (res.status!=200){
                return toast.error("Error replacing all event managements")
            }
            else{
                toast.success("Successfully replaced all event managements")
                controllerApi.uniconUpdater();
                router.replace(`/dashboard/events-management`)
            }
        })
        
    }
    const addOn = (e) => {
        e.preventDefault();

        console.log(eventsManagementInfoArr)
        Promise.resolve(eventsManagementApi.addEventsManagement(eventsManagementInfoArr, entrances, controllers))
        .then(res =>{
            if (res.status!=200){
                return toast.error("Error adding event managements")
            }
            else{
                toast.success("Event managements successfully added")
                controllerApi.uniconUpdater();
                router.replace(`/dashboard/events-management`)
            }
        })

    }

    //for MultiSelectInput
    const entranceControllerEqual = (option, value) => {
        if (option.entranceId) {
            return option.entranceId == value.entranceId;
        }
        return option.controllerId == value.controllerId;
    }
    const getEntranceControllerName = (e) => e.entranceName || e.controllerName;
    const entranceControllerFilter = (entranceController, state) => {
        const text = state.inputValue.toLowerCase(); // case insensitive search
        return entranceController.filter(e => (
            e.entranceName?.toLowerCase().includes(text) ||
            e.controllerName?.toLowerCase().includes(text)
        ))
    }

    const eventActionInputEqual = (option, value) => option.eventActionInputId == value.eventActionInputId;
    const eventActionInputFilter = (inputEvents, state) => {
        const text = state.inputValue.toLowerCase(); // case insensitive search
        return inputEvents.filter(e => (
            e.eventActionInputName.toLowerCase().includes(text)
        ))
    }
    const getEventActionInputName = (e) => e.eventActionInputName;

    const eventActionOutputEqual = (option, value) => option.eventActionOutputId == value.eventActionOutputId;
    const eventActionOutputFilter = (outputEvents, state) => {
        const text = state.inputValue.toLowerCase(); // case insensitive search
        return outputEvents.filter(e => (
            e.eventActionOutputName.toLowerCase().includes(text)
        ))
    }
    const getEventActionOutputName = (e) => e.eventActionOutputName;
    
    const changeEntranceController = (newValue) => {
        setEntrancesControllers(newValue);
        // const updatedInfo = [...eventsManagementInfoArr];
        const entrancesOnly = newValue.filter(e => e.entranceId != undefined || e.entranceId != null);
        const controllersOnly = newValue.filter(c => c.controllerId != undefined || c.controllerId != null);
        const entrancesIds = entrancesOnly.map(e => e.entranceId);
        const controllersIds = controllersOnly.map(c => c.controllerId);
        // for (let i = 0; i < updatedInfo.length; i++) {
        //     updatedInfo[i]['entranceIds'] = entrancesOnly.map(e => e.entranceId);
        //     updatedInfo[i]['controllerIds'] = controllersOnly.map(c => c.controllerId);
        // }
        setEntrances(entrancesIds);
        setControllers(controllersIds);
        // setEventsManagementInfoArr(updatedInfo);
    }
    const changeInputEventsWithoutTimer = (newValue, id) => {
        const updatedInfo = [...eventsManagementInfoArr];
        const eventManagementToBeUpdated = updatedInfo.find(info => info.eventsManagementId == id);
        const newValueMapped = newValue.map(i => {
            return {
                timerDuration: null,
                eventActionInputType: {
                    eventActionInputId : i.eventActionInputId
                }
            }
        })
        const filteredInputEventsWithTimerFromEventManagement = eventManagementToBeUpdated['inputEvents'].filter(i => i.timerDuration != null)
        eventManagementToBeUpdated['inputEvents'] = filteredInputEventsWithTimerFromEventManagement.push(newValueMapped);
        setEventsManagementInfoArr(updatedInfo);
        setInputEventsWithoutTimer(newValue);
    }
    const changeOutputEventsWithoutTimer = (newValue, id) => {
        const updatedInfo = [...eventsManagementInfoArr];
        const eventManagementToBeUpdated = updatedInfo.find(info => info.eventsManagementId == id);
        const newValueMapped = newValue.map(i => {
            return {
                timerDuration: null,
                eventActionOutputType: {
                    eventActionOutputId : i.eventActionOutputId
                }
            }
        })
        const filteredOutputEventsWithTimerFromEventManagement = eventManagementToBeUpdated['outputActions'].filter(i => i.timerDuration != null)
        eventManagementToBeUpdated['outputActions'] = filteredOutputEventsWithTimerFromEventManagement.push(newValueMapped);
        setEventsManagementInfoArr(updatedInfo);
        setOutputEventsWithoutTimer(newValue);
    }

    const changeInputEventsWithTimer = (newValue, id) => {
        // const updatedInfo = [...eventsManagementInfoArr];
        // const eventManagementToBeUpdated = updatedInfo.find(info => info.eventsManagementId == id);
        // const filteredInputEventsWithoutTimerFromEventManagement = eventManagementToBeUpdated['inputEvents'].filter(i => i.timerDuration == null || i.timerDuration == undefined)
        // eventManagementToBeUpdated['inputEvents'] = filteredInputEventsWithoutTimerFromEventManagement.push(newValue);
        // setEventsManagementInfoArr(updatedInfo);
        setInputEventsWithTimer(newValue);
    }
    const changeOutputEventsWithTimer = (newValue, id) => {
        // const updatedInfo = [...eventsManagementInfoArr];
        // const eventManagementToBeUpdated = updatedInfo.find(info => info.eventsManagementId == id);
        // const filteredOutputEventsWithTimerFromEventManagement = eventManagementToBeUpdated['outputActions'].filter(i => i.timerDuration != null)
        // eventManagementToBeUpdated['outputActions'] = filteredOutputEventsWithTimerFromEventManagement.push(newValue);
        // setEventsManagementInfoArr(updatedInfo);
        setOutputEventsWithTimer(newValue);
    }
 
    return(
        <>
            <Head>
                <title>
                    Etlas: Create Events Management
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
                            href={`/dashboard/events-management`}
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
                                    Events Management
                                </Typography>
                            </Link>
                        </NextLink>
                    </Box>
                    <Box marginBottom={3}>
                        <Typography variant="h3">
                            Create Events Management
                        </Typography>
                        {/* <Grid container
                            marginLeft={0.5}
                            marginBottom={1}>
                            <Grid item
                                mr={1}>
                                <Typography variant="body2"
                                            color="neutral.500">
                                {"Modifying for: "}
                                </Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="body2"
                                            color="neutral.500"
                                            fontWeight="bold">
                                {accGrp?accGrp.accessGroupName:"undefined"}
                                </Typography>
                            </Grid>
                        </Grid> */}
                        <Box marginTop={1}>
                            <Alert severity="info"
                                variant="outlined">Quick tip : You may select more than one entrance/controller to apply these actions to multiple entrances/controllers
                            </Alert>
                        </Box>
                    </Box>
                    <Grid container
                        alignItems="center"
                        mb={3}>
                        <Grid item
                            mr={2}>
                            <Typography fontWeight="bold">Controller(s)/ Entrance(s) :</Typography>
                        </Grid>
                        <Grid item
                            xs={11}
                            md={7}>
                            <MultipleSelectInput
                                options={[...allEntrances, ...allControllers]}
                                setSelected={changeEntranceController}
                                getOptionLabel={getEntranceControllerName}
                                label="Controllers/ Entrances"
                                noOptionsText="No controller/ entrance found"
                                placeholder="Search for controller name or entrance name"
                                filterOptions={entranceControllerFilter}
                                value={entrancesControllers}
                                isOptionEqualToValue={entranceControllerEqual}
                                error={
                                    Boolean(entrancesControllers.length==0)
                                }
                                helperText={
                                    Boolean(entrancesControllers.length == 0) && "Error : no entrance/ controller selected" || 
                                    Boolean(controllers.length != 0) && "Note: When a controller is selected, some input/output types may be unavailable. You may only create events management for entrances with those input/output types"
                                }
                            />
                        </Grid>
                    </Grid>
                    <form onSubmit={(e) => { e.nativeEvent.submitter.name =="add"? (addOn(e)):(replaceAll(e))}}>
                        <Stack spacing={3}>
                            { eventsManagementInfoArr.map((eventsManagementInfo, i) => (
                                <EditEventManagementForm
                                    key={eventsManagementInfo.eventsManagementId}
                                    eventsManagementInfo={eventsManagementInfo}
                                    removeCard={removeCard}
                                    changeTimeStart={changeTimeStart}
                                    changeTimeEnd={changeTimeEnd}
                                    eventsManagementValidations={eventsManagementValidationsArr[i]}
                                    changeTextField={onNameChangeFactory(eventsManagementInfo.eventsManagementId)}
                                    changeNameCheck={changeNameCheck}
                                    changeRrule={changeRrule}
                                    checkUntil={checkUntil(eventsManagementInfo.eventsManagementId)}
                                    changeInputEventsWithoutTimer={changeInputEventsWithoutTimer}
                                    changeOutputEventsWithoutTimer={changeOutputEventsWithoutTimer}
                                    eventActionInputEqual={eventActionInputEqual}
                                    eventActionInputFilter={eventActionInputFilter}
                                    getEventActionInputName={getEventActionInputName}
                                    eventActionOutputEqual={eventActionOutputEqual}
                                    eventActionOutputFilter={eventActionOutputFilter}
                                    getEventActionOutputName={getEventActionOutputName}
                                    allInputEvents={inputEvents}
                                    allOutputEvents={outputEvents}
                                    changeInputEventsWithTimer={changeInputEventsWithTimer}
                                    changeOutputEventsWithTimer={changeOutputEventsWithTimer}
                                />
                            ))}
                            <div>
                                <Button
                                    size="large"
                                    variant="outlined"
                                    startIcon={<Add />}
                                    onClick={addCard}
                                >
                                    Add events management
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
                                            entrancesControllers.length == 0 ||
                                            inputEvents.length == 0 ||
                                            outputActions.length == 0 ||
                                            eventsManagementValidationsArr.some( // check if validations fail
                                                validation => validation.eventsManagementNameBlank        ||
                                                validation.timeEndInvalid ||
                                                validation.untilInvalid ||
                                                validation.timeStartInvalid
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
                                            entrancesControllers.length == 0
                                            // eventsManagementValidationsArr.some( // check if validations fail
                                            //     validation => validation.eventsManagementNameBlank        ||
                                            //     validation.timeEndInvalid ||
                                            //     validation.untilInvalid ||
                                            //     validation.timeStartInvalid
                                            // )
                                        }
                                    >
                                        Add on
                                    </Button>
                                </Grid>
                                <Grid item>
                                    <NextLink
                                        href="/dashboard/events-management/"
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

CreateEventManagement.getLayout = (page) => (
    <AuthGuard>
        <DashboardLayout>
            { page }
        </DashboardLayout>
    </AuthGuard>
)

export default CreateEventManagement;