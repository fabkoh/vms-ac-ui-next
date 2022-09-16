import Warning from "@mui/icons-material/Warning";
import { Card, useMediaQuery, CardHeader, Divider } from "@mui/material";
import { PropertyList } from "../../../property-list";
import { PropertyListItem } from "../../../property-list-item";
import { SeverityPill } from "../../../severity-pill";
import BasicDetailsCard from "../../shared/basic-details-card";
import { Circle } from "@mui/icons-material";

export const AccessGroupBasicDetails = (props) => {
    console.log(props.accessGroup, "accessGroup")
    const { accessGroupName, accessGroupDesc, isActive, isInSchedule } = props.accessGroup;
    
    // copied from template
    const mdUp = useMediaQuery ((theme) => theme.breakpoints.up('md'));
    const align = mdUp ? 'horizontal' : 'vertical';

    return(
        <BasicDetailsCard>
            <PropertyList>
                <PropertyListItem
                    align={align}
                    divider
                    label="Name"
                    value={accessGroupName}
                />
                <PropertyListItem
                    align={align}
                    divider
                    label="Description"
                    value={accessGroupDesc}
                >
                    {
                        // if no accessGroupDesc, render warning
                        !accessGroupDesc && (
                            <SeverityPill color="warning">
                                <Warning 
                                    fontSize="small" 
                                    sx={{ mr: 1 }}
                                />
                                No descriptions
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
                                NOT ACTIVE
                            </SeverityPill>
                        ) || (
                            <SeverityPill color="success">
                                ACTIVE
                            </SeverityPill>
                        )
                    }
                </PropertyListItem>
                <PropertyListItem
                    align={align}
                    divider
                    label="In Schedule"
                    value={isInSchedule && isActive ? "Yes" : "No"}
                >
                </PropertyListItem>
            </PropertyList>
        </BasicDetailsCard>
    )
}