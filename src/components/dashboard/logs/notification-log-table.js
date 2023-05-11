import { Table, TableBody, TableCell, TableHead, TablePagination, TableRow, Button, Tooltip, Chip, Link, Typography } from "@mui/material";
import NextLink from 'next/link';
import { Scrollbar } from "../../scrollbar";
import { toDisplayDate } from "../../../utils/utils";
import { EmailView } from "./email-view";
import { SMSView } from "./sms-view";
import { useState, useEffect } from "react";
import {getEventsManagementDetailsLink} from "../../../utils/eventsManagement";
import { ErrorPopUp } from "../errors/error-popup";

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
    const [errMsg, setErrMsg] = useState("");
    const [errOpen, setErrOpen] = useState(false);

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
        <ErrorPopUp
            open={errOpen}
            handleDialogClose={() => { setErrOpen(false) }}
            errorMessage={errMsg}
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
                                    {log.eventsManagementNotification ?
                                        <NextLink
                                            href={getEventsManagementDetailsLink(log.eventsManagementNotification.eventsManagement.eventsManagementId)}
                                            passHref
                                        >
                                            <Link color="inherit"
                                                variant="subtitle2">
                                                <Typography noWrap>
                                                    {log.eventsManagementNotification.eventsManagement.eventsManagementName}
                                                </Typography>
                                            </Link>
                                        </NextLink>
                                        : "No Event Management Linked"
                                    }
                                </TableCell>
                                {log.eventsManagementNotification ?
                                    <TableCell>
                                        {log.notificationLogsStatusCode != 200 ?
                                            <div>
                                                <Tooltip title="Error: notification not sent">
                                                    <Chip color="error"
                                                        label={log.eventsManagementNotification.eventsManagementNotificationType} />
                                                </Tooltip>
                                                <Button
                                                        size="small"
                                                        variant="text"
                                                        sx={{ m: 1, mr: 5 }}
                                                        onClick={() => {
                                                            setErrMsg(log.notificationLogsError);
                                                            setErrOpen(true);
                                                        }}
                                                >
                                                See Error
                                                </Button>
                                            </div>
                                            : <Chip label={log.eventsManagementNotification.eventsManagementNotificationType} />
                                        }
                                    </TableCell> :
                                    <TableCell>No Event Management Notification Linked</TableCell>
                                }
                                <TableCell>
                                    {log.eventsManagementNotification ?
                                        <div>
                                            {log.eventsManagementNotification.eventsManagementNotificationRecipients.split(",").map((recipient, i) => (
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
                                                    if (log.eventsManagementNotification.eventsManagementNotificationType == "EMAIL") {
                                                        setEmailRecipients(log.eventsManagementNotification.eventsManagementNotificationRecipients.split(","));
                                                        setEmailTitle(log.eventsManagementNotification.eventsManagementNotificationTitle);
                                                        setEmailContent(log.eventsManagementNotification.eventsManagementNotificationContent);
                                                        setEmailOpen(true);
                                                    } else if (log.eventsManagementNotification.eventsManagementNotificationType == "SMS") {
                                                        setSMSRecipients(log.eventsManagementNotification.eventsManagementNotificationRecipients.split(","));
                                                        setSMSContent(log.eventsManagementNotification.eventsManagementNotificationContent);
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
                                    {toDisplayDate(new Date(Date.parse(log.timeSent)))}
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