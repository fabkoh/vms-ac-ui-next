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

// default URL (see getControllerDetailsLink in ./controller)
const DEFAULT_URL = '/dashboard';

const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov' , 'Dec'];
// takes in a raw date string eg 2022-05-06T13:09:14.372126 and converts to display date string eg 6 May 2022 13:09:14
const toDisplayDateString = (str) => {
    return (
        str.slice(8, 10) + ' ' +
        months[Number(str.slice(5, 7))] + ' ' +
        str.slice(0, 4) + ' ' +
        str.slice(11, 19)
    );
};
// takes in a raw date string eg 05-30-2022T13:09:14.372126 and converts to display date string eg 6 May 2022 13:09:14
const toDisplayEventsDateString = (str) => {
    return (
        str.slice(3, 5) + ' ' +
        months[Number(str.slice(0, 2))] + ' ' +
        str.slice(6, 10) + ' ' +
        str.slice(11, 19)
    );
};

export { isObject, filterByState, stringIn, arraySameContents, DEFAULT_URL, toDisplayDateString,toDisplayEventsDateString }