import {
    Card,
    CardActionArea,
    CardContent,
    Divider,
    Typography,
  } from '@mui/material';
import { ArrowRight as ArrowRightIcon } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import toast from "react-hot-toast";
import { eventslogsApi } from '../../../api/events';
import { useRouter } from 'next/router';
import { AlertCardType } from './alert-card-type';

export const AlertCard = (props) => {
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