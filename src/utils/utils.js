import { parsePhoneNumberWithError, ParseError } from 'libphonenumber-js'

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

const toDisplayDate = (d) => {
    if (isNaN(d)) {
        return "No time specified";
    }
    let datestring = d.getDate()  + " " + (months[d.getMonth()+1]) + " " + d.getFullYear() + " ";
    if (d.getHours() < 10) {
        datestring += "0" + d.getHours();
    } else {
        datestring += d.getHours();
    }
    datestring += ":";
    if (d.getMinutes() < 10) {
        datestring += "0" + d.getMinutes();
    } else {
        datestring += d.getMinutes();
    }
    return datestring;
};

// takes in a raw date string eg 05-30-2022T13:09:14.372126 and converts to display date string eg 6 May 2022 13:09:14
const toDisplayEventsDateString = (str) => {
    return (
        str.slice(3, 5) + ' ' +
        months[Number(str.slice(0, 2))] + ' ' +
        str.slice(6, 10) + ' ' +
        str.slice(11, 19))

};

// return some object if valid, else return null
const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

const validatePhoneNumber = (phoneNumber) => {
    try {
        const possiblePhoneNumber = parsePhoneNumberWithError(phoneNumber);
        console.log(phoneNumber);
        console.log("possible Phone number", possiblePhoneNumber.isValid());
        return { isValid: possiblePhoneNumber.isValid(), errorMessage: null };
    } catch (error) {
        if (error instanceof ParseError) {
            console.log(error.message);
            let detailedErrorMessage;
            switch (error.message) {
                case 'NOT_A_NUMBER':
                    detailedErrorMessage = 'the input has to be a number.';
                    break;
                case 'INVALID_COUNTRY':
                    detailedErrorMessage = 'the country code is missing, invalid or not supported. e.g. +65 912345678';
                    break;
                case 'TOO_SHORT':
                    detailedErrorMessage = 'the phone number is too short.';
                    break;
                case 'TOO_LONG':
                    detailedErrorMessage = 'the phone number is too long.';
                    break;
                default:
                    detailedErrorMessage = 'invalid phone number.';
            }
            return { isValid: false, errorMessage: detailedErrorMessage };
        } else {
            // Re-throw other unexpected errors
            throw error;
        }
    }
};

export { isObject, filterByState, stringIn, arraySameContents, DEFAULT_URL, toDisplayDate, toDisplayDateString,toDisplayEventsDateString, validateEmail, validatePhoneNumber }

