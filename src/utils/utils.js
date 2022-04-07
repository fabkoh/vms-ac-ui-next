const isObject = (e) => typeof e === 'object' && e !== null

// converts filter by string to filter by state (uses state.inputValue)
const filterByState = (filterFunction) => (v, state) => filterFunction(v, state.inputValue);

// obj can be anything, case insensitive search
const stringIn = (s, obj) => typeof(obj) === 'string' && obj.toLowerCase().includes(s);

// compares arr1 and arr2 contents
const arraySameContents = (arr1, arr2) => {
    if (arr1.length != arr2.length) {
        return false;
    }

    const arr1Obj = {};
    arr1.forEach(i => arr1Obj[i] == true);
    
    return arr2.every(i => arr1Obj[i]);
}

export { isObject, filterByState, stringIn, arraySameContents }