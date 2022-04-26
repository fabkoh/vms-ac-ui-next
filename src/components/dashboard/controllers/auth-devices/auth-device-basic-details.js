import { MeetingRoom } from "@mui/icons-material";
import Warning from "@mui/icons-material/Warning";
import { Card, useMediaQuery, CardHeader, Divider, Switch, Chip } from "@mui/material";
import { useEffect, useState } from "react";
import { PropertyList } from "../../../property-list";
import { PropertyListItem } from "../../../property-list-item";
import { SeverityPill } from "../../../severity-pill";

export const AuthDeviceBasicDetails = (props) => {
    // const { 
    //     controllerName, 
    //     controllerIP, 
    //     controllerMAC,
    //     controllerSerialNo, 
    //     lastOnline,
    //     firstOnline,
    //     //status?
    // } = controller;
    // console.log("controllerName",controller.controllerName)
    const {deviceInfo} = props
    // const [device, setDevice] = useState(null)
    // useEffect(() => {   
    //     setDevice(deviceInfo)
    //     console.log("device",device)
    // }, [deviceInfo])
    
    console.log("deviceinfo",deviceInfo)
    // copied from template
    const mdUp = useMediaQuery ((theme) => theme.breakpoints.up('md'));
    const align = mdUp ? 'horizontal' : 'vertical';
    
    return(
        <Card>
            <CardHeader title="Basic Details" />
            <Divider />
            <PropertyList>
                <PropertyListItem
                    align={align}
                    divider
                    label="Name"
                    // value={deviceInfo.authDeviceName}
                    // value={controller.controllerName}
                />
                <PropertyListItem
                    align={align}
                    divider
                    label="Direction"
                    // value={deviceInfo.authDeviceDirection}
                    // value={controller.controllerIP}
                />
                <PropertyListItem
                    align={align}
                    divider
                    label="Status"
                    // value={controller.controllerMAC}
                    value={<Chip color="success" label="connected" />}
                />
                <PropertyListItem
                    align={align}
                    divider
                    label="Last Online"
                    // value={deviceInfo.lastOnline}
                    // value={controllerMAC}
                />
                <PropertyListItem
                    align={align}
                    divider
                    label="Masterpin"
                    // value={<Switch checked={deviceInfo.masterpin} size="small" ></Switch>}
                    // value={controllerSerialNo}
                />
                <PropertyListItem
                    align={align}
                    divider
                    label="Entrance"
                    // value={<Chip icon={<MeetingRoom/>} label={deviceInfo.entrance.entranceName}></Chip>}
                    // value={lastOnline}
                />
                {/* <PropertyListItem
                    align={align}
                    divider
                    label="Status"
                    value={"test"} //needs another api to check status
                >
                {<SeverityPill color="error">
                    <Warning fontSize="small" sx={{mr:1}}/>
                    test disconnected 
                    </SeverityPill>}
                </PropertyListItem> */}
                {/* <PropertyListItem
                    align={align}
                    divider
                    label="Description"
                    value={entranceDesc}
                >
                    {
                        // if no entranceDesc, render warning
                        !entranceDesc && (
                            <SeverityPill color="warning">
                                <Warning 
                                    fontSize="small" 
                                    sx={{ mr: 1 }}
                                />
                                No description
                            </SeverityPill>
                        )
                    }
                </PropertyListItem>
                <PropertyListItem
                    align={align}
                    divider
                    label="Status"
                    value={isActive}
                >
                    {
                        !isActive && (
                            <SeverityPill color="error">
                                UNLOCKED
                            </SeverityPill>
                        ) || (
                            <SeverityPill color="success">
                                ACTIVE
                            </SeverityPill>
                        )
                    }
                </PropertyListItem> */}
            </PropertyList>
        </Card>
    )
}