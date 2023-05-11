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

export const ErrorPopUp = (props) => {
	const { open, handleDialogClose, errorMessage } = props;
	const [msg, setMsg] = React.useState(errorMessage ?? "An error has occured");
	React.useEffect(() => {
		setMsg(errorMessage);
	}, [errorMessage]);

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
						{msg}
					</DialogContentText>
				</DialogContent>
			</Dialog>
		</>
	);
};
