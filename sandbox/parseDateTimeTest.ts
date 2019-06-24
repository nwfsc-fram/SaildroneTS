import * as moment from 'moment-timezone';

let dtStr1 = "06-JUN-2019 08:22:34";
let dtStr2 = "06-JUN-2019 22:34"; //"91.21";
let dtStr3 = 2.3;
let dtStr4 = -2.3;

let dt1 = moment.tz(dtStr1, "DD-MMM-YYYY HH:mm:ss", true, "UTC").add(1, "minutes");
let dt2 = moment.tz(dtStr2, "DD-MMM-YYYY HH:mm:ss", true, "UTC").add(1, "minutes");
let dt3 = moment.tz(dtStr3, "DD-MMM-YYYY HH:mm:ss", true, "UTC").add(1, "minutes");
let dt4 = moment.tz(dtStr4, "DD-MMM-YYYY HH:mm:ss", true, "UTC").add(1, "minutes");


function letterCheck(word) {
    return (/[A-z]{3}/g).test(word);
    // return /^[a-z]+$/i.test(word);
}

console.info(`dt1 = ${dt1}, isValid: ${dt1.isValid()}, letterCheck: ${letterCheck(dtStr1)}`);
console.info(`dt2 = ${dt2}, isValid: ${dt2.isValid()}, letterCheck: ${letterCheck(dtStr2)}`);
console.info(`dt3 = ${dt3}, isValid: ${dt3.isValid()}, letterCheck: ${letterCheck(dtStr3)}`);
console.info(`dt4 = ${dt4}, isValid: ${dt4.isValid()}, letterCheck: ${letterCheck(dtStr4)}`);
