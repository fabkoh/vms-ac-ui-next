import Warning from "@mui/icons-material/Warning";
import { Card, useMediaQuery, CardHeader, Divider } from "@mui/material";
import { PropertyList } from "../../../property-list";
import { PropertyListItem } from "../../../property-list-item";
import { SeverityPill } from "../../../severity-pill";

export const EntranceBasicDetails = (props) => {
    const { entranceName, entranceDesc, isActive } = props.entrance;
    
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
                    value={entranceName}
                />
                <PropertyListItem
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
                   // value={isActive}
                >
                    {
                        isActive && (
                            <SeverityPill color="success">
                                <Warning 
                                    fontSize="small" 
                                    sx={{ mr: 1 }}
                                />
                                ACTIVE
                            </SeverityPill>
                        ),

                        !isActive && (
                            <SeverityPill color="error">
                                <Warning 
                                    fontSize="small" 
                                    sx={{ mr: 1 }}
                                />
                                UNLOCKED
                            </SeverityPill>
                        )
                    }
                </PropertyListItem>
            </PropertyList>
        </Card>
    )
}