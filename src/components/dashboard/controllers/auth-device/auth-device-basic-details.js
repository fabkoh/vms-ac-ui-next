import { Circle, MeetingRoom } from "@mui/icons-material";
import Warning from "@mui/icons-material/Warning";
import { Card, useMediaQuery, CardHeader, Divider, Switch, Chip, CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { getEntranceDetailsLink } from "../../../../utils/entrance";
import { PropertyList } from "../../../property-list";
import { PropertyListItem } from "../../../property-list-item";
import { SeverityPill } from "../../../severity-pill";
import NextLink from 'next/link';
import Link from "next/link";
import { toDisplayDateString } from "../../../../utils/utils";
import WarningChip from "../../shared/warning-chip";
import BasicDetailsCard from "../../shared/basic-details-card";


export const AuthDeviceBasicDetails = ({handleToggleMasterpin,deviceInfo,statusLoaded,authStatus}) => {
    // copied from template
    const mdUp = useMediaQuery ((theme) => theme.breakpoints.up('md'));
    const align = mdUp ? 'horizontal' : 'vertical';
    
    if(deviceInfo == null){
        return null
    }
    else{
    return( 
        <BasicDetailsCard>
            <PropertyList>
                <PropertyListItem
                    align={align}
                    divider
                    label="Name"
                    value={deviceInfo.authDeviceName}
                />
                <PropertyListItem
                    align={align}
                    divider
                    label="Direction"
                    value={deviceInfo.authDeviceDirection}
                />
                <PropertyListItem
                    align={align}
                    divider
                    label="Status"
                    value={		statusLoaded?
                        (<Circle color={deviceInfo.lastOnline?(authStatus?(authStatus[deviceInfo.authDeviceDirection]?"success":"error"):"error"):"disabled"} />):
                        (<CircularProgress size='1rem'/>)
                        } 
                    // value={<Chip color="success" label="fix this eventually" />} // need to pass status here.
                />
                <PropertyListItem
                    align={align}
                    divider
                    label="Last Online"
                    value={	statusLoaded?
                        (authStatus[deviceInfo.authDeviceDirection]?"Online":(deviceInfo.lastOnline?toDisplayDateString(deviceInfo.lastOnline):"Never")):
                    (<CircularProgress size='1rem'/>)}
                    // value={	statusLoaded?
                    //     (authStatus?(authStatus[deviceInfo.authDeviceDirection]?"Online":deviceInfo.lastOnline):(deviceInfo.lastOnline?deviceInfo.lastOnline:"Never")):
                    // (<CircularProgress size='1rem'/>)}
                    // value={deviceInfo?.lastOnline?deviceInfo.lastOnline:"never"}
                    // value={controllerMAC}
                />
                <PropertyListItem
                    align={align}
                    divider
                    label="Masterpin"
                    value={<Switch onClick={(e)=>handleToggleMasterpin(e)} checked={deviceInfo.masterpin} size="small" ></Switch>}
                    // value={controllerSerialNo}
                />
                <PropertyListItem
                    align={align}
                    divider
                    label="Entrance"
                    value={
                        deviceInfo.entrance ? (
                            <NextLink
                                href={getEntranceDetailsLink(deviceInfo.entrance)}
                                passHref
                            >
                                <Link>
                                <Chip icon={<MeetingRoom/>} label={deviceInfo.entrance.entranceName} clickable/>
                                </Link>
                            </NextLink>
                        ) : (
                            <WarningChip text="No entrance assigned"/>
                        )
                        // value={lastOnline}
                    }
                />
                <PropertyListItem
                    align={align}
                    divider
                    label="Default Auth Method"
                    >
                        <div>
                            <Typography
                                color="textSecondary"
                                variant="body2"
                            >
                                {deviceInfo.defaultAuthMethod.authMethodDesc}
                            </Typography>
                            <divider/>
                                <Typography
                                style={{color:'rgb(101, 116, 139)' ,fontSize:'12px'}}
                            >
                                {"Default Auth Method will be used when no auth schedule is detected"}
                            </Typography>
                        </div>
                    </PropertyListItem>
                      

                    
        
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
        </BasicDetailsCard>
    )
            }
}