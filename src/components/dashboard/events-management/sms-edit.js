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
} from "@mui/material";
import { useState, useEffect } from "react";
import { validatePhoneNumber } from "../../../utils/utils";

export const SMSEdit = (props) => {
	const { open, handleDialogClose, changeSMS, smsRecipients, smsValue } = props;

	// closing actions
	const handleClose = () => { 
		handleDialogClose();
	}

	// submit action
	const handleChangeSMS = (recipients, content) => {
		const newValue = {
			eventsManagementSMSRecipients: recipients,
			eventsManagementSMSContent: content
		}
		changeSMS(newValue);
		handleClose();
	}
	
	const [notificationSMSsInputValue, setNotificationSMSsInputValue] = useState("");
    const [notificationSMSsRecipients, setNotificationSMSsRecipients] = useState(smsRecipients);
	const [notificationSMSContent, setNotificationSMSContent] = useState(smsValue?.eventsManagementSMSContent);
	const [isInvalidSMSs, setIsInvalidSMSs] = useState(false);
	const [isEmptyRecipients, setIsEmptyRecipients] = useState(false);

	useEffect(() => {
		setNotificationSMSsRecipients(smsRecipients);
		setNotificationSMSContent(smsValue?.eventsManagementSMSContent);
	}, [smsRecipients, smsValue])

	return (
		<>
			<Dialog
				open={open}
				onClose={handleClose}
				onBackdropClick={handleClose}
			>
				<DialogContent>
                           <div style={{display: "flex", flexDirection: "row"}}>
                                    <Grid item
                                            mr={2}
                                            mb={1}>
                                    <Typography fontWeight="bold"
                                        width={150}>SMS Recipient(s):</Typography>
                                </Grid>
                                <div>
                                    {notificationSMSsRecipients.map((item, index) => (
                                        <Chip key={index}
                                            sx={{ mr: 1, mb: 1 }}
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
                                <Input
                                        sx={{mr: 2}}
                                        variant="standard"
                                        label="SMS Recipients"
                                        value={notificationSMSsInputValue}
                                        onChange={(e) => {
                                            setNotificationSMSsInputValue(e.target.value);
                                        }}
                                        onKeyDown={(e) => {
                                            console.log(e.key);
                                            if (e.key == "Enter") {
												const newNotificationSMSRecipients = [...notificationSMSsRecipients, e.target.value];
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
						</div>
					</div>
					<TextField
						sx={{ mt: 2 }}
						multiline
						rows={10}
						value={notificationSMSContent}
						onChange={(e) => {setNotificationSMSContent(e.target.value)}}
						placeholder="Enter SMS Content"
						fullWidth
					/>
						<Box display="flex"
							justifyContent="flex-end"
							mt={3}>
							{(isEmptyRecipients || isInvalidSMSs) && <Grid sx={{ color: "#D14343", fontSize: "0.75rem", marginRight: "12px", alignSelf: "center"}}>
								{isEmptyRecipients && "Error: empty SMS recipients is not allowed" || isInvalidSMSs && "Error: invalid SMS recipient(s)"}
							</Grid>
							}
							<Button
								disabled={isInvalidSMSs || isEmptyRecipients}
								type="submit"
								variant="contained"
							sx={{ borderRadius: 8, marginRight: 1 }}
							onClick={() => handleChangeSMS(notificationSMSsRecipients, notificationSMSContent)}
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
