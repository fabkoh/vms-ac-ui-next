import { useState } from "react";
import {
	Button,
	Card,
	CardHeader,
	Checkbox,
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
import EntranceScheduleDelete from "./entrance-schedule-delete";
import NextLink from 'next/link';
import rruleDescription from "../../../../utils/rrule-desc";
import WarningChip from "../../shared/warning-chip";
import { eventActionInputDescription, eventActionOutputDescription} from "../../../../utils/eventsManagement";



export default function EntranceEventsManagement({
	eventsManagementCreatelink,
	entrance,
	entranceEventManagements,
	deleteSchedules,
}) {
	// expanding card
	const [expanded, setExpanded] = useState(true);
	const handleExpandClick = () => setExpanded(!expanded);

	// schedules
	const [entranceId, setEntranceId] = useState("");
    
	// schedule actions
	const [actionAnchor, setActionAnchor] = useState(null);
	const actionOpen = Boolean(actionAnchor);
	const handleActionMenuOpen = (e) => setActionAnchor(e.currentTarget);
	const handleActionMenuClose = () => setActionAnchor(null);
	const actionDisabled = entranceEventManagements.length == 0;

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
			{/* <EntranceScheduleDelete
				open={openDelete}
				schedules={entranceEventManagements}
				handleDialogClose={closeDeleteDialog}
				deleteSchedules={handleDeleteSchedules}
			/> */}
			<Box
				display="flex"
				justifyContent="space-between"
				alignItems="center"
				flexWrap="wrap"
			>
				<Box>
					<CardHeader
						title="Events Management"
						subheader="The inputs below will trigger the outputs"
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
						Management Actions
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
                        eventsManagementCreatelink
					}
					passHref
				>
					<MenuItem disableRipple 
					// disabled={actionDisabled}
					>
						<Edit />
						&#8288;Create
					</MenuItem>
				</NextLink>
				{/* <MenuItem
					disableRipple
					// disabled={actionDisabled}
					onClick={openDeleteDialog}
				>
					<Delete />
					&#8288;Delete
				</MenuItem> */}
			</StyledMenu>
			<Collapse in={expanded}>
				{/*<Divider /> */}
				<Divider />
				{(Array.isArray(entranceEventManagements) && entranceEventManagements.length > 0) ?
					<Scrollbar>
						<Table>
							<TableHead sx={{ backgroundColor: "neutral.200" }}>
								<TableRow>
                                    
									<TableCell>Name</TableCell>
									<TableCell>Description</TableCell>
                                    <TableCell>Input(s)</TableCell>
									<TableCell>Output(s)</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{entranceEventManagements.map((eventManagement, i) => {

                                return(
									
                          
                                    <TableRow hover key={i}>
                                        <TableCell sx={{minWidth: 150}}>{eventManagement.eventsManagementName}</TableCell>
                                        <TableCell sx={{minWidth: 250}}>{ rruleDescription(rrulestr(eventManagement.triggerSchedule.rrule), eventManagement.triggerSchedule.timeStart, eventManagement.triggerSchedule.timeEnd) }</TableCell>
                                        <TableCell sx={{minWidth: 300}} >{ eventActionInputDescription(eventManagement.inputEvents)}</TableCell>
                                        <TableCell sx={{minWidth: 300}}>{ eventActionOutputDescription(eventManagement.outputActions)}</TableCell>
									</TableRow>
                                    
								);})}
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
								<WarningChip text="No Event Management" />
							</Grid>
						</Grid>
					)
				}
			</Collapse>
		</Card>
	);
}
