const isObject = (e) => typeof e === 'object' && e !== null

// converts filter by string to filter by state (uses state.inputValue)
const filterByState = (filterFunction) => (v, state) => filterFunction(v, state.inputValue);

// obj can be anything, case insensitive search
const stringIn = (s, obj) => typeof(obj) === 'string' && obj.toLowerCase().includes(s);

export { isObject, filterByState, stringIn }