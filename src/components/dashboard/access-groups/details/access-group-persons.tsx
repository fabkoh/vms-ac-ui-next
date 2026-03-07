import { Person } from "@mui/icons-material";
import DetailsCard from "../../shared/details-card-with-search-field";
import { getPersonName, getPersonDetailsLink, filterPersonsByString, filterPersonByStringPlaceholder } from "../../../../utils/persons";

export const AccessGroupPersons = (props) => {
    const { persons } = props.accessGroup;

    return (
        <DetailsCard
            title="Persons"
            subheader="Click on person name below to go to person details page"
            entities={ persons }
            getLabel={ getPersonName }
            getLink={ getPersonDetailsLink }
            emptyLabel="No persons"
            searchFilter={ filterPersonsByString } // find a file for this function as it is written multiple times
            placeholder={filterPersonByStringPlaceholder}
            noneFoundText="No persons found"
            icon={<Person fontSize="small" sx={{mr: 1}} />}
        />
    )
}