import * as React from "react";
import toast from "react-hot-toast";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import {
	Button,
	Box,
	DialogContent,
	DialogContentText,
	Switch,
} from "@mui/material";
import { useEffect, useState } from "react";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import notificationConfigApi from "../../../api/notifications-config";

export const ConfirmNotificationDisabledSubmit = (props) => {
	const { action, open, handleDialogClose, submitEventsManagement, smsEnable, emailEnable } = props;

	const [localSMSEnable, setLocalSMSEnable] = useState(smsEnable);
	const [localEmailEnable, setLocalEmailEnable] = useState(emailEnable);

	const handleEmailToggle = async () => {
		const res = await notificationConfigApi.changeEmailNotificationEnablementStatus();
		if (res.status != 200) {
			throw new Error("Failed to update email notification config");
		} else {
			toast.success(`Successfully update email notification config`);
			setLocalEmailEnable(!localEmailEnable);
		}
	}

	const handleSMSToggle = async () => {
		const res = await notificationConfigApi.changeSMSNotificationEnablementStatus();
		if (res.status != 200) {
			throw new Error("Failed to update SMS notification config");
		} else {
			toast.success(`Successfully update SMS notification config`);
			setLocalSMSEnable(!localSMSEnable);
		}
	}
	// closing actions
	const handleClose = () => { 
		handleDialogClose();
	}

	// submit action
	const handleSubmitEventManagements = (e) => {
		submitEventsManagement(e);
		handleClose();
	}

	useEffect(() => {
		setLocalEmailEnable(emailEnable);
		setLocalSMSEnable(smsEnable);
	}, [emailEnable, smsEnable]);

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
						<Switch checked={localEmailEnable}
							onChange={handleEmailToggle}
                            sx={{alignSelf:"center"}}>
                        </Switch>
                    </div>
                    <div style={{ display: "flex", flexDirection: "row", marginBottom:"10px" }}>
                        <DialogContentText sx={{alignSelf:"center", width: "200px"}}>
                            Enable SMS Notifications
                        </DialogContentText>
						<Switch
							onChange={handleSMSToggle}
							checked={localSMSEnable}
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
