import { writeFileSync, appendFileSync, existsSync, mkdirSync, createWriteStream, 
    createReadStream, unlinkSync, statSync, readFileSync, read, readSync, copyFileSync } from 'fs';
import * as path from 'path';
import Axios from 'axios';
import * as json2csv from 'json2csv';
import { logger } from './logger';
import * as moment from 'moment-timezone';
import * as yazl from 'yazl';
import * as fg from 'fast-glob';
import * as tar from 'tar';
import { getLastStartDateTime } from './utilities';

import { saildroneUrl, queryRangeInMinutes, timeZone, timeOutputFormat, 
    outputFolder, timeRangeTest } from './parameters';
import { apiKey, apiSecret } from './keys';

logger.info('***** Start data processing *****');

export async function checkHealth(): Promise<Object> {
    let healthEndpoint = 'health';
    let healthUrl: string = saildroneUrl + healthEndpoint;
    const response = await Axios.get(healthUrl, {
        headers: { 'Accept': 'application/json' }
    });
    return response.data
}

export async function authenticate(key: string, secret: string): Promise<Object> {
    let authEndpoint: string = 'v1/auth';
    let authUrl: string = saildroneUrl + authEndpoint;
    let data: Object = {
        "key": key,
        "secret": secret
    };
    const response = await Axios.post(authUrl, data, {
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
    });
    return response.data;
}

export async function getAccesses(authToken: string): Promise<Object> {
    let accessesEndpoint: string = 'v1/auth/access';
    let accessesUrl: string = saildroneUrl + accessesEndpoint;
    const response = await Axios.get(accessesUrl, {
        headers: {
            "Accept": "application/json",
            "authorization": authToken
        },
    });
    return response.data;
}

export async function getTimeSeriesData(authToken: string, mission: number, dataSet: string, startDate: string): 
    Promise<Object> {
    let timeSeriesEndpoint = 'v1/timeseries/' + mission.toString();
    let timeSeriesUrl = saildroneUrl + timeSeriesEndpoint;

    // let startDate = moment().subtract(queryTime, 'minutes').format();   // subtract minutes from now to start the query
    let endDate = moment().format();    // now

    if (timeRangeTest) {
        startDate = moment("2019-05-31T16:00:00.000").format();
        endDate = moment("2019-05-31T16:30:00.000").format();
    }

    try {
        const response = await Axios.get(timeSeriesUrl, {
            headers: {
                "Accept": "application/json",
                "authorization": authToken
            },
            params: {
                "data_set": dataSet,
                "start_date": startDate,
                "end_date": endDate,
                "interval": 1,
                "limit": 1000,
                "order_by": "asc"
            }
        })
        return response.data;
    
    } catch {
        // console.info(`Error in querying time series`);
        return null;
    }
}

