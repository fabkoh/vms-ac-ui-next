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

// for textfield placeholder
const filterEventsManagementByStringPlaceholder = "Search for Controller, Entrance, Name, Description, Input(s) or Output(s)";

const stringFilterHelper = (eventsManagement, query) => {
        return(
        query === "" 
        || stringIn(query, eventsManagement.eventsManagementName) 
        || (eventsManagement.inputEvents.some(inputevent=> stringIn(query, inputevent.eventActionInputType.eventActionInputTypeName)))
        || (eventsManagement.outputActions.some(outputAction=> stringIn(query, outputAction.eventActionOutputType.eventActionOutputTypeName)))
        || (eventsManagement.entrance ? stringIn(query, eventsManagement.entrance.entranceName):false) 
        || (eventsManagement.controller ? stringIn(query, eventsManagement.controller.controllerName):false) 
        || stringIn(query, rruleDescription(rrulestr(eventsManagement.triggerSchedule.rrule), eventsManagement.triggerSchedule.timeStart, eventsManagement.triggerSchedule.timeEnd))
        )}

// returns true if queryString === "" or
//                 lowercase queryString in lowercase entranceName or
//                 lowercase queryString in lowercase controllerName or 
//                 lowercase queryString in lowercase eventsManagementName or
//                 lowercase queryString in lowercase inputEvents or 
//                 lowercase queryString in lowercase outputActions or
//                 lowercase queryString in lowercase rruleDescription 

const filterEventsManagementByString = (eventsManagement, queryString) => stringFilterHelper(eventsManagement, queryString.toLowerCase());

// returns true if status == null or
//                 isActive == status
const filterEntranceByStatus = (entrance, status) => status == null || entrance.isActive == status;

const getEntranceDetailsLink = (entrance) => isObject(entrance) && `/dashboard/entrances/details/${entrance.entranceId}`;

const getEntranceEditLink = (entrances) => (
    '/dashboard/entrances/edit?ids=' + encodeURIComponent(JSON.stringify(entrances.filter(isObject).map(e => e.entranceId)))
);

const getEntranceIdsEditLink = (ids) =>  '/dashboard/entrances/edit?ids=' + encodeURIComponent(JSON.stringify(ids));


const entranceListLink = '/dashboard/entrances';
const eventsManagementCreateLink = '/dashboard/entrances/create';

const getEntranceLabel = (entrance) => isObject(entrance) && entrance.entranceName;

const filterEntrancesByString = (entrances, queryString) => {
    const query = queryString.toLowerCase();
    return entrances.filter(e => stringFilterHelper(e, query))
}

const filterEntrancesByState = filterByState(filterEntrancesByString);

const isEntranceEqual = (e1, e2) => isObject(e1) && isObject(e2) && e1.entranceId != null && e1.entranceId === e2.entranceId;

// takes in inputEvents list and return string 
const eventActionInputDescription = inputEvents => {
        
    return (inputEvents.map(
        (inputEvent,i) =>
        // check if timer enabled, concatenate to string 
        
            <div key={i}>
            {`${inputEvent.eventActionInputType.eventActionInputTypeName}`}
            {inputEvent.eventActionInputType.timerEnabled ?
                (inputEvent.timerDuration?
                    ` (${inputEvent.timerDuration}secs)`:
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
            {`${outputAction.eventActionOutputType.eventActionOutputTypeName}`}
            {outputAction.eventActionOutputType.timerEnabled ?
                (outputAction.timerDuration?
                ` (${outputAction.timerDuration}secs)`:
                ``)
            :"" }
            </div>      

    ))
}

export { 
    filterEventsManagementByStringPlaceholder, 
    filterEventsManagementByString,
    eventsManagementCreateLink, 
    entranceListLink, 
    getEntranceEditLink, 
    getEntranceIdsEditLink, 
    getEntranceDetailsLink, 
    getEntranceLabel, 
    filterEntrancesByString, 
    filterEntrancesByState, 
    isEntranceEqual,
    eventActionInputDescription,
    displayEntranceOrController,
    eventActionOutputDescription
 }