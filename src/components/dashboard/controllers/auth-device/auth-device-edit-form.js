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
import ExpandMore from "../../shared/expand-more";
import ErrorCard from "../../shared/error-card";
import EditFormTooltip from "../../../../components/dashboard/shared/edit_form_tooltip";
import SingleSelect from "../single-select-input";

const AuthdeviceEditForm = ({
	deviceInfo,
	changeText,
	masterpinHandler,
	defaultAuthMethodHandler,
	authMethodList,
}) => {
	// const controllerName = useRef(controllerInfo['controllerName'])

	// expanding form
	const [expanded, setExpanded] = useState(true);
	const handleExpandClick = () => setExpanded(!expanded);

	if(!deviceInfo){
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
				title="Authentication Device"
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
					<Grid container alignItems="center">
					<Grid item md={6} xs={12}>
						<TextField
							fullWidth
							label="Name"
							name="authdeviceName"
							required
							value={deviceInfo.authDeviceName}
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
					<Grid item ml={1}>
						<FormGroup>
							<FormControlLabel
								control={
									<Switch
									// checked="true"
									checked={deviceInfo.masterpin}
									onChange={masterpinHandler}
									// onChange={changeIPStatic}
									/>
								}
								labelPlacement="start"
								label={<Typography fontWeight="bold">Masterpin</Typography>}
							/>
						</FormGroup>
					</Grid>
					</Grid>
					<Collapse in={expanded}>
						<Stack spacing={3}>
							<Grid container alignItems="center" xs={12} md={6}>
							<SingleSelect
								label="Default Auth Method"
								value={deviceInfo.defaultAuthMethod.authMethodId}
								getLabel={(authMethod)=>authMethod.authMethodDesc}
								getValue={(authMethod)=>authMethod.authMethodId}
								onChange={defaultAuthMethodHandler}
								options={authMethodList}
								noclear
								required
								fullWidth
							/>
							</Grid>
						</Stack>
					</Collapse>
				</Stack>
			</CardContent>
		</ErrorCard>
	);
};

export default AuthdeviceEditForm;
