import DetailsCard from "../../shared/details-card-with-search-field"
import { LockClosed } from '../../../../icons/lock-closed';
import { filterAccessGroupByStringPlaceholder, filterAccessGroupsByString, getAccessGroupDetailsLink, getAccessGroupLabel } from "../../../../utils/access-group";

export default function AccessGroupDetails({ accessGroupEntrance }){
    return (
        <DetailsCard 
            title="Access Groups"
            subheader="Click on access group name below to go to access group details page"
            entities={ accessGroupEntrance.map(entranceGroup => entranceGroup.accessGroup) }
            getLabel={ getAccessGroupLabel }
            getLink={ getAccessGroupDetailsLink }
            emptyLabel="No access groups"
            searchFilter={ filterAccessGroupsByString }
            placeholder={ filterAccessGroupByStringPlaceholder }
            noneFoundText="No access groups found"
            icon={<LockClosed fontSize="small" sx={{mr: 1}} />}
        />
    )
}
