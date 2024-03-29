/**
 * Entrance util functions
 *
 * filterEntranceBy... takes in (entrance, query)
 * filterEntrancesBy... takes in (list of entrance, query)
 *
 * ...ByString filters entrances by name and description (query is string)
 * ...ByStatus filters entrances by isActive (query is null or boolean)
 *
 * filterEntranceByStringPlaceholder is meant to be the placeholder for a textfield where
 * users type in the query to filter entrances by (like in entrance list)
**/

import { MeetingRoom, SelectAll, WarningAmber } from "@mui/icons-material";
import WarningAmberOutlined from "@mui/icons-material/WarningAmberOutlined";
import { rrulestr } from "rrule";
import RenderTableCell from "../components/dashboard/shared/renderTableCell";
import rruleDescription, { rruleDescriptionWithBr } from "./rrule-desc";
import { filterByState, isObject, stringIn } from "./utils";
import {Grid, Tooltip, IconButton} from "@mui/material";
import { bool } from "prop-types";

// for textfield placeholder
const filterEventsManagementByStringPlaceholder = "Search for Controller, Entrance, Name, Description, Trigger(s) or Action(s)";

const stringFilterHelper = (eventsManagement, query) => {

        return(
        query === "" 
        || stringIn(query, eventsManagement.eventsManagementName) 
        || (eventsManagement.inputEvents.some(inputevent=> stringIn(query, inputevent.eventActionInputType.eventActionInputTypeName)))
        || (eventsManagement.outputActions.some(outputAction=> stringIn(query, outputAction.eventActionOutputType.eventActionOutputTypeName)))
        || (eventsManagement.entrance ? stringIn(query, eventsManagement.entrance.entranceName):false) 
        || (eventsManagement.controller ? stringIn(query, eventsManagement.controller.controllerName):false) 
        || (eventsManagement.triggerSchedules.some(schedule=> stringIn(query, rruleDescription(rrulestr(schedule.rrule), schedule.timeStart, schedule.timeEnd))))
    )}

// returns true if queryString === "" or
//                 lowercase queryString in lowercase entranceName or
//                 lowercase queryString in lowercase controllerName or 
//                 lowercase queryString in lowercase eventsManagementName or
//                 lowercase queryString in lowercase inputEvents or 
//                 lowercase queryString in lowercase outputActions or
//                 lowercase queryString in lowercase rruleDescription 


const filterEventsManagementByString = (eventsManagement, queryString) => stringFilterHelper(eventsManagement, queryString.toLowerCase());

const eventsManagementListLink = '/dashboard/events-management';
const eventsManagementCreateLink = '/dashboard/events-management/create';
const eventsManagementEditLink = (emId) =>  ('/dashboard/events-management/edit?id=' + encodeURIComponent(JSON.stringify(emId)))


const getEventManagementLabel = (eventManagement) => isObject(eventManagement) && eventManagement.eventsManagementName;

const filterEventManagementsByState = filterByState(filterEventsManagementByString);

const isEventManagementEqual = (e1, e2) => isObject(e1) && isObject(e2) && e1.eventManagementId != null && e1.eventManagementId === e2.eventManagementId;

// takes in inputEvents list and return string 
const eventActionInputDescription = inputEvents => {
        
    return (inputEvents.map(
        (inputEvent, i) =>
            // check if timer enabled, concatenate to string 
            <div key={i}>
            {`${inputEvent.eventActionInputType.eventActionInputName}`}
            {inputEvent.eventActionInputType.timerEnabled ?
                (inputEvent.timerDuration?
                    ` (${inputEvent.timerDuration} secs)`:
                ``)
            :"" }
            </div>      

    ))
}

const eventActionInputText = inputEvents => {
    return (inputEvents.map(
        (inputEvent, i) => {
            let timerDuration = ""
            if (inputEvent.eventActionInputType.timerEnabled) {
                if (inputEvent.timerDuration) {
                    timerDuration = ` (${inputEvent.timerDuration} secs)`
                }
            }
            return `${inputEvent.eventActionInputType.eventActionInputName}${timerDuration}`
        }
    )).join(", ");
}

