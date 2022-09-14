export default function rruleDescription(rruleObj, timeStart, timeEnd) {
    // returns '1 time on {Date} from {timeStart} to {timeEnd}' when count == 1
    // returns 'Every month on the {num} {day} from {timeStart} to {timeEnd}, starting {startDate}' when setPos is set
    // appends ' from {timeStart} to {timeEnd}, starting {startDate}' for all other rules

    if (rruleObj == undefined) {
        return "Please select start date below";
    }

    const rruleOptions = rruleObj.origOptions;
    
    // return 'Please select start date' if start date not in object
    if (rruleOptions.dtstart == null) {
        return 'Please select start date below';
    }

    const dateString = rruleOptions.dtstart.toLocaleDateString("en-US", {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // return '1 time on {Date} from {timeStart} to {timeEnd} when count == 1
    if (rruleOptions.count == 1) {
        return `1 time on ${dateString}` + getTime(timeStart, timeEnd);
    }

    return capitalize(getDescription(rruleObj) + getTime(timeStart, timeEnd) + `, starting ${dateString}`)
}

const getDescription = (rruleObj) => {
    const rruleText = rruleObj.toText();
    const rruleOptions = rruleObj.origOptions;
    // if setPos, add pos to day
    if (Array.isArray(rruleOptions.bysetpos) && rruleOptions.bysetpos.length == 1) {
        const index = rruleText.indexOf(' on ')
        return (
            rruleText.substring(0, index + 3) + // on 
            ' the ' + numberText(rruleOptions.bysetpos[0]) + // the {number}
            rruleText.substring(index + 3) // rest of string
        );
    }

    return rruleText;
};

const numberText = (n) => {
    if (n == 1) return '1st';
    if (n == 2) return '2nd';
    if (n == 3) return '3rd';
    return `${n}th`
}

const getTime = (timeStart, timeEnd) => {
    if (timeStart == undefined || timeEnd == undefined) {
        return ""
    }
    if ( timeStart == "00:00" && timeEnd == "24:00"){
        return ` (All Day) `
    }

    return ` from ${time(timeStart)} to ${time(timeEnd)}`
};

const time = (timeString) => {
    const num = Number(timeString.substring(0, 2));
    const rest = timeString.substring(2);

    if (timeString == "24:00") {
        return "End of Day"
    }

    if (num == 0) {
        return '12' + rest + ' am'
    }

    if (num <= 11) {
        return timeString + ' am'
    }

    if (num == 12) {
        return '12' + rest + ' pm'
    }

    const numString = String(num-12);
    if (num <= 21) {
        return '0' + numString + rest + ' pm'
    }

    return numString + rest + ' pm'
}

const capitalize = (s) => {
    if (s.length == 0) return "";
    return s.charAt(0).toUpperCase() + s.substring(1);
}

export function rruleDescriptionWithBr(rruleObj, timeStart, timeEnd) {
    // returns '1 time on {Date} from {timeStart} to {timeEnd}' when count == 1
    // returns 'Every month on the {num} {day} from {timeStart} to {timeEnd}, starting {startDate}' when setPos is set
    // appends ' from {timeStart} to {timeEnd}, starting {startDate}' for all other rules

    if (rruleObj == undefined) {
        return "Please select start date below";
    }

    const rruleOptions = rruleObj.origOptions;
    
    // return 'Please select start date' if start date not in object
    if (rruleOptions.dtstart == null) {
        return 'Please select start date below';
    }

    const dateString = rruleOptions.dtstart.toLocaleDateString("en-US", {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // return '1 time on {Date} from {timeStart} to {timeEnd} when count == 1
    if (rruleOptions.count == 1) {
        return `1 time on ${dateString}` + getTime(timeStart, timeEnd);
    }

    return (
    
    <div>
        <div>{capitalize(getDescription(rruleObj) + getTime(timeStart, timeEnd)) }</div>
        <div>{`starting ${dateString}` }</div>
    </div>)
}