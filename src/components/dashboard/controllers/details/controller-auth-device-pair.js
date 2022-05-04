import { useEffect, useState } from "react";
import {
	Button,
	Card,
	CardHeader,
	Checkbox,
	Collapse,
	Divider,
	Fab,
	Grid,
	IconButton,
	MenuItem,
	Switch,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
	Typography,
	Link
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandMore from "../../shared/expand-more";
import { Box } from "@mui/system";
import { ChevronDown } from "../../../../icons/chevron-down";
import StyledMenu from "../../styled-menu";
import {
	BuildCircle,
	Circle,
	Delete,
	Edit,
	WarningAmber,
} from "@mui/icons-material";
import { Scrollbar } from "../../../scrollbar";
import { rrulestr } from "rrule";
import NextLink from "next/link";
import rruleDescription from "../../../../utils/rrule-desc";
import WarningChip from "../../shared/warning-chip";
import { PencilAlt } from "../../../../icons/pencil-alt";
import { ArrowRight } from "../../../../icons/arrow-right";
import entranceApi from "../../../../api/entrance";
import { getAuthdeviceDetailsLink } from "../../../../utils/controller";
import { controllerApi } from "../../../../api/controllers";

export default function AuthDevicePair({ authPair,controllerId,status }) {
	// console.log("controllerId",controllerId);

	// for selection of checkboxes
	const [selectedDevices, setSelectedDevices] = useState([]);
	const selectedAllDevices = selectedDevices.length == 2;
	const selectedSomeDevices = selectedDevices.length > 0 && !selectedAllDevices;
	const handleSelectAllDevices = (e) =>
		setSelectedDevices(
			e.target.checked ? authPair.map((e) => e.authDeviceId) : []
		);
	const handleSelect = (authDeviceId) => {
		if (selectedDevices.includes(authDeviceId)) {
			setSelectedDevices(selectedDevices.filter((id) => id !== authDeviceId));
		} else {
			setSelectedDevices([...selectedDevices, authDeviceId]);
		}
	};

	//get entrance
	const [deviceEntrance, setDeviceEntrance] = useState(null);
	const getDeviceEntrance = (authPair) => {
		try {
			if (authPair[0].entrance) {
				setDeviceEntrance(authPair[0].entrance);
			}
		} catch (err) {
			console.log(err);
		}
	};

	useEffect(() => {
		getDeviceEntrance(authPair);
	}, [authPair]);

	// schedule actions
	const [actionAnchor, setActionAnchor] = useState(null);
	const actionOpen = Boolean(actionAnchor);
	const handleActionMenuOpen = (e) => setActionAnchor(e.currentTarget);
	const handleActionMenuClose = () => setActionAnchor(null);
	// const actionDisabled = schedules.length == 0;

	// delete schedules
	const [openDelete, setOpenDelete] = useState(false);
	const openDeleteDialog = () => setOpenDelete(true);
	const closeDeleteDialog = () => {
		setOpenDelete(false);
		handleActionMenuClose();
	};
	// useEffect(() => {
	// 	console.log("selectedDevices", selectedDevices);
	// }, [selectedDevices]);

	return (
		<Card>
			{/* <EntranceScheduleDelete
				open={openDelete}
				schedules={schedules}
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
						title={
							"Authentication devices for: " +
							`${
								deviceEntrance
									? deviceEntrance.entranceName
									: "No entrance assigned"
							}`
						}
						// title={deviceEntrance?deviceEntrance.entranceName:"No Entrance Assigned"}
						subheader="Click on the authentication device below to go to the device details page"
						avatar={
							// <ExpandMore expand={expanded} onClick={handleExpandClick}>
							// 	<ExpandMoreIcon />
							// </ExpandMore>
							deviceEntrance ? (
								true
							) : (
								<WarningAmber color="warning"></WarningAmber>
							)
						}
					/>
				</Box>
				<Box>
					<Button
						sx={{ m: 2 }}
						variant="contained"
						// onClick={handleActionMenuOpen}
					>
						Assign Entrance
					</Button>
					<Button
						endIcon={<ChevronDown fontSize="small" />}
						sx={{ m: 2 }}
						variant="contained"
						onClick={handleActionMenuOpen}
					>
						Actions
					</Button>
				</Box>
			</Box>
			<StyledMenu
				anchorEl={actionAnchor}
				open={actionOpen}
				onClose={handleActionMenuClose}
			>
				{/* <NextLink
					href={
                        link
					}
					passHref
				> */}
				<MenuItem
					disableRipple
					// disabled={actionDisabled}
				>
					<BuildCircle />
					&#8288;Reset
				</MenuItem>
				{/* </NextLink> */}
				<MenuItem
					disableRipple
					// disabled={actionDisabled}
					onClick={openDeleteDialog}
				>
					<Delete />
					&#8288;Remove
				</MenuItem>
			</StyledMenu>
			{/* <Collapse in={expanded}> */}
			{/*<Divider /> */}
			<Divider />
			{Array.isArray(authPair) && authPair.length > 0 ? (
				<Scrollbar>
					<Table>
						<TableHead sx={{ backgroundColor: "neutral.200" }}>
							<TableRow>
								<TableCell padding="checkbox">
									<Checkbox
										checked={selectedAllDevices}
										indeterminate={selectedSomeDevices}
										onChange={handleSelectAllDevices}
									/>{" "}
								</TableCell>
								<TableCell>Name</TableCell>
								<TableCell>Direction</TableCell>
								<TableCell>No. of auth methods</TableCell>
								<TableCell>masterpin</TableCell>
								<TableCell>Status</TableCell>
								<TableCell>lastOnline</TableCell>
								<TableCell></TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{authPair.map((device, i) => {
								const authDeviceId = device.authDeviceId;
								// const controllerId = device.controllerId
								return (
									<TableRow hover key={i}>
										<TableCell padding="checkbox">
											<Checkbox
												checked={selectedDevices.includes(authDeviceId)}
												onChange={(e) => handleSelect(authDeviceId)}
												// value={selectedDevices.includes(id)}
											/>{" "}
										</TableCell>
										<TableCell>							
											<NextLink href={getAuthdeviceDetailsLink(controllerId,authDeviceId)} passHref> 
											{/* <NextLink href={`/dashboard/controllers/auth-device/details/${controllerId}/${authDeviceId}`} passHref>  */}
												<Link color="inherit">
													{device.authDeviceName} 
												</Link>
											</NextLink>
										</TableCell>
										<TableCell>{device.authDeviceDirection}</TableCell>
										<TableCell>{1}</TableCell>
										<TableCell>
											{<Switch checked={device.masterpin} />}
										</TableCell>
										<TableCell>
											{/* <Circle color="disabled" /> */}
											<Circle color={device?.lastOnline ? (status[device?.authDeviceDirection]? "success":"error") : "disabled"} />
										</TableCell>
										<TableCell>
											{device?.lastOnline ? device.lastOnline:"never"}
										</TableCell>
										<TableCell>
											{/* <NextLink
                                                href={ editLink }
                                                passHref
                                            > */}
											<IconButton component="a">
												<PencilAlt fontSize="small" />
											</IconButton>
											{/* </NextLink>
                                            <NextLink 
                                                href={ detailsLink }
                                                passHref
                                            > */}
											<IconButton component="a">
												<ArrowRight fontSize="small" />
											</IconButton>
											{/* </NextLink> */}
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</Scrollbar>
			) : (
				<Grid container flexDirection="row" paddingLeft={3} paddingTop={3}>
					<Grid item paddingRight={3} paddingBottom={3}>
						<WarningChip text="Authentication devices not found" />
					</Grid>
				</Grid>
			)}
			{/* </Collapse> */}
		</Card>
	);
}
