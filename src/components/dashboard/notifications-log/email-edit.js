import * as React from "react";
import Dialog from "@mui/material/Dialog";
import {
	Button,
	Box,
	DialogContent,
	TextField,
	Grid,
	Chip,
	Typography,
} from "@mui/material";
import { useState, useEffect } from "react";

export const EmailEdit = (props) => {
	const { open, handleDialogClose, emailRecipients, emailValue } = props;

	// closing actions
	const handleClose = () => { 
		setNotificationEmailsRecipients(emailRecipients);
		setNotificationEmailContent(emailValue?.eventsManagementEmailContent);
		setNotificationEmailTitle(emailValue?.eventsManagementEmailTitle);
		handleDialogClose();
	}
	
    const [notificationEmailsRecipients, setNotificationEmailsRecipients] = useState(emailRecipients);
	const [notificationEmailContent, setNotificationEmailContent] = useState(emailValue?.eventsManagementEmailContent ?? "");
	const [notificationEmailTitle, setNotificationEmailTitle] = useState(emailValue?.eventsManagementEmailTitle ?? "");

	useEffect(() => {
		setNotificationEmailsRecipients(emailRecipients);
		setNotificationEmailContent(emailValue?.eventsManagementEmailContent);
		setNotificationEmailTitle(emailValue?.eventsManagementEmailTitle);
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
									label={item} />
							))}
						</div>
					</div>
					<TextField
						sx={{ mt: 2 }}
						value={notificationEmailTitle}
						placeholder="Enter Email Title"
						disabled={true}
						fullWidth
					/>
					<TextField
						sx={{ mt: 2 }}
						multiline
						rows={10}
						value={notificationEmailContent}
						placeholder="Enter Email Content"
						disabled={true}
						fullWidth
					/>
						<Box display="flex"
							justifyContent="flex-end"
							mt={3}>
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
								Close
							</Button>		
						</Box>		
				</DialogContent>
			</Dialog>
		</>
	);
};
