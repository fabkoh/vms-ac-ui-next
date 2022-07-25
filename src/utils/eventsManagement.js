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

import { MeetingRoom, SelectAll } from "@mui/icons-material";
import { rrulestr } from "rrule";
import RenderTableCell from "../components/dashboard/shared/renderTableCell";
import rruleDescription from "./rrule-desc";
import { filterByState, isObject, stringIn } from "./utils";
import {Grid} from "@mui/material";

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
const eventsManagementCreateLink = '/dashboard/events-management/modify';

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

const displayEntranceOrController = eventManagement => {
    return (
        eventManagement.controller  ?
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
const eventActionOutputDescription = outputActions => {
    
    return (outputActions.map(
        (outputAction,i) =>
        // check if timer enabled, concatenate to string 
        
            <div key={i}>
            {`${outputAction.eventActionOutputType.eventActionOutputName}`}
            {outputAction.eventActionOutputType.timerEnabled ?
                (outputAction.timerDuration?
                ` (${outputAction.timerDuration} secs)`:
                ``)
            :"" }
            </div>      

    ))
}

const listDescription = eventManagement => 
{
    return(eventManagement.triggerSchedules.map((trigger,i) => {
    if(i<eventManagement.triggerSchedules.length-1)
        return(
            <div key={i} >
                {rruleDescription(rrulestr(trigger.rrule), 
                trigger.timeStart, 
                trigger.timeEnd)}
                <br /><br />
            </div>)
        else return(
            <div key={i}>
                {rruleDescription(rrulestr(trigger.rrule), 
                trigger.timeStart, 
                trigger.timeEnd)}
            </div>
        )}))}

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
    listDescription
 }