import { controllerApi } from "../../../../api/controllers";
import WarningChip from "../../shared/warning-chip";
import NextLink from "next/link";
import { PencilAlt } from "../../../../icons/pencil-alt";
import { ArrowRight } from "../../../../icons/arrow-right";
import { getEntranceDetailsLink } from "../../../../utils/entrance"
import { getControllerDetailsLink, getControllerEditLink } from "../../../../utils/controller";
import { Circle, CloudOff, CloudQueue } from "@mui/icons-material";
import { isObject, toDisplayDateString } from "../../../../utils/utils";
import { Box, Checkbox, CircularProgress, IconButton, Link, TableCell, TableRow, Typography } from "@mui/material";
import { useState, useEffect } from "react";


const authDeviceKeys = ["E1_IN", "E1_OUT", "E2_IN", "E2_OUT"];

const EntranceComponent = ({ entrance, ...props }) => {
    if (isObject(entrance) && "entranceName" in entrance) {
        return (
            <Box { ...props }>
                <NextLink
                    href={getEntranceDetailsLink(entrance)}
                    passHref
                >
                    <Link color="inherit">
                        <Typography noWrap>{ entrance.entranceName }</Typography>
                    </Link>
                </NextLink>
            </Box>
        )
    }
    
    return <WarningChip text="No entrance" { ...props }/>;
}

const ControllerRow = ({controller, selectedControllers, handleSelectFactory}) => {
    const {
        controllerId,
        controllerName,
        controllerIP,
        created,
        authDevices=[]
    } = controller;

    const authDevicesIsArray = Array.isArray(authDevices);

    const deviceArr = authDeviceKeys.map(key => authDevicesIsArray && authDevices.find(device => device.authDeviceDirection == key));

    const entrance1 = isObject(deviceArr[0]) && deviceArr[0].entrance;
    const entrance2 = isObject(deviceArr[2]) && deviceArr[2].entrance;

    const controllerSelected = selectedControllers.includes(controllerId);
    const handleSelect = handleSelectFactory(controllerId);

    const detailsLink = getControllerDetailsLink(controller);

    const [deviceStatus, setDeviceStatus] = useState({});
    const [statusLoaded, setStatusLoaded] = useState(false);
    const [connected,    setConnected]    = useState(false);

    useEffect(async() => {
        setStatusLoaded(false);
        try {
            const res = await controllerApi.getAuthStatus(controllerId);
            if(res.status == 200) {
                const body = await res.json();
                setDeviceStatus(body);
                setConnected(true);
            } else {
                throw new Error("controller not connected");
            }
        } catch(e) {
            setConnected(false);
        }
        setStatusLoaded(true);
    }, [controller]) // whenever controller changes (during refresh, run this)

    return (
        <TableRow
            hover
            key={controllerId}
            selected={controllerSelected}
        >
            <TableCell padding="checkbox">
                <Checkbox
                    checked={controllerSelected}
                    onChange={handleSelect}
                    value={controllerSelected}
                />
            </TableCell>
            <TableCell>
                <NextLink
                    href={ detailsLink }
                    passHref
                >
                    <Link color="inherit">
                        <Typography noWrap>{ controllerName }</Typography>
                    </Link>
                </NextLink>
            </TableCell>
            <TableCell>
                {
                    statusLoaded ? 
                    (connected ? 
                    <CloudQueue color="success" /> :
                    <CloudOff color="error" />) :
                    <CircularProgress size='1rem' />
                }
            </TableCell>
            <TableCell>
                <Typography>{ controllerIP }</Typography>
            </TableCell>
            <TableCell>
                <EntranceComponent entrance={entrance1} />
            </TableCell>
            <TableCell>
                <EntranceComponent entrance={entrance2} />
            </TableCell>
            <TableCell>
                {
                    statusLoaded ? 
                    (deviceArr.map((device, i) => (
                        <Circle
                            key={device?.authDeviceId}
                            color={
                                (deviceStatus[authDeviceKeys[i]] && connected) ? 
                                    "success" :
                                    ((device?.lastOnline) ?
                                        "error":
                                        "disabled")
                            }
                        />
                    ))) :
                    <CircularProgress size='1rem' />
                }
            </TableCell>
            <TableCell>
                    { toDisplayDateString(created) }
            </TableCell>
            <TableCell>
                <NextLink
                    href={ getControllerEditLink(controller) }
                    passHref
                >
                    <IconButton component="a">
                        <PencilAlt fontSize="small" />
                    </IconButton>
                </NextLink>
                <NextLink
                    href={ detailsLink }
                    passHref
                >
                    <IconButton component="a">
                        <ArrowRight fontSize="small" />
                    </IconButton>
                </NextLink>
            </TableCell>
        </TableRow>
    )
}
export default ControllerRow;