import { useState } from "react";
import {
	Button,
	Card,
	CardHeader,
	Collapse,
	Divider,
	Grid,
	MenuItem,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	Switch
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandMore from "../../shared/expand-more";
import { Box } from "@mui/system";
import { ChevronDown } from "../../../../icons/chevron-down";
import StyledMenu from "../../styled-menu";
import { Delete, Edit } from "@mui/icons-material";
import { Scrollbar } from "../../../scrollbar";
import { rrulestr } from "rrule";
import EntranceScheduleDelete from "./entrance-schedule-delete";
import NextLink from 'next/link';
import rruleDescription from "../../../../utils/rrule-desc";
import WarningChip from "../../shared/warning-chip";
import {entranceScheduleApi} from "../../../../api/entrance-schedule";
import toast from 'react-hot-toast';


export default function EntranceSchedules({
	link,
	entrance,
	entranceSchedules,
	deleteSchedules,
}) {

	const handleToggleFactory = (entranceSchedId) => async (e) => {
        const bool = e.target.checked;
        const verb = bool ? 'activated' : 'deactivated';
        try {
            const res = await (bool ? entranceScheduleApi.activateEntranceSchedule(entranceSchedId) : entranceScheduleApi.deactivateEntranceSchedule(entranceSchedId));
            if (res.status != 200) throw new Error("Failed to send req");
            toast.success(`Successfully ${verb} entrance schedule`);
            return true
        } catch(e) {
            console.error(e);
            const errorVerb = bool ? 'activate' : 'deactivate';
            toast.error(`Failed to ${errorVerb} entrance schedule`);
            return false
        }
	}
	
	// expanding card
	const [expanded, setExpanded] = useState(true);
	const handleExpandClick = () => setExpanded(!expanded);

	// schedules
	const [entranceId, setEntranceId] = useState("");

	const schedules = entranceSchedules.filter(
		(schedule) => schedule.entranceId == entrance.entranceId
	);

	// schedule actions
	const [actionAnchor, setActionAnchor] = useState(null);
	const actionOpen = Boolean(actionAnchor);
	const handleActionMenuOpen = (e) => setActionAnchor(e.currentTarget);
	const handleActionMenuClose = () => setActionAnchor(null);
	const actionDisabled = schedules.length == 0;

	// delete schedules
	const [openDelete, setOpenDelete] = useState(false);
	const openDeleteDialog = () => setOpenDelete(true);
	const closeDeleteDialog = () => {
		setOpenDelete(false);
		handleActionMenuClose();
	};

	const handleDeleteSchedules = (ids, allSelected) => {
		if (allSelected) {
			setEntranceId("");
		}
		deleteSchedules(ids);
	};

	return (
		<Card>
			<EntranceScheduleDelete
				open={openDelete}
				schedules={schedules}
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
						title="Entrance Unlock Schedules"
						subheader="The schedules below show when the entrance is normally unlocked"
						avatar={
							<ExpandMore expand={expanded}
								onClick={handleExpandClick}>
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
				<NextLink
					href={
                        link
					}
					passHref
				>
					<MenuItem disableRipple 
					// disabled={actionDisabled}
					>
						<Edit />
						&#8288;Modify
					</MenuItem>
				</NextLink>
				<MenuItem
					disableRipple
					// disabled={actionDisabled}
					onClick={openDeleteDialog}
				>
					<Delete />
					&#8288;Delete
				</MenuItem>
			</StyledMenu>
			<Collapse in={expanded}>
				{/*<Divider /> */}
				<Divider />
				{(Array.isArray(schedules) && schedules.length > 0) ?
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
								{schedules.map((schedule, i) => (
									<TableRow hover
										key={i}>
										<TableCell>{schedule.entranceScheduleName}</TableCell>
										<TableCell>{rruleDescription(rrulestr(schedule.rrule), schedule.timeStart, schedule.timeEnd)}</TableCell>
										<TableCell>
											{console.log(schedule)}
											<Switch onChange={handleToggleFactory(schedule.entranceScheduleId)}
												defaultChecked={schedule.active}
												size="small" ></Switch>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</Scrollbar> 
					: (
						<Grid
							container
							flexDirection="row"
							paddingLeft={3}
							paddingTop={3}
						>
							<Grid
								item
								paddingRight={3}
								paddingBottom={3}
							>
								<WarningChip text="No schedules" />
							</Grid>
						</Grid>
					)
				}
			</Collapse>
		</Card>
	);
}
