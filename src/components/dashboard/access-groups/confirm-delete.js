import * as React from "react";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import {
	Button,
	DialogActions,
	DialogContent,
	DialogContentText,
	TextField,
	Typography,
} from "@mui/material";
import { useEffect } from "react";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import Alert from "@mui/material/Alert";

export const Confirmdelete = (props) => {
	const {selectedState,handleTextChange,deleteBlock}=props;
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
	
	return (
		<>
			<Dialog
				open={props.deleteOpen}
				onClose={props.handleDeleteClose}
				onBackdropClick={props.handleDeleteClose}
				
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
						Are you sure you want to delete access group(s)? This action cannot be
						undone.
					</DialogContentText>
					<DialogContentText>
						
							<TextField variant="filled" fullWidth 
							helperText='Please type in DELETE to proceed' 
							onChange={handleTextChange} />
					
					</DialogContentText>
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
				</DialogActions>
			</Dialog>
		</>
	);
};