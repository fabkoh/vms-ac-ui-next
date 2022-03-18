import { Person } from "@mui/icons-material";
import DetailsCard from "../../shared/details_card_with_search_field";

export const AccessGroupPersons = (props) => {
    const { persons } = props.accessGroup;

    const getName = (person) => person.personFirstName + ' ' + person.personLastName;

    const getLink = (person) => `/dashboard/persons/details/${person.personId}`

    const personSearch = (persons, inputValue) => {
        const input = inputValue.toLowerCase();
        return persons.filter(p => (
            getName(p).toLowerCase().includes(input)
        ))
    }

    return (
        <DetailsCard
            title="Persons"
            subheader="Click on person name below to go to person details page"
            entities={ persons }
            getLabel={ getName }
            getLink={ getLink }
            emptyLabel="No persons"
            searchFilter={ personSearch } // find a file for this function as it is written multiple times
            placeholder="Search for person name, mobile number or email"
            noneFoundText="No persons found"
            icon={<Person fontSize="small" sx={{mr: 1}} />}
        />
    )
}