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
	Link,
	CircularProgress
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
import { getAuthdeviceDetailsLink, getAuthdeviceEditLink, getControllerEditLink, getControllerEditLinkWithId } from "../../../../utils/controller";
import { controllerApi } from "../../../../api/controllers";
import AuthDeviceDelete from "../auth-device/auth-device-delete";
import AuthDeviceReset from "../auth-device/auth-device-reset";
import { toDisplayDateString } from "../../../../utils/utils";
import { authDeviceApi } from "../../../../api/auth-devices";
import toast from "react-hot-toast";
import RemoveEntrance from "./remove-entrance";

export default function AuthDevicePair({ authPair,controllerId, status, statusLoaded, resetAuthDevices, deleteAuthDevices,handleToggleMasterpin,removeEntrance }) {
	// const status = {
	// 	"E1_IN": true,
	// 	"E1_OUT": true,
	// 	"E2_IN": false,
	// 	"E2_OUT": false
	// }]

	//get entrance
	// const [deviceEntrance, setDeviceEntrance] = useState(null);
	// const getDeviceEntrance = (authPair) => {
	// 	try {
	// 		if (authPair[0].entrance) {
	// 			setDeviceEntrance(authPair[0].entrance);
	// 		}
	// 	} catch (err) {
	// 		console.log(err);
	// 	}
	// };

	// useEffect(() => {
	// 	getDeviceEntrance(authPair);
	// }, [authPair]);

	// auth device actions
	const [actionAnchor, setActionAnchor] = useState(null);
	const actionOpen = Boolean(actionAnchor);
	const handleActionMenuOpen = (e) => setActionAnchor(e.currentTarget);
	const handleActionMenuClose = () => setActionAnchor(null);

	// delete auth devices
	const [openDelete, setOpenDelete] = useState(false);
	const openDeleteDialog = () => setOpenDelete(true);
	const closeDeleteDialog = () => {
		setOpenDelete(false);
		handleActionMenuClose();
	};

	const handleDeleteAuthDevices = () => {
		deleteAuthDevices(selectedDevices);
		closeDeleteDialog();
		setSelectedDevices("");
	}

	// reset auth devices
	const [openReset, setOpenReset] = useState(false);
	const openResetDialog = () => setOpenReset(true);
	const closeResetDialog = () => {
		setOpenReset(false);
		handleActionMenuClose();
	};

	const handleResetAuthDevices = () => {
		resetAuthDevices(selectedDevices);
		closeResetDialog();
		setSelectedDevices("");
	}

	//remove entrance
	const [removeOpen, setRemoveOpen] = useState(false)
	const handleRemoveClose = () => {
		setRemoveOpen(false)
	}
	const handleRemoveOpen = () => {
		setRemoveOpen(true)
	}

	return (
		<Card>
			<AuthDeviceReset
				setActionAnchor={setActionAnchor}
				open={openReset}
				handleDialogClose={closeResetDialog}
				// selectedAuthDevices={selectedDevices}
				resetAuthDevices={handleResetAuthDevices}
			/> 
			
			<AuthDeviceDelete
				setActionAnchor={setActionAnchor}
				open={openDelete} 
				handleDialogClose={closeDeleteDialog}
				// selectedAuthDevices={selectedDevices}
				deleteAuthDevices={handleDeleteAuthDevices}
			/>
			<RemoveEntrance
				open={removeOpen}
				handleDialogClose={handleRemoveClose}
				removeEntrance={removeEntrance(authPair)}
			/>

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
								authPair
									? (authPair[0].entrance?authPair[0].entrance.entranceName:"No entrance assigned")
									: "No entrance assigned"
							}`
						}
						// title={deviceEntrance?deviceEntrance.entranceName:"No Entrance Assigned"}
						subheader="Click on the authentication device below to go to the device details page"
						avatar={
							authPair?
							(authPair[0].entrance?true:<WarningAmber color="warning"></WarningAmber>):
							<WarningAmber color="warning"></WarningAmber>
							// deviceEntrance ? (
							// 	true
							// ) : (
							// 	<WarningAmber color="warning"></WarningAmber>
							// )
						}
					/>
				</Box>
				<Box>
				<NextLink 
                                                href={getControllerEditLinkWithId(controllerId)}
                                                passHref
                                            >
					<Button
						sx={{ ml:2, mb: 2 }}
						variant="contained"
						onClick={getControllerEditLinkWithId(controllerId)}
					>
						Assign Entrance
					</Button>
					</NextLink>
					<Button
						sx={{ ml: 2 , mb:2}}
						variant="contained"
						onClick={handleRemoveOpen}
						// disabled={true}
						disabled={authPair?(authPair[0].entrance==null?true:false):true}
					>
						Remove Entrance
					</Button>

				</Box>
			</Box>
			{/* <StyledMenu
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
				<MenuItem
					disableRipple
					disabled={actionDisabled}
					onClick={openResetDialog}
				>
					<BuildCircle />
					&#8288;Reset
				</MenuItem>
				</NextLink>
				<MenuItem
					disableRipple
					disabled={actionDisabled}
					onClick={openDeleteDialog}
				>
					<Delete />
					&#8288;Remove
				</MenuItem>
			</StyledMenu> */}
			{/* <Collapse in={expanded}> */}
			{/*<Divider /> */}
			<Divider />
			{Array.isArray(authPair) && authPair.length > 0 ? (
				<Scrollbar>
					<Table>
						<TableHead sx={{ backgroundColor: "neutral.200" }}>
							<TableRow>
								{/* <TableCell padding="checkbox">
									<Checkbox
										checked={selectedAllDevices}
										indeterminate={selectedSomeDevices}
										onChange={handleSelectAllDevices}
									/>{" "}
								</TableCell> */}
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
										{/* <TableCell padding="checkbox">
											<Checkbox
												checked={selectedDevices.includes(authDeviceId)}
												onChange={(e) => handleSelect(authDeviceId)}
												// value={selectedDevices.includes(id)}
											/>{" "}
										</TableCell> */}
										<TableCell>							
											<NextLink href={getAuthdeviceDetailsLink(controllerId,authDeviceId)} passHref> 
												<Link color="inherit">
													{device.authDeviceName} 
												</Link>
											</NextLink>
										</TableCell>
										<TableCell>{device.authDeviceDirection}</TableCell>
										<TableCell>{1}</TableCell>
										<TableCell>
											{<Switch onClick={(e)=>handleToggleMasterpin(authDeviceId,e)} checked={device.masterpin} />}
										</TableCell>
										<TableCell>
											{statusLoaded?
											(<Circle color={device.lastOnline?(status?(status[device.authDeviceDirection]?"success":"error"):"error"):"disabled"} />):
											(<CircularProgress size='1rem'/>)
											}
											{/* {statusLoaded?
											(<Circle color={device?.lastOnline ? (status[device.authDeviceDirection]? "success":"error") : "disabled"} />):
											(<CircularProgress size='1rem'/>)
											} */}
										</TableCell>
										<TableCell>
											{statusLoaded?
												(status[device.authDeviceDirection]?"Online":(device.lastOnline?toDisplayDateString(device.lastOnline):"Never")):
											(<CircularProgress size='1rem'/>)}
											{/* {statusLoaded?
												(status?(status[device.authDeviceDirection]?"Online":device.lastOnline):(device.lastOnline?device.lastOnline:"Never")):
											(<CircularProgress size='1rem'/>)} */}
											{/* {statusLoaded?
												(status[device.authDeviceDirection]?"N.A.":
												(device.lastOnline?device.lastOnline:"Never")) :
											(<CircularProgress size='1rem'/>)} */}
										</TableCell>
										<TableCell>
											<NextLink
                                                href={ getAuthdeviceEditLink(controllerId,authDeviceId) }
                                                passHref
                                            >
											<IconButton component="a">
												<PencilAlt fontSize="small" />
											</IconButton>
											</NextLink>
                                            <NextLink 
                                                href={ getAuthdeviceDetailsLink(controllerId,authDeviceId) }
                                                passHref
                                            >
											<IconButton component="a">
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
