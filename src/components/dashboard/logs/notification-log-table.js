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
import { EmailView } from "./email-view";
import { SMSView } from "./sms-view";
import { useState, useEffect } from "react";

const NotificationLogTable = ({
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    eventsCount,
    logs }) => {
    const [smsOpen, setSMSOpen] = useState(false);
    const [emailOpen, setEmailOpen] = useState(false);
    const [smsRecipients, setSMSRecipients] = useState([]);
    const [smsContent, setSMSContent] = useState("");
    const [emailContent, setEmailContent] = useState("");
    const [emailRecipients, setEmailRecipients] = useState([]);
    const [emailTitle, setEmailTitle] = useState("");
    return (<div>
        <EmailView
            open={emailOpen}
            handleDialogClose={() =>{setEmailOpen(false)}}
            emailRecipients={emailRecipients}
            emailTitle={emailTitle}
            emailContent={emailContent}
        />
        <SMSView
            open={smsOpen}
            handleDialogClose={() =>{setSMSOpen(false)}}
            smsRecipients={smsRecipients}
            smsContent={smsContent}
        />
        <Scrollbar>
            <Table sx={{ minWidth: 700 }}>
                <TableHead sx={{ backgroundColor: "neutral.200" }}>
                    <TableRow>
                        <TableCell style={{ width: "25%" }}>Event</TableCell>
                        <TableCell style={{ width: "25%" }}>Notification Type</TableCell>
                        <TableCell style={{ width: "35%" }}>Recipients</TableCell>
                        <TableCell style={{ width: "20%" }}>Timestamp</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        Array.isArray(logs) && logs.map((log, i) => (
                            <TableRow
                                hover
                                key={`logtablerow${i}`}
                            >

                                {/* // insert icon for different types of eventtype  */}
                                <TableCell>
                                    {log.eventsManagementName}
                                </TableCell>
                                <TableCell>
                                    <Chip label={log.notificationType} />
                                </TableCell>
                                <TableCell>
                                    {log.recipients ?
                                        <div>
                                            {log.recipients.split(",").map((recipient, i) => (
                                                <Chip
                                                    sx={{ marginRight: 1 }}
                                                    key={`recipient${i}`}
                                                    label={
                                                        recipient
                                                    } />
                                            ))}
                                            <Button
                                                size="small"
                                                variant="text"
                                                sx={{ m: 1, mr: 5 }}
                                                onClick={() => {
                                                    if (log.notificationType == "EMAIL") {
                                                        setEmailRecipients(log.recipients.split(","));
                                                        setEmailTitle(log.title);
                                                        setEmailContent(log.content);
                                                        setEmailOpen(true);
                                                    } else if (log.notificationType == "SMS") {
                                                        setSMSRecipients(log.recipients.split(","));
                                                        setSMSContent(log.content);
                                                        setSMSOpen(true);
                                                    }
                                                }}
                                            >
                                                See Details
                                            </Button>
                                        </div>
                                        : 'N.A.'
                                    }
                                </TableCell>
                                <TableCell>
                                    {toDisplayEventsDateString(log.notificationTime)}
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
}


export default NotificationLogTable;