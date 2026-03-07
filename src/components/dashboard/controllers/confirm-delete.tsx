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
	const { open, message, handleDialogClose,  deleteFunc } = props;

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
	const handleDelete = (e) => {
		deleteFunc(e);
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
						{message}
					</DialogContentText>

					<form onSubmit={handleDelete}>
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
									deleteFunc();
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
