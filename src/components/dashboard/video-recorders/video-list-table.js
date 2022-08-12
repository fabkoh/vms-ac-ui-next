import { Checkbox, Chip, IconButton, Link, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, Typography } from "@mui/material";
import { Scrollbar } from "../../scrollbar";
import WarningChip from "../shared/warning-chip";
import NextLink from "next/link";
import { PencilAlt } from "../../../icons/pencil-alt";
import { ArrowRight } from "../../../icons/arrow-right";
import { ListFilter } from "../shared/list-filter";
<<<<<<< HEAD
import { getVideoRecorderDetailsLink, getVideoRecorderIdsEditLink } from "../../../utils/video-recorder";
=======
import { getVideoRecorderDetailsLink, getVideoRecorderEditLink } from "../../../utils/video-recorder";
>>>>>>> 4845b6f844cd459845023c6646fd82ec2b60981e
import { toDisplayDateString } from "../../../utils/utils";

// for status options
const statusOptions = ['Non-Active', 'Active'];

export default function VideoListTable({ selectedAllVideoRecorders, selectedSomeVideoRecorders, handleSelectAllVideoRecorders, videoRecorders, selectedVideoRecorders, handleSelectFactory, videoRecorderCount, onPageChange, onRowsPerPageChange, page, rowsPerPage, 
    handleStatusSelect, ...other }) {   
    return(
        <div {...other}>
            <Scrollbar>
                <Table sx={{ minWidth: 700 }}>
                    <TableHead sx={{ backgroundColor: "neutral.200" }}>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    checked={selectedAllVideoRecorders}
                                    indeterminate={selectedSomeVideoRecorders}
                                    onChange={handleSelectAllVideoRecorders}
                                />  
                            </TableCell>
                            <TableCell>Recorder Name</TableCell>
                            <TableCell>
                                <ListFilter
                                    array={statusOptions}
                                    onSelect={handleStatusSelect}
                                    defaultLabel="Status"
                                />
                            </TableCell>
                            <TableCell>Serial No.</TableCell>
                            <TableCell>IP Address</TableCell>
                            <TableCell>No. of Ch</TableCell>
                            <TableCell>Cam Status</TableCell>
                            <TableCell>Alarm Status</TableCell>
                            <TableCell>Created</TableCell>
                            <TableCell align="left">Actions</TableCell>
                        </TableRow>    
                    </TableHead>   
                    <TableBody>
                        {
                            videoRecorders.map(recorder => {
                                const {
                                    recorderId,
                                    recorderName,
                                    recorderIpAddress,
                                    recorderSerialNumber,
                                    recorderChannels,
                                    recorderCameras,
                                    recorderAlarms,
                                    isActive,
                                    created
                                } = recorder
                                const isVideoRecorderSelected = selectedVideoRecorders.includes(recorderId);
                                const handleSelect = handleSelectFactory(recorderId);
                                const detailsLink = getVideoRecorderDetailsLink(recorder);
<<<<<<< HEAD
                                const editLink = getVideoRecorderIdsEditLink([recorderId]);
=======
                                const editLink = getVideoRecorderEditLink(recorderId);
>>>>>>> 4845b6f844cd459845023c6646fd82ec2b60981e
                                return(
                                    <TableRow
                                        hover
                                        key={recorderId}
                                        selected={isVideoRecorderSelected}
                                    >
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={isVideoRecorderSelected}
                                                onChange={handleSelect}
                                                value={isVideoRecorderSelected}
                                            /> 
                                        </TableCell>    
                                        <TableCell>
                                            <NextLink
                                                href={detailsLink}    
                                                passHref
                                            >
                                                <Link color="inherit">
                                                    <Typography noWrap>{ recorderName }</Typography>
                                                </Link>    
                                            </NextLink>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
<<<<<<< HEAD
                                                label={isActive ? "ACTIVE" : "NON-ACTIVE"}
                                                color={isActive? "success" : "error"}
=======
                                                label={recorderName === "Real Video Recorder" ? "ACTIVE" : "NON-ACTIVE"}
                                                color={recorderName === "Real Video Recorder"? "success" : "error"}
>>>>>>> 4845b6f844cd459845023c6646fd82ec2b60981e
                                                sx={{
                                                    fontSize: "12px",
                                                    fontWeight: 600
                                                }}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            { 
                                                <Typography noWrap>{recorderSerialNumber}</Typography>
                                                
                                            }
                                        </TableCell>
                                        <TableCell>
                                            { 
                                                <Typography noWrap>{recorderIpAddress}</Typography>
                                                
                                            }
                                        </TableCell>
                                        <TableCell>
                                            {
                                                (Array.isArray(recorderChannels) && recorderChannels.length > 0) ? (
                                                    <Typography noWrap>{recorderChannels.length}</Typography>
                                                ) : (
                                                    <WarningChip text="No channels" />
                                                )
                                            }
                                        </TableCell>
                                        <TableCell>
                                            {
                                                (Array.isArray(recorderCameras) && recorderCameras.length > 0) ? (
                                                    <Typography noWrap>{recorderCameras.length}</Typography>
                                                ) : (
                                                    <WarningChip text="No cameras found" />
                                                )
                                            }
                                        </TableCell>
                                        <TableCell>
                                            {
                                                 (Array.isArray(recorderAlarms) && recorderAlarms.length > 0) ? (
                                                    <Typography noWrap>{recorderAlarms.length}</Typography>
                                                ) : (
                                                    <WarningChip text="No alarms found" />
                                                )
                                            }
                                        </TableCell>
                                        <TableCell>
                                            <NextLink
                                                href={detailsLink}    
                                                passHref
                                            >
                                                <Link color="inherit">
                                                    <Typography noWrap>{ toDisplayDateString(created) }</Typography>
                                                </Link>    
                                            </NextLink>
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
                count={videoRecorderCount}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
                page={page}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[5, 10, 15]}
            />
        </div>
    )
}