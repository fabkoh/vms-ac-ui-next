import {
    Card,
    CardActionArea,
    CardContent,
    Divider,
    Icon,
    IconButton,
    Skeleton,
    Typography
  } from '@mui/material';
import { useEffect, useState } from 'react';
import toast from "react-hot-toast";
import { eventslogsApi } from '../../../api/events';
import { FlipTwoTone, MeetingRoom, LocalFireDepartmentOutlined } from '@mui/icons-material';

  
const AlertCardType = (props) => {
    const {
        cardType
    } = props;
    const [count, setCount] = useState(null);
    const [alertIcon, setIcon] = useState(null);
    const loading = count === null;

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

    // Sets number of unauthorised door opens in the last 24 hours
    const getFireAlarms = async () => {
        const fireRes = await eventslogsApi.getFireAlarms();
        if (fireRes.status !== 200) {
            toast.error("Error loading unauthorised door opens");
            return;
        }
        const fireJson = await fireRes.json();
        setCount(fireJson.length);
    };

    useEffect(() => {
        if (cardType == "Unauthenticated scans") {
            getUnauthenticatedScans();
            setIcon(<FlipTwoTone style={{ marginRight: '10px', fontSize: '36px' }} />);
        } else if (cardType == "Unauthorised door openings") {
            getUnauthorisedDoorOpens();
            setIcon(<MeetingRoom style={{ marginRight: '10px', fontSize: '36px' }} />);
        } else if (cardType == "Fire alarms") {
            getFireAlarms();
            setIcon(<LocalFireDepartmentOutlined style={{ marginRight: '10px', fontSize: '36px' }} />);
        }
    }, [cardType]);

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Skeleton variant="circular" width={36} height={36} sx={{ mr: '10px' }} />
                <Skeleton variant="text" width={60} height={45} />
            </div>
        );
    }

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

  export default AlertCardType;