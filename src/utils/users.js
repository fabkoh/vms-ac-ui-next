import { filterByState, isObject, stringIn } from "./utils";

const userCreateLink = '/dashboard/settings/users/create';
const accountLink = '/dashboard/settings/account';


const stringFilterHelper = (user, query) => (
  query === "" ||
  stringIn(query, user.firstName) ||
  stringIn(query, user.lastName) ||
  stringIn(query, user.role) ||
  stringIn(query, user.email) ||
  stringIn(query, user.mobile)
)

const filterUserByString = (user, queryString) => stringFilterHelper(user, queryString.toLowerCase());

const filterUsersByString = (users, queryString) => {
  const query = queryString.toLowerCase();
  return users.filter(p => stringFilterHelper(p, query));
}


export {userCreateLink, filterUserByString, filterUsersByString, accountLink}