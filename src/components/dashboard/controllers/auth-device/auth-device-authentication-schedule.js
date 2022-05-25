import { useState } from "react";
import {
	Button,
	Card,
	CardHeader,
	Chip,
	Collapse,
	Divider,
	Grid,
	MenuItem,
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

import NextLink from 'next/link';
import rruleDescription from "../../../../utils/rrule-desc";
import WarningChip from "../../shared/warning-chip";
//import EntranceScheduleDelete from "../../entrances/details/entrance-schedule-delete";
import AuthenticationScheduleDelete from "../../authentication-schedule/authentication-schedule-delete";


export default function AuthenticationSchedules({
	link,
	deviceInfo,
	authenticationSchedules,
	deleteSchedules,
}) {
	// expanding card
	const [expanded, setExpanded] = useState(true);
	const handleExpandClick = () => setExpanded(!expanded);

	// schedules
	const [authdeviceId, setAuthDeviceId] = useState("");

	const schedules = authenticationSchedules

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
			setAuthDeviceId("");
		}
		deleteSchedules(ids);
	};

	return (
		<Card>
			<AuthenticationScheduleDelete
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
						title="Authentication Schedules"
						subheader="The list belows shows all authentication schedules currently linked to the authentication device"
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
									<TableCell>Authentication Method</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{schedules.map((schedule, i) => (
									<TableRow hover key={i}>
										<TableCell>{schedule.authenticationScheduleName}</TableCell>
										<TableCell>{ rruleDescription(rrulestr(schedule.rrule), schedule.timeStart, schedule.timeEnd) }</TableCell>
										<TableCell>
											<Chip label= { schedule.authMethod.authMethodDesc } />																
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
