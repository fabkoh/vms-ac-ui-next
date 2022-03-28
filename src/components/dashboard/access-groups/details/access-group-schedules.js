import { useState } from "react";
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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandMore from "../../shared/expand-more";
import { Box } from "@mui/system";
import { ChevronDown } from "../../../../icons/chevron-down";
import StyledMenu from "../../styled-menu";
import { Delete, Edit } from "@mui/icons-material";
import { Scrollbar } from "../../../scrollbar";
import { rrulestr } from "rrule";
import AccessGroupScheduleDelete from "./access-group-schedule-delete";
import NextLink from 'next/link';
import rruleDescription from "../../../../utils/rrule-desc";


export default function AccessGroupSchedules({
	link,
	accessGroupEntrance,
	accessGroupSchedules,
	deleteSchedules,
}) {
	// expanding card
	const [expanded, setExpanded] = useState(true);
	const handleExpandClick = () => setExpanded(!expanded);

	// schedules
	const [groupToEntranceId, setGroupToEntranceId] = useState("");
	const handleEntranceSelect = (e) => {
		setGroupToEntranceId(e.target.value);
	};

	const schedules = accessGroupSchedules.filter(
		(schedule) => schedule.groupToEntranceId == groupToEntranceId
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
			setGroupToEntranceId("");
		}
		deleteSchedules(ids);
	};

	return (
		<Card>
			<AccessGroupScheduleDelete
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
				<NextLink
					href={
                        link
					}
					passHref
				>
					<MenuItem disableRipple disabled={actionDisabled}>
						<Edit />
						&#8288;Modify
					</MenuItem>
				</NextLink>
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
							{Array.isArray(accessGroupEntrance) &&
								accessGroupEntrance.map((groupEntrance, i) => (
									<MenuItem key={i} value={groupEntrance.groupToEntranceId}>
										{groupEntrance.entrance.entranceName}
									</MenuItem>
								))}
						</Select>
					</FormControl>
				</Box>
				<Divider />
				{Array.isArray(schedules) && schedules.length > 0 && (
					<Scrollbar>
						<Table>
							<TableHead sx={{ backgroundColor: "neutral.200" }}>
								<TableRow>
									<TableCell>Name</TableCell>
									<TableCell>Description</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{schedules.map((schedule, i) => (
									<TableRow hover key={i}>
										<TableCell>{schedule.accessGroupScheduleName}</TableCell>
										<TableCell>{ rruleDescription(rrulestr(schedule.rrule), schedule.timeStart, schedule.timeEnd) }</TableCell>
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
