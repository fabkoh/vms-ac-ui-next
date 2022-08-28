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

export const Confirmdelete = (props) => {
	const { open, handleDialogClose, deleteRecorders } = props;
	
	//text field
	const [value, setValue] = useState("");
	const handleTextChange = (e) => setValue(e.target.value);
	const deleteDisabled = value != 'DELETE';

    const handleClose = () => { 
        handleDialogClose();
		setValue("");
    }

    // delete action
    const handleDeleteVideoRecorders = () => {
        deleteRecorders();
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
						Are you sure you want to delete video recorder(s)? This action cannot be
						undone.
					</DialogContentText>

					<form onSubmit={handleDeleteVideoRecorders}>
						<TextField
							variant="filled"
							fullWidth 
							helperText='Please type in DELETE to proceed' 
							onChange={handleTextChange} 
							autoFocus 
						/>

						<Box display="flex"
							 justifyContent="flex-end"
							 mt={1}>
							<Button
								color="error"
								disabled={deleteDisabled}
								variant="contained"
								sx={{ borderRadius: 8, marginRight: 1}}
								onClick={() => {
									handleDeleteVideoRecorders();
								}}
							>
							Delete	
							</Button>

							<Button
								onClick={() => {
									handleClose();
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