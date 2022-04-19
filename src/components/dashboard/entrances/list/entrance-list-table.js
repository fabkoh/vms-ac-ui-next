import { Checkbox, Chip, IconButton, Link, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, Typography } from "@mui/material";
import { Scrollbar } from "../../../scrollbar";
import WarningChip from "../../shared/warning-chip";
import NextLink from "next/link";
import { PencilAlt } from "../../../../icons/pencil-alt";
import { ArrowRight } from "../../../../icons/arrow-right";
import { ListFilter } from "../../shared/list-filter";
import { getEntranceDetailsLink, getEntranceIdsEditLink } from "../../../../utils/entrance";

// for status options
const statusOptions = ['Unlocked', 'Active'];

export default function EntranceListTable({ selectedAllEntrances, selectedSomeEntrances, handleSelectAllEntrances, entrances, selectedEntrances, handleSelectFactory, entranceCount, onPageChange, onRowsPerPageChange, page, rowsPerPage, handleStatusSelect, openStatusUpdateDialog, ...other }) {   
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
                            <TableCell>
                                <ListFilter
                                    array={statusOptions}
                                    onSelect={handleStatusSelect}
                                    defaultLabel="Status"
                                />
                            </TableCell>
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
                                const detailsLink = getEntranceDetailsLink(entrance);
                                const editLink = getEntranceIdsEditLink([entranceId]);
                                const handleOpenStatusUpdateDialog = () => openStatusUpdateDialog([entranceId], !isActive);
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
                                            <Chip
                                                label={isActive ? "ACTIVE" : "UNLOCKED"}
                                                onClick={handleOpenStatusUpdateDialog}
                                                color={isActive? "success" : "error"}
                                                sx={{
                                                    fontSize: "12px",
                                                    fontWeight: 600
                                                }}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <NextLink
                                                href={ editLink }
                                                passHref
                                            >
                                                <IconButton component="a">
                                                    <PencilAlt fontSize="small" />    
                                                </IconButton>    
                                            </NextLink>
                                            <NextLink 
                                                href={ detailsLink }
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
                count={entranceCount}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
                page={page}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[5, 10, 15]}
            />
        </div>
    )
}