export async function getData() {
    let outputFullpath = path.join(__dirname, outputFolder);
    if (!existsSync(outputFullpath)) {
        mkdirSync(outputFullpath);
    }

    let health = await checkHealth();
    if (health['success']) {
        logger.info('Saildrone API health check ... Success');

        let authToken = await authenticate(apiKey, apiSecret);
        if (authToken['success']) {
            logger.info('Authentication ... Success')

            // Get Accesses
            let accesses = await getAccesses(authToken['token']);
            let drones: any = null, droneAccess: any = null, startDate: any = null;
            if ((accesses["data"] !== null) && (accesses["data"]["access"] !== null)) {
                drones = accesses["data"]["access"];
            }

            // Iterate through the missions
            // missions.forEach(async mission => {
            let mission: number = null, stats: any = null, size: number = null, 
                stream: any = null, options: object = null, line: string = null, lineSplit: string[],
                lastDateTime: any, response: any, lineNo: number = 1, dataSize: number = -1;
            // drones.forEach(async drone => {
            for (let drone of drones) {
                mission = drone['drone_id'];
                logger.info(`Pulling mission ${mission} data...`);

                if (drones !== null) {
                    droneAccess = drones.filter((d: any) => d['drone_id'] === mission);
                    if (droneAccess.length === 1) {
                        droneAccess = droneAccess[0];
                        logger.info(`\taccess = ${JSON.stringify(droneAccess)}`);

                        for (let dataSet of droneAccess['data_set']) {
                            logger.info(`\t${dataSet}`);

                            dataSize = -1;

                            // Prepare the path for the masterFullPath for the csv file for this mission/dataset
                            let masterFilename = mission + '_' + dataSet + '.csv';
                            let masterFullPath = path.join(__dirname, outputFolder, masterFilename);

                            if (existsSync(masterFullPath)) {
                                // Find the last line of data pulled for this mission / dataset and use that to define the startDate
                                startDate = await getLastStartDateTime(masterFullPath);
                                logger.info(`\t\tQuerying since the last date/time of ${startDate.format()}`);
                            } else {
                                // Mission + dataset csv does not exist, start pulling from the beginning
                                logger.info(`\t\tCSV not found, pulling all data for it.`);
                                startDate = moment(droneAccess["start_date"]).tz(timeZone);
                            }

                            // Pull the mission / dataset time series
                            if (startDate.isValid()) {

                                // let timeDiff: number = 5;
                                // let timeCutoff = moment().tz(timeZone).subtract(timeDiff, "minutes");
                                // logger.info(`\t\ttimeCutoff is ${timeDiff} minutes ago = ${timeCutoff.format()}`);

                                // while ((startDate.isValid()) && (startDate.isBefore(timeCutoff))) {
                                while ((startDate.isValid()) && (dataSize !== 0)) {

                                    logger.info(`\t\tstartDate = ${startDate.format()}`);

                                    response = await getTimeSeriesData(authToken['token'], mission, dataSet, startDate.format());
                                    if (response === null) {
                                        dataSize = 0;
                                        logger.info(`\tdata not available for mission ${mission} ${dataSet}, skipping...`);
                                        continue;
                                    }
                                    logger.info(`\t\tsizes, metadata: ${Object.keys(response['meta']).length}, data: ${Object.keys(response['data']).length}`);                
                                    dataSize = Object.keys(response['data']).length;

                                    // Process the data
                                    let data = response['data'];

                                    if (Object.keys(data).length !== 0) {

                                        // Convert the Epoch time to the format defined in parameters.ts
                                        data = await data.filter((x: any) => {
                                            // logger.info(`len = ${Object.keys(x).length} >>> ${JSON.stringify(x)}`)
                                            try {
                                                return ('gps_time' in x) &&
                                                    moment.unix(x['gps_time']).tz(timeZone).isValid() &&
                                                    moment.unix(x['gps_time']).tz(timeZone).isAfter('2012-01-01');
                                            } catch {
                                                return false;
                                            }
                                        }).map((y: any) => {
                                            y['gps_time'] = moment.unix(y['gps_time']).tz(timeZone).format(timeOutputFormat);
                                            return y;
                                        });
                                        dataSize = data.length;

                                        if (dataSize > 0) {

                                            // Convert the JSON data to a csv - csv will include the columns headers
                                            let csv = await json2csv.parse(data);

                                            // Append the current data to the master file if it exists, otherwise create a new file
                                            if (existsSync(masterFullPath)) {
                                                // Drop the first line of header information if the csv file exists (i.e. don't duplicate headers)
                                                csv = "\n" + csv.substring(csv.indexOf("\n") + 1);
                                            }
                                            try {
                                                appendFileSync(masterFullPath, csv);
                                            } catch (e) {
                                                logger.error(`Error writing to data file: ${e}`);
                                            }
                                        } else if (dataSize === 0) {
                                            logger.info(`dataSize is zero after filtering, finished with ${mission} ${dataSet}`);
                                        }
                                    }

                                    // Update the startDate to the newest last line of the csv file
                                    startDate = await getLastStartDateTime(masterFullPath);
                                };

                                // Copy the File for Users to use
                                let userMasterFilename = 'USERS_' + mission + '_' + dataSet + '.csv';
                                let userMasterFullPath = path.join(__dirname, outputFolder, userMasterFilename);
                                try {
                                    copyFileSync(masterFullPath, userMasterFullPath);
                                } catch (e) {
                                    logger.error(`Error writing to the user data file: ${e}`);
                                }

                                // Process the metdata
                                let metadataFilename = 'metadata_' + dataSet + '.json';
                                let metadataFullPath = path.join(outputFolder, metadataFilename);
                                if (!existsSync(metadataFullPath)) {
                                    if (response !== null) {
                                        let metadata = response['meta'];
                                        if (Object.keys(metadata).length !== 0) {
                                            try {
                                                writeFileSync(metadataFullPath, JSON.stringify(metadata));
                                            } catch (e) {
                                                logger.error(`Error writing metadata file: ${e}`);
                                            }
                                        }    
                                    }
                                }    
                            }

                            // Update the last updated date time information, for use by the saildrone.htm webpage
                            let updateDateTimeName = "lastUpdatedDateTime.js";
                            let updatedFullPath = path.join(outputFolder, updateDateTimeName);
                            let mjsText = "export function latestUpdate() { return '" + new Date() + "'; }";
                            try { 
                                writeFileSync(updatedFullPath, mjsText);
                            } catch (e) {
                                logger.error(`Error writing the lastUpdatedDateTime.js file: ${e}`);
                            }
                        }
                    }
                }
            }
            logger.info('Data pull completed');

            // Delete the old zip file if it exists
            if (existsSync(path.join(__dirname, outputFolder, "all_data.zip"))) {
                unlinkSync(path.join(__dirname, outputFolder, "all_data.zip"));
            }
        }
    }
}

getData();
