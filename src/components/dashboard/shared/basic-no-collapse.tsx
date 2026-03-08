import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Card, CardHeader, Collapse, Divider } from "@mui/material";
import ExpandMore from "./expand-more";
import { useState } from "react";

const BasicDetailsCardNoCollapse = ({ children, title="Basic Details", subtitle = undefined }: { children?: any; title?: string; subtitle?: any; }) => {
    return (
        <Card>
            <CardHeader
                title={title}
                subtitle={subtitle}
            />
            
            { children }
        </Card>
    )
}

export default BasicDetailsCardNoCollapse;