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
	Switch,
    FormGroup,
    FormControlLabel,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import ExpandMore from "../shared/expand-more";
import MultipleSelectInput from "../shared/multi-select-input";
import ErrorCard from "../shared/error-card";
import EditFormTooltip from "../../../components/dashboard/shared/edit_form_tooltip";
import { useMounted } from "../../../hooks/use-mounted";

const ControllerEditForm = ({controllerInfo,changeText,changeIPStatic,changeIPHandler,controllerValidations}) => {
	
	// const controllerName = useRef(controllerInfo['controllerName'])
	

	// expanding form
	const [expanded, setExpanded] = useState(true);
	const handleExpandClick = () => setExpanded(!expanded);

	// let storedInfo = controllerInfo;
	// const storedInfo = controllerInfo?JSON.parse(JSON.stringify(controllerInfo)):""
	

	if(!controllerInfo){
		return null
	}
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
					<ExpandMore expand={expanded} onClick={handleExpandClick}>
						<ExpandMoreIcon />
					</ExpandMore>
				}
				title="Controller"
				// action={
				//     // action are children flushed to the right
				//     (
				//         <Grid item container>
				//             { edit && (
				//                 <Grid item sx={{display: "flex", justifyContent: "center", alignItems: "center", paddingRight: 1, paddingLeft: 1}}>
				//                     <EditFormTooltip />
				//                 </Grid>
				//             )}
				//             <Button
				//                 variant="outlined"
				//                 color="error"
				//                 // onClick={() => removeCard(accessGroupId)}
				//             >
				//                 Clear
				//             </Button>
				//             { edit && (
				//                 <Box ml={2}>
				//                     <Button
				//                         variant="contained"
				//                         color="error"
				//                         onClick={() => console.log("delete")} // put delete method here
				//                     >
				//                         Delete
				//                     </Button>
				//                 </Box>
				//             )}
				//         </Grid>
				//     )
				// }
				sx={{ width: "100%", flexWrap: "wrap" }}
			/>
			<Divider />
			<CardContent>
				<Stack spacing={3}>
					<Grid item md={6} xs={12}>
						<TextField
							fullWidth
							label="Name"
							name="controllerName"
							required
							value={controllerInfo.controllerName}
							onChange={changeText}
							// onChange={onNameChange}
							// helperText={
							//     (accessGroupNameBlank && 'Error: access group name cannot be blank') ||
							//     (accessGroupNameExists && 'Error: access group name taken') ||
							//     (accessGroupNameDuplicated && 'Error: duplicate access group name in form')
							// }
							// error={ Boolean(accessGroupNameBlank || accessGroupNameExists || accessGroupNameDuplicated)}
						/>
					</Grid>
					<Collapse in={expanded}>
						<Stack spacing={3}>
							<Grid container alignItems="center">
								<Grid item md={6} xs={6}>
									<TextField
										fullWidth
										label="IP Address"
										name="controllerIP"
										disabled={controllerInfo.controllerIPStatic?false:true}
                                        required={controllerInfo.controllerIPStatic}
										// disabled={controller.controllerIpStatic}
										value={controllerInfo.controllerIP}
										helperText={controllerValidations.invalidIP ? "Invalid IP address": controllerValidations.takenIP ? "IP address taken":""}
										onChange={changeIPHandler}
										error={controllerValidations.invalidIP || controllerValidations.takenIP}
										// error={controllerInfo.controllerIPStatic?
										// 	!/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(controllerInfo.controllerIP):false}
									/>
								</Grid>
								<Grid item ml={1}>
									<FormGroup>
										<FormControlLabel
											control={<Switch 
                                                // checked="true" 
                                                checked={controllerInfo.controllerIPStatic}
                                                onChange={changeIPStatic}
                                                />}
                                            labelPlacement="start"
											label={<Typography fontWeight="bold">Static IP</Typography>}
										/>
									</FormGroup>
								</Grid>
							</Grid>
						</Stack>
					</Collapse>
				</Stack>
			</CardContent>
		</ErrorCard>
	);
};

export default ControllerEditForm;
