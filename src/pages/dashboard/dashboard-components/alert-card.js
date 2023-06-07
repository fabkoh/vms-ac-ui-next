import {
    Card,
    CardActionArea,
    CardContent,
    Divider,
    Typography,
  } from '@mui/material';
import AlertCardType from './alert-card-type';

const AlertCard = (props) => {
    const {
        name
    } = props;

    // const router = useRouter();

    // const handleClickController = () => {
    //     const currentUrl = router.asPath;
    //     router.push(`${currentUrl}/${link}`);
    // };

    return (
            <Card>
                {/* <CardActionArea onClick={handleClickController}> */}
                    <CardContent>
                        <AlertCardType cardType={name} />
                        <Typography
                        fontSize={15}
                        color="textSecondary"
                        variant="body2"
                        >
                        {name}
                        </Typography>
                    </CardContent>
                {/* </CardActionArea> */}
            </Card>
    );
}

export default AlertCard;