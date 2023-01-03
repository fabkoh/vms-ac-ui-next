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
import EditEventManagementForm from "../../../components/dashboard/events-management/edit/events-management-create-form";
import MultipleSelectInput from "../../../components/dashboard/shared/multi-select-input"
import { Info } from "@mui/icons-material";
import { controllerApi } from "../../../api/controllers";
import entranceApi from "../../../api/entrance";
import { eventsManagementApi } from "../../../api/events-management";
import EventsManagementAddOnError from "../../../components/dashboard/events-management/events-management-add-on-error";
import { Confirmdelete } from "../../../components/dashboard/events-management/confirm-delete";
import { input } from "aws-amplify";
import { ServerDownError } from "../../../components/dashboard/errors/server-down-error";
import { serverDownCode } from "../../../api/api-helpers";
import { validatePhoneNumber, validateEmail } from "../../../utils/utils";
import { ConfirmNotificationDisabledSubmit } from "../../../components/dashboard/events-management/confirm-notification-disabled-submit";
import notificationConfigApi from "../../../api/notifications-config";

const ModifyEventManagement = () => {
    const router = useRouter();
    const isMounted = useMounted();
    const temp = router.query;
    // const eventsManagementId = temp.eventsManagementId;

    const [allEntrances, setAllEntrances] = useState([]);
    const [allControllers, setAllControllers] = useState([]);
    const [entrancesControllers, setEntrancesControllers] = useState([]);
    const [entrances, setEntrances] = useState([]);
    const [controllers, setControllers] = useState([]);
    const [inputEvents, setInputEvents] = useState([]);
    const [outputEvents, setOutputEvents] = useState([]);
    const [smsConfig, setSMSConfig] = useState({});
    const [emailConfig, setEmailConfig] = useState({});
    const [inputEventsWithoutTimer, setInputEventsWithoutTimer] = useState({});
    const [outputActionsWithoutTimer, setOutputActionsWithoutTimer] = useState({});
    const [inputEventsWithTimer, setInputEventsWithTimer] = useState({});
    const [outputEventsWithTimer, setOutputEventsWithTimer] = useState({});

    // dictionary, key is event management ID, value is the email {recipient (an array), content}
    const [notificationEmails, setNotificationEmails] = useState({});
    // dictionary, key is event management ID, value is the SMS {recipient (an array), content}
    const [notificationSMSs, setNotificationSMSs] = useState({});

    const [open, setOpen] = useState(false);
    const [serverDownOpen, setServerDownOpen] = useState(false);
    const [notificationDisabledOpen, setNotificationDisabledOpen] = useState(false);

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

    const [action, setAction] = useState("");
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
        handleClose();
		setDeleteOpen(false);
    }


    // This check is dependant on the name of the custom input to not change eg: remain GEN_IN_1 and GEN_OUT_1
    // Only check for this conflict in changeInputEventsWithoutTimer and changeOutputActionsWithTimer as these are the types of the custom input/output
    const [customInputEventsSelected, setCustomInputEventsSelected] = useState({});     // List of custom input events (GEN_IN_1, etc) that is selected for validation
    const [customOutputEventsSelected, setCustomOutputEventsSelected] = useState({});    // List of custom output events (GEN_OUT_1, etc) that is selected for validation

    const deleteEventsManagement = async (e) => {
        e.preventDefault();
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
            toast.error("Error loading controllers");
            setAllControllers([]);
            if (controllersRes.status == serverDownCode) {
                setServerDownOpen(true);
            }
            return;
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
            toast.error("Error loading trigger options");
            setInputEvents([]);
            if (inputEventsRes.status == serverDownCode) {
                setServerDownOpen(true);
            }
        }
        if (outputEventsRes.status !== 200) {
            toast.error("Error loading action options");
            setOutputEvents([]);
            if (outputEventsRes.status == serverDownCode) {
                setServerDownOpen(true);
            }
            return;
        }
        const inputEventsJson = await inputEventsRes.json();
        const outputEventsJson = await outputEventsRes.json();
        if (isMounted()){
            setInputEvents(inputEventsJson);
            setOutputEvents(outputEventsJson);
        }
    }, [isMounted]);

    const getSMSEmailConfig = useCallback(async() => {
        const smsNotificationConfig= await notificationConfigApi.getNotificationSMSConfig();
        const emailNotificationConfig = await notificationConfigApi.getNotificationEmailConfig();
        if (smsNotificationConfig.status !== 200) {
            toast.error("Error loading SMS config");
            setSMSConfig({});
            if (smsNotificationConfig.status == serverDownCode) {
                setServerDownOpen(true);
            }
        }
        if (emailNotificationConfig.status !== 200) {
            toast.error("Error loading email config");
            setEmailConfig({});
            if (emailNotificationConfig.status == serverDownCode) {
                setServerDownOpen(true);
            }
            return;
        }
        const smsConfigJson = await smsNotificationConfig.json();
        const emailConfigJson = await emailNotificationConfig.json();
        if (isMounted()){
            setSMSConfig(smsConfigJson);
            setEmailConfig(emailConfigJson);
        }
    }, [isMounted]);

    const getAllEntrances = useCallback(async () => {
        const res = await entranceApi.getEntrances();
        if (res.status != 200) {
            toast.error("Error loading entrances");
            setAllEntrances([]);
            if (res.status == serverDownCode) {
                setServerDownOpen(true);
            }
            return;
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
        eventsManagementEmail: null,
        eventsManagementSMS: null,
        eventsManagementDefaultTitle: "Event Management Triggered",
        eventsManagementDefaultContent: "An Event Management has been triggered.",
    });
    const getEmptyEventsManagementValidations = (eventsManagementId) => ({
        eventsManagementId,
        eventsManagementNameBlank: true,
        eventsManagementInputEventsEmpty: false,
        eventsManagementInputEventsInvalidId: false,
        eventsManagementInputEventsConflict: false,
        eventsManagementOutputActionsEmpty: false,
        eventsManagementOutputActionsInvalidId: false,
        eventsManagementOutputActionsConflict: false,
        eventsManagementTriggerSchedulesEmpty: false,
        eventsManagementInvalidEmailRecipients: false,
        eventsManagementInvalidSMSRecipients: false,
        eventsManagementEmailRecipientsEmpty: false,
        eventsManagementSMSRecipientsEmpty: false,
        timeEndInvalid:false,
        timeStartInvalid:true,
        beginInvalid:true,
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
        } catch (error) {
            console.log(error)
        }
    }, [controllers])

    useEffect(() => {
        getSMSEmailConfig();
    }, [])

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
        updateEventManagementDefaultTitle();
    }
    const checkAnyUntilForEventManagement = (id) => (bool) => {
        const newValidations = [...eventsManagementValidationsArr];
        const validation = newValidations.find(v => v.eventsManagementId == id);
        validation.untilInvalid = bool
        setEventsManagementValidationsArr(newValidations);

    }

    const checkAnyBeginForEventManagement = (id) => (bool) => {
        const newValidations = [...eventsManagementValidationsArr];
        const validation = newValidations.find(v => v.eventsManagementId == id);
        validation.beginInvalid = bool
        setEventsManagementValidationsArr(newValidations);
    }

    const submitReplaceAll = () => {
        Promise.resolve(eventsManagementApi.replaceEventsManagement(eventsManagementInfoArr, entrances, controllers))
        .then(res =>{
            if (res.status!=201){ 
                (res.json()).then(data => {
                    const array = [];
                    if (data[0]) {
                        Object.entries(data[0]).map(([key, value]) => {
                            value.map(singleData =>
                                // console.log(key, singleData))
                                array.push(singleData))
                        })
                    }
                    setSingleErrorMessage(array)
                    handleErrorMessages(data)
                    // getClashingEventsManagement
                })     
            }
            else {
                getSMSEmailConfig();
                toast.success("Successfully replaced all event managements")
                router.replace(`/dashboard/events-management`)
            }
        }).finally(() => setAction(""))
    }

    const replaceAll = (fromNotificationDisabledSubmit) => {
        setAction("replaceall");
        let isOpeningNotificationDisabled = false;
        if (!fromNotificationDisabledSubmit) {
            getSMSEmailConfig();
            let hasEmailNotif = false;
            let hasSMSNotif = false;
            for (let i = 0; i < eventsManagementInfoArr.length; i++) {
                if (i.eventsManagementEmail) {
                    hasEmailNotif = true;
                }
                if (i.eventsManagementSMS) {
                    hasSMSNotif = true;
                }
            }
            let notifDisabledOpen;
            if (hasEmailNotif && hasSMSNotif) {
                notifDisabledOpen = !smsConfig.enabled || !emailConfig.enabled;
                setNotificationDisabledOpen(notifDisabledOpen);
            } else if (hasEmailNotif) {
                notifDisabledOpen = !emailConfig.enabled;
                setNotificationDisabledOpen(notifDisabledOpen);
            } else if (hasSMSNotif) {
                notifDisabledOpen = !smsConfig.enabled;
                setNotificationDisabledOpen(notifDisabledOpen);
            }
            if (notifDisabledOpen) {
                isOpeningNotificationDisabled = true;
            }
        }
        if (!isOpeningNotificationDisabled) {
        submitReplaceAll();
        }

    }

    const submitAddAll = () => {
    Promise.resolve(eventsManagementApi.addEventsManagement(eventsManagementInfoArr, entrances, controllers))
        .then(res => {
        if (res.status!=201){ 
            (res.json()).then(data => {
                const array = [];
                if (data[0]) {
                    Object.entries(data[0]).map(([key, value]) => {
                        value.map(singleData =>
                            // console.log(key, singleData))
                            array.push(singleData))
                    }) 
                }
                setSingleErrorMessage(array)
                handleErrorMessages(data)
                // getClashingEventsManagement
            })
        }
        else {
            getSMSEmailConfig();
            toast.success("Event managements successfully added")
            router.replace(`/dashboard/events-management`)
        }
    }).finally(() => setAction(""))

    }
    const addOn = (fromNotificationDisabledSubmit) => {
        setAction("addon");
        let isOpeningNotificationDisabled = false;
        if (!fromNotificationDisabledSubmit) {
            getSMSEmailConfig();
            let hasEmailNotif = false;
            let hasSMSNotif = false;
            for (let i = 0; i < eventsManagementInfoArr.length; i++) {
                let currEventManagement = eventsManagementInfoArr[i];
                if (currEventManagement.eventsManagementEmail) {
                    hasEmailNotif = true;
                }
                if (currEventManagement.eventsManagementSMS) {
                    hasSMSNotif = true;
                }
            }
            let notifDisabledOpen;
            if (hasEmailNotif && hasSMSNotif) {
                notifDisabledOpen = !smsConfig.enabled || !emailConfig.enabled;
                setNotificationDisabledOpen(notifDisabledOpen);
            } else if (hasEmailNotif) {
                notifDisabledOpen = !emailConfig.enabled;
                setNotificationDisabledOpen(notifDisabledOpen);
            } else if (hasSMSNotif) {
                notifDisabledOpen = !smsConfig.enabled || !emailConfig.enabled;
                console.log("smsConfigEnabled: ", smsConfig.enabled, "emailConfigEnabled: ", emailConfig.enabled)
                console.log("notifDisabledOpen: ", notifDisabledOpen)
                notifDisabledOpen = !smsConfig.enabled;
                setNotificationDisabledOpen(notifDisabledOpen);
            }
            if (notifDisabledOpen) {
                isOpeningNotificationDisabled = true;
            }
        }
        if (!isOpeningNotificationDisabled) {
            submitAddAll();
        }

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

    const updateEventManagementDefaultTitle = () => {
        const updatedInfo = [...eventsManagementInfoArr];
        for (let i = 0; i < updatedInfo.length; i++) {
            updatedInfo[i].eventsManagementDefaultTitle = "Event Management " + updatedInfo[i].eventsManagementName + " Triggered";
            
        }
        setEventsManagementInfoArr(updatedInfo);
    }

    const updateEventManagementDefaultContent = () => {
        const updatedInfo = [...eventsManagementInfoArr];
        for (let i = 0; i < updatedInfo.length; i++) {
            const currEventManagement = eventsManagementInfoArr[i];
            let currInputEvents = currEventManagement.inputEvents;
            let inputStr = ""
            for (let j = 0; j < currInputEvents.length; j++) {
                const inputEventId = currInputEvents[j].eventActionInputType.eventActionInputId;
                const inputEventEntity = inputEvents.find(e => e.eventActionInputId == inputEventId);
                if (currInputEvents[j].timerDuration) {
                    inputStr += inputEventEntity.eventActionInputName + " for " + currInputEvents[j].timerDuration + " second(s), ";
                } else {
                    inputStr += inputEventEntity.eventActionInputName + ", "
                }
            }
            let toBeAdded = inputStr == "" ? "..." : inputStr.substring(0, inputStr.length - 2);
            updatedInfo[i].eventsManagementDefaultContent = "with the following triggers: " + toBeAdded + " has been triggered";
            
        }
        setEventsManagementInfoArr(updatedInfo);
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

        const selectedOutputEvents = {};
        for (let i = 0; i < eventsManagementInfoArr.length; i++) {
            const currEventManagement = eventsManagementInfoArr[i];
            let currOutputActions = currEventManagement.outputActions;
            for (let j = 0; j < currOutputActions.length; j++) {
                if (currOutputActions[j].timerDuration) {
                    const outputEventId = currOutputActions[j].eventActionOutputType.eventActionOutputId;
                    const outputEventEntity = outputEvents.find(e => e.eventActionOutputId == outputEventId);
                    if (outputEventEntity?.eventActionOutputName == 'GEN_OUT_1') {
                        if (selectedOutputEvents['GEN_OUT_1'] == undefined) {
                            selectedOutputEvents['GEN_OUT_1'] = [currEventManagement.eventsManagementId];
                        } else {
                            selectedOutputEvents['GEN_OUT_1'].push(currEventManagement.eventsManagementId);
                        }
                    } else if (outputEventEntity?.eventActionOutputName == 'GEN_OUT_2') {
                        if (selectedOutputEvents['GEN_OUT_2'] == undefined) {
                            selectedOutputEvents['GEN_OUT_2'] = [currEventManagement.eventsManagementId];
                        } else {
                            selectedOutputEvents['GEN_OUT_2'].push(currEventManagement.eventsManagementId);
                        }
                    } else if (outputEventEntity?.eventActionOutputName == 'GEN_OUT_3') {
                        if (selectedOutputEvents['GEN_OUT_3'] == undefined) {
                            selectedOutputEvents['GEN_OUT_3'] = [currEventManagement.eventsManagementId];
                        } else {
                            selectedOutputEvents['GEN_OUT_3'].push(currEventManagement.eventsManagementId);
                        }
                    }
                }
            }
        }

        console.log(selectedOutputEvents, "selectedOutputEvents");
        setCustomOutputEventsSelected(selectedOutputEvents);
  
        const selectedInputEvents = {};
        for (let i = 0; i < eventsManagementInfoArr.length; i++) {
            const currEventManagement = eventsManagementInfoArr[i];
            let currInputEvents = currEventManagement.inputEvents;
            for (let j = 0; j < currInputEvents.length; j++) {
                if (currInputEvents[j].timerDuration) {
                    continue;
                }
                const inputEventId = currInputEvents[j].eventActionInputType.eventActionInputId;
                const inputEventEntity = inputEvents.find(e => e.eventActionInputId == inputEventId);
                if (inputEventEntity?.eventActionInputName == 'GEN_IN_1') {
                    if (selectedInputEvents['GEN_IN_1'] == undefined) {
                        selectedInputEvents['GEN_IN_1'] = [currEventManagement.eventsManagementId];
                    } else {
                        selectedInputEvents['GEN_IN_1'].push(currEventManagement.eventsManagementId);
                    }
                } else if (inputEventEntity?.eventActionInputName == 'GEN_IN_2') {
                    if (selectedInputEvents['GEN_IN_2'] == undefined) {
                        selectedInputEvents['GEN_IN_2'] = [currEventManagement.eventsManagementId];
                    } else {
                        selectedInputEvents['GEN_IN_2'].push(currEventManagement.eventsManagementId);
                    }
                } else if (inputEventEntity?.eventActionInputName == 'GEN_IN_3') {
                    if (selectedInputEvents['GEN_IN_3'] == undefined) {
                        selectedInputEvents['GEN_IN_3'] = [currEventManagement.eventsManagementId];
                    } else {
                        selectedInputEvents['GEN_IN_3'].push(currEventManagement.eventsManagementId);
                    }
                }
            }
        }
        console.log(selectedInputEvents, "selectedInputEvents");
        setCustomInputEventsSelected(selectedInputEvents);
        // validations
        const newValidations = [...eventsManagementValidationsArr];
        for (let i = 0; i < newValidations.length; i++) {
            const currValidation = newValidations[i];
            // reset all events management conflict as false
            currValidation.eventsManagementInputEventsConflict = false;
            currValidation.eventsManagementOutputActionsConflict = false;
        }

        for (const [key, value] of Object.entries(selectedInputEvents)) {
            if (key == 'GEN_IN_1') {
                let genOut1s = selectedOutputEvents['GEN_OUT_1'];
                if (genOut1s != undefined) {
                    for (let i = 0; i < value.length; i++) {
                        const validation = newValidations.find(v => v.eventsManagementId == value[i]);
                        validation.eventsManagementInputEventsConflict = true;
                        for (let i = 0; i < genOut1s.length; i++) {
                            const validation = newValidations.find(v => v.eventsManagementId == genOut1s[i]);
                            validation.eventsManagementOutputActionsConflict = true;
                        }
                    }
                }
            } else if (key == 'GEN_IN_2') {
                let genOut2s = selectedOutputEvents['GEN_OUT_2'];
                if (genOut2s != undefined) {
                    for (let i = 0; i < value.length; i++) {
                        const validation = newValidations.find(v => v.eventsManagementId == value[i]);
                        validation.eventsManagementInputEventsConflict = true;
                        for (let i = 0; i < genOut2s.length; i++) {
                            const validation = newValidations.find(v => v.eventsManagementId == genOut2s[i]);
                            validation.eventsManagementOutputActionsConflict = true;
                        }
                    }
                }
            } else if (key == 'GEN_IN_3') {
               let genOut3s = selectedOutputEvents['GEN_OUT_3'];
                if (genOut3s != undefined) {
                    for (let i = 0; i < value.length; i++) {
                        const validation = newValidations.find(v => v.eventsManagementId == value[i]);
                        validation.eventsManagementInputEventsConflict = true;
                        for (let i = 0; i < genOut3s.length; i++) {
                            const validation = newValidations.find(v => v.eventsManagementId == genOut3s[i]);
                            validation.eventsManagementOutputActionsConflict = true;
                        }
                    }
                }
            }
        }

        // for (const [key, value] of Object.entries(selectedOutputEvents)) {
        //     console.log(key, value);
        //     if (value.length > 1) {
        //         for (let i = 0; i < value.length; i++) {
        //             const newValidations = [...eventsManagementValidationsArr];
        //             const validation = newValidations.find(v => v.eventsManagementId == value[i]);
        //             validation.eventsManagementOutputActionsConflict = true;
        //         }
        //     }
        // }

        const validation = newValidations.find(v => v.eventsManagementId == id);
        validation.eventsManagementInputEventsEmpty = newInputEvents.length === 0;
        if (!newValue) {
            validation.eventsManagementInputEventsInvalidId = true;
        } else {
            validation.eventsManagementInputEventsInvalidId = false;
        }

        // else {

        //     validation.eventsManagementInputEventsConflict = false;
        //     console.log(inputEventToBeAdded.eventActionInputName, "inputEventToBeAddedInChangeInputEventsWithoutTimer");
        //     if (inputEventToBeAdded?.eventActionInputName === 'GEN_IN_1') {
        //         if (selectedOutputEvents.has('GEN_OUT_1')) {
        //             validation.eventsManagementInputEventsConflict = true;
        //         }
        //     } else if (inputEventToBeAdded?.eventActionInputName === 'GEN_IN_2') {
        //         if (selectedOutputEvents.has('GEN_OUT_2')) {
        //             validation.eventsManagementInputEventsConflict = true;
        //         }
        //     } else if (inputEventToBeAdded?.eventActionInputName === 'GEN_IN_3') {
        //         if (selectedOutputEvents.has('GEN_OUT_3')) {
        //             validation.eventsManagementInputEventsConflict = true;
        //         }
        //     }
        // }

        // validation.eventsManagementOutputActionsConflict = false;
        // const eventManagementsToBeUpdatedOutputActions = eventManagementToBeUpdated['outputActions'];
        // for (let i = 0; i < eventManagementsToBeUpdatedOutputActions.length; i++) {
        //     const outputActionToBeAdded = outputEvents.find(e=> e.eventActionOutputId === eventManagementsToBeUpdatedOutputActions[i].eventActionOutputType.eventActionOutputId);
        //     if (outputActionToBeAdded?.eventActionOutputName === 'GEN_OUT_1') {
        //         if (selectedInputEvents.has('GEN_IN_1')) {
        //             validation.eventsManagementOutputActionsConflict = true;
        //         }
        //     }
        //     else if (outputActionToBeAdded?.eventActionOutputName === 'GEN_OUT_2') {
        //         if (selectedInputEvents.has('GEN_IN_2')) {
        //             validation.eventsManagementOutputActionsConflict = true;
        //         }
        //     } else if (outputActionToBeAdded?.eventActionOutputName === 'GEN_OUT_3') {
        //         if (selectedInputEvents.has('GEN_IN_3')) {
        //             validation.eventsManagementOutputActionsConflict = true;
        //         }
        //     }
        // }

        setEventsManagementValidationsArr(newValidations);
        updateEventManagementDefaultContent();
    }
    const changeOutputActionsWithoutTimer = (newValue, id) => {
        updateEventManagementDefaultContent();
        updateEventManagementDefaultTitle();

        let updatedInfo = [...eventsManagementInfoArr];
        let eventManagementToBeUpdated = updatedInfo.find(info => info.eventsManagementId == id);
        const eventManagementToBeUpdatedOutputActions = eventManagementToBeUpdated['outputActions'];
        let hasNotificationEmailsOutput = false;
        let hasNotificationSMSsOutput = false;
        const newValueMapped = newValue.map(i => {
            if (i.eventActionOutputName === 'NOTIFICATION (EMAIL)') {
                hasNotificationEmailsOutput = true;
            } else if (i.eventActionOutputName === 'NOTIFICATION (SMS)') {
                hasNotificationSMSsOutput = true;
            }
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

        if (!hasNotificationEmailsOutput) {
            eventManagementToBeUpdated['eventsManagementEmail'] = null;
            let newNotificationEmails = { ...notificationEmails };
            delete newNotificationEmails[id];
            setNotificationEmails(newNotificationEmails);
        } else {
            if (eventManagementToBeUpdated['eventsManagementEmail'] === null) {
                eventManagementToBeUpdated['eventsManagementEmail'] = '';
                eventManagementToBeUpdated['eventsManagementEmail'] = {
                    eventsManagementEmailRecipients: "",
                    eventsManagementEmailContent: eventManagementToBeUpdated.eventsManagementDefaultContent,
                    eventsManagementEmailTitle: eventManagementToBeUpdated.eventsManagementDefaultTitle
                };
                let newNotificationEmails = { ...notificationEmails };
                newNotificationEmails[id] = {
                    eventsManagementEmailRecipients: [],
                    eventsManagementEmailContent: eventManagementToBeUpdated.eventsManagementDefaultContent,
                    eventsManagementEmailTitle: eventManagementToBeUpdated.eventsManagementDefaultTitle,
                    useDefaultEmails: true
                };
                setNotificationEmails(newNotificationEmails);
            }
        }
        if (!hasNotificationSMSsOutput) {
            eventManagementToBeUpdated['eventsManagementSMS'] = null;
            let newNotificationSMSs = { ...notificationSMSs };
            delete newNotificationSMSs[id];
            setNotificationSMSs(newNotificationSMSs);
        } else {
            if (eventManagementToBeUpdated['eventsManagementSMS'] === null) {
                eventManagementToBeUpdated['eventsManagementSMS'] = {
                    eventsManagementSMSRecipients: "",
                    eventsManagementSMSContent: eventManagementToBeUpdated.eventsManagementDefaultContent,
                };
                let newNotificationSMSs = { ...notificationSMSs };
                newNotificationSMSs[id] = {
                    eventsManagementSMSRecipients: [],
                    eventsManagementSMSContent: eventManagementToBeUpdated.eventsManagementDefaultContent,
                    useDefaultSMS: true
                };
                setNotificationSMSs(newNotificationSMSs);
            }
        }
        setEventsManagementInfoArr(updatedInfo);
        setOutputActionsWithoutTimer({ ...outputActionsWithoutTimer, [id]: newValue });
        
        // validations
        const newValidations = [...eventsManagementValidationsArr];
        const validation = newValidations.find(v => v.eventsManagementId == id);
        validation.eventsManagementOutputActionsEmpty = newOutputActions.length === 0;
        if (newValueMapped.filter(i => i.eventActionOutputType.eventActionOutputId == null || i.eventActionOutputType.eventActionOutputId == undefined).length > 0) {
            validation.eventsManagementOutputActionsInvalidId = true;
        } else {
            validation.eventsManagementOutputActionsInvalidId = false;
        }
        if (!hasNotificationEmailsOutput) {
            validation.eventsManagementInvalidEmailRecipients = false;
            validation.eventsManagementEmailRecipientsEmpty = false;
        } else {
            validation.eventsManagementEmailRecipientsEmpty = notificationEmails[id]?.eventsManagementEmailRecipients.length === 0 || notificationEmails[id] === undefined;
        }
        if (!hasNotificationSMSsOutput) {
            validation.eventsManagementInvalidSMSRecipients = false;
            validation.eventsManagementSMSRecipientsEmpty = false;
        } else {
            validation.eventsManagementSMSRecipientsEmpty = notificationSMSs[id]?.eventsManagementSMSRecipients.length === 0 || notificationSMSs[id] === undefined;
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
        } else {
            validation.eventsManagementInputEventsInvalidId = false;
        }
        setEventsManagementValidationsArr(newValidations);
        updateEventManagementDefaultContent();
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
        
        const selectedOutputEvents = {};
        for (let i = 0; i < eventsManagementInfoArr.length; i++) {
            const currEventManagement = eventsManagementInfoArr[i];
            let currOutputActions = currEventManagement.outputActions;
            for (let j = 0; j < currOutputActions.length; j++) {
                if (currOutputActions[j].timerDuration) {
                    const outputEventId = currOutputActions[j].eventActionOutputType.eventActionOutputId;
                    const outputEventEntity = outputEvents.find(e => e.eventActionOutputId == outputEventId);
                    if (outputEventEntity?.eventActionOutputName == 'GEN_OUT_1') {
                        if (selectedOutputEvents['GEN_OUT_1'] == undefined) {
                            selectedOutputEvents['GEN_OUT_1'] = [currEventManagement.eventsManagementId];
                        } else {
                            selectedOutputEvents['GEN_OUT_1'].push(currEventManagement.eventsManagementId);
                        }
                    } else if (outputEventEntity.eventActionOutputName == 'GEN_OUT_2') {
                        if (selectedOutputEvents['GEN_OUT_2'] == undefined) {
                            selectedOutputEvents['GEN_OUT_2'] = [currEventManagement.eventsManagementId];
                        } else {
                            selectedOutputEvents['GEN_OUT_2'].push(currEventManagement.eventsManagementId);
                        }
                    } else if (outputEventEntity.eventActionOutputName == 'GEN_OUT_3') {
                        if (selectedOutputEvents['GEN_OUT_3'] == undefined) {
                            selectedOutputEvents['GEN_OUT_3'] = [currEventManagement.eventsManagementId];
                        } else {
                            selectedOutputEvents['GEN_OUT_3'].push(currEventManagement.eventsManagementId);
                        }
                    }
                }
            }
        }

        console.log(selectedOutputEvents, "selectedOutputEvents");
        setCustomOutputEventsSelected(selectedOutputEvents);
  
        const selectedInputEvents = {};
        for (let i = 0; i < eventsManagementInfoArr.length; i++) {
            const currEventManagement = eventsManagementInfoArr[i];
            let currInputEvents = currEventManagement.inputEvents;
            for (let j = 0; j < currInputEvents.length; j++) {
                if (currInputEvents[j].timerDuration) {
                    continue;
                }
                const inputEventId = currInputEvents[j].eventActionInputType.eventActionInputId;
                const inputEventEntity = inputEvents.find(e => e.eventActionInputId == inputEventId);
                if (inputEventEntity?.eventActionInputName == 'GEN_IN_1') {
                    if (selectedInputEvents['GEN_IN_1'] == undefined) {
                        selectedInputEvents['GEN_IN_1'] = [currEventManagement.eventsManagementId];
                    } else {
                        selectedInputEvents['GEN_IN_1'].push(currEventManagement.eventsManagementId);
                    }
                } else if (inputEventEntity.eventActionInputName == 'GEN_IN_2') {
                    if (selectedInputEvents['GEN_IN_2'] == undefined) {
                        selectedInputEvents['GEN_IN_2'] = [currEventManagement.eventsManagementId];
                    } else {
                        selectedInputEvents['GEN_IN_2'].push(currEventManagement.eventsManagementId);
                    }
                } else if (inputEventEntity.eventActionInputName == 'GEN_IN_3') {
                    if (selectedInputEvents['GEN_IN_3'] == undefined) {
                        selectedInputEvents['GEN_IN_3'] = [currEventManagement.eventsManagementId];
                    } else {
                        selectedInputEvents['GEN_IN_3'].push(currEventManagement.eventsManagementId);
                    }
                }
            }
        }
        console.log(selectedInputEvents, "selectedInputEvents");
        setCustomInputEventsSelected(selectedInputEvents);

        // validations

        const newValidations = [...eventsManagementValidationsArr];
        for (let i = 0; i < newValidations.length; i++) {
            const currValidation = newValidations[i];
            // reset all events management conflict as false
            currValidation.eventsManagementInputEventsConflict = false;
            currValidation.eventsManagementOutputActionsConflict = false;
        }

        for (const [key, value] of Object.entries(selectedInputEvents)) {
            if (key == 'GEN_IN_1') {
                let genOut1s = selectedOutputEvents['GEN_OUT_1'];
                if (genOut1s != undefined) {
                    for (let i = 0; i < value.length; i++) {
                        const validation = newValidations.find(v => v.eventsManagementId == value[i]);
                        validation.eventsManagementInputEventsConflict = true;
                        for (let i = 0; i < genOut1s.length; i++) {
                            const validation = newValidations.find(v => v.eventsManagementId == genOut1s[i]);
                            validation.eventsManagementOutputActionsConflict = true;
                        }
                    }
                }
            } else if (key == 'GEN_IN_2') {
                let genOut2s = selectedOutputEvents['GEN_OUT_2'];
                if (genOut2s != undefined) {
                    for (let i = 0; i < value.length; i++) {
                        const validation = newValidations.find(v => v.eventsManagementId == value[i]);
                        validation.eventsManagementInputEventsConflict = true;
                        for (let i = 0; i < genOut2s.length; i++) {
                            const validation = newValidations.find(v => v.eventsManagementId == genOut2s[i]);
                            validation.eventsManagementOutputActionsConflict = true;
                        }
                    }
                }
            } else if (key == 'GEN_IN_3') {
               let genOut3s = selectedOutputEvents['GEN_OUT_3'];
                if (genOut3s != undefined) {
                    for (let i = 0; i < value.length; i++) {
                        const validation = newValidations.find(v => v.eventsManagementId == value[i]);
                        validation.eventsManagementInputEventsConflict = true;
                        for (let i = 0; i < genOut3s.length; i++) {
                            const validation = newValidations.find(v => v.eventsManagementId == genOut3s[i]);
                            validation.eventsManagementOutputActionsConflict = true;
                        }
                    }
                }
            }
        }

        // for (const [key, value] of Object.entries(selectedOutputEvents)) {
        //     console.log(key, value);
        //     if (value.length > 1) {
        //         for (let i = 0; i < value.length; i++) {
        //             const newValidations = [...eventsManagementValidationsArr];
        //             const validation = newValidations.find(v => v.eventsManagementId == value[i]);
        //             validation.eventsManagementOutputActionsConflict = true;
        //         }
        //     }
        // }

        const validation = newValidations.find(v => v.eventsManagementId == id);
        validation.eventsManagementOutputActionsEmpty = newOutputActions.length === 0;
        if (newValue.filter(i => i.eventActionOutputType.eventActionOutputId == null || i.eventActionOutputType.eventActionOutputId == undefined).length > 0) {
            validation.eventsManagementOutputActionsInvalidId = true;
        } else {
            validation.eventsManagementOutputActionsInvalidId = false;
        }

        // validation.eventsManagementOutputActionsConflict = false;
        // for (let i = 0; i < newValue.length; i++) {
        //     const outputActionToBeAdded = outputEvents.find(e=> e.eventActionOutputId === newValue[i].eventActionOutputType.eventActionOutputId);
        //     if (outputActionToBeAdded?.eventActionOutputName === 'GEN_OUT_1') {
        //         if (selectedInputEvents.has('GEN_IN_1')) {
        //             validation.eventsManagementOutputActionsConflict = true;
        //         }
        //     }
        //     else if (outputActionToBeAdded?.eventActionOutputName === 'GEN_OUT_2') {
        //         if (selectedInputEvents.has('GEN_IN_2')) {
        //             validation.eventsManagementOutputActionsConflict = true;
        //         }
        //     } else if (outputActionToBeAdded?.eventActionOutputName === 'GEN_OUT_3') {
        //         if (selectedInputEvents.has('GEN_IN_3')) {
        //             validation.eventsManagementOutputActionsConflict = true;
        //         }
        //     }
        // }

        // validation.eventsManagementInputEventsConflict = false;
        // const eventManagementsToBeUpdatedInputEvents = eventManagementToBeUpdated['inputEvents'];
        // for (let i = 0; i < eventManagementsToBeUpdatedInputEvents.length; i++) {
        //     const inputEventToBeAdded = inputEvents.find(e=> e.eventActionInputId === eventManagementsToBeUpdatedInputEvents[i].eventActionInputType.eventActionInputId);
        //     if (inputEventToBeAdded?.eventActionInputName === 'GEN_IN_1') {
        //         if (selectedOutputEvents.has('GEN_OUT_1')) {
        //             validation.eventsManagementInputEventsConflict = true;
        //         }
        //     } else if (inputEventToBeAdded?.eventActionInputName === 'GEN_IN_2') {
        //         if (selectedOutputEvents.has('GEN_OUT_2')) {
        //             validation.eventsManagementInputEventsConflict = true;
        //         }
        //     } else if (inputEventToBeAdded?.eventActionInputName === 'GEN_IN_3') {
        //         if (selectedOutputEvents.has('GEN_OUT_3')) {
        //             validation.eventsManagementInputEventsConflict = true;
        //         }
        //     }
        // }

        setEventsManagementValidationsArr(newValidations);
    }
 
    const changeNotificationEmails = (newValue, id) => {
        const updatedInfo = [...eventsManagementInfoArr];
        const eventManagementToBeUpdated = updatedInfo.find(info => info.eventsManagementId == id);
        const newRecipients = newValue.eventsManagementEmailRecipients;
        const newRecipientsCSV = newRecipients.join(',');
        let newEmailValue;
        if (newValue.useDefaultEmails) {
            newEmailValue = { eventsManagementEmailRecipients: newRecipientsCSV, eventsManagementEmailContent: updatedInfo[0].eventsManagementDefaultContent, eventsManagementEmailTitle: newValue.eventsManagementEmailTitle, useDefaultEmails: newValue.useDefaultEmails };
        } else {
            newEmailValue = { eventsManagementEmailRecipients: newRecipientsCSV, eventsManagementEmailContent: newValue.eventsManagementEmailContent, eventsManagementEmailTitle: newValue.eventsManagementEmailTitle, useDefaultEmails: newValue.useDefaultEmails };
        }
        eventManagementToBeUpdated['eventsManagementEmail'] = newEmailValue;
        setEventsManagementInfoArr(updatedInfo);
        setNotificationEmails({ ...notificationEmails, [id]: newValue });
        console.log(notificationEmails, 8899)
        
        // validations
        const newValidations = [...eventsManagementValidationsArr];
        const validation = newValidations.find(v => v.eventsManagementId == id);
        validation.eventsManagementEmailRecipientsEmpty = newRecipients.length === 0 && eventManagementToBeUpdated['eventsManagementEmail'];
        validation.eventsManagementInvalidEmailRecipients = false;
        for (let j = 0; j < newRecipients.length; j++) {
            if (validateEmail(newRecipients[j]) === null) {
                validation.eventsManagementInvalidEmailRecipients = true;
            }
        }
        setEventsManagementValidationsArr(newValidations);
    }

    const changeNotificationSMSs = (newValue, id) => {
        const updatedInfo = [...eventsManagementInfoArr];
        const eventManagementToBeUpdated = updatedInfo.find(info => info.eventsManagementId == id);
        const newRecipients = newValue.eventsManagementSMSRecipients;
        const newRecipientsCSV = newRecipients.join(',');
        let newSMSValue;
        if (newValue.useDefaultSMS) {
            newSMSValue = { eventsManagementSMSRecipients: newRecipientsCSV, eventsManagementSMSContent: updatedInfo[0].eventsManagementDefaultContent, useDefaultSMS: newValue.useDefaultSMS };
        } else {
            newSMSValue = { eventsManagementSMSRecipients: newRecipientsCSV, eventsManagementSMSContent: newValue.eventsManagementSMSContent, useDefaultSMS: newValue.useDefaultSMS };
        }
        eventManagementToBeUpdated['eventsManagementSMS'] = newSMSValue;
        setEventsManagementInfoArr(updatedInfo);
        setNotificationSMSs({ ...notificationEmails, [id]: newValue });
        
        // validations
        const newValidations = [...eventsManagementValidationsArr];
        const validation = newValidations.find(v => v.eventsManagementId == id);
        validation.eventsManagementSMSRecipientsEmpty = newRecipients.length === 0 && eventManagementToBeUpdated['eventsManagementSMS'];
        validation.eventsManagementInvalidSMSRecipients = false;
        for (let j = 0; j < newRecipients.length; j++) {
            if (!validatePhoneNumber(newRecipients[j])) {
                validation.eventsManagementInvalidSMSRecipients = true;
            }
        }
        setEventsManagementValidationsArr(newValidations);
    }
    // console.log(eventsManagementValidationsArr)
    // console.log(eventsManagementInfoArr, 33344)
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
                        <ServerDownError
                            open={serverDownOpen}
                            handleDialogClose={() => setServerDownOpen(false)}
                        />
                        <ConfirmNotificationDisabledSubmit
                            action={action}
                            open={notificationDisabledOpen}
                            smsEnable={smsConfig.enabled}
                            emailEnable={emailConfig.enabled}
                            submitEventsManagement={action === 'addon' ? () => addOn(true) : () => replaceAll(true)}
                            handleDialogClose={() => setNotificationDisabledOpen(false)}
                        />
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
                                    Boolean(controllers.length != 0) && "Note: When a controller is selected, some trigger/action(s) may be unavailable. You may only create events management for entrances with those input/output types"
                                }
                            />
                        </Grid>
                    </Grid>
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
                                        checkAnyBeginForEventManagement={checkAnyBeginForEventManagement(eventsManagementInfo.eventsManagementId)}
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
                                        changeNotificationEmails={changeNotificationEmails}
                                        changeNotificationSMSs={changeNotificationSMSs}
                                        inputEventsValueWithoutTimer={inputEventsWithoutTimer}
                                        outputActionsValueWithoutTimer={outputActionsWithoutTimer}
                                        notificationEmails={notificationEmails}
                                        notificationSMSs={notificationSMSs}
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
                                        onClick={() => replaceAll(false)}
                                        disabled={
                                            entrancesControllers.length == 0 ||
                                            eventsManagementValidationsArr.some( // check if validations fail
                                                validation => validation.eventsManagementNameBlank        ||
                                                validation.timeEndInvalid ||
                                                validation.beginInvalid ||
                                                validation.untilInvalid ||
                                                validation.timeStartInvalid ||
                                                validation.eventsManagementInputEventsEmpty ||
                                                validation.eventsManagementInputEventsInvalidId ||
                                                validation.eventsManagementInputEventsConflict ||
                                                validation.eventsManagementOutputActionsEmpty ||
                                                validation.eventsManagementOutputActionsInvalidId ||
                                                validation.eventsManagementOutputActionsConflict ||
                                                validation.eventsManagementTriggerSchedulesEmpty ||
                                                validation.eventsManagementInvalidEmailRecipients ||
                                                validation.eventsManagementInvalidSMSRecipients ||
                                                validation.eventsManagementEmailRecipientsEmpty ||
                                                validation.eventsManagementSMSRecipientsEmpty
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
                                        onClick={() => addOn(false)}
                                        disabled={
                                            entrancesControllers.length == 0 ||
                                            eventsManagementValidationsArr.some( // check if validations fail
                                                validation => validation.eventsManagementNameBlank        ||
                                                validation.timeEndInvalid ||
                                                validation.beginInvalid ||
                                                validation.untilInvalid ||
                                                validation.timeStartInvalid ||
                                                validation.eventsManagementInputEventsEmpty ||
                                                validation.eventsManagementInputEventsInvalidId ||
                                                validation.eventsManagementInputEventsConflict ||
                                                validation.eventsManagementOutputActionsEmpty ||
                                                validation.eventsManagementOutputActionsInvalidId ||
                                                validation.eventsManagementOutputActionsConflict ||
                                                validation.eventsManagementTriggerSchedulesEmpty ||
                                                validation.eventsManagementInvalidEmailRecipients ||
                                                validation.eventsManagementInvalidSMSRecipients ||
                                                validation.eventsManagementEmailRecipientsEmpty ||
                                                validation.eventsManagementSMSRecipientsEmpty
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