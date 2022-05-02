import * as React from "react";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import {
	Button,
	Box,
	DialogContent,
	DialogContentText,
	TextField
} from "@mui/material";
import { useState } from "react";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";

export const ConfirmReset = (props) => {
	const { open, handleDialogClose, resetControllers } = props;

	//text field
	const [value, setValue] = useState("");
	const handleTextChange = (e) => setValue(e.target.value);
	const resetDisabled = value != 'RESET';

	// closing actions
	const handleClose = () => { 
		handleDialogClose();
		setValue("");
	}

	// reset action
	const handleResetControllers = () => {
		resetControllers();
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
					&#8288;Confirm Reset?
				</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Are you sure you want to reset controller(s)? This action cannot
						be undone.
					</DialogContentText>
					<DialogContentText>
						Controllers and related authentication devices will be reset to their default settings.
					</DialogContentText>

					<form onSubmit={handleResetControllers}>
						<TextField
							variant="filled"
							fullWidth
							helperText="Please type in RESET to proceed"
							onChange={handleTextChange}
							autoFocus
						/>

						<Box display="flex" justifyContent="flex-end" mt={1}>
							<Button
								color="error"
								disabled={resetDisabled}
								variant="contained"
								sx={{ borderRadius: 8, marginRight: 1}}
								onClick={() => {
									resetControllers();
									props.setActionAnchor(null);
								}}
							>
							Reset
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
