import { Warning } from "@mui/icons-material";
import { SeverityPill } from "../../severity-pill";

export default function WarningChip({ text }) {
    return(
        <SeverityPill color="warning">
            <Warning fontSize="small" sx={{ mr: 1 }} />
            { text }    
        </SeverityPill>
    )
}