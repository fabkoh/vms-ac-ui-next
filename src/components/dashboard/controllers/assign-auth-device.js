import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { 
    Button, 
    CardHeader, 
    Collapse, 
    Grid, 
    TextField, 
    Divider, 
    CardContent,
    Stack,
    Typography,
    Box,
    Select,
    Table,
    TableHead,
    TableRow,
    TableCell,
    Checkbox,
    TableBody,
    Link,
    Switch,
    CircularProgress,
} from "@mui/material";
import { useState } from "react";
import ExpandMore from "../shared/expand-more";
import MultipleSelectInput from "../shared/multi-select-input";
import ErrorCard from "../shared/error-card";
import EditFormTooltip from "../shared/edit_form_tooltip";
import { Scrollbar } from "../../scrollbar";
import { Circle } from "@mui/icons-material";
import NextLink from "next/link";
import WarningChip from "../shared/warning-chip";
import { getEntranceLabel } from "../../../utils/entrance";
import entranceApi from "../../../api/entrance";
import SingleSelect from "./single-select-input";
import { toDisplayDateString } from "../../../utils/utils";

//this is the authdevice list for edit page. can only assign entrance. other details for viewing only.

const AssignAuthDevice = ({authPair,status,statusLoaded,allEntrances,changeEntrance,controllerValidations}) => {
    console.log("authPair",authPair)
    // expanding form
    const [expanded, setExpanded] = useState(true);
    const handleExpandClick = () => setExpanded(!expanded);

    // const authPair = [{
    //     authDeviceDirection: "E2 IN",
    // authDeviceId: "3",
    // authDeviceName: "authDevice3",
    // controllerId: "1",
    // defaultAuthMethod: "",
    // entrance: null,
    // lastOnline: "",
    // masterpin: true,
    // },
    // {
    //     authDeviceDirection: "E2 OUT",
    // authDeviceId: "4",
    // authDeviceName: "authDevice4",
    // controllerId: "1",
    // defaultAuthMethod: "",
    // entrance: null,
    // lastOnline: "",
    // masterpin: true,
    // },
    // ]

    return (
        <ErrorCard 
        // error={
        //     accessGroupNameBlank        ||
        //     accessGroupNameExists       ||
        //     accessGroupNameDuplicated   ||
        //     accessGroupPersonDuplicated ||
        //     submitFailed
        // }
        >
            <CardHeader
                avatar={
                    // avatar are children flushed to the left
                    <ExpandMore
                        expand={expanded}
                        onClick={handleExpandClick}
                    >
                        <ExpandMoreIcon />
                    </ExpandMore>
                }
                // title="Entrance E1 :"
                title={
                    <Grid container alignItems="center" >
                        <Grid item md={2} xs={2}>
                            <Typography variant="h6">{authPair? (authPair[0]?.authDeviceDirection.includes("E1")? "E1 entrance :": "E2 entrance :"): "Device not found"} </Typography>
                        </Grid>
                        <Grid item md={6} xs={8}>
                            <SingleSelect 
                            fullWidth 
                            label="Select Entrance"
                            getLabel={getEntranceLabel}
                            helperText={controllerValidations?.invalidEntrance?"Error: Entrance repeated in form":""}
                            error={controllerValidations?.invalidEntrance}
                            onChange={changeEntrance}
                            value={authPair?(authPair[0].entrance?authPair[0].entrance :'') :''}
                            options={allEntrances}
                            getValue={(entrance) => entrance}
                            getKey={(entrance)=>entrance.entranceId}
                            />
                        </Grid>
                    </Grid>
                }
                sx={{ width: '100%', flexWrap: "wrap" }}
            />
            <Divider />
            <CardContent>
                {/* <Stack
                    spacing={3}
                > */}
                    {/* <Grid
                        item
                        md={6}
                        xs={12}
                    >
                        
                    </Grid> */}
                    <Collapse in={expanded}>
                        <Stack spacing={3}>
                            <Grid
                                item
                                md={12}
                                xs={12}
                            >
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
								const id = device.authDeviceId;
								return (
									<TableRow hover key={i}>
										{/* <TableCell padding="checkbox">
											<Checkbox
												checked={selectedDevices.includes(id)}
												onChange={(e) => handleSelect(id)}
												// value={selectedDevices.includes(id)}
											/>{" "}
										</TableCell> */}
										<TableCell>
											{/* <NextLink href={"/dashboard"} passHref> */}
												{/* <Link color="inherit"> */}
													{device.authDeviceName}
												{/* </Link> */}
											{/* </NextLink> */}
										</TableCell>
										<TableCell>{device.authDeviceDirection}</TableCell>
										<TableCell>{1}</TableCell>
										<TableCell>
											{<Switch disabled checked={device.masterpin} />}
										</TableCell>
										<TableCell>
                                        {statusLoaded?
											(<Circle color={device.lastOnline?(status?(status[device.authDeviceDirection]?"success":"error"):"error"):"disabled"} />):
											(<CircularProgress size='1rem'/>)
											}
										</TableCell>
										<TableCell>
                                        {statusLoaded?
												(status[device.authDeviceDirection]?"Online":(device.lastOnline?toDisplayDateString(device.lastOnline):"Never")):
											(<CircularProgress size='1rem'/>)}
                                        {/* {statusLoaded?
												(status?(status[device.authDeviceDirection]?"Online":device.lastOnline):(device.lastOnline?device.lastOnline:"Never")):
											(<CircularProgress size='1rem'/>)} */}
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
                            </Grid>
                        </Stack>
                    </Collapse>
                {/* </Stack> */}
            </CardContent>
        </ErrorCard>
    )
}

export default AssignAuthDevice;