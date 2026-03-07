class FormUtils {

    // infoArr: array of primitives (numbers, strings, boolean)
    // output: object with primitive key set to true
    // returns the items in infoArr that occurs more than once as keys in an object
    getDuplicates(infoArr) {
        const seenBefore = {}; // info seen before
        const ans = {}; // duplicated info
        infoArr.forEach(info => {
            if(seenBefore[info]) {
                ans[info] = true;
            } else {
                seenBefore[info] = true;
            }
        })
        return ans;
    }

    // returns if string is blank
    // ie 
    // returns true if string == ' '
    // returns true if string == ''
    // returns false if string == 'a'
    checkBlank(string) {
        return /^\s*$/.test(string);
    }

    // returns if string is empty space
    // ie
    // returns true if string == ' '
    // returns false if string == ''
    // returns false if string == 'a'
    checkEmpty(string) {
        return /^\s+$/.test(string);
    }

}

const formUtils = new FormUtils();

const createCounterObject = (n) => () => {
    n += 1;
    return n;
}

const getDuplicates = (infoArr) => {
    const seenBefore = {}; // info seen before
    const ans = {}; // duplicated info
    infoArr.forEach(info => {
        if(seenBefore[info]) {
            ans[info] = true;
        } else {
            seenBefore[info] = true;
        }
    })
    return ans;
}

const createNegativeCounterObject = (n) => () => {
    n -= 1;
    return n;
}

export default formUtils;

export { createCounterObject, getDuplicates, createNegativeCounterObject };