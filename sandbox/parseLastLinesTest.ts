import * as path from 'path';
import { existsSync } from 'fs';
import * as moment from 'moment-timezone';
import { getLastStartDateTime } from '../utilities';

export async function parseDataOld(): Promise<moment> { 
    let line, startDate, lineSplit, lineNo: number = 1;

    let masterFilename = '1039_vehicle.csv';
    let masterFullPath = path.join(__dirname, '..\\', 'output', masterFilename);
    if (existsSync(masterFullPath)) {

        try {
            while (lineNo < 3) {

                // line = await getLastLineSync(masterFullPath, 1);
                line = await getLastDateTime(masterFullPath, lineNo);
                if (line !== undefined) {
                    console.info(`line = ${line}, size: ${line.length}`);
                    lineSplit = line.split(",");
                    startDate = moment.tz(lineSplit[2], "DD-MMM-YYYY HH:mm:ss", true, "UTC").add(1, "minutes");
                    if (startDate.isValid()) {
                        startDate = startDate.tz("UTC").format();
                        console.info(`\t\tQuerying since the last time of the last date element using ${lineSplit[2]}`);
                        break;
                    }
                }
                lineNo++;
            }

        } catch (e) {
            startDate = moment.tz("UTC").subtract(30, 'minutes').format();   // subtract minutes from now to start the query
            console.info(`\t\tError in parsing last date/time: ${e}`);
            console.info(`\t\tQuerying the last ${30} minutes`);
        }
    }
    console.info(`startDate = ${startDate}`);
    return startDate
}

export async function parseData() {
    let masterFilename = '1039_vehicle.csv';
    let masterFullPath = path.join(__dirname, '..\\', 'output', masterFilename);
    let startDate = await getLastStartDateTime(masterFullPath);
    console.info(`startDate = ${startDate}, formatted = ${startDate.format()}`);
}

parseData();

let v = moment().tz("UTC").subtract(1, "hours");
console.info(`one hour ago: ${v.format()}`);


// console.info(`startDate = ${startDate}`);

// let testDate = moment.tz("22-Jun-2019 21:05:43", "DD-MMM-YYYY HH:mm:ss", true, "UTC").add(1, "minutes");
// console.info(`testDate = ${testDate} >>> formatted: ${testDate.format()}`);

// let v = "'hello todd'";
// let w = v.replace(/'/g, "");
// console.info(`w = ${w}`);