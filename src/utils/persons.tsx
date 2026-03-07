import { filterByState, isObject, stringIn } from "./utils";

const personListLink = "/dashboard/persons";
const getPersonsEditLink = (persons) =>
  `/dashboard/persons/edit?ids=${encodeURIComponent(
    JSON.stringify(persons.filter(isObject).map((p) => p.personId))
  )}`;
const getPersonIdsEditLink = (ids) =>
  "/dashboard/persons/edit?ids=" + encodeURIComponent(JSON.stringify(ids));

const getPersonName = (person) =>
  isObject(person) &&
  (person.personFirstName ? person.personFirstName + " " : "") +
    (person.personLastName ? person.personLastName : "");

const getPersonDetailsLink = (person) =>
  isObject(person) && "/dashboard/persons/details/" + person.personId;

/**
 * Filters a person by a string query with the different fields of the person.
 * 
 * @param {Object} person
 * @param {string} query
 * @returns {boolean} true if the person matches the query, false otherwise
 */
const stringFilterHelper = (person, query) => {
  // remove hyphens from query to allow for searching by mobile number without hyphens, will need a
  // better implementation as this means other fields cannot have hyphens as well
  const queryWithoutHyphens = query.replace(/-/g, '');

  const matchesName = stringIn(query, getPersonName(person));
  const matchesUid = stringIn(query, person.personUid);
  const matchesMobileNumber = person.personMobileNumber && stringIn(queryWithoutHyphens, person.personMobileNumber.replace(/-/g, ''));
  const matchesAccessGroup = person.accessGroup && stringIn(query, person.accessGroup.accessGroupName);
  const matchesEmail = stringIn(query, person.personEmail);

  if (query === "" || matchesName || matchesUid || matchesMobileNumber || matchesAccessGroup || matchesEmail) {
    return true;
  }
  return false;
};
  

const credentialFilterHelper = (person, query) => {
  if (stringFilterHelper(person, query)) return true;
  const cardCredentials = person.cardCredentials;
  return (
    Array.isArray(cardCredentials) &&
    cardCredentials
      .map((s) => s && s.toLowerCase())
      .some((s) => stringIn(query, s))
  );
};

const filterPersonByString = (person, queryString) =>
  stringFilterHelper(person, queryString.toLowerCase());

const filterPersonByCredential = (person, queryString) =>
  credentialFilterHelper(person, queryString.toLowerCase());

const filterPersonsByString = (persons, queryString) => {
  const query = queryString.toLowerCase();
  return persons.filter((p) => stringFilterHelper(p, query));
};

const filterPersonByStringPlaceholder =
  "Search for person name, uid, mobile number or email";

const filterPersonByAccessGroupName = (person, accessGroupName) =>
  accessGroupName == null ||
  (isObject(person) &&
    isObject(person.accessGroup) &&
    person.accessGroup.accessGroupName === accessGroupName);

const personCreateLink = "/dashboard/persons/create";

const filterPersonsByState = filterByState(filterPersonsByString);

const isPersonEqual = (p1, p2) =>
  isObject(p1) &&
  isObject(p2) &&
  p1.personId != null &&
  p1.personId == p2.personId;

const filterPersonByCredentialsPlaceholder = "Search for Owner of Lost Card";

const personLostAndFoundLink = "/dashboard/persons/lost-and-found";

export {
  personListLink,
  getPersonsEditLink,
  getPersonName,
  getPersonDetailsLink,
  filterPersonByString,
  filterPersonsByString,
  filterPersonByStringPlaceholder,
  filterPersonByAccessGroupName,
  personCreateLink,
  getPersonIdsEditLink,
  filterPersonsByState,
  isPersonEqual,
  filterPersonByCredential,
  filterPersonByCredentialsPlaceholder,
  personLostAndFoundLink,
};
