import * as React from "react";
import Dialog from "@mui/material/Dialog";
import {
	Button,
	Box,
	DialogContent,
	TextField,
	Grid,
	Chip,
	InputAdornment,
	FormControlLabel,
	Switch

} from "@mui/material";
import { useState, useEffect } from "react";
import { validatePhoneNumber } from "../../../utils/utils";

export const SMSEdit = (props) => {
	const { open, handleDialogClose, changeSMS, smsRecipients, smsValue, defaultSMSContent } = props;

	// submit action
	const handleChangeSMS = (recipients, content, defaultSMS) => {
		const newValue = {
			eventsManagementSMSRecipients: recipients,
			eventsManagementSMSContent: content,
			useDefaultSMS: defaultSMS
		}
		changeSMS(newValue);
		handleClose();
	}
	
	const [notificationSMSsInputValue, setNotificationSMSsInputValue] = useState("");
    const [notificationSMSsRecipients, setNotificationSMSsRecipients] = useState(smsRecipients);
	const [notificationSMSContent, setNotificationSMSContent] = useState("");
	const [useDefaultSMS, setUseDefaultSMS] = useState(smsValue?.useDefaultSMS);
	const [isInvalidSMSs, setIsInvalidSMSs] = useState(false);
	const [isEmptyRecipients, setIsEmptyRecipients] = useState(false);

	// closing actions
	const handleClose = () => { 
		setNotificationSMSsRecipients(smsRecipients);
		setNotificationSMSContent(smsValue?.eventsManagementSMSContent);
		setUseDefaultSMS(smsValue?.useDefaultSMS);
		handleDialogClose();
	}
	useEffect(() => {
		setNotificationSMSsRecipients(smsRecipients);
		if (smsValue?.useDefaultSMS) {
			setNotificationSMSContent(defaultSMSContent);
		} else {
			setNotificationSMSContent(smsValue?.eventsManagementSMSContent);
		}
		setUseDefaultSMS(smsValue?.useDefaultSMS);
	}, [smsRecipients, smsValue, defaultSMSContent])

	return (
		<>
			<Dialog
				fullWidth
    			maxWidth='lg'
				open={open}
				onClose={() => {/* do nothing */}}
				onBackdropClick={() => {/* do nothing */}}
			>
				<DialogContent>
					<TextField
						fullWidth
						sx={{mr: 2}}
						label="SMS Recipients"
						value={notificationSMSsInputValue}
						onChange={(e) => {
							setNotificationSMSsInputValue(e.target.value);
						}}
						helperText={ 
							(isEmptyRecipients && "Error: empty SMS recipients is not allowed") ||
							(isInvalidSMSs && "Error: invalid SMS recipient(s)")
						}
						error={ isEmptyRecipients || isInvalidSMSs }
						InputProps={{
						sx: {height: 80},
						startAdornment: (
							<InputAdornment position="start"
								sx={{ maxWidth: "65%", marginTop: 2, marginBottom: 1, scrollbarColor: "white"}}>
							<div style={{display: "flex", overflowX: "scroll"}}>
								{notificationSMSsRecipients.map((item, index) => (
									<Chip key={index}
										sx={{ mr: 1, mb: 1 }}
										color={(!validatePhoneNumber(item)) ? "error": "default"}
										size="small"
										onDelete={() => {
											let arr = [...notificationSMSsRecipients]
											arr.splice(index, 1)
											setNotificationSMSsRecipients(arr);
											if (arr.length == 0) {
												setIsEmptyRecipients(true);
											}
											let isInvalid = false;
											for (let j = 0; j < arr.length; j++) {
												if (!validatePhoneNumber(arr[j])) {
													isInvalid = true;
												}
											}
											setIsInvalidSMSs(isInvalid);
										}}
										label={item} />
								))}
							</div>
						</InputAdornment>
						),
						}}
						onKeyDown={(e) => {
							if (e.key == "Enter") {
								const newNotificationSMSRecipients = [...notificationSMSsRecipients, ...(e.target.value).split(",")];
								let isInvalid = false;
								for (let j = 0; j < newNotificationSMSRecipients.length; j++) {
									if (!validatePhoneNumber(newNotificationSMSRecipients[j])) {
										isInvalid = true;
									}
								}
								setIsInvalidSMSs(isInvalid);
								setIsEmptyRecipients(false);
								setNotificationSMSsRecipients(newNotificationSMSRecipients);
								setNotificationSMSsInputValue("");
							}
						}}
					/>
					<TextField
						sx={{ mt: 2 }}
						multiline
						rows={10}
						value={notificationSMSContent}
						onChange={(e) => {setNotificationSMSContent(e.target.value)}}
						placeholder="Enter SMS Content"
						disabled={useDefaultSMS}
						fullWidth
					/>
					<Box
						display="flex"
						justifyContent="flex-end"
						flexWrap="wrap"
						mt={3}>
						<div>
							<FormControlLabel checked={useDefaultSMS}
								onChange={(e) => {
									if (e.target.checked) {
										setNotificationSMSContent(defaultSMSContent);
									}
									setUseDefaultSMS(e.target.checked)
								}}
								control={<Switch defaultChecked />}
								sx={{marginBottom: 2 }}
								labelPlacement="right"
								label="Use Default" />
						</div>
						<div style={{display: "flex", height:"fit-content"}}>
							<Button
								disabled={isInvalidSMSs || isEmptyRecipients}
								variant="contained"
								sx={{ borderRadius: 8, marginRight: 1 }}
								onClick={() => handleChangeSMS(notificationSMSsRecipients, notificationSMSContent, useDefaultSMS)}
							>
							Save	
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
						</div>
					</Box>		
				</DialogContent>
			</Dialog>
		</>
	);
};
