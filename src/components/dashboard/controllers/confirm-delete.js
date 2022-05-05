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

export const Confirmdelete = (props) => {
	const { open, handleDialogClose, deleteControllers } = props;

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
	const handleDeleteControllers = () => {
		deleteControllers();
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
						Are you sure you want to delete controller(s)? This action cannot
						be undone.
					</DialogContentText>
					<DialogContentText>
						Authentication devices of selected controller(s) will be deleted.
					</DialogContentText>

					<form onSubmit={handleDeleteControllers}>
						<TextField
							variant="filled"
							fullWidth
							helperText="Please type in DELETE to continue"
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
									deleteControllers();
									props.setActionAnchor(null);
								}}
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
