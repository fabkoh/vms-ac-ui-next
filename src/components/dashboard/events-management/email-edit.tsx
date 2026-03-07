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
	Switch,
	FormControlLabel
} from "@mui/material";
import { useState, useEffect } from "react";
import { validateEmail } from "../../../utils/utils";

export const EmailEdit = (props) => {
	const { open, handleDialogClose, changeEmail, emailRecipients, emailValue, defaultEmailTitle, defaultEmailContent, eventManagementName } = props;

	// closing actions
	const handleClose = () => { 
		setNotificationEmailsRecipients(emailRecipients);
		setNotificationEmailContent(emailValue?.eventsManagementEmailContent);
		setNotificationEmailTitle(emailValue?.eventsManagementEmailTitle);
		setUseDefaultEmails(emailValue?.useDefaultEmails ?? false);
		handleDialogClose();
	}

	// submit action
	const handleChangeEmail = (recipients, content, title, defaultEmail) => {
		const newValue = {
			eventsManagementEmailRecipients: recipients,
			eventsManagementEmailContent: content,
			eventsManagementEmailTitle: title,
			useDefaultEmails: defaultEmail
		}
		changeEmail(newValue);
		handleClose();
	}
	
	const [notificationEmailsInputValue, setNotificationEmailsInputValue] = useState("");
    const [notificationEmailsRecipients, setNotificationEmailsRecipients] = useState(emailRecipients);
	const [notificationEmailContent, setNotificationEmailContent] = useState("");
	const [notificationEmailTitle, setNotificationEmailTitle] = useState("");
	const [useDefaultEmails, setUseDefaultEmails] = useState(emailValue?.useDefaultEmails);
	const [isInvalidEmails, setIsInvalidEmails] = useState(false);
	const [isEmptyRecipients, setIsEmptyRecipients] = useState(false);

	useEffect(() => {
		setNotificationEmailsRecipients(emailRecipients);
		if (emailValue?.useDefaultEmails) {
			let content = "Event Management " + eventManagementName + " at <exit/controller name> " + defaultEmailContent + " on <occurence time>.";
			setNotificationEmailContent(content);
			setNotificationEmailTitle(defaultEmailTitle);
		} else {
			setNotificationEmailContent(emailValue?.eventsManagementEmailContent);
			setNotificationEmailTitle(emailValue?.eventsManagementEmailTitle);
		}
		setUseDefaultEmails(emailValue?.useDefaultEmails);
	}, [emailRecipients, emailValue, defaultEmailContent, defaultEmailTitle, eventManagementName])

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
						label="Email Recipients"
						value={notificationEmailsInputValue}
						onChange={(e) => {
							setNotificationEmailsInputValue(e.target.value);
						}}
						helperText={ 
							(isEmptyRecipients && "Error: empty email recipients is not allowed") ||
							(isInvalidEmails && "Error: invalid email recipient(s)")
						}
						error={ isEmptyRecipients || isInvalidEmails }
						InputProps={{
						sx: {height: 80},
						startAdornment: (
							<InputAdornment position="start"
								sx={{ maxWidth: "65%", marginTop: 2, marginBottom: 1, scrollbarColor: "white"}}>
							<div style={{display: "flex", overflowX: "scroll"}}>
							{notificationEmailsRecipients.map((item, index) => (
								<Chip key={index}
									color={(validateEmail(item) === null) ? "error": "default"}
									sx={{ mr: 1, mb: 1 }}
									size="small"
									onDelete={() => {
										let arr = [...notificationEmailsRecipients]
										arr.splice(index, 1)
										setNotificationEmailsRecipients(arr);
										if (arr.length == 0) {
											setIsEmptyRecipients(true);
										}
										let isInvalid = false;
										for (let j = 0; j < arr.length; j++) {
											if (validateEmail(arr[j]) === null) {
												isInvalid = true;
											}
										}
										setIsInvalidEmails(isInvalid);
									}}
									label={item} />
							))}
							</div>
						</InputAdornment>
						),
						}}
						onKeyDown={(e) => {
							if (e.key == "Enter") {
								const newNotificationEmailRecipients = [...notificationEmailsRecipients, ...(e.target.value).split(",")];
								let isInvalid = false;
								for (let j = 0; j < newNotificationEmailRecipients.length; j++) {
									if (validateEmail(newNotificationEmailRecipients[j]) === null) {
										isInvalid = true;
									}
								}
								setIsInvalidEmails(isInvalid);
								setIsEmptyRecipients(false);
								setNotificationEmailsRecipients(newNotificationEmailRecipients);
								setNotificationEmailsInputValue("");
							}
						}}
					/>
					<TextField
						sx={{ mt: 2 }}
						value={notificationEmailTitle}
						onChange={(e) => {setNotificationEmailTitle(e.target.value)}}
						placeholder="Enter Email Title"
						disabled={useDefaultEmails}
						fullWidth
					/>
					<TextField
						sx={{ mt: 2 }}
						multiline
						rows={10}
						value={notificationEmailContent}
						onChange={(e) => {setNotificationEmailContent(e.target.value)}}
						placeholder="Enter Email Content"
						disabled={useDefaultEmails}
						fullWidth
					/>
					<Box
						display="flex"
						justifyContent="flex-end"
						flexWrap="wrap"
						mt={3}>
						<div>
							<FormControlLabel checked={useDefaultEmails}
								onChange={(e) => {
									if (e.target.checked) {
										let content = "Event Management " + eventManagementName + " at <exit/controller name> " + defaultEmailContent + " on <occurence time>.";
										setNotificationEmailTitle(defaultEmailTitle)
										setNotificationEmailContent(content)
									}
									setUseDefaultEmails(e.target.checked)
								}}
								control={<Switch defaultChecked />}
								sx={{marginBottom: 2}}
								label="Use Default" />
						</div>
						<div style={{display: "flex", height:"fit-content"}}>
							<Button
								disabled={isInvalidEmails || isEmptyRecipients}
								variant="contained"
								sx={{ borderRadius: 8, marginRight: 1 }}
								onClick={() => handleChangeEmail(notificationEmailsRecipients, notificationEmailContent, notificationEmailTitle, useDefaultEmails)}
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
