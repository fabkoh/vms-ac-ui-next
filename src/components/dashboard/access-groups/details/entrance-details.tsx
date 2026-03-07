import DetailsCard from "../../shared/details-card-with-search-field";
import MeetingRoom from "@mui/icons-material/MeetingRoom";
import { getEntranceLabel, getEntranceDetailsLink, filterEntrancesByString, filterEntranceByStringPlaceholder } from "../../../../utils/entrance";

export default function EntranceDetails({ accessGroupEntrance }){
    return (
        <DetailsCard 
            title="Entrances"
            subheader="Click on entrance below to go to entrance details page"
            entities={ accessGroupEntrance.map(groupEntrance => groupEntrance.entrance) }
            getLabel={ getEntranceLabel }
            getLink={ getEntranceDetailsLink }
            emptyLabel="No entrances"
            searchFilter={ filterEntrancesByString }
            placeholder={ filterEntranceByStringPlaceholder }
            noneFoundText="No entrances found"
            icon={<MeetingRoom fontSize="small" sx={{mr: 1}} />}
        />
    )
}
