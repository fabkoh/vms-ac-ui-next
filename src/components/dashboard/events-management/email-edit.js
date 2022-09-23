import * as React from "react";
import Dialog from "@mui/material/Dialog";
import {
	Button,
	Box,
	DialogContent,
	TextField,
	Grid,
	Input,
	Chip,
	Typography,
	Switch,
	FormControlLabel
} from "@mui/material";
import { useState, useEffect } from "react";
import { validateEmail } from "../../../utils/utils";

export const EmailEdit = (props) => {
	const { open, handleDialogClose, changeEmail, emailRecipients, emailValue } = props;

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
	const [notificationEmailContent, setNotificationEmailContent] = useState(emailValue?.eventsManagementEmailContent ?? "");
	const [notificationEmailTitle, setNotificationEmailTitle] = useState(emailValue?.eventsManagementEmailTitle ?? "");
	const [useDefaultEmails, setUseDefaultEmails] = useState(emailValue?.useDefaultEmails ?? false);
	const [isInvalidEmails, setIsInvalidEmails] = useState(false);
	const [isEmptyRecipients, setIsEmptyRecipients] = useState(false);

	useEffect(() => {
		setNotificationEmailsRecipients(emailRecipients);
		setNotificationEmailContent(emailValue?.eventsManagementEmailContent);
		setNotificationEmailTitle(emailValue?.eventsManagementEmailTitle);
		setUseDefaultEmails(emailValue?.useDefaultEmails ?? false);
	}, [emailRecipients, emailValue])

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
                           <div style={{display: "flex", flexDirection: "row"}}>
                                    <Grid item
                                            mr={2}
                                            mb={1}>
                                    <Typography fontWeight="bold"
                                        width={150}>Email Recipient(s):</Typography>
                                </Grid>
                                <div style={{width: "80%"}}>
                                    {notificationEmailsRecipients.map((item, index) => (
                                        <Chip key={index}
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
                                <Input
                                        sx={{mr: 2}}
                                        variant="standard"
                                        label="Email Recipients"
                                        value={notificationEmailsInputValue}
                                        onChange={(e) => {
                                            setNotificationEmailsInputValue(e.target.value);
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
						</div>
						<div style={{width: "13.1%"}}>
							<FormControlLabel checked={useDefaultEmails}
								onChange={(e) => {
									if (e.target.checked) {
										setNotificationEmailTitle("Event Management Triggered")
										setNotificationEmailContent("An Event Management has been triggered.")
									}
									setUseDefaultEmails(e.target.checked)
								}}
								control={<Switch defaultChecked />}
								sx={{marginRight: 0}}
								label="Use Default" />
						</div>
					</div>
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
						<Box display="flex"
							justifyContent="flex-end"
							mt={3}>
							{(isEmptyRecipients || isInvalidEmails) && <Grid sx={{ color: "#D14343", fontSize: "0.75rem", marginRight: "12px", alignSelf: "center"}}>
								{isEmptyRecipients && "Error: empty email recipients is not allowed" || isInvalidEmails && "Error: invalid email recipient(s)"}
							</Grid>
						}
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
						</Box>		
				</DialogContent>
			</Dialog>
		</>
	);
};
