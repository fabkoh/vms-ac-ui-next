import DetailsCard from "../../shared/details_card_with_search_field"
import MeetingRoom from "@mui/icons-material/MeetingRoom"

const getName = (entrance) => entrance.entranceName;
const getLink = (entrance) => `/dashboard/entrances/details/${entrance.entranceId}`
const search = (entrances, inputValue) => {
    const input = inputValue.toLowerCase();
    return entrances.filter(e => (
        e.entranceName.toLowerCase().includes(input)
    ));
}

export default function EntranceDetails({ accessGroupEntrance }){
    return (
        <DetailsCard 
            title="Entrances"
            subheader="Click on entrance below to go to entrance details page"
            entities={ accessGroupEntrance.map(groupEntrance => groupEntrance.entrance) }
            getLabel={ getName }
            getLink={ getLink }
            emptyLabel="No entrances"
            searchFilter={ search }
            placeholder="Search for entrance name"
            noneFoundText="No entrances found"
            icon={<MeetingRoom fontSize="small" sx={{mr: 1}} />}
        />
    )
}
