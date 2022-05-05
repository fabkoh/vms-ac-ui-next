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
} from "@mui/material";
import { useState } from "react";
import ExpandMore from "../shared/expand-more";
import MultipleSelectInput from "../shared/multi-select-input";
import ErrorCard from "../shared/error-card";
import EditFormTooltip from "../shared/edit_form_tooltip";
import SingleSelect from "../shared/single-select-input";
import { Scrollbar } from "../../scrollbar";
import { Circle } from "@mui/icons-material";
import NextLink from "next/link";
import WarningChip from "../shared/warning-chip";

//this is the authdevice list for edit page. can only assign entrance. other details for viewing only.

const AssignAuthDevice = ({ }) => {

    // expanding form
    const [expanded, setExpanded] = useState(true);
    const handleExpandClick = () => setExpanded(!expanded);

    const authPair = [{
        authDeviceDirection: "E2 IN",
    authDeviceId: "3",
    authDeviceName: "authDevice3",
    controllerId: "1",
    defaultAuthMethod: "",
    entrance: null,
    lastOnline: "",
    masterpin: true,
    },
    {
        authDeviceDirection: "E2 OUT",
    authDeviceId: "4",
    authDeviceName: "authDevice4",
    controllerId: "1",
    defaultAuthMethod: "",
    entrance: null,
    lastOnline: "",
    masterpin: true,
    },

    ]

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
                            <Typography variant="h6">E1 Entrance : </Typography>
                        </Grid>
                        <Grid item md={6} xs={8}>
                            <SingleSelect fullWidth label="Select Entrance"/>
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
											<Circle color={device.lastOnline ? "success" : "error"} />
										</TableCell>
										<TableCell>
											{device.lastOnline ? device.lastOnline : "Never"}
										</TableCell>
										<TableCell>
											{/* <NextLink
                                                href={ editLink }
                                                passHref
                                            > */}
											{/* <IconButton component="a">
												<PencilAlt fontSize="small" />
											</IconButton>
											{/* </NextLink>
                                            <NextLink 
                                                href={ detailsLink }
                                                passHref
                                            > */}
											{/* <IconButton component="a">
												<ArrowRight fontSize="small" />
											</IconButton> */}
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
                            </Grid>
                        </Stack>
                    </Collapse>
                {/* </Stack> */}
            </CardContent>
        </ErrorCard>
    )
}

export default AssignAuthDevice;