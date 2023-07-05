import {
  Checkbox,
  Chip,
  IconButton,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import { Scrollbar } from "../../scrollbar";
import WarningChip from "../shared/warning-chip";
import NextLink from "next/link";
import { PencilAlt } from "../../../icons/pencil-alt";
import { ArrowRight } from "../../../icons/arrow-right";
import { ListFilter } from "../shared/list-filter";
import {
  getVideoRecorderDetailsLink,
  getVideoRecordersEditLink,
  getVideoRecorderEditLink,
} from "../../../utils/video-recorder";
import { toDisplayDateString } from "../../../utils/utils";
import CropPortraitIcon from "@mui/icons-material/CropPortrait";
import SignalCellularAlt1BarSharpIcon from "@mui/icons-material/SignalCellularAlt1BarSharp";
import { resolveTypeReferenceDirective } from "typescript";
import { SeverityPill } from "../../severity-pill";
import { useEffect, useState } from "react";

// for status options
const statusOptions = ["Non-Active", "Active"];

export default function VideoListTable({
  selectedAllVideoRecorders,
  selectedSomeVideoRecorders,
  handleSelectAllVideoRecorders,
  videoRecorders,
  selectedVideoRecorders,
  handleSelectFactory,
  videoRecorderCount,
  onPageChange,
  onRowsPerPageChange,
  page,
  rowsPerPage,
  handleStatusSelect,
  getRecordersLocal,
  ...other
}) {
  return (
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
              <TableCell>No. of Ch</TableCell>
              <TableCell>Cam Status</TableCell>
              <TableCell>Serial No.</TableCell>
              <TableCell>Public IP Address</TableCell>
              <TableCell>Private IP Address</TableCell>
              <TableCell>Port Number</TableCell>
              <TableCell>IWS Port</TableCell>
              <TableCell>uPnP enabled</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="left">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {videoRecorders.map((recorder) => {
              const {
                recorderId,
                recorderName,
                recorderPublicIp,
                recorderPrivateIp,
                recorderPortNumber,
                recorderIWSPort,
                recorderSerialNumber,
                autoPortForwarding,
                cameras,
                created,
              } = recorder;
              const isVideoRecorderSelected =
                selectedVideoRecorders.includes(recorderId);
              const handleSelect = handleSelectFactory(recorderId);
              const detailsLink = getVideoRecorderDetailsLink(recorder);
              const editLink = getVideoRecorderEditLink(recorderId);
              console.log(recorder, "recorder");
              return (
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
                    {/* <NextLink
                                                href={detailsLink}    
                                                passHref
                                            > */}
                    <Link
                      color="inherit"
                      onClick={() => {
                        window.location.href = `/dashboard/video-recorders/details/${recorderId}`;
                      }}
                    >
                      <Typography noWrap>{recorderName}</Typography>
                    </Link>
                    {/* </NextLink> */}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={(recorder && "cameras" in recorder)  ? "ACTIVE" : "NON-ACTIVE"}
                      color={(recorder && "cameras" in recorder)  ? "success" : "error"}
                      sx={{
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {Array.isArray(cameras) && cameras.length > 0 ? (
                      <Typography noWrap>{cameras.length}</Typography>
                    ) : (
                      <WarningChip text="No channels" />
                    )}
                  </TableCell>
                  {/* {console.log(recorder.cameras[1]["online"])} */}
                  <TableCell>
                    {Array.isArray(cameras) && cameras.length > 0 ? (
                      // <Typography noWrap>{cameras.length}</Typography>
                      cameras.map((camera) =>
                        // <SignalCellularAlt1BarSharpIcon
                        //     color="primary"
                        //     style={{ fontSize: 160}}
                        //     />
                        camera["online"] ? (
                          <SeverityPill
                            color="success"
                            style={{ color: "transparent", margin: "4px" }}
                          >
                            _.
                          </SeverityPill>
                        ) : (
                          <SeverityPill
                            color="error"
                            style={{ color: "transparent", margin: "4px" }}
                          >
                            _.
                          </SeverityPill>
                        )
                      )
                    ) : (
                      <WarningChip text="No cameras found" />
                    )}
                  </TableCell>
                  <TableCell>
                    {<Typography noWrap>{recorderSerialNumber}</Typography>}
                  </TableCell>
                  <TableCell>
                    {<Typography noWrap>{recorderPublicIp}</Typography>}
                  </TableCell>
                  <TableCell>
                    {<Typography noWrap>{recorderPrivateIp}</Typography>}
                  </TableCell>
                  <TableCell>
                    {<Typography noWrap>{recorderPortNumber}</Typography>}
                  </TableCell>
                  <TableCell>
                    {<Typography noWrap>{recorderIWSPort}</Typography>}
                  </TableCell>
                  {/* <TableCell>
                                            {
                                                 (Array.isArray(recorderAlarms) && recorderAlarms.length > 0) ? (
                                                    <Typography noWrap>{recorderAlarms.length}</Typography>
                                                ) : (
                                                    <WarningChip text="No alarms found" />
                                                )
                                            }
                                        </TableCell> */}
                  <TableCell>
                    {autoPortForwarding ? (
                      <SeverityPill
                        color="success"
                        style={{ color: "transparent" }}
                      >
                        _.
                      </SeverityPill>
                    ) : (
                      <SeverityPill
                        color="error"
                        style={{ color: "transparent" }}
                      >
                        _.
                      </SeverityPill>
                    )}
                  </TableCell>
                  <TableCell>
                    <NextLink href={detailsLink} passHref>
                      <Link color="inherit">
                        <Typography noWrap>
                          {toDisplayDateString(created)}
                        </Typography>
                      </Link>
                    </NextLink>
                  </TableCell>
                  <TableCell>
                    <NextLink href={editLink} passHref>
                      <IconButton component="a">
                        <PencilAlt fontSize="small" />
                      </IconButton>
                    </NextLink>
                    <NextLink href={detailsLink} passHref>
                      <IconButton
                        component="a"
                        onClick={() => {
                          window.location.href = `/dashboard/video-recorders/details/${recorderId}`;
                        }}
                      >
                        <ArrowRight fontSize="small" />
                      </IconButton>
                    </NextLink>
                  </TableCell>
                </TableRow>
              );
            })}
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
  );
}
