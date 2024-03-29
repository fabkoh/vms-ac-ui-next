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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandMore from "../../shared/expand-more";
import { Box } from "@mui/system";
import { ChevronDown } from "../../../../icons/chevron-down";
import StyledMenu from "../../styled-menu";
import { Delete, Edit, MeetingRoom, SelectAll } from "@mui/icons-material";
import { Scrollbar } from "../../../scrollbar";
import { rrulestr } from "rrule";
import NextLink from 'next/link';
import rruleDescription from "../../../../utils/rrule-desc";
import WarningChip from "../../shared/warning-chip";
import RenderTableCell from "../../shared/renderTableCell";
import { eventActionInputDescription, displayEntranceOrController, eventActionOutputDescription, listDescription} from "../../../../utils/eventsManagement";
import ControllerEventsManagementDelete from "./controller-eventsManagement-delete";

import { Confirmdelete } from "../confirm-delete"
import { toast } from "react-hot-toast";
import { eventsManagementApi } from "../../../../api/events-management";


export default function ControllerEventsManagement({
	eventsManagementCreateLink,
	controllerEventManagements,
	deleteEventManagements,
}) {
	// expanding card
	const [expanded, setExpanded] = useState(true);
	const handleExpandClick = () => setExpanded(!expanded);

	// schedules
	const [eventManagementsId, seteventManagementsId] = useState("");
    
	// schedule actions
	const [actionAnchor, setActionAnchor] = useState(null);
	const actionOpen = Boolean(actionAnchor);
	const handleActionMenuOpen = (e) => setActionAnchor(e.currentTarget);
	const handleActionMenuClose = () => setActionAnchor(null);
	const actionDisabled = controllerEventManagements.length == 0;

	// delete schedules
	const [openDelete, setOpenDelete] = useState(false);
	const openDeleteDialog = () => setOpenDelete(true);
	const closeDeleteDialog = () => {
		setOpenDelete(false);
		handleActionMenuClose();
	};

	// events management
	const [eventsManagement, setEventsManagement] = useState(controllerEventManagements);

	const deleteEventsManagement = async(em) => {
		toast.loading("Deleting EventsManagement...");
		eventsManagementApi.deleteById(em.eventsManagementId)
		.then(async res => {
			toast.dismiss();

			if (res.status != 200) {
				toast.error('Delete unsuccessful', {duration:3000})
			}
			else {
				toast.success('Delete success');
				setEventsManagement(eventsManagement.filter(obj => obj != em));
			}
		})
		setOpenDelete(false);
	}
    
	const handleDeleteEventManagements = (ids, allSelected) => {
		if (allSelected) {
			seteventManagementsId("");
		}
		deleteEventManagements(ids);
	};

	return (
		<Card >
			<ControllerEventsManagementDelete
				open={openDelete}
				eventManagements={controllerEventManagements}
				handleDialogClose={closeDeleteDialog}
				deleteEventManagements={handleDeleteEventManagements}
			/>
			<Box
				display="flex"
				justifyContent="space-between"
				alignItems="center"
				flexWrap="wrap"
			>
				<Box>
					<CardHeader
						title="Events Management"
						subheader="The trigger(s) below will lead to the action(s)."
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
                        eventsManagementCreateLink
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
					disabled={actionDisabled}
					onClick={openDeleteDialog}
				>
					<Delete />
					&#8288;Delete
				</MenuItem>
			</StyledMenu>
			<Collapse in={expanded}>
				{/*<Divider /> */}
				<Divider />
				{(Array.isArray(controllerEventManagements) && controllerEventManagements.length > 0) ?
					<Scrollbar>
						<Table>
							<TableHead sx={{ backgroundColor: "neutral.200" }}>
								<TableRow>
									<TableCell>Edit/Delete</TableCell>
                                    <TableCell>
                                        <div>Controller(s)/</div> 
                                        <div>Entrance(s)</div>
                                    </TableCell>
									<TableCell>Name</TableCell>
									<TableCell>Description(s)</TableCell>
                                    <TableCell>Trigger(s)</TableCell>
									<TableCell>Action(s)</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{eventsManagement.map((eventManagement, i) => (
									<TableRow hover key={i}>
										<TableCell>
											<Button onClick={openDeleteDialog}>Delete</Button>
											<Confirmdelete
												setActionAnchor={setActionAnchor}
												open={openDelete}
												message={"Are you sure you want to remove the following event(s)? This action cannot be undone. Please ensure that you have disconnected the input/output pins."}
												handleDialogClose={closeDeleteDialog}
												deleteFunc={() => deleteEventsManagement(eventManagement)} />

											<Button>Edit</Button>
										</TableCell>
                                        <TableCell>{displayEntranceOrController(eventManagement)}</TableCell>
                                        <TableCell sx={{minWidth: 200}}>{eventManagement.eventsManagementName}</TableCell>
                                        <TableCell sx={{minWidth: 300}}> {listDescription(eventManagement)}</TableCell>
                                        <TableCell sx={{minWidth: 300}} >{ eventActionInputDescription(eventManagement.inputEvents)}</TableCell>
                                        <TableCell  sx={{minWidth: 300}}>{ eventActionOutputDescription(eventManagement.outputActions)}</TableCell>
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
								<WarningChip text="No Event Management" />
							</Grid>
						</Grid>
					)
				}
			</Collapse>
		</Card>
	);
}
