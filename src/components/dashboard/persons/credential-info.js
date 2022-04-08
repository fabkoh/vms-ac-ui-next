import { ExpandMore as ExpandMoreIcon } from "@mui/icons-material";
import { Card, CardHeader, Collapse, Divider } from "@mui/material"
import { useState } from "react";
import ExpandMore from "../shared/expand-more";

const PersonCredentials = () => {

    // expand logic
    const [expanded, setExpanded] = useState(true);
    const handleExpandClick = () => setExpanded(!expanded);

    return (
        <Card>
            <CardHeader
                title="Credentials"
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
                
            </Collapse>
        </Card>
    )
}

export default PersonCredentials;