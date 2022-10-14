import { Table, TableBody, TableCell, TableHead, TablePagination, TableRow, Button } from "@mui/material";
import { Scrollbar } from "../../scrollbar";
import { toDisplayEventsDateString } from "../../../utils/utils";
import NextLink from "next/link";
import { Card, CardHeader, Grid, Link, Divider, Chip, TextField, Box, InputAdornment, Typography, Collapse, IconButton } from "@mui/material";
import MeetingRoom from "@mui/icons-material/MeetingRoom";
import WarningChip from "../shared/warning-chip";
import RenderTableCell from "../shared/renderTableCell";
import { Person, SelectAll } from "@mui/icons-material";
import { LockClosed } from "../../../icons/lock-closed";
// import { NotificationDetails } from "./see-notification-details";

const NotificationLogTable = ({
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
                        <TableCell style={{width:"25%"}}>Event</TableCell>
                        <TableCell style={{width:"25%"}}>Notification Type</TableCell>
                        <TableCell style={{ width: "35%" }}>Recipients</TableCell>
                        <TableCell style={{width:"20%"}}>Timestamp</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        Array.isArray(logs) && logs.map((log,i) => (
                            <TableRow
                                hover
                                key={`logtablerow${i}`}
                            >

                            {/* // insert icon for different types of eventtype  */}
                                <TableCell>
                                    <Chip label={
                                        log.eventsManagementName
                                    } />
                                </TableCell>
                                <TableCell>
                                { log.notificationType }
                                </TableCell>
                                <TableCell>
                                {log.notification ?
                                <Button
                                    variant="contained"
                                    sx={{ m: 1 , mr : 5 }}
                                    onClick={() => { }}
                                    >
                                    See Details
                                </Button>
                                : 'N.A.'
                                }
                                </TableCell>
                                <TableCell>
                                    { toDisplayEventsDateString(log.notificationTime) }
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

export default NotificationLogTable;