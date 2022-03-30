import { isObject, stringIn } from "./utils";

const personListLink = '/dashboard/persons';
const getPersonsEditLink = (persons) => (
    `/dashboard/persons/edit?ids=${encodeURIComponent(JSON.stringify(persons.filter(isObject).map(p => p.personId)))}`
);

const getPersonName = (person) => isObject(person) && (
                                                        (person.personFirstName ? person.personFirstName + " " : "") +
                                                        (person.personLastName ? person.personLastName : "")
                                                      );

const getPersonDetailsLink = (person) => isObject(person) && ('/dashboard/persons/details' + person.personId)

const stringFilterHelper = (person, query) => (
  query === "" ||
  stringIn(query, getPersonName(person)) ||
  stringIn(query, person.personUid) ||
  stringIn(query, person.personMobileNumber) ||
  stringIn(query, person.personEmail)
)

const filterPersonByString = (person, queryString) => stringFilterHelper(person, queryString.toLowerCase());

const filterPersonsByString = (persons, queryString) => {
  const query = queryString.toLowerCase();
  return persons.filter(p => stringFilterHelper(p, query));
}

const filterPersonByStringPlaceholder = "Search for person name, uid, mobile number or email";

export { personListLink, getPersonsEditLink, getPersonName, getPersonDetailsLink, filterPersonByString, filterPersonsByString, filterPersonByStringPlaceholder }