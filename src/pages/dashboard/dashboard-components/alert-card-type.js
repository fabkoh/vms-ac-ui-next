import {
    Card,
    CardActionArea,
    CardContent,
    Divider,
    Icon,
    IconButton,
    Typography
  } from '@mui/material';
import { useEffect, useState } from 'react';
import toast from "react-hot-toast";
import { eventslogsApi } from '../../../api/events';
import { FlipTwoTone, MeetingRoom } from '@mui/icons-material';

  
  export const AlertCardType = (props) => {
    const {
        cardType
    } = props;
    const [count, setCount] = useState([]);
    const [alertIcon, setIcon] = useState(null);

    // Sets number of unauthenticated scans in the last 24 hours
    const getUnauthenticatedScans = async () => {
        const unauthenticatedRes = await eventslogsApi.getUnauthenticatedScans();
        if (unauthenticatedRes.status !== 200) {
            toast.error("Error loading unauthenticated scans");
            return;
        }
        const unauthenticatedJson = await unauthenticatedRes.json();
        setCount(unauthenticatedJson.length);
    };

    // Sets number of unauthorised door opens in the last 24 hours
    const getUnauthorisedDoorOpens = async () => {
        const unauthorisedRes = await eventslogsApi.getUnauthorisedDoorOpens();
        if (unauthorisedRes.status !== 200) {
            toast.error("Error loading unauthorised door opens");
            return;
        }
        const unauthorisedJson = await unauthorisedRes.json();
        setCount(unauthorisedJson.length);
    };

    useEffect(() => {
        if (cardType == "Unauthenticated scans") {
            getUnauthenticatedScans();
            setIcon(<FlipTwoTone style={{ marginRight: '10px', fontSize: '36px' }} />);
        } else if (cardType == "Unauthorised door openings") {
            getUnauthorisedDoorOpens();
            setIcon(<MeetingRoom style={{ marginRight: '10px', fontSize: '36px' }} />);
        }
    }, [cardType]);

    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            {alertIcon}
            <Typography
                fontSize={30}
                color="textPrimary"
                variant="overline"
            >
                {count}
            </Typography>
        </div>
    );
  }