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
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import Alert from "@mui/material/Alert";

export const ServerDownError = (props) => {
	const {open, handleDialogClose} = props;

	return (
		<>
			<Dialog
				open={open}
				onClose={handleDialogClose}
				onBackdropClick={handleDialogClose}
			>
				<DialogTitle>
					<WarningAmberOutlinedIcon
						sx={{ color: "#F44336", marginBottom: -0.6, width: 20, marginRight: "0.3rem" }}
					/>{" "}
					&#8288;Error
				</DialogTitle>
				<DialogContent>
					<DialogContentText>
						It seems like the server is down. Please try again later or contact xxxx if the error persists.
					</DialogContentText>
				</DialogContent>
			</Dialog>
		</>
	);
};
