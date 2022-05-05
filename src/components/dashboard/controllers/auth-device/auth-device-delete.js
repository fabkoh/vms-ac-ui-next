import * as React from "react";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import {
	Button,
	Box,
	DialogActions,
	DialogContent,
	DialogContentText,
	TextField
} from "@mui/material";
import { useEffect, useState } from "react";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import Alert from "@mui/material/Alert";

const AuthDeviceDelete = (props) => {
	const { open, handleDialogClose, deleteAuthDevices } = props;

	//text field
	const [value, setValue] = useState("");
	const handleTextChange = (e) => setValue(e.target.value);
	const deleteDisabled = value != 'REMOVE';

	// closing actions
	const handleClose = () => { 
		handleDialogClose();
		setValue("");
	}

	// delete action
	const handleDeleteAuthDevices = () => {
		deleteAuthDevices();
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
					&#8288;Confirm Remove?
				</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Are you sure you want to remove authentication device(s)? This action cannot
						be undone.
					</DialogContentText>
					<DialogContentText>
						Selected authentication devices will be removed.
					</DialogContentText>
					<DialogContentText>
						Please ensure that the authentication device(s) is physically disconnected.
					</DialogContentText>

					<form onSubmit={handleDeleteAuthDevices}>
						<TextField
							variant="filled"
							fullWidth
							helperText="Please type in REMOVE to continue"
							onChange={handleTextChange}
							autoFocus
						/>

						<Box display="flex" justifyContent="flex-end" mt={1}>
							<Button
								color="error"
								disabled={deleteDisabled}
								variant="contained"
								sx={{ borderRadius: 8, marginRight: 1}}
								onClick={() => {
									deleteAuthDevices();
									props.setActionAnchor(null);
								}}
							>
							Remove	
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
}

export default AuthDeviceDelete;