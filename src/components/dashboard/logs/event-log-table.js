import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { Scrollbar } from "../../scrollbar";
import { toDisplayDateString } from "../../../utils/utils";

const EventLogTable = ({logs}) => (
    <div>
        <Scrollbar>
            <Table sx={{minWidth: 700}}>
                <TableHead sx={{backgroundColor:"neutral.200"}}>
                    <TableRow>
                        <TableCell>Event Type</TableCell>
                        <TableCell>Entrance</TableCell>
                        <TableCell>Person</TableCell>
                        <TableCell>Access Group</TableCell>
                        <TableCell>Timestamp</TableCell>
                        <TableCell>Auth Method</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        Array.isArray(logs) && logs.map((log,i) => (
                            <TableRow
                                hover
                                key={`logtablerow${i}`}
                            >
                                <TableCell>{ log.eventType }</TableCell>
                                <TableCell>
                                    {
                                        log.entrance ?
                                        log.entrance :
                                        'N.A.'
                                    }
                                </TableCell>
                                <TableCell>
                                    {
                                        log.person ?
                                        log.person : 
                                        'N.A.'
                                    }
                                </TableCell>
                                <TableCell>
                                    {
                                        log.accessGroup ?
                                        log.accessGroup :
                                        'N.A.'
                                    }
                                </TableCell>
                                <TableCell>
                                    { toDisplayDateString(log.timestamp) }
                                </TableCell>
                                <TableCell>
                                    { 
                                        log.authMethod ?
                                        log.authMethod :
                                        'N.A.'
                                    }
                                </TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
        </Scrollbar>
    </div>
)

export default EventLogTable;