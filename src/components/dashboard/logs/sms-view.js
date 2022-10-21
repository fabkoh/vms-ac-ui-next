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

export const SMSView = (props) => {
	const { open, handleDialogClose, smsRecipients, smsContent } = props;
	
    const [notificationSMSsRecipients, setNotificationSMSsRecipients] = useState(smsRecipients);
	const [notificationSMSContent, setNotificationSMSContent] = useState(smsContent ?? "");

	// closing actions
	const handleClose = () => { 
		setNotificationSMSsRecipients([]);
		setNotificationSMSContent("");
		handleDialogClose();
	}
	useEffect(() => {
		setNotificationSMSsRecipients(smsRecipients);
		setNotificationSMSContent(smsContent);
	}, [smsRecipients, smsContent])

	return (
		<>
			<Dialog
				fullWidth
    			maxWidth='lg'
				open={open}
			>
				<DialogContent>
                    <div style={{display: "flex", flexDirection: "row"}}>
						<Grid item
									mr={2}
									mb={1}>
							<Typography fontWeight="bold"
								width={150}>SMS Recipient(s):</Typography>
						</Grid>
						<div style={{width: "80%"}}>
							{notificationSMSsRecipients.map((item, index) => (
								<Chip key={index}
									sx={{ mr: 1, mb: 1 }}
									size="small"
									label={item} />
							))}
						</div>
					</div>
					<TextField
						sx={{ mt: 2 }}
						multiline
						rows={10}
						value={notificationSMSContent}
						onChange={(e) => {setNotificationSMSContent(e.target.value)}}
						placeholder="Enter SMS Content"
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
