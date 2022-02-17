import { Card } from "@mui/material";
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
    root: {
        border: '1px solid #D14343'
    }
});

// card border turns red if error
const ErrorCard = ({ error, ...props }) => {
    const errorStyle = useStyles();
    return (
        <Card className={error && errorStyle.root || ""} {...props} />
    );
}

export default ErrorCard;
