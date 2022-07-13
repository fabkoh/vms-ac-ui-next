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
	Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import Alert from "@mui/material/Alert";

export const Confirmdelete = (props) => {
	const { open, handleDialogClose, deleteEventsManagement } = props;
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
	const handleTextChange = (e) => setValue(e.target.value);
	const deleteDisabled = value != 'DELETE';

	// closing actions
	const handleClose = () => { 
		handleDialogClose();
		setValue("");
	}

	// delete action
	const handleDeleteeventManagements = (e) => {
		deleteEventsManagement(e);
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
						sx={{ color: "#F44336", m: -0.5, width: 50 }}
					/>{" "}
					&#8288;Confirm Delete?
				</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Are you sure you want to delete selected Event Management(s)? This action cannot
						be undone.
					</DialogContentText>

					<form onSubmit={handleDeleteeventManagements}
                    autoComplete="off">
						<TextField
							variant="filled"
							fullWidth
							helperText="Please type in DELETE to proceed"
							onChange={handleTextChange}
							autoFocus
						/>

						<Box display="flex" justifyContent="flex-end" mt={1}>
							<Button
								type="submit"
								color="error"
								disabled={deleteDisabled}
								variant="contained"
								sx={{ borderRadius: 8, marginRight: 1}}
							>
							Delete	
							</Button>

							<Button
								onClick={() => {
									handleClose();
									props.setActionAnchor(null);
								}}
								variant="outlined"
								sx={{ borderRadius: 8, color: "main.primary" }}
							>
								Cancel
							</Button>		
						</Box>		
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
};
