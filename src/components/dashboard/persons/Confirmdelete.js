import * as React from "react";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import {
	Button,
	DialogActions,
	DialogContent,
	DialogContentText,
	Typography,
} from "@mui/material";
import { useEffect } from "react";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import Alert from "@mui/material/Alert";

export const Confirmdelete = (props) => {
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
    

	return (
		<>
			<Dialog open={props.deleteOpen} onClose={props.handleDeleteClose} onBackdropClick={props.handleDeleteClose}>
				<DialogTitle>
					{" "}
					<WarningAmberOutlinedIcon
						sx={{ color: "#F44336", m: -0.5, width: 50 }}
					/>{" "}
					Confirm delete?
				</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Are you sure you want to delete person? This action cannot be
						undone.
					</DialogContentText>
					<div>
						<br />
						<DialogContentText>
							<Typography>
								Before deletion, person will be removed from their
								respective org groups and access groups.
							</Typography>
						</DialogContentText>
					</div>
				</DialogContent>
				<DialogActions>
					<Button
						variant="outlined"
						onClick={props.handleDeleteAction}
						sx={{ borderRadius: 8, bgcolor: "#F44336" }}
					>
						<Typography sx={{ color: "white" }}>Delete</Typography>
					</Button>
					<Button
						variant="outlined"
						onClick={props.handleDeleteClose}
						sx={{ borderRadius: 8, color: "main.primary" }}
					>
						Cancel
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};
