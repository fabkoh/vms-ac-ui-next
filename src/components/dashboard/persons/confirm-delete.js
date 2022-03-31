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
    const handleDeletePersons = () => {
        deletePersons();
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
					&#8288;Confirm delete?
				</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Are you sure you want to delete person(s)? This action cannot be
						undone.
					</DialogContentText>
					<form onSubmit={handleDeletePersons}>
						<TextField 
							variant="filled"
							fullWidth 
							helperText='Type in DELETE to proceed'
							onChange={handleTextChange} 
							autoFocus 
						/>
						<Box display="flex" justifyContent="space-between" mt={1}>
							<Button 
								type="submit"
								color="error" 
								disabled={deleteDisabled}
								variant="contained"
								sx={{ borderRadius: 8 }}
							>
								Delete
							</Button>
							<Button
								onClick={handleClose}
								variant="outlined"
								sx={{ borderRadius: 8, color: "main.primary" }}
							>
								Cancel
							</Button>
						</Box>
					</form>


{/*
						{ selectedState && <DialogContentText>
							
								<TextField variant="filled" fullWidth 
								helperText='Type in DELETE to proceed' 
								onChange={handleTextChange} 
								autoFocus />
						
						</DialogContentText>}
				</DialogContent>
				<DialogActions>
					<Button
						disabled={selectedState? deleteBlock:false}
						variant="contained"
						onClick={() => {
							props.handleDeleteAction();
							props.setAnchorEl(null);
						}}
						sx={{ borderRadius: 8, bgcolor: "#F44336" }}
					>
						<Typography sx={{ color: "white" }}>Delete</Typography>
					</Button>
					<Button
						variant="outlined"
						onClick={() => {
							props.handleDeleteClose();
							props.setAnchorEl(null);
						}}
						sx={{ borderRadius: 8, color: "main.primary" }}
					>
						Cancel
					</Button>
					</DialogActions> */}
				</DialogContent>
			</Dialog>
		</>
	);
};