const eventActionOutputText = outputActions => {
    return (outputActions.map(
        (outputAction, i) => {
            let timerDuration = ""
            if (outputAction.eventActionOutputType.timerEnabled) {
                if (outputAction.timerDuration) {
                    timerDuration = ` (${outputAction.timerDuration} secs)`
                }
            }
            return `${outputAction.eventActionOutputType.eventActionOutputName}${timerDuration}`
        }
    )).join(", ");
}


const displayEntranceOrController = eventManagement => {
    return (
        eventManagement.controller ?
            <RenderTableCell
                exist={eventManagement.controller ? true : false}
                deleted={false}
                id={eventManagement.controller.controllerId}
                name={eventManagement.controller.controllerName}
                link={ `/dashboard/controllers/details/${eventManagement.controller.controllerId}` }
                chip={<SelectAll fontSize="small" />} //Centered vertically}} />}
            />: 
        (eventManagement.entrance  ?
            <RenderTableCell
                exist={eventManagement.entrance ? true : false}
                deleted={false}
                id={eventManagement.entrance.entranceId}
                name={eventManagement.entrance.entranceName}
                link={ `/dashboard/entrances/details/${eventManagement.entrance.entranceId}` }
                chip={<MeetingRoom fontSize="small" />} //Centered vertically}} />}
            />: null)
    )
}

// takes in outputActions list and return string 
const eventActionOutputDescription = (outputActions, smsConfig= {}, emailConfig={}) => {
    
    return (outputActions.map(
        (outputAction, i) =>
        // check if timer enabled, concatenate to string 
        
        {
            let hasSMS = false;
            let hasSMSDisabled = false;
            let hasEmail = false;
            let hasEmailDisabled = false;
            if (outputAction.eventActionOutputType.eventActionOutputName === "NOTIFICATION (SMS)") {
                hasSMS = true;
                hasSMSDisabled = !smsConfig.enabled;
            }

            if (outputAction.eventActionOutputType.eventActionOutputName === "NOTIFICATION (EMAIL)") {
                hasEmail = true;
                hasEmailDisabled = !emailConfig.enabled;
            }
            return <div key={i}
                style={{
                    display: "flex",
                    flexDirection: "row",
                }}>
                {(hasSMS && hasSMSDisabled) || (hasEmail && hasEmailDisabled) ?
                    <Tooltip title={(hasSMS && hasSMSDisabled) ? "SMS Notification is disabled": "Email Notification is disabled"}>
                        <IconButton sx={{ borderRadius: "50%" }}>
                            <WarningAmber sx={{ color: "#FFB020", width: 20, marginRight: 0.5 }} />
                        </IconButton>
                    </Tooltip> : ""}
                <div style={{alignSelf: "center"}}>
                    {`${outputAction.eventActionOutputType.eventActionOutputName}`}
                    {outputAction.eventActionOutputType.timerEnabled ?
                        (outputAction.timerDuration ?
                            ` (${outputAction.timerDuration} secs)` :
                            ``)
                        : ""}
                </div>
        </div>
        }

    ))
}

const listDescription = eventManagement => 
{
    return(eventManagement.triggerSchedules.map((trigger,i) => {
    if(i<eventManagement.triggerSchedules.length-1)
        return(
            <div key={i} >
                {rruleDescriptionWithBr(rrulestr(trigger.rrule), 
                trigger.timeStart, 
                trigger.timeEnd)}
                <br /><br />
            </div>)
        else return(
            <div key={i}>
                {rruleDescriptionWithBr(rrulestr(trigger.rrule), 
                trigger.timeStart, 
                trigger.timeEnd)}
            </div>
        )}))}

const getEventsManagementDetailsLink = (emId) =>  ('/dashboard/events-management/details/' + emId)


export { 
    filterEventsManagementByStringPlaceholder, 
    filterEventsManagementByString,
    eventsManagementCreateLink, 
    eventsManagementListLink,
    getEventManagementLabel, 
    isEventManagementEqual,
    eventActionInputDescription,
    displayEntranceOrController,
    eventActionOutputDescription,
    eventActionOutputText,
    eventActionInputText,
    listDescription,
    getEventsManagementDetailsLink,
    eventsManagementEditLink
 }