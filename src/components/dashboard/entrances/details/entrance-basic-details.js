import Warning from "@mui/icons-material/Warning";
import {Lock, LockOpen} from "@mui/icons-material";
import { Card, useMediaQuery, CardHeader, Divider, Link, Typography, Chip } from "@mui/material";
import { PropertyList } from "../../../property-list";
import { PropertyListItem } from "../../../property-list-item";
import { SeverityPill } from "../../../severity-pill";
import BasicDetailsCard from "../../shared/basic-details-card";
import WarningChip from "../../shared/warning-chip";
import NextLink from "next/link";
import { getControllerDetailsLink } from "../../../../utils/controller";

export const EntranceBasicDetails = (props) => {
    const { entranceId, entranceName, entranceDesc, isActive, isLocked, thirdPartyOption } = props.entrance;
    const controller = props.entranceController[entranceId];
    
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
                    label="Third Party Option"
                    value={thirdPartyOption}
                />
                <PropertyListItem
                    align={align}
                    divider
                    label="Current"
                    value={isLocked}
                >
                    <Chip
                        label={isLocked ? "LOCKED" : "UNLOCKED"}
                        icon={isLocked ? <Lock /> : <LockOpen />}
                        sx={{
                            fontSize: "12px",
                            fontWeight: 600
                        }}
                        size="small"
                    />
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
                                INACTIVE
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
                    label="Controller"
                    value={
                        controller ? ( // TODO make this into link
                            <NextLink href={getControllerDetailsLink(controller)}
                                passHref>
                                <Link color="inherit">
                                    <Typography noWrap>{ controller.controllerName }</Typography>
                                </Link>
                            </NextLink>
                        ) : (
                            <WarningChip text="No controller" />
                        )
                    }>
                
                </PropertyListItem>
            </PropertyList>
        </BasicDetailsCard>
    )
}