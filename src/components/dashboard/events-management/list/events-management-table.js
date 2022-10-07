import { Checkbox, Table, TableBody, TableCell, TableHead, TablePagination, TableRow } from "@mui/material";
import { Scrollbar } from "../../../scrollbar";
import { eventActionInputDescription, displayEntranceOrController, eventActionOutputDescription, listDescription} from "../../../../utils/eventsManagement";


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
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {eventsManagements.map((eventManagement, i) => {
                                        const IsEventsManagementSelected = selectedEventsManagement.includes(eventManagement.eventsManagementId);
                                        const handleSelect = handleSelectFactory(eventManagement.eventsManagementId);
                                        return(
                                        <TableRow hover
                                            key={i}>
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={IsEventsManagementSelected}
                                                    onChange={handleSelect}
                                                    value={IsEventsManagementSelected}
                                                /> 
                                            </TableCell> 
                                            <TableCell>{displayEntranceOrController(eventManagement)}</TableCell>
                                            <TableCell sx={{minWidth: 200}}>{eventManagement.eventsManagementName}</TableCell>
                                            <TableCell sx={{minWidth: 300}}>
                                                {listDescription(eventManagement)}
                                            </TableCell>
                                            <TableCell sx={{minWidth: 300}} >{ eventActionInputDescription(eventManagement.inputEvents)}</TableCell>
                                            <TableCell  sx={{minWidth: 300}}>{ eventActionOutputDescription(eventManagement.outputActions, smsConfig, emailConfig)}</TableCell>
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