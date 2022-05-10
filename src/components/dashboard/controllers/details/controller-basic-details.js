import Warning from "@mui/icons-material/Warning";
import { Card, useMediaQuery, CardHeader, Divider, CircularProgress } from "@mui/material";
import { PropertyList } from "../../../property-list";
import { PropertyListItem } from "../../../property-list-item";
import { SeverityPill } from "../../../severity-pill";

export const ControllerBasicDetails = ({controller,authStatus,statusLoaded}) => {
    // const { 
    //     controllerName, 
    //     controllerIP, 
    //     controllerMAC,
    //     controllerSerialNo, 
    //     lastOnline,
    //     firstOnline,
    //     //status?
    // } = controller;
    // const {controller:{controllerName}} = props
    // console.log("controllerName",controller.controllerName)
    // const controller = {
    //     "controllerId":1,
    //     "controllerName":"Controller_DefaultMAC1",
    //     "controllerIpStatic":false,
    //     "controllerIP":"192.168.1.1",
    //     "controllerMAC":"495162159654",
    //     "controllerSerialNo":"5e86805e2bafd54f66cc95c3",
    //     "firstOnline":"2022-18-04    09:52:23",
    //     "pinAssignmentConfig":"",
    //     "settingsConfig":"",
    //     "lastOnline":"2022-18-04    09:52:23",
    // }
    // console.log("controller",controller)
    // copied from template
    const mdUp = useMediaQuery ((theme) => theme.breakpoints.up('md'));
    const align = mdUp ? 'horizontal' : 'vertical';
    // const statusArr= true //returns true if status is successfully fetched. null if disconnected
    // const statusArr= authStatus==null//returns true if status is successfully fetched. null if disconnected
    // const statusArr= Array.isArray(E1Status)&&Array.isArray(E2Status) //returns true if status is successfully fetched. null if disconnected
    // console.log("statusArr",statusArr)
    
    
    return(
        <Card>
            <CardHeader title="Basic Details" />
            <Divider />
            <PropertyList>
                <PropertyListItem
                    align={align}
                    divider
                    label="Name"
                    // value={controllerName}
                    value={controller?.controllerName}
                />
                <PropertyListItem
                    align={align}
                    divider
                    label="Controller IP"
                    // value={controllerIP}
                    value={controller?.controllerIP}
                />
                <PropertyListItem
                    align={align}
                    divider
                    label="Controller MAC"
                    value={controller?.controllerMAC}
                    // value={controllerMAC}
                />
                <PropertyListItem
                    align={align}
                    divider
                    label="Controller Serial"
                    value={controller?.controllerSerialNo}
                    // value={controllerSerialNo}
                />
                <PropertyListItem
                    align={align}
                    divider
                    label="Last Online"
                    value={controller?.lastOnline}
                    // value={lastOnline}
                />
                <PropertyListItem
                    align={align}
                    divider
                    label="Status"
                    value={statusLoaded?
                        (authStatus?(<SeverityPill color="success">Connected</SeverityPill>):(<SeverityPill color="error">Disconnected</SeverityPill>)):
                        (<CircularProgress size='1rem'/>)
                    } //needs another api to check status
                    // value={<SeverityPill color="success"> test</SeverityPill>} //needs another api to check status
                >
                {/* {(E1Status.length==0&&E2Status.length==0)?(
                    <SeverityPill color="error">
                    <Warning fontSize="small" sx={{mr:1}}/>
                    disconnected 
                    </SeverityPill>):(<SeverityPill color="success"> connected</SeverityPill>)} */}
                </PropertyListItem>
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