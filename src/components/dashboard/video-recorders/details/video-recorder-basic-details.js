import Warning from "@mui/icons-material/Warning";
import { Card, useMediaQuery, CardHeader, Divider, CircularProgress } from "@mui/material";
import { isObject, toDisplayDateString } from "../../../../utils/utils";
import { PropertyList } from "../../../property-list";
import { PropertyListItem } from "../../../property-list-item";
import { SeverityPill } from "../../../severity-pill";
import BasicDetailsCardNoCollapse from "../../shared/basic-no-collapse";

export const VideoRecorderBasicDetails = ({recorder}) => {
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
                    label="IP Address"
                    value={(recorder) ? recorder.recorderIpAddress : <CircularProgress size='1rem'/>}
                />
                <PropertyListItem
                    align={align}
                    divider
                    label="Model"
                    value={(recorder) ? recorder.model : <CircularProgress size='1rem'/>}
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
                    value={(recorder) ? recorder.recorderChannels.length : <CircularProgress size='1rem'/>}
                />
                
                <PropertyListItem
                    align={align}
                    divider
                    label="Camera Status"
                    value={(recorder) ? <SeverityPill color="success" style={{color: 'transparent'}}>_.</SeverityPill> : <CircularProgress size='1rem'/>}
                >
                </PropertyListItem>

                <PropertyListItem
                    align={align}
                    divider
                    label="Alarm Status"
                    value={(recorder) ? <SeverityPill color="success" style={{color: 'transparent'}}>_.</SeverityPill> : <CircularProgress size='1rem'/>}
                >
                </PropertyListItem>
            </PropertyList>
        </BasicDetailsCardNoCollapse>
    )
}