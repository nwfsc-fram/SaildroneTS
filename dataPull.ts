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
import { getLastLineSync } from './utilities';

import { saildroneUrl, missions, dataSets, queryRangeInMinutes, timeZone, timeOutputFormat, 
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
        // logger.info(`authToken = ${JSON.stringify(authToken)}`);
        if (authToken['success']) {
            logger.info('Authentication ... Success')

            // let isInitialPull: boolean = false;
            // if (existsSync('./initialPull')) {
            //     isInitialPull = true;
            //     logger.info(`initialPull = ${isInitialPull}`);
            // }

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
                lastDateTime: any, response: any;
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

                            // Prepare the path for the masterFullPath for the csv file for this mission/dataset
                            let masterFilename = mission + '_' + dataSet + '.csv';
                            let masterFullPath = path.join(__dirname, outputFolder, masterFilename);

                            // Find the last line of data pulled for this mission / dataset and use that to define the startDate
                            if (existsSync(masterFullPath)) {
                                // line = await rll.read(masterFullPath, 1);

                                try {
                                    line = await getLastLineSync(masterFullPath, 1);
                                    // logger.info(`\t\tline = ${line}`);
                                    lineSplit = line.split(",");
                                    startDate = moment(lineSplit[2], "DD-MMM-YYYY HH:mm:ss").tz(timeZone).add(1, "minutes");
                                    startDate = startDate.isValid ? startDate.format() : 
                                        moment().subtract(queryRangeInMinutes, 'minutes').format();
                                    logger.info(`\t\tQuerying since the last time of the last date element`);
                                } catch (e) {
                                    startDate = moment().subtract(queryRangeInMinutes, 'minutes').format();   // subtract minutes from now to start the query
                                    logger.info(`\t\tError in parsing last date/time: ${e}`);
                                    logger.info(`\t\t${mission} ${dataSet} - Updating for the last ${queryRangeInMinutes} minutes`);
                                }
                                // logger.info(`\t\t${mission} ${dataSet} last line = ${line}`);    
                            } else {

                                // Mission + dataset csv does not exist, start pulling from the beginning
                                logger.info(`\t\t${mission} ${dataSet} - csv not found, pulling all data for it.`);
                                startDate = droneAccess["start_date"];
                            }

                            // Pull the mission / dataset time series
                            logger.info(`\t\tstartDate = ${startDate}`);
                            response = await getTimeSeriesData(authToken['token'], mission, dataSet, startDate);
                            if (response === null) {
                                logger.info(`\tdata not available for mission ${mission} ${dataSet}, skipping...`);
                                return;
                            }
                            // logger.info(`response: ${JSON.stringify(response)}`);
                            logger.info(`\t\tsizes, metadata: ${Object.keys(response['meta']).length}, data: ${Object.keys(response['data']).length}`);

                            // Process the metdata
                            let metadataFilename = 'metadata_' + dataSet + '.json';
                            let metadataFullPath = path.join(outputFolder, metadataFilename);
                            if (!existsSync(metadataFullPath)) {
                                let metadata = response['meta'];
                                if (Object.keys(metadata).length !== 0) {
                                    //     let fields = Object.keys(metadata["units"]).toString().split(',');    
                                    try {
                                        writeFileSync(metadataFullPath, JSON.stringify(metadata));
                                    } catch (e) {
                                        logger.error(`Error writing metadata file: ${e}`);
                                    }
                                }
                            }                      

                            // Process the data
                            let data = response['data'];
                            if (Object.keys(data).length !== 0) {

                                // Convert the Epoch time to ISO-8601 time
                                data = await data.map((x: number) => {
                                    x['gps_time'] = moment.unix(x['gps_time']).tz(timeZone).format(timeOutputFormat);
                                    return x;
                                })

                                // Convert the JSON data to a csv - csv will include the columns headers
                                let csv = await json2csv.parse(data);

                                // Write the update file
                                // let subfolder = path.join(__dirname, outputFolder, mission.toString());
                                // let updateFilename = mission + '_' + dataSet + '_' + moment().tz(timeZone).format("YYYYMMDD_HHmmss") + '.csv';
                                // let updateFullPath = path.join(subfolder, updateFilename);
                                // if (!existsSync(subfolder)) {
                                //     mkdirSync(subfolder);
                                // }
                                // writeFileSync(updateFullPath, csv);

                                // Append the current data to the master file if it exists, otherwise create a new file
                                if (existsSync(masterFullPath)) {
                                    // Drop the first line of header information
                                    csv = "\n" + csv.substring(csv.indexOf("\n") + 1);
                                }
                                try {
                                    appendFileSync(masterFullPath, csv);
                                } catch (e) {
                                    logger.error(`Error writing to data file: ${e}`);
                                }

                                // Copy the File for Users to use
                                let userMasterFilename = 'USERS_' + mission + '_' + dataSet + '.csv';
                                let userMasterFullPath = path.join(__dirname, outputFolder, userMasterFilename);
                                
                                try {
                                    copyFileSync(masterFullPath, userMasterFullPath);
                                } catch (e) {
                                    logger.error(`Error writing to the user data file: ${e}`);
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
                // logger.info(`\tmission ${mission} data files written`);
            }
            logger.info('Data pull completed');

            // Delete the old zip file if it exists
            if (existsSync(path.join(__dirname, outputFolder, "all_data.zip"))) {
                unlinkSync(path.join(__dirname, outputFolder, "all_data.zip"));
            }

            let globDir: string = '';
            if (__dirname === '/root/SaildroneTS') {
                // globDir = path.join('SaildroneTS', outputFolder);
                globDir = path.join(__dirname, outputFolder);
                // globDir = path.join(cwd(), outputFolder);
            } else {
                globDir = outputFolder;
            }

            // logger.info(`\n__dirname = ${__dirname}\nglobDir = ${globDir}\ncwd = ${cwd()}`);

            // Create tar file
            let createTar: boolean = false;
            if (createTar) {
                tar.c(
                    {
                        file: 'all_data.tar',
                        sync: true,
                        cwd: outputFolder
                    },
                    ['']
                );
                logger.info(`Tar file written`);
            }

            // Generate the zip file
            let zip: boolean = false;
            if (zip) {

                logger.info(`Creating new all_data.zip file`);
                let zipFile = new yazl.ZipFile();

                // Get a listing of all of the files of interest and add to the zip file
                let csvFiles = fg.sync([
                    globDir + '/**/*.csv', 
                    globDir + '/**/*.json'], {nocase: true, deep: 0}
                );
                logger.info(`csvFiles = ${csvFiles}`);

                csvFiles.forEach(async (x) => {
                    await zipFile.addFile(x, x.split("/").pop());
                    logger.info(`\tzipping ${x}`)
                })

                // Finalize the zip file
                zipFile.outputStream.pipe(createWriteStream(path.join(__dirname, outputFolder, "all_data.zip"))).on("close", function() {
                    logger.info("Zip file written\n");
                });
                zipFile.end();
            }
        }
    }
}

getData();
