import * as React from "react";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import {
	Button,
	Box,
	DialogActions,
	DialogContent,
	DialogContentText,
	TextField,
	Switch,
} from "@mui/material";
import { useEffect, useState } from "react";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import Alert from "@mui/material/Alert";

export const ConfirmNotificationDisabledSubmit = (props) => {
	const { open, handleDialogClose, submitEventsManagement } = props;
	// //handle delete action. put this in parent component
	// const [Open, setOpen] = React.useState(false);

	// const handleclickOpen = () => {        //click open is for binding to button.
	// 	setOpen(true);                        //can remove if not needed
	// 	console.log('true');
	// };
	// const handleClose = () => {
	// 	setOpen(false);
	// 	console.log('false');
	// };
	// const handleDelete = () => {
	// 	try {
	// 		setOpen(false);
	// 		console.log('false');
	// 		// const data = await personApi.getPersons()
	// 	} catch (error) {}
	// };

	//move text state here

	//text field
	const [value, setValue] = useState("");

	// closing actions
	const handleClose = () => { 
		handleDialogClose();
		setValue("");
	}

	// submit action
	const handleSubmitEventManagements = (e) => {
		submitEventsManagement(e);
		handleClose();
	}

	return (
		<>
			<Dialog
				open={open}
				onClose={handleClose}
				onBackdropClick={handleClose}
			>
				<DialogTitle>
					{" "}
					<WarningAmberOutlinedIcon
						sx={{ color: "#FFB020", marginBottom: -0.5, marginRight: 0.5, width: 25 }}
					/>{" "}
					Confirm Submit?
				</DialogTitle>
				<DialogContent>
                    <DialogContentText>
                        Your notifications are currently disabled.
                        <br></br>
                        <br></br>
                        Would you like to enable your notifications before creating the following event(s)?
                        <br></br>
                        <br></br>
                    </DialogContentText>
                    <div style={{ display: "flex", flexDirection: "row" }}>
                        <DialogContentText sx={{alignSelf:"center", width: "200px"}}>
                            Enable Email Notifications
                        </DialogContentText>
                        <Switch checked={true}
                            sx={{alignSelf:"center"}}>

                        </Switch>
                    </div>
                    <div style={{ display: "flex", flexDirection: "row", marginBottom:"10px" }}>
                        <DialogContentText sx={{alignSelf:"center", width: "200px"}}>
                            Enable SMS Notifications
                        </DialogContentText>
                        <Switch checked={true}
                            sx={{alignSelf:"center"}}>
                        </Switch>
                    </div>
						<Box display="flex"
							justifyContent="flex-end"
							mt={1}>
                            <Button
                                onClick={handleSubmitEventManagements}
								type="submit"
								variant="contained"
								sx={{ borderRadius: 8, marginRight: 1}}
							>
							Submit	
							</Button>

							<Button
								onClick={() => {
									handleClose();
									if (props.setActionAnchor) {
										props.setActionAnchor(null);
									}
								}}
								variant="outlined"
								sx={{ borderRadius: 8, color: "main.primary" }}
							>
								Cancel
							</Button>		
						</Box>
				</DialogContent>
			</Dialog>
		</>
	);
};
