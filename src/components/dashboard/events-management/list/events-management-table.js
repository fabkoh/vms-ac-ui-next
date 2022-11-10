import { Checkbox, IconButton, Table, TableBody, TableCell, TableHead, TablePagination, TableRow } from "@mui/material";
import { Scrollbar } from "../../../scrollbar";
import NextLink from "next/link";
import { PencilAlt as PencilAltIcon} from "../../../../icons/pencil-alt";
import { ArrowRight as ArrowRightIcon } from "../../../../icons/arrow-right";
import { eventActionInputDescription, displayEntranceOrController, eventActionOutputDescription, listDescription, getEventsManagementDetailsLink, eventsManagementEditLink} from "../../../../utils/eventsManagement";

function EventsManagementTable({ 
    selectedEventsManagement, 
    selectedSomeEventsManagement, 
    selectedAllEventsManagement,
    handleSelectAllEventsManagement, 
    eventsManagements, 
    handleSelectFactory, 
    eventsManagementCount, 
    onPageChange, 
    onRowsPerPageChange, 
    page,
    smsConfig,
    emailConfig,
    rowsPerPage, 
    }) {  
        
        
        return (
            <div>
                <Scrollbar>
                            <Table>
                                <TableHead sx={{ backgroundColor: "neutral.200" }}>
                                    <TableRow>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={selectedAllEventsManagement}
                                            indeterminate={selectedSomeEventsManagement}
                                            onChange={handleSelectAllEventsManagement}
                                        />  
                                    </TableCell>
                                        <TableCell>
                                            <div>Controller/</div> 
                                            <div>Entrance</div>
                                        </TableCell>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Description(s)</TableCell>
                                        <TableCell>Trigger(s)</TableCell>
                                        <TableCell>Action(s)</TableCell>
                                        <TableCell> </TableCell>
                                        <TableCell> </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {eventsManagements.map((eventManagement, i) => {
                                        const IsEventsManagementSelected = selectedEventsManagement.includes(eventManagement.eventsManagementId);
                                        const handleSelect = handleSelectFactory(eventManagement.eventsManagementId);
                                        return(
                                        <TableRow hover
                                            key={i}>
                                            <TableCell padding="checkbox" width="5%">
                                                <Checkbox
                                                    checked={IsEventsManagementSelected}
                                                    onChange={handleSelect}
                                                    value={IsEventsManagementSelected}
                                                /> 
                                            </TableCell> 
                                            <TableCell width="18%">{displayEntranceOrController(eventManagement)}</TableCell>
                                            <TableCell width="15%">{eventManagement.eventsManagementName}</TableCell>
                                            <TableCell width="30%">
                                                {listDescription(eventManagement)}
                                            </TableCell>
                                            <TableCell width="15%">{ eventActionInputDescription(eventManagement.inputEvents)}</TableCell>
                                            <TableCell width="15%">{ eventActionOutputDescription(eventManagement.outputActions, smsConfig, emailConfig)}</TableCell>
                                            <TableCell width="1%">
                                                <NextLink
                                                    href={eventsManagementEditLink(eventManagement.eventsManagementId)}
                                                    passHref
                                                >
                                                    <IconButton component="a">
                                                        <PencilAltIcon fontSize="small" />
                                                    </IconButton>
                                                </NextLink>
                                            </TableCell>
                                            <TableCell width="1%">
                                                <NextLink
                                                    href={getEventsManagementDetailsLink(eventManagement.eventsManagementId)}
                                                    passHref
                                                >
                                                    <IconButton component="a">
                                                        <ArrowRightIcon fontSize="small" />
                                                    </IconButton>
                                                </NextLink>
                                            </TableCell>
                                        </TableRow>
                                        
                                    )})}
                                </TableBody>
                            </Table>
                        </Scrollbar> 
            <TablePagination
            component="div"
            count={eventsManagementCount}
            onPageChange={onPageChange}
            onRowsPerPageChange={onRowsPerPageChange}
            page={page}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[5, 10, 15]}
        />
        </div>
        );

    }

export default EventsManagementTable;