import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { 
    Button, 
    CardHeader, 
    Collapse, 
    Grid, 
    TextField, 
    Divider, 
    CardContent,
    Stack,
    Typography,
    Select,
    Input,
    MenuItem,
    Chip,
    InputAdornment
} from "@mui/material";
import { useEffect, useState } from "react";
import ExpandMore from "../../shared/expand-more";
import MultipleSelectInput from "../../shared/multi-select-input";
import ErrorCard from "../../shared/error-card";
import EditFormTooltip from "../../shared/edit_form_tooltip";
import Rrule2 from "../../shared/rrule-form2";
import rruleDescription from "../../../../utils/rrule-desc";
import Add from "@mui/icons-material/Add";
import formUtils from "../../../../utils/form-utils";
import { ContactSupportOutlined, Edit } from "@mui/icons-material";
import { EmailEdit } from "../email-edit";
import { validatePhoneNumber, validateEmail } from "../../../../utils/utils";
import { SMSEdit } from "../sms-edit";

const EditEventManagementForm = ({currInputEventsWithTimer, currOutputEventsWithTimer, originalEM, checkAnyUntilForEventManagement, checkAnyBeginForEventManagement, checkAnyTimeStartForEventManagement, checkAnyTimeEndForEventManagement, changeTriggerSchedules,changeTextField,eventsManagementInfo,eventsManagementValidations,allInputEvents, allOutputEvents,eventActionOutputEqual,eventActionOutputFilter,getEventActionOutputName, changeInputEventsWithoutTimer, changeOutputActionsWithoutTimer,changeInputEventsWithTimer, changeOutputActionsWithTimer,outputActionsValueWithoutTimer,inputEventsValueWithoutTimer, notificationEmails, notificationSMSs, changeNotificationEmails, changeNotificationSMSs}) => {
    const inputEventsWithTimer = allInputEvents.filter(e => e.timerEnabled);
    const inputEventsWithoutTimer = allInputEvents.filter(e => !e.timerEnabled);
    const outputEventsWithTimer = allOutputEvents.filter(e => e.timerEnabled);
    const outputEventsWithoutTimer = allOutputEvents.filter(e => !e.timerEnabled);
    const MAX_INPUT_TIMER_DURATION = 300;
    const MAX_OUTPUT_TIMER_DURATION = 300;
    //console.log(originalEM, "og")

    const getEmptyInputWithTimer = (inputId) => ({
        inputId, // this id will not be used for anything
        timerDuration: 1,
        eventActionInputType: {
            eventActionInputId: inputEventsWithTimer[0]?.eventActionInputId ?? null
        }
    });
    const getEmptyOutputWithTimer = (outputId) => ({
        outputId, // this id will not be used for anything
        timerDuration: 1,
        eventActionOutputType: {
            eventActionOutputId: outputEventsWithTimer[0]?.eventActionOutputId ?? null
        }
    });

    const getEmptyInputWithTimerValidation = (inputId) => ({
        inputId,
        eventActionInputIdBlank: false,
        timerDurationInputBlank: false,
        timerDurationInputNotPositive: false,
        timerDurationInputTooLarge: false,
    });

    const getEmptyOutputWithTimerValidation = (outputId) => ({
        outputId,
        eventActionOutputIdBlank: false,
        timerDurationOutputBlank: false,
        timerDurationOutputNotPositive: false,
        timerDurationOutputTooLarge: false,
    });

    const [inputWithTimerEventsManagementArr, 
        setInputWithTimerEventsManagementArr] = useState(currInputEventsWithTimer[0] ? currInputEventsWithTimer[0] : []);
    const [inputWithTimerEventsManagementValidations, 
        setInputWithTimerEventsManagementValidations] = useState(currInputEventsWithTimer[0] ? [getEmptyInputWithTimerValidation(0)]: []);
    const [outputWithTimerEventsManagementArr, 
        setOutputWithTimerEventsManagementArr] = useState(currOutputEventsWithTimer[0] ? currOutputEventsWithTimer[0] : []);
    const [outputWithTimerEventsManagementValidations, 
        setOutputWithTimerEventsManagementValidations] = useState(currOutputEventsWithTimer[0] ? [getEmptyOutputWithTimerValidation(0)]: []);

    // add card logic
    const getNewIdForInputWithTimer = () => inputWithTimerEventsManagementArr.map(info => info.inputId)
        .reduce((a, b) => Math.max(a, b), -1) + 1
    const getNewIdForOutputWithTimer = () => outputWithTimerEventsManagementArr.map(info => info.outputId)
                                             .reduce((a, b) => Math.max(a, b), -1) + 1

    const addInputWithTimerCard = () => {
        const newId = getNewIdForInputWithTimer();
        setInputWithTimerEventsManagementArr([ ...inputWithTimerEventsManagementArr, getEmptyInputWithTimer(newId) ]);
        setInputWithTimerEventsManagementValidations([ ...inputWithTimerEventsManagementValidations, getEmptyInputWithTimerValidation(newId) ]);
    }

    const removeInputWithTimerCard = (id) => {
        const newInputWithTimerEventsManagementInfoArr = inputWithTimerEventsManagementArr.filter(info => info.inputId != id);
        const newValidations = inputWithTimerEventsManagementValidations.filter(validation => validation.inputId != id);

        setInputWithTimerEventsManagementArr(newInputWithTimerEventsManagementInfoArr);
        setInputWithTimerEventsManagementValidations(newValidations);       
    }

    const addOutputWithTimerCard = () => {
        const newId = getNewIdForOutputWithTimer();
        setOutputWithTimerEventsManagementArr([ ...outputWithTimerEventsManagementArr, getEmptyOutputWithTimer(newId) ]);
        setOutputWithTimerEventsManagementValidations([ ...outputWithTimerEventsManagementValidations, getEmptyOutputWithTimerValidation(newId) ]);
    }

    const removeOutputWithTimerCard = (id) => {
        const newEventsManagementInfoArr = outputWithTimerEventsManagementArr.filter(info => info.outputId != id);
        const newValidations = outputWithTimerEventsManagementValidations.filter(validation => validation.outputId != id);

        setOutputWithTimerEventsManagementArr(newEventsManagementInfoArr);
        setOutputWithTimerEventsManagementValidations(newValidations);       
    }

    const changeInputTime = (e, inputId) => {
        const updatedInfo = [...inputWithTimerEventsManagementArr];
        updatedInfo.find(info => info.inputId == inputId)['timerDuration'] = e.target.value;
        setInputWithTimerEventsManagementArr(updatedInfo);

        const validations = [...inputWithTimerEventsManagementValidations];
        const validation = validations.find(info => info.inputId == inputId);
        if (!e.target.value) {
            validation.timerDurationInputBlank = true;
            setInputWithTimerEventsManagementValidations(validations);
        }
        if (e.target.value < 1) {
            validation.timerDurationInputNotPositive = true;
            setInputWithTimerEventsManagementValidations(validations);
        } else if (e.target.value > MAX_INPUT_TIMER_DURATION) {;
            validations.find(info => info.inputId == inputId).timerDurationInputTooLarge = true;
            setInputWithTimerEventsManagementValidations(validations);
        } else {
            validation.timerDurationInputTooLarge = false;
            validation.timerDurationInputNotPositive = false;
            validation.timerDurationInputBlank = false;
            setInputWithTimerEventsManagementValidations(validations);
        }
    }

    const changeOutputTime = (e, outputId) => {
        const updatedInfo = [...outputWithTimerEventsManagementArr];
        updatedInfo.find(info => info.outputId == outputId)['timerDuration'] = e.target.value;
        setOutputWithTimerEventsManagementArr(updatedInfo);

        const validations = [...outputWithTimerEventsManagementValidations];
        const validation = validations.find(info => info.outputId == outputId);
        if (!e.target.value) {
            validation.timerDurationOutputBlank = true;
            setOutputWithTimerEventsManagementValidations(validations);
        }
        if(e.target.value < 1) {
            validation.timerDurationOutputNotPositive = true;
            setOutputWithTimerEventsManagementValidations(validations);
        } else if (e.target.value > MAX_OUTPUT_TIMER_DURATION) {
            validation.timerDurationOutputTooLarge = true;
            setOutputWithTimerEventsManagementValidations(validations);
        } else {
            validation.timerDurationOutputTooLarge = false;
            validation.timerDurationOutputNotPositive = false;
            validation.timerDurationOutputBlank = false;
            setOutputWithTimerEventsManagementValidations(validations);
        }
    }

    const changeSelectionInputWithTime = (e, inputId) => {
        const validations = [...inputWithTimerEventsManagementValidations];
        const validation = validations.find(info => info.inputId == inputId);
        if (!e.target.value) {
            validation.eventActionInputIdBlank = true;
            setInputWithTimerEventsManagementValidations(validations);
        }
        const updatedInfo = [...inputWithTimerEventsManagementArr];
        updatedInfo.find(info => info.inputId == inputId)['eventActionInputType']['eventActionInputId'] = e.target.value;
        setInputWithTimerEventsManagementArr(updatedInfo);
    }
    
    const changeSelectionOutputWithTime = (e, outputId) => {
        const validations = [...outputWithTimerEventsManagementValidations];
        const validation = validations.find(info => info.outputId == outputId);
        if (!e.target.value) {
            validation.eventActionOutputIdBlank = true;
            setOutputWithTimerEventsManagementValidations(validations);
        }
        const updatedInfo = [...outputWithTimerEventsManagementArr];
        updatedInfo.find(info => info.outputId == outputId)['eventActionOutputType']['eventActionOutputId'] = e.target.value;
        setOutputWithTimerEventsManagementArr(updatedInfo);
    }

    const getEmptyTriggerSchedule = (triggerScheduleId) => ({
        triggerScheduleId, // this id will not be used for anything
        triggerName: `${triggerScheduleId}`,
        rrule: null,
        timeStart: null,
        timeEnd: null,
        dtstart: null,
        until: null,
        count: null,
        repeatToggle: false,
        rruleinterval: null,
        byweekday: null,
        bymonthday: null,
        bysetpos: null,
        bymonth: null,
        allDay: false,
        endOfDay: false,
    });

    const getEmptyTriggerScheduleValidation = (triggerScheduleId) => ({
        triggerScheduleId,
        timeStartInvalid: false,
        timeEndInvalid: false,
        untilInvalid: false,
        beginInvalid: false,
    });


    const [triggerScheduleArr, setTriggerScheduleArr] = useState(originalEM.triggerSchedules);
    console.log(218888,originalEM);

    const [triggerScheduleValidations, setTriggerScheduleValidations] = useState(triggerScheduleArr 
        ? triggerScheduleArr.map(x => getEmptyTriggerScheduleValidation(x.triggerScheduleId))
        : [getEmptyTriggerScheduleValidation(0)]);

    const getNewIdForTriggerSchedule = () => triggerScheduleArr.map(info => info.triggerScheduleId)
                                             .reduce((a, b) => Math.max(a, b), -1) + 1

    const addTriggerScheduleCard = () => {
        const newId = getNewIdForTriggerSchedule();
        setTriggerScheduleArr([ ...triggerScheduleArr, getEmptyTriggerSchedule(newId) ]);
        setTriggerScheduleValidations([ ...triggerScheduleValidations, getEmptyTriggerScheduleValidation(newId) ]);
    }

    const removeTriggerScheduleCard = (id) => {
        const newTriggerScheduleArr = triggerScheduleArr.filter(info => info.triggerScheduleId != id);
        const newValidations = triggerScheduleValidations.filter(validation => validation.triggerScheduleId != id);

        setTriggerScheduleArr(newTriggerScheduleArr);
        setTriggerScheduleValidations(newValidations);       
    }

    const changeRruleTriggerSchedule = (value, triggerScheduleId) => {
        const updatedInfo = [...triggerScheduleArr];
        updatedInfo.find(info => info.triggerScheduleId == triggerScheduleId)['rrule'] = value;
        setTriggerScheduleArr(updatedInfo);
    }

    const changeTimeStartTriggerSchedule = (value, triggerScheduleId) => {
        const updatedInfo = [...triggerScheduleArr];
        //console.log(24777,updatedInfo.map(info => console.log(info.triggerScheduleId,triggerScheduleId)),"this",triggerScheduleId);
        updatedInfo.find(info => info.triggerScheduleId == triggerScheduleId)['timeStart'] = value;
        setTriggerScheduleArr(updatedInfo);
        checkTimeStart(value,triggerScheduleId)
    }

    const changeTimeEndTriggerSchedule = (value, triggerScheduleId) => {
        const updatedInfo = [...triggerScheduleArr];
        updatedInfo.find(info => info.triggerScheduleId == triggerScheduleId)['timeEnd'] = value;
        setTriggerScheduleArr(updatedInfo);
        checkTimeEnd(value, triggerScheduleId);
    }

    const changeRruleObjectsTriggerSchedule = (value, triggerScheduleId) => {
        const updatedInfo = [...triggerScheduleArr];
        updatedInfo.find(info => info.triggerScheduleId == triggerScheduleId)['dtstart'] = value.dtstart.toString();
        updatedInfo.find(info => info.triggerScheduleId == triggerScheduleId)['until'] = value.until;
        updatedInfo.find(info => info.triggerScheduleId == triggerScheduleId)['count'] = value.count;
        updatedInfo.find(info => info.triggerScheduleId == triggerScheduleId)['byweekday'] = value.byweekday;
        updatedInfo.find(info => info.triggerScheduleId == triggerScheduleId)['bymonthday'] = value.bymonthday;
        updatedInfo.find(info => info.triggerScheduleId == triggerScheduleId)['bysetpos'] = value.bysetpos;
        updatedInfo.find(info => info.triggerScheduleId == triggerScheduleId)['bymonth'] = value.bymonth;
        updatedInfo.find(info => info.triggerScheduleId == triggerScheduleId)['rruleinterval'] = value.interval;
        setTriggerScheduleArr(updatedInfo);
        checkTimeEnd(value, triggerScheduleId);
    }

    const changeRruleObjectsTriggerScheduleForAdditional = (value, triggerScheduleId) => {
        const updatedInfo = [...triggerScheduleArr];
        //console.log(value);
        updatedInfo.find(info => info.triggerScheduleId == triggerScheduleId)['allDay'] = value.allDay;
        updatedInfo.find(info => info.triggerScheduleId == triggerScheduleId)['endOfDay'] = value.endOfDay;
        updatedInfo.find(info => info.triggerScheduleId == triggerScheduleId)['repeatToggle'] = value.repeatToggle;
        setTriggerScheduleArr(updatedInfo);
        //console.log("9997",triggerScheduleArr);
        checkTimeEnd(value, triggerScheduleId);
    }

    const checkTimeEnd = (end,id) => {
        const endTime = end;
        const newValidations = [ ...triggerScheduleValidations ];
        const validation = newValidations.find(v => v.triggerScheduleId == id);
        // store a temp updated access group info
        const newTriggerScheduleArr = [ ...triggerScheduleArr ]
        const tempStartTime = newTriggerScheduleArr.find(info => info.triggerScheduleId == id)['timeStart'];

        if(tempStartTime=="00:00"){
            validation.timeEndInvalid = false;
            setTriggerScheduleValidations(newValidations);
            setEndHolderForEventManagement({...endHolderForEventManagement, [eventsManagementId]: false})
        }
        const value = (formUtils.checkBlank(endTime) || endTime <= tempStartTime);
        validation.timeEndInvalid = value;
        setEndHolderForEventManagement({...endHolderForEventManagement, [eventsManagementId]: value})
        setTriggerScheduleValidations(newValidations)
    }
    const checkTimeStart = (start,id) => {
        const starttime = start;
        const newValidations = [ ...triggerScheduleValidations ];
        const validation = newValidations.find(v => v.triggerScheduleId == id);
        const value = (formUtils.checkBlank(starttime));
        validation.timeStartInvalid = value;
        setTriggerScheduleValidations(newValidations);
        setStartHolderForEventManagement({ ...startHolderForEventManagement, [eventsManagementId]: value });
    }

    const {
        eventsManagementId,
        eventsManagementName,
        triggerSchedules,
        entrance,
        controller,
        inputEvents,
        outputActions,
        eventsManagementDefaultTitle,
        eventsManagementDefaultContent
    } = eventsManagementInfo;
    // console.log(7788, eventsManagementInfo == originalEM)
    // console.log(7799,originalEM)

    if (entrance) {
        const {
            entranceId,
            entranceName,
        } = entrance;
    }

    if (controller) {
        const {
            controllerId,
            controllerName,
            controllerSerialNo,
        } = controller;
    }

    const {
        eventsManagementNameBlank,
        timeStartInvalid,
        timeEndInvalid,
        untilInvalid,
        submitFailed,
        eventsManagementInputEventsEmpty,
        eventsManagementInputEventsInvalidId,
        eventsManagementInputEventsConflict,
        eventsManagementOutputActionsEmpty,
        eventsManagementOutputActionsInvalidId,
        eventsManagementOutputActionsConflict,
        eventsManagementTriggerSchedulesEmpty,
        eventsManagementInvalidEmailRecipients,
        eventsManagementInvalidSMSRecipients,
        eventsManagementEmailRecipientsEmpty,
        eventsManagementSMSRecipientsEmpty,
    } = eventsManagementValidations;
   
    const inputEventsValueForWithoutTimer = inputEventsValueWithoutTimer[eventsManagementId];
    const outputActionsValueForWithoutTimer = outputActionsValueWithoutTimer[eventsManagementId];
    const [inputEventsValueWithoutTimerState, setInputEventsValueWithoutTimerState] = useState(inputEventsValueForWithoutTimer);
    const [outputActionsValueWithoutTimerState, setOutputActionsValueWithoutTimerState] = useState(outputActionsValueForWithoutTimer);

    const notificationEmailsValue = notificationEmails[eventsManagementId]
    const notificationSMSsValue = notificationSMSs[eventsManagementId]

    const [notificationEmailsInputValue, setNotificationEmailsInputValue] = useState("");
    const [notificationEmailsRecipients, setNotificationEmailsRecipients] = useState(notificationEmailsValue?.eventsManagementEmailRecipients ?? []);

    const [notificationSMSsInputValue, setNotificationSMSsInputValue] = useState("");
    const [notificationSMSsRecipients, setNotificationSMSsRecipients] = useState(notificationSMSsValue?.eventsManagementSMSRecipients ?? []);

    const [notificationEmailEditOpen, setNotificationEmailEditOpen] = useState(false);
    const [notificationSMSEditOpen, setNotificationSMSEditOpen] = useState(false);

    const loadValues = () => {
        setInputEventsValueWithoutTimerState(originalEM.inputEvents)
    }


    useEffect(() => { 
        setInputEventsValueWithoutTimerState(inputEventsValueForWithoutTimer);
    }, [inputEventsValueForWithoutTimer]);

    useEffect(() => { 
        setOutputActionsValueWithoutTimerState(outputActionsValueForWithoutTimer);
    }, [outputActionsValueForWithoutTimer]);
    
    // expanding form
    const [expanded, setExpanded] = useState(true);
    const handleExpandClick = () => setExpanded(!expanded);

    //get timestart timeend 
    const [start, setStart] = useState(originalEM.triggerSchedules 
                            ? originalEM.triggerSchedules.timeStart
                            : "00:00")
    const [end, setEnd] = useState(originalEM.triggerSchedules
                    ? originalEM.triggerSchedules.timeEnd
                    : "00:00")
        
    const [beginHolderForEventManagement, setBeginHolderForEventManagement] = useState({})
    const [untilHolderForEventManagement, setUntilHolderForEventManagement] = useState({})
    const [startHolderForEventManagement, setStartHolderForEventManagement] = useState({})
    const [endHolderForEventManagement, setEndHolderForEventManagement] = useState({})
    //get rrule string and text from rrulecomponent
    const [description, setDescription] = useState({})
    const [rrulestring, setRrulestring] = useState({})
    const [rule, setRule] = useState({})

    const [firstRendering, setfirstRendering] = useState(false);

    const getStart = (triggerScheduleId) => (e) => {
        changeTimeStartTriggerSchedule(e, triggerScheduleId);
        setStart({ ...start, [triggerScheduleId]: e });
    }
    const getEnd = (triggerScheduleId) => (e) => {
        changeTimeEndTriggerSchedule(e, triggerScheduleId);
        setEnd({ ...end, [triggerScheduleId]: e });
    }
    const handleRrule = (triggerScheduleId) => (e) => {
        descriptionHandler(triggerScheduleId, e);
        changeRruleTriggerSchedule(e?.toString() ?? "", triggerScheduleId);
        changeRruleObjectsTriggerSchedule(e.options, triggerScheduleId);
        setRrulestring({ ...rrulestring, [triggerScheduleId]: e.toString() })
        setRule({ ...rule, [triggerScheduleId]: e });
    }
    const handleAdd = (triggerScheduleId) => (e) => {
        //console.log(e, 8788);
        changeRruleObjectsTriggerScheduleForAdditional(e, triggerScheduleId);
    }

    //Description handler
    const descriptionHandler = (triggerScheduleId, e) => { //e should be the rrule obj
        setDescription({ ...description, [triggerScheduleId]: rruleDescription(e, start[triggerScheduleId], end[triggerScheduleId]) })
    }
    

    // useEffect(() => {
    //     if (!firstRendering){
    //         originalEM.triggerSchedules.map(schedule => {
    //             // console.log(11221,schedule)

    //         })
    //         setfirstRendering(true);
    //     }
    // }, [])

    useEffect(() => {
        changeTriggerSchedules(triggerScheduleArr, eventsManagementId);
    }, [triggerScheduleArr])
    
    useEffect(() => {
        changeInputEventsWithTimer(inputWithTimerEventsManagementArr, eventsManagementId);
    }, [inputWithTimerEventsManagementArr])

    useEffect(() => {
        changeOutputActionsWithTimer(outputWithTimerEventsManagementArr, eventsManagementId);
    }, [outputWithTimerEventsManagementArr])
    
    //blocker for invalid until date
    const handleInvalidUntil = (triggerScheduleId) => (bool) => {
        const newValidations = [ ...triggerScheduleValidations ];
        const validation = newValidations.find(v => v.triggerScheduleId == triggerScheduleId);
        validation.untilInvalid = bool;
        checkAnyBeginForEventManagement(bool)
        setUntilHolderForEventManagement({...untilHolderForEventManagement, [eventsManagementId]: bool})
    }

    const handleInvalidBegin = (triggerScheduleId) => (bool) => {
        const newValidations = [ ...triggerScheduleValidations ];
        const validation = newValidations.find(v => v.triggerScheduleId == triggerScheduleId);
        validation.beginInvalid = bool;
        checkAnyBeginForEventManagement(bool)
        // setBeginHolderForEventManagement({...beginHolderForEventManagement, [eventsManagementId]: bool})
    }

    useEffect(() => {
        checkAnyUntilForEventManagement(untilHolderForEventManagement[eventsManagementId]);
        checkAnyTimeStartForEventManagement(startHolderForEventManagement[eventsManagementId]);
        checkAnyTimeEndForEventManagement(endHolderForEventManagement[eventsManagementId]);
    }, [beginHolderForEventManagement, untilHolderForEventManagement, startHolderForEventManagement, endHolderForEventManagement])

    useEffect(() => {
        const inputEventsId = allInputEvents.map(event => event.eventActionInputId);
        const outputActionsId = allOutputEvents.map(event => event.eventActionOutputId);
        const inputWithTimerValidations = [...inputWithTimerEventsManagementValidations];
        const outputWithTimerValidations = [...outputWithTimerEventsManagementValidations];
        let newInputEventsWithTimer = [];
        let newInputEventsWithTimerValidation = [];
        let newOutputActionsWithTimer = [];
        let newOutputActionsWithTimerValidation = [];
        for (let i = 0; i < inputWithTimerEventsManagementArr.length; i++) {
            const inputEvent = inputWithTimerEventsManagementArr[i];
            const validation = inputWithTimerValidations.find(info => info.inputId == inputEvent.inputId);
            if (inputEvent.eventActionInputType.eventActionInputId in inputEventsId) {
                newInputEventsWithTimer.push(inputEvent);
                newInputEventsWithTimerValidation.push(validation);
            }
        }

        for (let i = 0; i < outputWithTimerEventsManagementArr.length; i++) {
            const outputAction = outputWithTimerEventsManagementArr[i];
            const validation = outputWithTimerValidations.find(info => info.outputId == outputAction.outputId);
            if (outputAction.eventActionOutputType.eventActionOutputId in outputActionsId) {
                newOutputActionsWithTimer.push(outputAction);
                newOutputActionsWithTimerValidation.push(validation);
            }
        }

        setInputWithTimerEventsManagementArr(newInputEventsWithTimer);
        setInputWithTimerEventsManagementValidations(newInputEventsWithTimerValidation);

        setOutputWithTimerEventsManagementArr(newOutputActionsWithTimer);
        setOutputWithTimerEventsManagementValidations(newOutputActionsWithTimerValidation);

        if (inputEventsValueWithoutTimerState) {

            let newInputEventsWithoutTimer = null;
        
            for (let i = 0; i < inputEventsId.length; i++) {
                if (inputEventsValueWithoutTimerState === inputEventsId[i])   {
                    newInputEventsWithoutTimer = inputEventsValueWithoutTimerState;
                }
            }
        
            setInputEventsValueWithoutTimerState(newInputEventsWithoutTimer);
            changeInputEventsWithoutTimer(newInputEventsWithoutTimer, eventsManagementId);
        }

        if (outputActionsValueWithoutTimerState) {
            let newOutputActionsWithoutTimer = [];
            for (let i = 0; i < outputActionsValueWithoutTimerState.length; i++) {
                for (let j = 0; j < outputActionsId.length; j++) {
                    if (outputActionsValueWithoutTimerState[i].eventActionOutputId === outputActionsId[j]) {
                        newOutputActionsWithoutTimer.push(outputActionsValueWithoutTimerState[i]);
                    }
                }
            }
            setOutputActionsValueWithoutTimerState(newOutputActionsWithoutTimer);
            changeOutputActionsWithoutTimer(newOutputActionsWithoutTimer, eventsManagementId);
        }
    }, [allInputEvents, allOutputEvents])

    return (
        <ErrorCard error={
            eventsManagementNameBlank ||
            timeStartInvalid ||
            timeEndInvalid ||
            untilInvalid ||
            submitFailed ||
            eventsManagementInputEventsEmpty ||
            eventsManagementInputEventsInvalidId ||
            eventsManagementInputEventsConflict ||
            eventsManagementOutputActionsEmpty ||
            eventsManagementOutputActionsInvalidId ||
            eventsManagementOutputActionsConflict ||
            eventsManagementTriggerSchedulesEmpty ||
            eventsManagementInvalidEmailRecipients ||
            eventsManagementInvalidSMSRecipients ||
            eventsManagementEmailRecipientsEmpty ||
            eventsManagementSMSRecipientsEmpty
        }>
            <CardHeader
                avatar={
                    <ExpandMore
                        expand={expanded}
                        onClick={handleExpandClick}
                    >
                        <ExpandMoreIcon />
                    </ExpandMore>
                }
                title="Events Management"
                action={
                    (
                        <Grid item
                            container>
                            {/* { edit && (
                                <Grid item
                                    sx={{display: "flex", justifyContent: "center", alignItems: "center", paddingRight: 1, paddingLeft: 1}}>
                                    <EditFormTooltip />
                                </Grid>
                            )} */}
                            <Button
                                variant="outlined"
                                color="error"
                                sx={{mt:1}}
                                onClick={() => removeCard(eventsManagementId)}
                            >
                                Clear
                            </Button>
                            {/* { edit && (
                                <Box ml={2}>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        onClick={() => console.log("delete")} // put delete method here
                                    >
                                        Delete
                                    </Button>
                                </Box>
                            )} */}
                        </Grid>
                    )
                }
                sx={{ width: '100%', flexWrap: "wrap" }}
            />
            <Divider />
            <CardContent>
                <EmailEdit
                    open={notificationEmailEditOpen}
                    eventManagementName={eventsManagementName}
                    handleDialogClose={() => setNotificationEmailEditOpen(false)}
                    emailValue={notificationEmailsValue}
                    emailRecipients={notificationEmailsRecipients}
                    defaultEmailTitle={eventsManagementDefaultTitle}
                    defaultEmailContent={eventsManagementDefaultContent}
                    changeEmail={(newValue) => {
                        setNotificationEmailsRecipients(newValue.eventsManagementEmailRecipients);
                        changeNotificationEmails(newValue, eventsManagementId);
                    }}
                />
                <SMSEdit
                    open={notificationSMSEditOpen}
                    eventManagementName={eventsManagementName}
                    handleDialogClose={() => setNotificationSMSEditOpen(false)}
                    smsValue={notificationSMSsValue}
                    smsRecipients={notificationSMSsRecipients}
                    defaultSMSContent={eventsManagementDefaultContent}
                    changeSMS={(newValue) => {
                        setNotificationSMSsRecipients(newValue.eventsManagementSMSRecipients);
                        changeNotificationSMSs(newValue, eventsManagementId);
                    }}
                />
                <Stack
                    spacing={3}
                >
                    <Grid
                        item
                        md={6}
                        xs={12}
                    >
                        <TextField
                            fullWidth
                            label="Name"
                            name="eventsManagementName"
                            required
                            value={eventsManagementName}
                            onChange={(e)=>{changeTextField(e,eventsManagementId)}}
                            helperText={ 
                                (eventsManagementNameBlank && 'Error: events management name cannot be blank')
                            }
                            error={ Boolean(eventsManagementNameBlank)}
                        />
                    </Grid>
                    <Collapse in={expanded}>
                        <Stack spacing={3}>
                            <Grid
                                container
                            >
                                <Grid item
                                    mr={2}
                                    mb={2}
                                    >
                                    <Typography fontWeight="bold">Trigger (without timer) :</Typography>
                                </Grid> 
                                <Grid
                                    item
                                    md={12}
                                    xs={12}
                                >
                                    {/* Remove console log at your own risk */}
                                    {console.log(inputEventsValueWithoutTimerState, "inputEventsValueWithoutTimerState")}
                                    <Select
                                        sx={{ maxWidth: "100%", minWidth: "100%", marginBottom: "10px" }}
                                        required={inputEvents.length===0}
                                        value={inputEventsValueWithoutTimerState}
                                        onChange={(e) => { changeInputEventsWithoutTimer(e.target.value, originalEM.eventsManagementId) }}
                                        error={
                                            Boolean(inputEvents.length==0)
                                        }
                                        renderValue={(value) => { return <div>{value ? inputEventsWithoutTimer.find(e => e.eventActionInputId == value)?.eventActionInputName : "Choose trigger (without timer)"}</div>}}
                                        displayEmpty
                                    >
                                        {inputEventsWithoutTimer.map(e => {
                                            return <MenuItem
                                                key={e.eventActionInputId}
                                                value={e.eventActionInputId}>{e.eventActionInputName}</MenuItem>
                                        })}
                                    </Select>
                                    <Grid sx={{color: "#D14343", fontSize: "0.75rem", marginTop: "3px", marginLeft: "12px", marginRight: "12px"}}>
                                        {Boolean(inputEvents.length == 0) && "Error: no trigger selected" || Boolean(eventsManagementInputEventsConflict) && "Error: trigger conflict. One type of custom trigger can only be used as either IN or OUT and not both"}
                                    </Grid>
                                </Grid>
                            </Grid>
                            {inputWithTimerEventsManagementArr.map((info, i) => (
                                <Grid container
                                    key={info.inputId}>
                                <Grid container
                                        alignItems="center">
                                        <Grid item
                                            mr={2}
                                            mt={1}>
                                            <Typography fontWeight="bold">Trigger (with timer):</Typography>
                                        </Grid>
                                        <Grid item
                                            mt={1}
                                            mr={2}
                                        
                                        >
                                            <Select
                                                // required={repeatToggle?true:false}
                                                sx={{ maxWidth: 400, minWidth: 400 }}
                                                value={info.eventActionInputType.eventActionInputId}
                                                onChange={(e) => { changeSelectionInputWithTime(e, info.inputId) }}
                                                error={Boolean(inputWithTimerEventsManagementValidations.find(e => e.inputId === info.inputId).eventActionInputIdBlank)}
                                            >
                                                {inputEventsWithTimer.map(e => {
                                                    return <MenuItem
                                                        key={e.eventActionInputId}
                                                        value={e.eventActionInputId}>{e.eventActionInputName}</MenuItem>
                                                })}
                                            </Select>
                                        </Grid>
                                        <Grid item
                                            mt={1}>
                                            <TextField
                                                type="number"
                                                sx={{ mr: 2, maxWidth: 150, minWidth: 150 }}
                                                value={info.timerDuration}
                                                required
                                                onChange={(e)=>{changeInputTime(e,info.inputId)}}
                                                error={ Boolean(inputWithTimerEventsManagementValidations.find(e => e.inputId === info.inputId).timerDurationInputBlank) || Boolean(inputWithTimerEventsManagementValidations.find(e => e.inputId === info.inputId).timerDurationInputTooLarge) || Boolean(inputWithTimerEventsManagementValidations.find(e => e.inputId === info.inputId).timerDurationInputNotPositive)}
                                            />
                                        </Grid>
                                        <Grid item
                                            mr={2}
                                            mt={1}>
                                            <Typography fontWeight="bold">second(s)</Typography>
                                        </Grid>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            sx={{mt:1}}
                                            onClick={() => removeInputWithTimerCard(info.inputId)}
                                        >
                                            Remove
                                        </Button>
                                    </Grid>
                                    <Grid sx={{color: "#D14343", fontSize: "0.75rem", marginTop: "3px", marginLeft: "12px", marginRight: "12px"}}>
                                        {Boolean(inputWithTimerEventsManagementValidations.find(e => e.inputId === info.inputId).eventActionInputIdBlank) && "Error: empty selection of trigger (with timer) is not allowed" || Boolean(inputWithTimerEventsManagementValidations.find(e => e.inputId === info.inputId).timerDurationInputBlank) && "Error: timer duration cannot be empty" || Boolean(inputWithTimerEventsManagementValidations.find(e => e.inputId === info.inputId).timerDurationInputTooLarge) && "Error: timer duration cannot be too large" || Boolean(inputWithTimerEventsManagementValidations.find(e => e.inputId === info.inputId).timerDurationInputNotPositive) && "Error: timer duration must be longer than 1 second"}
                                    </Grid>
                            </Grid>                           
                            ))}
                            <div>
                                <Button
                                    size="large"
                                    variant="outlined"
                                    startIcon={<Add />}
                                    onClick={addInputWithTimerCard}
                                    disabled={inputEventsWithTimer.length === 0}
                                >
                                    Add trigger with timer
                                </Button>
                            </div>
                            <Grid
                                container
                                mb={3}
                            >
                                <Grid item
                                    md={4}
                                    xs={4}
                                    mr={2}
                                    mb={2}
                                >
                                    <Typography fontWeight="bold">Action (without timer) :</Typography>
                                </Grid>                 
                                <Grid
                                    item
                                    md={12}
                                    xs={12}
                                >  
                                    {/* Remove console log at your own risk */}
                                    {console.log(outputActionsValueWithoutTimerState)}
                                    <MultipleSelectInput
                                        options={outputEventsWithoutTimer}
                                        setSelected={(e) => {
                                            let hasNotificationEmailsOutput = false;
                                            let hasNotificationSMSsOutput = false;
                                            for (let j = 0; j < e.length; j++) {
                                                if (e[j].eventActionOutputName === "NOTIFICATION (EMAIL)") {
                                                    hasNotificationEmailsOutput = true;
                                                }
                                                if (e[j].eventActionOutputName === "NOTIFICATION (SMS)") {
                                                    hasNotificationSMSsOutput = true;
                                                }
                                            }
                                            if (!hasNotificationEmailsOutput) {
                                                setNotificationEmailsRecipients([]);
                                            }
                                            if (!hasNotificationSMSsOutput) {
                                                setNotificationSMSsRecipients([]);
                                            }
                                            changeOutputActionsWithoutTimer(e, eventsManagementId)
                                        }}
                                        getOptionLabel={getEventActionOutputName}
                                        label="Action (without timer)"
                                        noOptionsText="No action (without timer) found"
                                        placeholder="Search for action (without timer) name"
                                        filterOptions={eventActionOutputFilter}
                                        value={outputActionsValueWithoutTimerState}
                                        isOptionEqualToValue={eventActionOutputEqual}
                                        error={
                                            Boolean(outputActions.length==0)
                                        }
                                        helperText={
                                            Boolean(outputActions.length==0)&&"Error : no action selected"
                                        }
                                    />
                                </Grid>
                            </Grid>
                            {notificationEmailsValue && <div style={{display: "flex", flexDirection: "column"}}>
                                <div>
                                    <TextField
                                        fullWidth
                                        sx={{mr: 2, mt: 2}}
                                        label="Email Recipients"
                                        value={notificationEmailsInputValue}
                                        onChange={(e) => {
                                            setNotificationEmailsInputValue(e.target.value);
                                        }}
                                        helperText={ 
                                            (Boolean(eventsManagementEmailRecipientsEmpty) && "Error: empty email recipients is not allowed") ||
                                            (Boolean(eventsManagementInvalidEmailRecipients) && "Error: invalid email recipient(s)")
                                        }
                                        error={ Boolean(eventsManagementEmailRecipientsEmpty) || Boolean(eventsManagementInvalidEmailRecipients) }
                                        InputProps={{
                                        sx: {height: 80},
                                        startAdornment: (
                                            <InputAdornment position="start"
                                                sx={{ maxWidth: "65%", marginTop: 2, marginBottom: 1, scrollbarColor: "white"}}>
                                            <div style={{display: "flex", overflowX: "scroll"}}>
                                            {notificationEmailsRecipients.map((item, index) => (
                                                <Chip key={index}
                                                    sx={{ mr: 1, mb: 1 }}
                                                    color={(validateEmail(item) === null)? "error": "default"}
                                                    size="small"
                                                    onDelete={() => {
                                                        let arr = [...notificationEmailsRecipients]
                                                        arr.splice(index, 1)
                                                        setNotificationEmailsRecipients(arr)
                                                        const newValue = {
                                                            eventsManagementEmailRecipients: arr,
                                                            eventsManagementEmailContent: notificationEmailsValue.eventsManagementEmailContent,
                                                            eventsManagementEmailTitle: notificationEmailsValue.eventsManagementEmailTitle,
                                                            useDefaultEmails: notificationEmailsValue.useDefaultEmails
                                                        }
                                                        changeNotificationEmails(newValue, eventsManagementId);
                                                    }}
                                                    label={item} />
                                            ))}
                                            </div>
                                        </InputAdornment>
                                        ),
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key == "Enter") {
                                                const newNotificationEmailRecipients = [...notificationEmailsRecipients, ...(e.target.value).split(",")];
                                                setNotificationEmailsRecipients(newNotificationEmailRecipients);
                                                const newValue = {
                                                    eventsManagementEmailRecipients: newNotificationEmailRecipients,
                                                    eventsManagementEmailContent: notificationEmailsValue.eventsManagementEmailContent,
                                                    eventsManagementEmailTitle: notificationEmailsValue.eventsManagementEmailTitle,
                                                    useDefaultEmails: notificationEmailsValue.useDefaultEmails
                                                }
                                                changeNotificationEmails(newValue, eventsManagementId);
                                                setNotificationEmailsInputValue("");
                                            }
                                        }}
                                    />
                                    <Button
                                        size="small"
                                        variant="text"
                                        sx={{verticalAlign:"bottom", marginTop: 2}}
                                        startIcon={<Edit />}
                                        onClick={() => {setNotificationEmailEditOpen(true)}}
                                        >
                                            Edit Email Content
                                    </Button>
                                </div>
                            </div>
                            }
                            {notificationSMSsValue && <div style={{display: "flex", flexDirection: "column"}}>
                                <div>
                                    <TextField
                                        fullWidth
                                        sx={{mr: 2, mt: 2}}
                                        label="SMS Recipients"
                                        value={notificationSMSsInputValue}
                                        helperText={ 
                                            (Boolean(eventsManagementSMSRecipientsEmpty) && "Error: empty SMS recipients is not allowed") ||
                                            (Boolean(eventsManagementInvalidSMSRecipients) && "Error: invalid SMS recipient(s)")
                                        }
                                        error={ Boolean(eventsManagementSMSRecipientsEmpty) || Boolean(eventsManagementInvalidSMSRecipients) }
                                        InputProps={{
                                        sx: {height: 80},
                                        startAdornment: (
                                            <InputAdornment position="start"
                                                sx={{ maxWidth: "65%", marginTop: 2, marginBottom: 1, scrollbarColor: "white"}}>
                                            <div style={{display: "flex", overflowX: "scroll"}}>
                                                {notificationSMSsRecipients.map((item, index) => (
                                                    <Chip key={index}
                                                        sx={{ mr: 1, mb: 1 }}
                                                        size="small"
                                                        color={(!validatePhoneNumber(item)) ? "error": "default"}
                                                        onDelete={() => {
                                                            let arr = [...notificationSMSsRecipients]
                                                            arr.splice(index, 1)
                                                            setNotificationSMSsRecipients(arr)
                                                            const newValue = {
                                                                eventsManagementSMSRecipients: arr,
                                                                eventsManagementSMSContent: notificationSMSsValue.eventsManagementSMSContent,
                                                                useDefaultSMS: notificationSMSsValue.useDefaultSMS
                                                            }
                                                            changeNotificationSMSs(newValue, eventsManagementId);
                                                        }}
                                                        label={item} />
                                                ))}
                                            </div>
                                        </InputAdornment>
                                        ),
                                        }}
                                        onChange={(e) => {
                                            setNotificationSMSsInputValue(e.target.value);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key == "Enter") {
                                                const newNotificationSMSRecipients = [...notificationSMSsRecipients, ...(e.target.value).split(",")];
                                                setNotificationSMSsRecipients(newNotificationSMSRecipients);
                                                const newValue = {
                                                    eventsManagementSMSRecipients: newNotificationSMSRecipients,
                                                    eventsManagementSMSContent: notificationSMSsValue.eventsManagementSMSContent,
                                                    useDefaultSMS: notificationSMSsValue.useDefaultSMS
                                                }
                                                changeNotificationSMSs(newValue, eventsManagementId);
                                                setNotificationSMSsInputValue("");
                                            }
                                        }}
                                    />
                                    <Button
                                        size="small"
                                        variant="text"
                                        startIcon={<Edit />}
                                        sx={{verticalAlign:"bottom", marginTop: 2}}
                                        onClick={() => {setNotificationSMSEditOpen(true)}}
                                    >
                                        Edit SMS Content
                                    </Button>
                                </div>
                            </div>
                            }
                            {(Boolean(eventsManagementSMSRecipientsEmpty) || Boolean(eventsManagementInvalidSMSRecipients)) && <Grid sx={{ color: "#D14343", fontSize: "0.75rem", marginTop: "3px", marginLeft: "12px", marginRight: "12px" }}>
                                {Boolean(eventsManagementSMSRecipientsEmpty) && "Error: empty SMS recipients is not allowed" || Boolean(eventsManagementInvalidSMSRecipients) && "Error: invalid SMS recipient(s)"}
                            </Grid>
                            }
                            {outputWithTimerEventsManagementArr.map((info, i) => (
                                <Grid container
                                    key={info.outputId}>
                                <Grid container
                                        alignItems="center">
                                        <Grid item
                                            mr={2}
                                            mt={1}>
                                            <Typography fontWeight="bold">Action (with timer):</Typography>
                                        </Grid>
                                        <Grid item
                                            mt={1}
                                            mr={2}
                                        
                                        >
                                            <Select
                                                // required={repeatToggle?true:false}
                                                sx={{ maxWidth: 400, minWidth: 400 }}
                                                value={info.eventActionOutputType.eventActionOutputId}
                                                onChange={(e) => { changeSelectionOutputWithTime(e, info.outputId) }}
                                                error={Boolean(outputWithTimerEventsManagementValidations.find(e => e.outputId === info.outputId).eventActionOutputIdBlank)}
                                            >
                                                {outputEventsWithTimer.map(e => {
                                                    return <MenuItem
                                                        key={e.eventActionOutputId}
                                                        value={e.eventActionOutputId}>{e.eventActionOutputName}</MenuItem>
                                                })}
                                            </Select>
                                        </Grid>
                                        <Grid item
                                            mt={1}>
                                            <TextField
                                                type="number"
                                                sx={{ mr: 2, maxWidth: 150, minWidth: 150 }}
                                                onChange={(e) => { changeOutputTime(e, i) }}
                                                error={ Boolean(outputWithTimerEventsManagementValidations.find(e => e.outputId === info.outputId).timerDurationOutputBlank) || Boolean(outputWithTimerEventsManagementValidations.find(e => e.outputId === info.outputId).timerDurationOutputTooLarge) || Boolean(outputWithTimerEventsManagementValidations.find(e => e.outputId === info.outputId).timerDurationOutputNotPositive)}
                                                value={info.timerDuration}
                                            />
                                        </Grid>
                                        <Grid item
                                            mr={2}
                                            mt={1}>
                                            <Typography fontWeight="bold">second(s)</Typography>
                                        </Grid>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            sx={{mt:1}}
                                            onClick={() => removeOutputWithTimerCard(info.outputId)}
                                        >
                                            Remove
                                        </Button>
                                    </Grid>
                                    <Grid sx={{color: "#D14343", fontSize: "0.75rem", marginTop: "3px", marginLeft: "12px", marginRight: "12px"}}>
                                        {Boolean(outputWithTimerEventsManagementValidations.find(e => e.outputId === info.outputId).eventActionOutputIdBlank) && "Error: empty selection of action (with timer) is not allowed" || Boolean(outputWithTimerEventsManagementValidations.find(e => e.outputId === info.outputId).timerDurationOutputBlank) && "Error: timer duration cannot be empty" || Boolean(outputWithTimerEventsManagementValidations.find(e => e.outputId === info.outputId).timerDurationOutputTooLarge) && "Error: timer duration cannot be too large" || Boolean(outputWithTimerEventsManagementValidations.find(e => e.outputId === info.outputId).timerDurationOutputNotPositive) && "Error: timer duration must be longer than 1 second" || Boolean(eventsManagementOutputActionsConflict) && "Error: action conflict. One type of custom action can only be used as either IN or OUT and not both"}
                                    </Grid>
                            </Grid>                           
                            ))}
                            <div>
                                <Button
                                    size="large"
                                    variant="outlined"
                                    startIcon={<Add />}
                                    onClick={addOutputWithTimerCard}
                                    disabled={outputEventsWithTimer.length === 0}
                                >
                                    Add action with timer
                                </Button>
                            </div>
                            {triggerScheduleArr.map((schedule, i) => {
                                console.log(998877,schedule);
                                console.log(123,triggerScheduleArr);
                                return <Grid container
                                    key={schedule.triggerScheduleId}>
                                <Grid container
                                        mt={2}
                                        mb={2}
                                        alignItems="center">
                                        <Grid item
                                            md={10}
                                            xs={10}
                                            mr={2}
                                            mb={2}
                                        >
                                            <TextField
                                                fullWidth
                                                name="Desc"
                                                multiline
                                                value={(description[schedule.triggerScheduleId])} //add new rrule obj here. value={new RRule(string)} from rrulefrom
                                                disabled
                                            />
                                        </Grid>
                                        <Grid item
                                            mr={2}
                                            mb={2}
                                        
                                        >
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                sx={{mt:1}}
                                                onClick={() => removeTriggerScheduleCard(schedule.triggerScheduleId)}
                                            >
                                                Remove
                                            </Button>            
                                        </Grid>
                                        <Grid
                                            item
                                            md={12}
                                            xs={12}
                                        >
                                            <Rrule2
                                                handleRrule={handleRrule(schedule.triggerScheduleId)}
                                                handleAdd={handleAdd(schedule.triggerScheduleId)}
                                                getStart={getStart(schedule.triggerScheduleId)}
                                                getEnd={getEnd(schedule.triggerScheduleId)}
                                                timeEndInvalid={ //triggerScheduleValidations.find(validation => validation.triggerScheduleId == schedule.triggerScheduleId) ? 
                                                    triggerScheduleValidations.find(validation => validation.triggerScheduleId == schedule.triggerScheduleId).timeEndInvalid
                                                    //: false
                                                }
                                                handleInvalidUntil={handleInvalidUntil(schedule.triggerScheduleId)}
                                                handleInvalidBegin={handleInvalidBegin(schedule.triggerScheduleId)}
                                                ogRrule={schedule}
                                            />
                                        </Grid>
                                        <Divider />
                                    </Grid>
                            </Grid>                           
                            })}
                            <div>
                                <Button
                                    size="large"
                                    variant="outlined"
                                    startIcon={<Add />}
                                    onClick={addTriggerScheduleCard}
                                >
                                    Add schedules
                                </Button>
                            </div>
                            <Grid sx={{color: "#D14343", fontSize: "0.75rem", marginTop: "3px", marginLeft: "12px", marginRight: "12px"}}>
                                {
                                    Boolean(eventsManagementTriggerSchedulesEmpty) && "Error: schedules cannot be empty" ||
                                    // Boolean(untilInvalid) && "Error: until is invalid" ||
                                    Boolean(submitFailed) && "Error: submit failed" 
                                }
                            </Grid>
                        </Stack>
                    </Collapse>
                </Stack>
            </CardContent>
        </ErrorCard>
    )
}

export default EditEventManagementForm;