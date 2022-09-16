import { InfoOutlined } from "@mui/icons-material";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import { useState } from "react";

export default function ConfirmStatusUpdate({entranceIds, open, handleDialogClose, handleStatusUpdate}) {
    const action = "Unlock";
    const helperText = `Type in ${action.toUpperCase()} to proceed`;

    // for text field
    const requireTextField = entranceIds.length > 1;
    const [text, setText] = useState("");
    const [buttonDisabled, setButtonDisabled] = useState(true);
    const handleTextChange = (e) => {
        const newText = e.target.value;
        setText(newText);
        setButtonDisabled(newText != action.toUpperCase());
    }

    // close conditions
    const handleClose = () => { setText(""); setButtonDisabled(true); handleDialogClose(); }
    const handleAction = (e) => { 
        e.preventDefault();
        handleClose(); 
        handleStatusUpdate(entranceIds); 
    }

    return(
        <Dialog
            open={open}
            onClose={handleClose}
            onBackdropClick={handleClose}
        >
            <DialogTitle>
                {" "}
                <InfoOutlined sx={{ color: "#1976D2", m: -0.6, width: 30, marginRight: 1 }}/>
                {"Confirm " + action + "?"}
            </DialogTitle>
            <form onSubmit={handleAction}>
                <DialogContent>
                    <DialogContentText>
                        { "Are you sure you want to " + action.toLowerCase() + ` ${requireTextField ? "these" :"this"} entrance${requireTextField ? "s" :""} for 5 seconds?\n` }
                        { requireTextField && 
                            <TextField 
                                sx={{marginTop: 2}}
                                variant="filled"
                                fullWidth
                                onChange={handleTextChange}
                                helperText={helperText}
                                value={text}
                                autoFocus
                            />
                        }  
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ marginBottom: 2}}>
                    <Button
                        type="submit"
                        disabled={requireTextField && buttonDisabled}
                        variant="contained"
                        sx={{ borderRadius: 8, marginRight: 1.7}}
                    >
                        { action[0].toUpperCase() + action.substring(1) }
                    </Button>
                    <Button
                        variant="outlined"
                        sx={{ borderRadius: 8, color: "main.primary", marginRight: 1.7 }}
                        onClick={handleClose}
                    >
                        Cancel    
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
   
}