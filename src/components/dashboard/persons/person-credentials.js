import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import { Card, CardContent, CardHeader, Collapse, Divider, Switch, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material"
import { useState } from "react";
import ExpandMore from "../shared/expand-more";
import WarningChip from "../shared/warning-chip";
import { Scrollbar } from "../../scrollbar";
import HiddenField from "../shared/hidden-field";
import { disableCredentialWithIdApi, enableCredentialWithIdApi } from "../../../api/credentials";
import toast from "react-hot-toast";

const toDateString = (date) => {
    const string = date.toString();
    const index = string.indexOf('T');
    if (index == -1) return string;
    return string.slice(0, index);
}

const PersonCredentials = ({ credentials }) => {

    // expand logic
    const [expanded, setExpanded] = useState(true);
    const handleExpandClick = () => setExpanded(!expanded);

    const handleToggleFactory = (credId) => async (e) => {
        const bool = e.target.checked;
        const verb = bool ? 'enabled' : 'deactivated';
        try {
            const res = await (bool ? enableCredentialWithIdApi(credId) : disableCredentialWithIdApi(credId));
            if (res.status != 200) throw new Error("Failed to send req");
            toast.success(`Successfully ${verb} credential`);
        } catch(e) {
            console.error(e);
            const errorVerb = bool ? 'enable' : 'deactivate';
            toast.error(`Failed to ${errorVerb} credential`)
        }
    }

    return (
        <Card>
            <CardHeader
                title="Credentials"
                avatar={
                    <ExpandMore
                        expand={expanded}
                        onClick={handleExpandClick}
                    >
                        <ExpandMoreIcon />
                    </ExpandMore>
                }
            />
            <Collapse in={expanded}>
                <Divider />
                {
                    credentials.length > 0 ? (
                        <Scrollbar>
                            <Table>
                                <TableHead sx={{ backgroundColor: 'neutral.200' }}>
                                    <TableRow>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Values</TableCell>
                                        <TableCell>Expiry</TableCell>
                                        <TableCell>Enabled</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    { credentials.map(cred => (
                                        <TableRow hover key={cred.credId}>
                                            <TableCell>{cred.credType?.credTypeName}</TableCell>
                                            <TableCell>
                                                <HiddenField text={cred.credUid} />
                                            </TableCell>
                                            <TableCell>{cred.isPerm ? 'PERMANENT' : toDateString(cred.credTTL)}</TableCell>
                                            <TableCell>
                                                <Switch onChange={handleToggleFactory(cred.credId)} defaultChecked={cred.isValid} />    
                                            </TableCell>
                                        </TableRow>
                                    )) }
                                </TableBody>
                            </Table>
                        </Scrollbar>
                    ) : (
                        <CardContent>
                            <WarningChip text="No credentials" />
                        </CardContent>
                    )
                }
            </Collapse>
        </Card>
    )
}

export default PersonCredentials;