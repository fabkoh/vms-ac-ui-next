import DetailsCard from "../../shared/details_card_with_search_field"
import { LockClosed } from '../../../../icons/lock-closed';

const getName = (accessGroup) => accessGroup.accessGroupName;
const getLink = (accessGroup) => `/dashboard/access-groups/details/${accessGroup.accessGroupId}`
const search = (accessGroups, inputValue) => {
    const input = inputValue.toLowerCase();
    return accessGroups.filter(e => (
        e.accessGroupName.toLowerCase().includes(input)
    ));
}

export default function AccessGroupDetails({ accessGroupEntrance }){
    return (
        <DetailsCard 
            title="Access Groups"
            subheader="Click on access group name below to go to access group details page"
            entities={ accessGroupEntrance.map(entranceGroup => entranceGroup.accessGroup) }
            getLabel={ getName }
            getLink={ getLink }
            emptyLabel="No access groups"
            searchFilter={ search }
            placeholder="Search for access group name"
            noneFoundText="No access groups found"
            icon={<LockClosed fontSize="small" sx={{mr: 1}} />}
        />
    )
}
