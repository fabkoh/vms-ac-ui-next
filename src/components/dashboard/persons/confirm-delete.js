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
import { useEffect , useState } from "react";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import Alert from "@mui/material/Alert";

export const Confirmdelete = (props) => {
	const {selectedState, open, handleDialogClose, deletePersons} = props;

	//text field
	const [value, setValue] = useState("");
	const handleTextChange = (e) => setValue(e.target.value);
	const deleteDisabled = value != 'DELETE';

	//blocking the delete button
	const [deleteBlock, setDeleteBlock] = useState(true);

	useEffect(() => {
		deleteDisabled? setDeleteBlock(true):setDeleteBlock(false)
	}, [value]);

	// closing actions
    const handleClose = () => { 
        handleDialogClose();
		setValue("");
    }

    // delete action
    const handleDeletePersons = (e) => {
		//console.log(e);
        deletePersons(e);
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
						Are you sure you want to delete person(s)? This action cannot be
						undone.
					</DialogContentText>
					<form onSubmit={e => handleDeletePersons(e)}>
						{selectedState && <TextField 
							variant="filled"
							fullWidth 
							helperText='Please type in DELETE to proceed'
							onChange={handleTextChange} 
							autoFocus 
						/> }
						<Box display="flex" justifyContent="flex-end" mt={1}>
							<Button
								type="submit"
								color="error" 
								disabled={selectedState? deleteBlock:false}
								variant="contained"
								sx={{ borderRadius: 8, marginRight: 1}}
							>
								Delete
							</Button>
							<Button
								onClick={() => {
									handleClose();
									props.setAnchorEl(null);
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
