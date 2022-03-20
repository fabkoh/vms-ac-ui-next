import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Card, CardHeader, Collapse, Divider } from "@mui/material";
import ExpandMore from "./expand-more";
import { useState } from "react";

const BasicDetailsCard = ({ children, title="Basic Details", subtitle }) => {

    const [expanded, setExpanded] = useState(true);
    const handleExpandClick = () => setExpanded(!expanded);

    return (
        <Card>
            <CardHeader
                title={title}
                subtitle={subtitle}
                avatar={
                    <ExpandMore
                        expand={expanded}
                        onClick={handleExpandClick}
                    >
                        <ExpandMoreIcon />
                    </ExpandMore>
                }
            />
            <Collapse in={expanded}>
                <Divider />
                { children }
            </Collapse>
        </Card>
    )
}

export default BasicDetailsCard;