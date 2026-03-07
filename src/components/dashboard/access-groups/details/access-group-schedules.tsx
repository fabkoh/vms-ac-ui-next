import { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  Collapse,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Switch,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandMore from "../../shared/expand-more";
import { Box } from "@mui/system";
import { ChevronDown } from "../../../../icons/chevron-down";
import StyledMenu from "../../styled-menu";
import {
  ConstructionOutlined,
  Delete,
  Edit,
  VolunteerActivismOutlined,
} from "@mui/icons-material";
import { Scrollbar } from "../../../scrollbar";
import { rrulestr } from "rrule";
import AccessGroupScheduleDelete from "./access-group-schedule-delete";
import NextLink from "next/link";
import rruleDescription from "../../../../utils/rrule-desc";
import { accessGroupScheduleApi } from "../../../../api/access-group-schedules";
import toast from "react-hot-toast";

export default function AccessGroupSchedules({
  link,
  accessGroupToEntranceMap,
  accessGroupToEntranceScheduleMap,
  deleteSchedules,
}) {
  // expanding card
  const [expanded, setExpanded] = useState(true);
  const handleExpandClick = () => setExpanded(!expanded);

  // States for accessGroupToEntranceSchedules
  const [groupToEntranceId, setGroupToEntranceId] = useState("");
  const [accessGroupToEntranceSchedules, setAccessGroupToEntranceSchedules] =
    useState([]);
  // State to coordinate switch status
  const [scheduleActiveStates, setScheduleActiveStates] = useState({});

  const handleEntranceSelect = (selected) => {
    setGroupToEntranceId(selected.target.value);

    // Get the schedules for the selected access group to entrance when groupToEntranceId changes
    const schedules = accessGroupToEntranceScheduleMap.filter(
      (schedule) => schedule.groupToEntranceId == selected.target.value
    );
    setAccessGroupToEntranceSchedules(schedules);
  };

  useEffect(() => {
    const activeStates = {};
    // Initialise and store active states for the schedules based on backend everytime component is rendered
    accessGroupToEntranceScheduleMap.forEach((schedule) => {
      activeStates[schedule.accessGroupScheduleId] = schedule.isActive;
    });
    setScheduleActiveStates(activeStates);

	// This will also run when deleteSchedules is called as accessGroupToEntranceScheduleMap changes
	setAccessGroupToEntranceSchedules(accessGroupToEntranceScheduleMap);
  }, [accessGroupToEntranceScheduleMap]);

  // schedule actions
  const [actionAnchor, setActionAnchor] = useState(null);
  const actionOpen = Boolean(actionAnchor);
  const handleActionMenuOpen = (e) => setActionAnchor(e.currentTarget);
  const handleActionMenuClose = () => setActionAnchor(null);
  const actionDisabled = accessGroupToEntranceSchedules.length == 0;

  // delete schedules
  const [openDelete, setOpenDelete] = useState(false);
  const openDeleteDialog = () => setOpenDelete(true);
  const closeDeleteDialog = () => {
    setOpenDelete(false);
    handleActionMenuClose();
  };

  const handleDeleteSchedules = (ids, allSelected) => {
    if (allSelected) {
      setGroupToEntranceId("");
    }
    deleteSchedules(ids);
  };

  const handleToggleFactory = (accessGroupScheduleId) => async (e) => {
    const switchStatus = e.target.checked;
    const activationStatus = switchStatus ? "activated" : "deactivated";
    try {
      const res = await (switchStatus
        ? accessGroupScheduleApi.activateAccessGroupSchedule(
            accessGroupScheduleId
          )
        : accessGroupScheduleApi.deactivateAccessGroupSchedule(
            accessGroupScheduleId
          ));
      if (res.status != 200) throw new Error("Failed to send req");
      setScheduleActiveStates((prev) => ({
        ...prev,
        [accessGroupScheduleId]: switchStatus,
      }));
      toast.success(`Successfully ${activationStatus} access group schedule`);
      return true;
    } catch (e) {
      console.error(e);
      toast.error(`Failed to ${activationStatus} access group schedule`);
      return false;
    }
  };

  return (
    <Card>
      <AccessGroupScheduleDelete
        open={openDelete}
        schedules={accessGroupToEntranceSchedules}
        handleDialogClose={closeDeleteDialog}
        deleteSchedules={handleDeleteSchedules}
      />
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
      >
        <Box>
          <CardHeader
            title="Access Group Schedules"
            subheader="Select entrance below to see schedules for selected entrance"
            avatar={
              <ExpandMore expand={expanded} onClick={handleExpandClick}>
                <ExpandMoreIcon />
              </ExpandMore>
            }
          />
        </Box>
        <Box>
          <Button
            endIcon={<ChevronDown fontSize="small" />}
            sx={{ m: 2 }}
            variant="contained"
            onClick={handleActionMenuOpen}
          >
            Schedule Actions
          </Button>
        </Box>
      </Box>
      <StyledMenu
        anchorEl={actionAnchor}
        open={actionOpen}
        onClose={handleActionMenuClose}
      >
        
          <MenuItem component={NextLink} href={link} disableRipple disabled={actionDisabled}>
            <Edit />
            &#8288;Modify
          </MenuItem>
        <MenuItem
          disableRipple
          disabled={actionDisabled}
          onClick={openDeleteDialog}
        >
          <Delete />
          &#8288;Delete
        </MenuItem>
      </StyledMenu>
      <Collapse in={expanded}>
        <Divider />
        <Box
          component="form"
          sx={{
            flexGrow: 1,
            m: 1.5,
          }}
        >
          <FormControl fullWidth>
            <InputLabel>Select Entrance</InputLabel>
            <Select
              label="Select Entrance"
              onChange={handleEntranceSelect}
              fullWidth
              value={groupToEntranceId}
            >
              <MenuItem value="" sx={{ fontStyle: "italic" }}>
                clear
              </MenuItem>
              {Array.isArray(accessGroupToEntranceMap) &&
                accessGroupToEntranceMap.map((groupEntrance, i) => (
                  <MenuItem key={i} value={groupEntrance.groupToEntranceId}>
                    {groupEntrance.entrance.entranceName}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Box>
        <Divider />
        {Array.isArray(accessGroupToEntranceSchedules) &&
          accessGroupToEntranceSchedules.length > 0 && (
            <Scrollbar>
              <Table>
                <TableHead sx={{ backgroundColor: "neutral.200" }}>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Active</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {accessGroupToEntranceSchedules.map((schedule, i) => (
                    <TableRow hover key={i}>
                      <TableCell>{schedule.accessGroupScheduleName}</TableCell>
                      <TableCell>
                        {rruleDescription(
                          rrulestr(schedule.rrule),
                          schedule.timeStart,
                          schedule.timeEnd
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={
                            scheduleActiveStates[schedule.accessGroupScheduleId]
                          }
                          onChange={handleToggleFactory(
                            schedule.accessGroupScheduleId
                          )}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Scrollbar>
          )}
      </Collapse>
    </Card>
  );
}
