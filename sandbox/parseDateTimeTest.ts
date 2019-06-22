import * as moment from 'moment-timezone';

let dtStr1 = "06-JUN-2019 08:22:34";
let dtStr2 = "91.21"
let dtStr3 = 91.21;

let dt1 = moment.tz(dtStr1, "DD-MMM-YYYY HH:mm:ss", "UTC").add(1, "minutes");
let dt2 = moment.tz(dtStr2, "DD-MMM-YYYY HH:mm:ss", "UTC").add(1, "minutes");
let dt3 = moment.tz(dtStr3, "DD-MMM-YYYY HH:mm:ss", "UTC").add(1, "minutes");

console.info(`dt1 = ${dt1}, isValid: ${dt1.isValid()}, parseFloat: ${!parseFloat(dtStr1)}`);
console.info(`dt2 = ${dt2}, isValid: ${dt2.isValid()}, parseFloat: ${!parseFloat(dtStr2)}`);
console.info(`dt3 = ${dt3}, isValid: ${dt3.isValid()}, parseFloat: ${!parseFloat(dtStr3)}`);
