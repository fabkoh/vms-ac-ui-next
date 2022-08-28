import { filterByState, isObject, stringIn } from "./utils";

const personListLink = '/dashboard/persons';
const getPersonsEditLink = (persons) => (
    `/dashboard/persons/edit?ids=${encodeURIComponent(JSON.stringify(persons.filter(isObject).map(p => p.personId)))}`
);
const getPersonIdsEditLink = (ids) => (
  '/dashboard/persons/edit?ids=' + encodeURIComponent(JSON.stringify(ids))
);

const getPersonName = (person) => isObject(person) && (
                                                        (person.personFirstName ? person.personFirstName + " " : "") +
                                                        (person.personLastName ? person.personLastName : "")
                                                      );

const getPersonDetailsLink = (person) => isObject(person) && ('/dashboard/persons/details/' + person.personId)

const stringFilterHelper = (person, query) => (
  query === "" ||
  stringIn(query, getPersonName(person)) ||
  stringIn(query, person.personUid) ||
  stringIn(query, person.personMobileNumber) ||
  stringIn(query, person.personEmail)
)

const credentialFilterHelper = (person, query) => {
  if(stringFilterHelper(person,query)) return true;
  const cardCredentials = person.cardCredentials;
  return Array.isArray(cardCredentials) && cardCredentials.map(s => s && s.toLowerCase()).some(s => stringIn(query, s));
}

const filterPersonByString = (person, queryString) => stringFilterHelper(person, queryString.toLowerCase());
const filterPersonByCredential = (person, queryString) => credentialFilterHelper(person, queryString.toLowerCase());

const filterPersonsByString = (persons, queryString) => {
  const query = queryString.toLowerCase();
  return persons.filter(p => stringFilterHelper(p, query));
}

const filterPersonByStringPlaceholder = "Search for person name, uid, mobile number or email";

const filterPersonByAccessGroupName = (person, accessGroupName) => accessGroupName == null || (isObject(person) && isObject(person.accessGroup) && person.accessGroup.accessGroupName === accessGroupName);

const personCreateLink = "/dashboard/persons/create";

const filterPersonsByState = filterByState(filterPersonsByString);

const isPersonEqual = (p1, p2) => isObject(p1) && isObject(p2) && p1.personId != null && p1.personId == p2.personId

export { personListLink, getPersonsEditLink, getPersonName, getPersonDetailsLink, filterPersonByString, filterPersonsByString, filterPersonByStringPlaceholder, filterPersonByAccessGroupName, personCreateLink, getPersonIdsEditLink, filterPersonsByState, isPersonEqual, filterPersonByCredential }