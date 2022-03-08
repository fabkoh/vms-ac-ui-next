import { Box, Checkbox, IconButton, Link, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, Typography } from "@mui/material";
import { propsToClassKey } from "@mui/styles";
import { Scrollbar } from "../../../scrollbar";
import { SeverityPill } from "../../../severity-pill";
import WarningChip from "../../shared/warning-chip";
import NextLink from "next/link";
import { PencilAlt } from "../../../../icons/pencil-alt";
import { ArrowRight } from "../../../../icons/arrow-right";

export default function EntranceListTable({ selectedAllEntrances, selectedSomeEntrances, handleSelectAllEntrances, entrances, selectedEntrances, handleSelectFactory, ...other }) {
    return(
        <div {...other}>
            <Scrollbar>
                <Table sx={{ minWidth: 700 }}>
                    <TableHead sx={{ backgroundColor: "neutral.200" }}>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    checked={selectedAllEntrances}
                                    indeterminate={selectedSomeEntrances}
                                    onChange={handleSelectAllEntrances}
                                />  
                            </TableCell>
                            <TableCell>Name</TableCell>    
                            <TableCell>No. of Access Groups</TableCell>
                            <TableCell>No. of Schedules</TableCell>
                            <TableCell>Controller</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="left">Actions</TableCell>
                        </TableRow>    
                    </TableHead>   
                    <TableBody>
                        {
                            entrances.map(entrance => {
                                const {
                                    entranceId,
                                    entranceName,
                                    accessGroups,
                                    entranceSchedules,
                                    controller,
                                    isActive
                                } = entrance
                                const isEntranceSelected = selectedEntrances.includes(entranceId);
                                const handleSelect = handleSelectFactory(entranceId);
                                const detailsLink = "/dashboard/entrances/details/" + entranceId;
                                return(
                                    <TableRow
                                        hover
                                        key={entranceId}
                                        selected={isEntranceSelected}
                                    >
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={isEntranceSelected}
                                                onChange={handleSelect}
                                                value={isEntranceSelected}
                                            /> 
                                        </TableCell>    
                                        <TableCell>
                                            <NextLink
                                                href={detailsLink}    
                                                passHref
                                            >
                                                <Link color="inherit">
                                                    <Typography noWrap>{ entranceName }</Typography>
                                                </Link>    
                                            </NextLink>
                                        </TableCell>
                                        <TableCell>
                                            { 
                                                (Array.isArray(accessGroups) && accessGroups.length > 0) ? (
                                                    <Typography noWrap>{accessGroups.length}</Typography>
                                                ) : (
                                                    <WarningChip text="No access groups" />
                                                )
                                            }
                                        </TableCell>
                                        <TableCell>
                                            {
                                                (Array.isArray(entranceSchedules) && entranceSchedules.length > 0) ? (
                                                    <Typography noWrap>{entranceSchedules.length}</Typography>
                                                ) : (
                                                    <WarningChip text="No schedules" />
                                                )
                                            }
                                        </TableCell>
                                        <TableCell>
                                            {
                                                controller ? ( // TODO make this into link
                                                    <Typography noWrap>{ controller.controllerName }</Typography>
                                                ) : (
                                                    <WarningChip text="No controller" />
                                                )
                                            }
                                        </TableCell>
                                        <TableCell>
                                            {
                                                isActive ? (
                                                    <SeverityPill color="success">Active</SeverityPill>
                                                ) : (
                                                    <SeverityPill color="error">Unlocked</SeverityPill>
                                                )
                                            }
                                        </TableCell>
                                        <TableCell>
                                            <NextLink
                                                href={ "/dashboard/entrances/edit?" + encodeURIComponent(JSON.stringify([entranceId])) }
                                                passHref
                                            >
                                                <IconButton component="a">
                                                    <PencilAlt fontSize="small" />    
                                                </IconButton>    
                                            </NextLink>
                                            <NextLink 
                                                href={ "/dashboard/entrances/details/" + entranceId }
                                                passHref
                                            >
                                                <IconButton component="a">
                                                    <ArrowRight fontSize="small" />    
                                                </IconButton>    
                                            </NextLink>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        }
                    </TableBody>
                </Table>
            </Scrollbar>
            <TablePagination
                component="div"
            />
        </div>
    )
}