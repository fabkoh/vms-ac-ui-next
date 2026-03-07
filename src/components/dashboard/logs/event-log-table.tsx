import { Table, TableBody, TableCell, TableHead, TablePagination, TableRow } from "@mui/material";
import { Scrollbar } from "../../scrollbar";
import { toDisplayEventsDateString } from "../../../utils/utils";
import NextLink from "next/link";
import { Card, CardHeader, Grid, Link, Divider, Chip, TextField, Box, InputAdornment, Typography, Collapse, IconButton } from "@mui/material";
import MeetingRoom from "@mui/icons-material/MeetingRoom";
import WarningChip from "../shared/warning-chip";
import RenderTableCell from "../shared/renderTableCell";
import { Person, SelectAll } from "@mui/icons-material";
import { LockClosed } from "../../../icons/lock-closed";

const EventLogTable = ({
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    eventsCount,
    logs}) => (
    <div>
        <Scrollbar>
            <Table sx={{minWidth: 700}}>
                <TableHead sx={{backgroundColor:"neutral.200"}}>
                    <TableRow>
                        <TableCell>Timestamp</TableCell>
                        <TableCell>Event Type</TableCell>
                        <TableCell>Entrance</TableCell>
                        <TableCell>Controller</TableCell>
                        <TableCell>Person</TableCell>
                        <TableCell>Access Group</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>

                
                    {
                        Array.isArray(logs) && logs.map((log,i) => (
                            <TableRow
                                hover
                                key={`logtablerow${i}`}
                            >

                                <TableCell>
                                    {/* { toDisplayDateString(log.eventTime) } */}
                                    { toDisplayEventsDateString(log.eventTime) }
                                </TableCell>

                            {/* // insert icon for different types of eventtype  */}
                                <TableCell>
                                    <Chip label={
                                        log.direction ? 
                                        log.eventActionType.eventActionTypeName + " ( " + log.direction +" ) ":
                                        log.eventActionType.eventActionTypeName
                                    } />

                                </TableCell>
                                
                                <TableCell>

                                {log.entrance ?
                                <RenderTableCell
                                    exist={log.entrance ? true : false}
                                    deleted={log.entrance.deleted}
                                    id={log.entrance.entranceId}
                                    name={log.entrance.entranceName}
                                    link={ `/dashboard/entrances/details/${log.entrance.entranceId}` }
                                    chip={<MeetingRoom fontSize="small" />} //Centered vertically}} />}
                                />: 'N.A.'
                                }
                                </TableCell>

                                
                                <TableCell>
                                {log.controller ?
                                <RenderTableCell
                                    exist={log.controller ? true : false}
                                    deleted={log.controller.deleted}
                                    id={log.controller.controllerId}
                                    name={log.controller.controllerName}
                                    link={ `/dashboard/controllers/details/${log.controller.controllerId}` }
                                    chip={<SelectAll fontSize="small" sx={{mr: 1}} />}
                                />: 'N.A.'
                                }
                                </TableCell>

                                <TableCell>
                                {log.person ?
                                <RenderTableCell
                                    exist={log.person ? true : false}
                                    deleted={log.person.deleted}
                                    id={log.person.personId}
                                    name={log.person.personFirstName +" "+ log.person.personLastName}
                                    link={ `/dashboard/persons/details/${log.person.personId}` }
                                    chip={<Person fontSize="small" sx={{mr: 1}} />}
                                />: 'N.A.'
                                }
                                </TableCell>


                                <TableCell>
                                {log.accessGroup ?
                                <RenderTableCell
                                    exist={log.accessGroup ? true : false}
                                    deleted={log.accessGroup.deleted}
                                    id={log.accessGroup.accessGroupId}
                                    name={log.accessGroup.accessGroupName }
                                    link={ `/dashboard/access-groups/details/${log.accessGroup.accessGroupId}` }
                                    chip={<LockClosed fontSize="small" sx={{mr: 1}} />}
                                />: 'N.A.'
                                }
                                </TableCell>

                                
                                
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
        </Scrollbar>
        <TablePagination
                component="div"
                count={eventsCount}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
                page={page}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
            />
    </div>
)

export default EventLogTable;