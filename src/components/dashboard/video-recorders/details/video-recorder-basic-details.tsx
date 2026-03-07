import Warning from "@mui/icons-material/Warning";
import { Card, useMediaQuery, CardHeader, Divider, CircularProgress } from "@mui/material";
import { isObject, toDisplayDateString } from "../../../../utils/utils";
import { PropertyList } from "../../../property-list";
import { PropertyListItem } from "../../../property-list-item";
import { SeverityPill } from "../../../severity-pill";
import BasicDetailsCardNoCollapse from "../../shared/basic-no-collapse";

export const VideoRecorderBasicDetails = ({count,recorder}) => {
    const mdUp  = useMediaQuery ((theme) => theme.breakpoints.up('md'));
    const align = mdUp ? 'horizontal' : 'vertical';
    
    return(
        <BasicDetailsCardNoCollapse>
            <PropertyList>
                <PropertyListItem
                    align={align}
                    divider
                    label="Name"
                    value={(recorder) ? recorder.recorderName : <CircularProgress size='1rem'/>}
                />
                <PropertyListItem
                    align={align}
                    divider
                    label="Public IP Address"
                    value={(recorder) ? recorder.recorderPublicIp : <CircularProgress size='1rem'/>}
                />
                <PropertyListItem
                    align={align}
                    divider
                    label="Private IP Address"
                    value={(recorder) ? recorder.recorderPrivateIp : <CircularProgress size='1rem'/>}
                />
                {/* <PropertyListItem
                    align={align}
                    divider
                    label="uPnP enabled"
                    value={(recorder) ? recorder.autoPortForwarding
                            ? <SeverityPill color="success" style={{color: 'transparent'}}>_.</SeverityPill>
                            : <SeverityPill color="error" style={{color: 'transparent'}}>_.</SeverityPill> 
                        : <CircularProgress size='1rem'/>}
                /> */}
                <PropertyListItem
                    align={align}
                    divider
                    label="Model"
                    value={(recorder && "model" in recorder) ? recorder.model : <CircularProgress size='1rem'/>}
                />
                <PropertyListItem
                    align={align}
                    divider
                    label="Serial No."
                    value={(recorder) ? recorder.recorderSerialNumber : <CircularProgress size='1rem'/>}
                />

                <PropertyListItem
                    align={align}
                    divider
                    label="Channels"
                    value={(recorder && "cameras" in recorder) ? count : <CircularProgress size='1rem'/>}
                />
                
                <PropertyListItem
                    align={align}
                    divider
                    label="Recorder Status"
                    value={(recorder && "cameras" in recorder) 
                        ? <SeverityPill color="success" style={{color: 'transparent'}}>_.</SeverityPill> 
                        : <SeverityPill color="error" style={{color: 'transparent'}}>_.</SeverityPill>}
                >
                </PropertyListItem>
                <PropertyListItem
                    align={align}
                    divider
                    label="Created"
                    value={(recorder) ? toDisplayDateString(recorder.created) : <CircularProgress size='1rem'/>}
                />

                {/* <PropertyListItem
                    align={align}
                    divider
                    label="Alarm Status"
                    value={(recorder) ? <SeverityPill color="success" style={{color: 'transparent'}}>_.</SeverityPill> : <CircularProgress size='1rem'/>}
                >
                </PropertyListItem> */}
            </PropertyList>
        </BasicDetailsCardNoCollapse>
    )
}