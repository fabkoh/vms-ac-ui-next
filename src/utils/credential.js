const formatString = (num, length) => {
    // prepends zeros the the number
    const numString = num.toString();
    const numZeros = length - numString.length;
    if (numZeros > 0) {
        return '0'.repeat(numZeros) + numString;
    }
    return numString;
}


const toDateInputString = (date) => {
    if (date == null) { return ''; }
    return formatString(date.getFullYear(), 4) + '-' + formatString(date.getMonth() + 1, 2) + '-' + formatString(date.getDate(), 2);
}

export { toDateInputString }