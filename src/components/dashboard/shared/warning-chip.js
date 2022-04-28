import { Warning } from "@mui/icons-material";
import { SeverityPill } from "../../severity-pill";

export default function WarningChip({ text, ...props }) {
    return(
        <SeverityPill color="warning" { ...props }>
            <Warning fontSize="small" sx={{ mr: 1 }} />
            { text }    
        </SeverityPill>
    )
}