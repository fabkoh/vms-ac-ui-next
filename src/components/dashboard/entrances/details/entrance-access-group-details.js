import DetailsCard from "../../shared/details_card_with_search_field"
import MeetingRoom from "@mui/icons-material/MeetingRoom"

export default function AccessGroupDetails({ accessGroups }){
    const getName = (accessGroup) => accessGroup.accessGroupName;
    const getLink = (accessGroup) => `/dashboard/entrances/details/${accessGroup.accessGroupId}`
    const search = (accessGroups, inputValue) => {
        const input = inputValue.toLowerCase();
        return accessGroups.filter(e => (
            e.accessGroupName.toLowerCase().includes(input)
        ));
    }
    return (
        <DetailsCard 
            title="Access Groups"
            subheader="Click on access group name below to go to access group details page"
            entities={ accessGroups }
            getLabel={ getName }
            getLink={ getLink }
            emptyLabel="No access groups"
            searchFilter={ search }
            placeholder="Search for access group name"
            noneFoundText="No access groups found"
            icon={<MeetingRoom fontSize="small" sx={{mr: 1}} />}
        />
    )
}
