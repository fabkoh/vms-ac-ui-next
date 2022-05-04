import { Box, Checkbox, CircularProgress, IconButton, Link, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, Typography } from "@mui/material";
import { Scrollbar } from "../../../scrollbar";
import NextLink from "next/link";
import WarningChip from "../../shared/warning-chip";
import { PencilAlt } from "../../../../icons/pencil-alt";
import { ArrowRight } from "../../../../icons/arrow-right";
import { getEntranceDetailsLink } from "../../../../utils/entrance"
import { getControllerDetailsLink, getControllerEditLink } from "../../../../utils/controller";
import { CloudOff, CloudQueue } from "@mui/icons-material";
import { isObject } from "../../../../utils/utils";

const EntranceComponent = ({ entrance, ...props }) => {
    if (isObject(entrance) && entranceName in entrance) {
        return (
            <Box { ...props }>
                <NextLink
                    href={getEntranceDetailsLink(entrance)}
                    passHref
                >
                    <Link color="inherit">
                        <Typography noWrap>{ entrance.entranceName }</Typography>
                    </Link>
                </NextLink>
            </Box>
        )
    }
    
    return <WarningChip text="No entrance" { ...props }/>;
}

const ControllerListTable = ({ controllers, selectedAllControllers, selectedSomeControllers, handleSelectAllControllers, handleSelectFactory, selectedControllers, page, rowsPerPage, onPageChange, onRowsPerPageChange, controllerCount, controllersStatus }) => {
    
    const statusLoaded = controllersStatus !== null;

    return (
        <div>
            <Scrollbar>
                <Table sx={{ minWidth: 800 }}>
                    <TableHead sx={{ backgroundColor: "neutral.200" }}>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    checked={selectedAllControllers}
                                    indeterminate={selectedSomeControllers}
                                    onChange={handleSelectAllControllers}
                                />
                            </TableCell>
                            <TableCell>Controller Name</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Ip Address</TableCell>
                            <TableCell>Entrances</TableCell>
                            <TableCell>Readers status</TableCell>
                            <TableCell>Created</TableCell>
                            <TableCell align="left">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            controllers.map((controller, i) => {
                                const {
                                    controllerId,
                                    controllerName,
                                    controllerIP,
                                    authDevices
                                } = controller;

                                const entrance1 = Array.isArray(authDevices) && authDevices.length >= 1 && authDevices[0].entrance;
                                const entrance2 = Array.isArray(authDevices) && authDevices.length >= 3 && authDevices[2].entrance;

                                const controllerSelected = selectedControllers.includes(controllerId);
                                const handleSelect = handleSelectFactory(controllerId);

                                const detailsLink = getControllerDetailsLink(controller);

                                const offline = statusLoaded && Object.keys(controllersStatus[i]).length == 0;
                                return(
                                    <TableRow
                                        hover
                                        key={controllerId}
                                        selected={controllerSelected}
                                    >
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={controllerSelected}
                                                onChange={handleSelect}
                                                value={controllerSelected}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <NextLink
                                                href={ detailsLink }
                                                passHref
                                            >
                                                <Link color="inherit">
                                                    <Typography noWrap>{ controllerName }</Typography>
                                                </Link>
                                            </NextLink>
                                        </TableCell>
                                        <TableCell>
                                            {
                                                statusLoaded ? 
                                                (offline ? 
                                                <CloudOff color="error" /> :
                                                <CloudQueue color="success" />) :
                                                <CircularProgress size='1rem' />
                                            }
                                        </TableCell>
                                        <TableCell>
                                            <Typography>{ controllerIP }</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between'
                                                }}
                                            >
                                                <EntranceComponent entrance={entrance1} sx={{ mr: 1 }} />
                                                <EntranceComponent entrance={entrance2} />
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            {
                                                statusLoaded ? 
                                                <div /> :
                                                <CircularProgress size='1rem' />
                                            }
                                        </TableCell>
                                        <TableCell>
                                                date
                                        </TableCell>
                                        <TableCell>
                                            <NextLink
                                                href={ getControllerEditLink(controller) }
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
                count={controllerCount}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
                page={page}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[5, 10, 15]}
            />
        </div>
    );
};

export default ControllerListTable;