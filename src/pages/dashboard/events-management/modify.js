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
import { Info } from "@mui/icons-material";
import { controllerApi } from "../../../api/controllers";
import entranceApi from "../../../api/entrance";
import { eventsManagementApi } from "../../../api/events-management";
import EventsManagementAddOnError from "../../../components/dashboard/events-management/events-management-add-on-error";
import { Confirmdelete } from "../../../components/dashboard/events-management/confirm-delete";
import { input } from "aws-amplify";

const ModifyEventManagement = () => {
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
    const [inputEventsWithoutTimer, setInputEventsWithoutTimer] = useState({});
    const [outputActionsWithoutTimer, setOutputActionsWithoutTimer] = useState({});
    const [inputEventsWithTimer, setInputEventsWithTimer] = useState({});
    const [outputEventsWithTimer, setOutputEventsWithTimer] = useState({});

    const [open, setOpen] = useState(false);
    const [errorMessages, setErrorMessages] = useState([]);
    const [singleErrorMessage, setSingleErrorMessage] = useState([]);

    // for selection of checkboxes
    const [selectedEventsManagement, setSelectedEventsManagement] = useState([]);
    const selectedAllEventsManagement = selectedEventsManagement.length === [...new Set(singleErrorMessage.map(e => e.eventsManagementId))].length;
    const selectedSomeEventsManagement = selectedEventsManagement.length > 0 && !selectedAllEventsManagement;
    const handleSelectAllEventsManagement = (e) => setSelectedEventsManagement(e.target.checked ? [...new Set(singleErrorMessage.map(e => e.eventsManagementId))] : []);
    const handleSelectFactory = (eventsManagementId) => () => {
        console.log(eventsManagementId, "the eventsManagementId getting passed");
        console.log(singleErrorMessage, "singleErrorMessage");
        if (selectedEventsManagement.includes(eventsManagementId)) {
            setSelectedEventsManagement(selectedEventsManagement.filter(id => id !== eventsManagementId));
        } else {
            setSelectedEventsManagement([ ...selectedEventsManagement, eventsManagementId ]);
        }
    }
    const handleClose = () => {
        setOpen(false);
        setErrorMessages([]);
        setSingleErrorMessage([]);
    };

    const handleErrorMessages = (res) => {
        console.log(res, "errorMessages");
        setErrorMessages(res);
        setOpen(true);
    }

    //for delete action button
	const [deleteOpen, setDeleteOpen] = useState(false); 

    const handleDeleteOpen = () => {        
		setDeleteOpen(true);           
	};
	const handleDeleteClose = () => {
		setDeleteOpen(false);
    }


    // This check is dependant on the name of the custom input to not change eg: remain GEN_IN_1 and GEN_OUT_1
    // Only check for this conflict in changeInputEventsWithoutTimer and changeOutputActionsWithTimer as these are the types of the custom input/output
    const [customInputEventsSelected, setCustomInputEventsSelected] = useState(new Set());     // List of custom input events (GEN_IN_1, etc) that is selected for validation
    const [customOutputEventsSelected, setCustomOutputEventsSelected] = useState(new Set());    // List of custom output events (GEN_OUT_1, etc) that is selected for validation

    const deleteEventsManagement = async() => {
		Promise.all(selectedEventsManagement.map(id=>{
			return eventsManagementApi.deleteEventsManagement(id)
		})).then( resArr => {
			resArr.filter(res=>{
				if(res.status == 200){
					toast.success('Delete success',{duration:2000},);
				}
				else{
					toast.error('Delete unsuccessful' )
				}
			})
		})
		setDeleteOpen(false);
        setSelectedEventsManagement([])
    };
    
    const getAllControllers = useCallback(async() => {
        const controllersRes = await controllerApi.getControllers();
        if (controllersRes.status !== 200) {
            toast.error("Controllers not loaded");
            setAllControllers([]);
        }
        const controllersJson = await controllersRes.json();
        if (isMounted()){
            setAllControllers(controllersJson);
        }
    }, [isMounted]);

    const getAllInputOutputEvents = useCallback(async(forController) => {
        const inputEventsRes = await eventsManagementApi.getInputEvents(forController);
        const outputEventsRes = await eventsManagementApi.getOutputEvents(forController);
        if (inputEventsRes.status !== 200) {
            toast.error("Trigger options failed to load");
            setInputEvents([]);
        }
        if (outputEventsRes.status !== 200) {
            toast.error("Action options failed to load");
            setOutputEvents([]);
        }
        const inputEventsJson = await inputEventsRes.json();
        const outputEventsJson = await outputEventsRes.json();
        if (isMounted()){
            setInputEvents(inputEventsJson);
            setOutputEvents(outputEventsJson);
        }
    }, [isMounted]);

    const getAllEntrances = useCallback(async () => {
        const res = await entranceApi.getEntrances();
        if (res.status != 200) {
            toast.error("Entrances failed to load");
            setAllEntrances([]);
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
        } catch (error) {
            console.log(error)
        }
    }, [])

    // empty objects for initialisation of new card
    const getEmptyEventsManagementInfo = (eventsManagementId) => ({
        eventsManagementId,
        eventsManagementName:"",
        triggerSchedules: [],
        inputEvents: [],
        outputActions: [],
    });
    const getEmptyEventsManagementValidations = (eventsManagementId) => ({
        eventsManagementId,
        eventsManagementNameBlank: false,
        eventsManagementInputEventsEmpty: false,
        eventsManagementInputEventsInvalidId: false,
        eventsManagementInputEventsConflict: false,
        eventsManagementOutputActionsEmpty: false,
        eventsManagementOutputActionsInvalidId: false,
        eventsManagementOutputActionsConflict: false,
        eventsManagementTriggerSchedulesEmpty: false,
        timeEndInvalid:false,
        timeStartInvalid:false,
        untilInvalid:false,
        submitFailed: false
    });

    const [eventsManagementInfoArr, 
        setEventsManagementInfoArr] = useState([getEmptyEventsManagementInfo(0)]);
    const [eventsManagementValidationsArr, 
        setEventsManagementValidationsArr] = useState([getEmptyEventsManagementValidations(0)]);

    useEffect(() => {
        try {
            getAllInputOutputEvents(controllers.length > 0);
            // const inputEventsId = inputEvents.map(event => event.eventActionInputId);
            // const outputActionsId = outputEvents.map(event => event.eventActionOutputId);
            // const updatedEventsManagementInfo = [...eventsManagementInfoArr];
            // for (let i = 0; i < updatedEventsManagementInfo.length; i++) {
            //     const eventsManagementInfo = updatedEventsManagementInfo[i];
            //     const eventsManagementInfoInputEvents = eventsManagementInfo.inputEvents;
            //     const eventsManagementInfoOutputActions = eventsManagementInfo.outputActions;
            //     let newInputEvents = [];
            //     let newInputEventsWithoutTimer = [];
            //     let newInputEventsWithTimer = [];
            //     for (let j = 0; j < eventsManagementInfoInputEvents.length; j++) {
            //         const inputEvent = eventsManagementInfoInputEvents[j];
            //         const inputEventFromApi = inputEvents.find(event => event.eventActionInputId === inputEvent.eventActionInputType.eventActionInputId);
            //         if (inputEvent.eventActionInputType.eventActionInputId in inputEventsId) {
            //             newInputEvents.push(inputEvent);
            //             if (inputEvent.timerDuration === null || inputEvent.timerDuration === undefined) {
            //                 newInputEventsWithoutTimer.push(inputEventFromApi);
            //             } else {
            //                 newInputEventsWithTimer.push(inputEventFromApi);
            //             }
            //         }
            //     }
            //     eventsManagementInfo['inputEvents'] = newInputEvents;
            //     setInputEventsWithoutTimer({ ...inputEventsWithoutTimer, [eventsManagementInfo.eventsManagementId]: newInputEventsWithoutTimer });
            //     setInputEventsWithTimer({ ...inputEventsWithTimer, [eventsManagementInfo.eventsManagementId]: newInputEventsWithTimer });
                
            //     let newOutputActions = [];
            //     let newOutputActionsWithoutTimer = [];
            //     let newOutputActionsWithTimer = [];
            //     for (let j = 0; j < eventsManagementInfoOutputActions.length; j++) {
            //         const outputAction = eventsManagementInfoOutputActions[j];
            //         const outputActionFromApi = outputEvents.find(event => event.eventActionOutputId === outputAction.eventActionOutputType.eventActionOutputId);
            //         if (outputAction.eventActionOutputType.eventActionOutputId in outputActionsId) {
            //             newOutputActions.push(outputAction);
            //             if (outputAction.timerDuration === null || outputAction.timerDuration === undefined) {
            //                 newOutputActionsWithoutTimer.push(outputActionFromApi);
            //             } else {
            //                 newOutputActionsWithTimer.push(outputActionFromApi);
            //             }
            //         }
            //     }
            //     eventsManagementInfo['outputActions'] = newOutputActions;
            //     setOutputActionsWithoutTimer({ ...outputActionsWithoutTimer, [eventsManagementInfo.eventsManagementId]: newOutputActionsWithoutTimer });
            //     setOutputEventsWithTimer({ ...outputEventsWithTimer, [eventsManagementInfo.eventsManagementId]: newOutputActionsWithTimer });
            // }
            // setEventsManagementInfoArr(updatedInfo);
        } catch (error) {
            console.log(error)
        }
    }, [controllers])

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

    // change triggerSchedules
    const changeTriggerSchedules = (value,id) =>{
        const updatedInfo = [...eventsManagementInfoArr];
        const eventManagementToBeUpdated = updatedInfo.find(info => info.eventsManagementId == id);
        eventManagementToBeUpdated['triggerSchedules'] = value;
        setEventsManagementInfoArr(updatedInfo);

        // validations
        const newValidations = [...eventsManagementValidationsArr];
        const validation = newValidations.find(v => v.eventsManagementId == id);
        validation.eventsManagementTriggerSchedulesEmpty = value.length === 0;
        setEventsManagementValidationsArr(newValidations);
    }

    const checkAnyTimeEndForEventManagement = (id) => (bool) => {
        const newValidations = [ ...eventsManagementValidationsArr ];
        const validation = newValidations.find(v => v.eventsManagementId == id);
        validation.timeEndInvalid = bool;
        setEventsManagementValidationsArr(newValidations)
    }
    const checkAnyTimeStartForEventManagement = (id) => (bool) => {
        const newValidations = [ ...eventsManagementValidationsArr ];
        const validation = newValidations.find(v => v.eventsManagementId == id);
        validation.timeStartInvalid = bool;
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
    const checkAnyUntilForEventManagement = (id) => (bool) => {
        const newValidations = [...eventsManagementValidationsArr];
        const validation = newValidations.find(v => v.eventsManagementId == id);
        validation.untilInvalid = bool
        setEventsManagementValidationsArr(newValidations);

    }

    const replaceAll = (e) => {
        e.preventDefault();
        Promise.resolve(eventsManagementApi.replaceEventsManagement(eventsManagementInfoArr, entrances, controllers))
        .then(res =>{
            if (res.status!=201){ 
                (res.json()).then(data => {
                    const array = [];
                    Object.entries(data[0]).map(([key,value]) => {
                        value.map( singleData => 
                            // console.log(key, singleData))
                            array.push(singleData))
                    })
                    setSingleErrorMessage(array)
                    handleErrorMessages(data)
                    // getClashingEventsManagement
                })     
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
        Promise.resolve(eventsManagementApi.addEventsManagement(eventsManagementInfoArr, entrances, controllers))
        .then(res =>{
            if (res.status!=201){ 
                (res.json()).then(data => {
                    const array = [];
                    Object.entries(data[0]).map(([key,value]) => {
                        value.map( singleData => 
                            // console.log(key, singleData))
                            array.push(singleData))
                    })
                    setSingleErrorMessage(array)
                    handleErrorMessages(data)
                    // getClashingEventsManagement
                })     
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

    const eventActionOutputEqual = (option, value) => option.eventActionOutputId == value.eventActionOutputId;
    const eventActionOutputFilter = (outputEvents, state) => {
        const text = state.inputValue.toLowerCase(); // case insensitive search
        return outputEvents.filter(e => (
            e.eventActionOutputName.toLowerCase().includes(text)
        ))
    }
    const getEventActionOutputName = (e) => e.eventActionOutputName;

    const checkInputOutputConflict = () => {
        const selectedOutputEvents = new Set();
        for (let i = 0; i < eventsManagementInfoArr.length; i++) {
            const currEventManagement = eventsManagementInfoArr[i];
            let currOutputActions = currEventManagement.outputActions;
            for (let j = 0; j < currOutputActions.length; j++) {
                if (currOutputActions[j].timerDuration) {
                    const outputEventId = currOutputActions[j].eventActionOutputType.eventActionOutputId;
                    const outputEventEntity = outputEvents.find(e => e.eventActionOutputId == outputEventId);
                    if (outputEventEntity.eventActionOutputName == 'GEN_OUT_1') {
                        selectedOutputEvents.add('GEN_OUT_1');
                    } else if (outputEventEntity.eventActionOutputName == 'GEN_OUT_2') {
                        selectedOutputEvents.add('GEN_OUT_2');
                    } else if (outputEventEntity.eventActionOutputName == 'GEN_OUT_3') {
                        selectedOutputEvents.add('GEN_OUT_3');
                    }
                }
            }
        }

        console.log(selectedOutputEvents, "selectedOutputEvents");
        setCustomOutputEventsSelected(selectedOutputEvents);
  
        const selectedInputEvents = new Set();
        for (let i = 0; i < eventsManagementInfoArr.length; i++) {
            const currEventManagement = eventsManagementInfoArr[i];
            let currInputEvents = currEventManagement.inputEvents;
            for (let j = 0; j < currInputEvents.length; j++) {
                if (currInputEvents[j].timerDuration) {
                    continue;
                }
                const inputEventId = currInputEvents[j].eventActionInputType.eventActionInputId;
                const inputEventEntity = inputEvents.find(e => e.eventActionInputId == inputEventId);
                if (inputEventEntity.eventActionInputName == 'GEN_IN_1') {
                    selectedInputEvents.add('GEN_IN_1');
                } else if (inputEventEntity.eventActionInputName == 'GEN_IN_2') {
                    selectedInputEvents.add('GEN_IN_2');
                } else if (inputEventEntity.eventActionInputName == 'GEN_IN_3') {
                    selectedInputEvents.add('GEN_IN_3');
                }
            }
        }
        console.log(selectedInputEvents, "selectedInputEvents");
        setCustomInputEventsSelected(selectedInputEvents);
    }

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
        const inputEventToBeAdded = inputEvents.find(e => e.eventActionInputId == newValue);
        const eventManagementToBeUpdatedInputEvents = eventManagementToBeUpdated['inputEvents'];
        let newInputEvents = []
        for (let j = 0; j < eventManagementToBeUpdatedInputEvents.length; j++) {
            if (eventManagementToBeUpdatedInputEvents[j].timerDuration) {
                newInputEvents.push(eventManagementToBeUpdatedInputEvents[j])
            }
        }
        if (newValue) {
            newInputEvents.push(...[{
                timerDuration: null,
                eventActionInputType: {
                    eventActionInputId: newValue
                }
            }]);
        }
        eventManagementToBeUpdated['inputEvents'] = newInputEvents;
        setEventsManagementInfoArr(updatedInfo);
        setInputEventsWithoutTimer({ ...inputEventsWithoutTimer, [id]: newValue });

        checkInputOutputConflict();
        // validations
        const newValidations = [...eventsManagementValidationsArr];
        const validation = newValidations.find(v => v.eventsManagementId == id);
        validation.eventsManagementInputEventsEmpty = newInputEvents.length === 0;
        if (!newValue) {
            validation.eventsManagementInputEventsInvalidId = true;
        } else {
            switch (inputEventToBeAdded.eventActionInputName) {
                case 'GEN_IN_1':
                    if (customOutputEventsSelected.has('GEN_OUT_1')) {
                        validation.eventsManagementInputEventsConflict = true;
                    }
                    break;
                case 'GEN_IN_2':
                    if (customOutputEventsSelected.has('GEN_OUT_2')) {
                        validation.eventsManagementInputEventsConflict = true;
                    }
                    break;
                case 'GEN_IN_3':
                    if (customOutputEventsSelected.has('GEN_OUT_3')) {
                        validation.eventsManagementInputEventsConflict = true;
                    }
                    break;
                default:
                    validation.eventsManagementInputEventsConflict = false;
                    break;
            }
        }
        setEventsManagementValidationsArr(newValidations);
    }
    const changeOutputActionsWithoutTimer = (newValue, id) => {
        const updatedInfo = [...eventsManagementInfoArr];
        const eventManagementToBeUpdated = updatedInfo.find(info => info.eventsManagementId == id);
        const eventManagementToBeUpdatedOutputActions = eventManagementToBeUpdated['outputActions'];
        const newValueMapped = newValue.map(i => {
            return {
                timerDuration: null,
                eventActionOutputType: {
                    eventActionOutputId : i.eventActionOutputId
                }
            }
        })
        let newOutputActions = []
        for (let j = 0; j < eventManagementToBeUpdatedOutputActions.length; j++) {
            if (eventManagementToBeUpdatedOutputActions[j].timerDuration) {
                newOutputActions.push(eventManagementToBeUpdatedOutputActions[j])
            }
        }
        newOutputActions.push(...newValueMapped);
        eventManagementToBeUpdated['outputActions'] = newOutputActions;
        setEventsManagementInfoArr(updatedInfo);
        setOutputActionsWithoutTimer({ ...outputActionsWithoutTimer, [id]: newValue });
        
        // validations
        const newValidations = [...eventsManagementValidationsArr];
        const validation = newValidations.find(v => v.eventsManagementId == id);
        validation.eventsManagementOutputActionsEmpty = newOutputActions.length === 0;
        if (newValueMapped.filter(i => i.eventActionOutputType.eventActionOutputId == null || i.eventActionOutputType.eventActionOutputId == undefined).length > 0) {
            validation.eventsManagementOutputActionsInvalidId = true;
        }
        setEventsManagementValidationsArr(newValidations);
    }

    const changeInputEventsWithTimer = (newValue, id) => {
        const updatedInfo = [...eventsManagementInfoArr];
        const eventManagementToBeUpdated = updatedInfo.find(info => info.eventsManagementId == id);
        const eventManagementToBeUpdatedInputEvents = eventManagementToBeUpdated['inputEvents'];
        let newInputEvents = []
        for (let j = 0; j < eventManagementToBeUpdatedInputEvents.length; j++) {
            if (eventManagementToBeUpdatedInputEvents[j].timerDuration == null || eventManagementToBeUpdatedInputEvents[j].timerDuration == undefined) {
                newInputEvents.push(eventManagementToBeUpdatedInputEvents[j])
            }
        }
        newInputEvents.push(...newValue);
        eventManagementToBeUpdated['inputEvents'] = newInputEvents;
        setEventsManagementInfoArr(updatedInfo);
        setInputEventsWithTimer({ ...inputEventsWithTimer, [id]: newValue });

        // validations
        const newValidations = [...eventsManagementValidationsArr];
        const validation = newValidations.find(v => v.eventsManagementId == id);
        validation.eventsManagementInputEventsEmpty = newInputEvents.length === 0;
        if (newValue.filter(i => i.eventActionInputType.eventActionInputId == null || i.eventActionInputType.eventActionInputId == undefined).length > 0) {
            validation.eventsManagementInputEventsInvalidId = true;
        }
        setEventsManagementValidationsArr(newValidations);
    }

    const changeOutputActionsWithTimer = (newValue, id) => {
        const updatedInfo = [...eventsManagementInfoArr];
        const eventManagementToBeUpdated = updatedInfo.find(info => info.eventsManagementId == id);
        const eventManagementToBeUpdatedOutputEvents = eventManagementToBeUpdated['outputActions'];
        let newOutputActions = []
        for (let j = 0; j < eventManagementToBeUpdatedOutputEvents.length; j++) {
            if (eventManagementToBeUpdatedOutputEvents[j].timerDuration == null || eventManagementToBeUpdatedOutputEvents[j].timerDuration == undefined) {
                newOutputActions.push(eventManagementToBeUpdatedOutputEvents[j])
            }
        }
        newOutputActions.push(...newValue);
        eventManagementToBeUpdated['outputActions'] = newOutputActions;
        setEventsManagementInfoArr(updatedInfo);
        setOutputEventsWithTimer({ ...outputEventsWithTimer, [id]: newValue });
        
        checkInputOutputConflict();

        // validations
        const newValidations = [...eventsManagementValidationsArr];
        const validation = newValidations.find(v => v.eventsManagementId == id);
        validation.eventsManagementOutputActionsEmpty = newOutputActions.length === 0;
        if (newValue.filter(i => i.eventActionOutputType.eventActionOutputId == null || i.eventActionOutputType.eventActionOutputId == undefined).length > 0) {
            validation.eventsManagementOutputActionsInvalidId = true;
        }

        for (let i = 0; i < newValue.length; i++) {
            const outputActionToBeAdded = outputEvents.find(e=> e.eventActionOutputId === newValue[i].eventActionOutputType.eventActionOutputId);
            switch (outputActionToBeAdded.eventActionOutputName) {
                case 'GEN_OUT_1':
                    if (customInputEventsSelected.has('GEN_IN_1')) {
                        validation.eventsManagementOutputActionsConflict = true;
                    }
                    break;
                case 'GEN_OUT_2':
                    if (customInputEventsSelected.has('GEN_IN_2')) {
                        validation.eventsManagementOutputActionsConflict = true;
                    }
                    break;
                case 'GEN_OUT_3':
                    if (customInputEventsSelected.has('GEN_IN_3')) {
                        validation.eventsManagementOutputActionsConflict = true;
                    }
                    break;
                default:
                    validation.eventsManagementOutputActionsConflict = false;
                    break;
            }
        }
        setEventsManagementValidationsArr(newValidations);
    }
 
    return(
        <>
            <Head>
                <title>
                    Etlas: Modify Events Management
                </title>
            </Head>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    py: 8
                }}
            >
                <Confirmdelete
                    open={deleteOpen} 
                    handleDialogClose={handleDeleteClose}
                    selectedEventsManagement={selectedEventsManagement}
                    deleteEventsManagement={deleteEventsManagement}
                />
                <EventsManagementAddOnError
                    errorMessages={errorMessages}
                    handleClose={handleClose}
                    open={open}
                    deleteEventsManagement={handleDeleteOpen}
                    handleSelectFactory={handleSelectFactory}
                    selectedEventsManagement={selectedEventsManagement}
                    selectedSomeEventsManagement={selectedSomeEventsManagement}
                    selectedAllEventsManagement={selectedAllEventsManagement}
                    handleSelectAllEventsManagement={handleSelectAllEventsManagement}
                />
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
                            Modify Events Management
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
                                    Boolean(controllers.length != 0) && "Note: When a controller is selected, some trigger/action(s) may be unavailable. You may only create events management for entrances with those input/output types"
                                }
                            />
                        </Grid>
                    </Grid>
                    <form onSubmit={(e) => { e.nativeEvent.submitter.name =="add"? (addOn(e)):(replaceAll(e))}}>
                        <Stack spacing={3}>
                            {eventsManagementInfoArr.map((eventsManagementInfo, i) => {
                                return (
                                    <EditEventManagementForm
                                        key={eventsManagementInfo.eventsManagementId}
                                        eventsManagementInfo={eventsManagementInfo}
                                        removeCard={removeCard}
                                        eventsManagementValidations={eventsManagementValidationsArr[i]}
                                        changeTextField={onNameChangeFactory(eventsManagementInfo.eventsManagementId)}
                                        changeNameCheck={changeNameCheck}
                                        changeTriggerSchedules={changeTriggerSchedules}
                                        checkAnyUntilForEventManagement={checkAnyUntilForEventManagement(eventsManagementInfo.eventsManagementId)}
                                        checkAnyTimeStartForEventManagement={checkAnyTimeStartForEventManagement(eventsManagementInfo.eventsManagementId)}
                                        checkAnyTimeEndForEventManagement={checkAnyTimeEndForEventManagement(eventsManagementInfo.eventsManagementId)}
                                        changeInputEventsWithoutTimer={changeInputEventsWithoutTimer}
                                        changeOutputActionsWithoutTimer={changeOutputActionsWithoutTimer}
                                        eventActionOutputEqual={eventActionOutputEqual}
                                        eventActionOutputFilter={eventActionOutputFilter}
                                        getEventActionOutputName={getEventActionOutputName}
                                        changeInputEventsWithTimer={changeInputEventsWithTimer}
                                        changeOutputActionsWithTimer={changeOutputActionsWithTimer}
                                        inputEventsValueWithoutTimer={inputEventsWithoutTimer}
                                        outputActionsValueWithoutTimer={outputActionsWithoutTimer}
                                        allInputEvents={inputEvents}
                                        allOutputEvents={outputEvents}
                                    />
                                )
                            })}
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
                                            eventsManagementValidationsArr.some( // check if validations fail
                                                validation => validation.eventsManagementNameBlank        ||
                                                validation.timeEndInvalid ||
                                                validation.untilInvalid ||
                                                validation.timeStartInvalid ||
                                                validation.eventsManagementInputEventsEmpty ||
                                                validation.eventsManagementInputEventsInvalidId ||
                                                validation.eventsManagementInputEventsConflict ||
                                                validation.eventsManagementOutputActionsEmpty ||
                                                validation.eventsManagementOutputActionsInvalidId ||
                                                validation.eventsManagementOutputActionsConflict ||
                                                validation.eventsManagementTriggerSchedulesEmpty
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
                                            entrancesControllers.length == 0 ||
                                            eventsManagementValidationsArr.some( // check if validations fail
                                                validation => validation.eventsManagementNameBlank        ||
                                                validation.timeEndInvalid ||
                                                validation.untilInvalid ||
                                                validation.timeStartInvalid ||
                                                validation.eventsManagementInputEventsEmpty ||
                                                validation.eventsManagementInputEventsInvalidId ||
                                                validation.eventsManagementInputEventsConflict ||
                                                validation.eventsManagementOutputActionsEmpty ||
                                                validation.eventsManagementOutputActionsInvalidId ||
                                                validation.eventsManagementOutputActionsConflict ||
                                                validation.eventsManagementTriggerSchedulesEmpty
                                            )
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

ModifyEventManagement.getLayout = (page) => (
    <AuthGuard>
        <DashboardLayout>
            { page }
        </DashboardLayout>
    </AuthGuard>
)

export default ModifyEventManagement;