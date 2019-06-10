import { writeFileSync, appendFileSync, existsSync, mkdirSync, createWriteStream, renameSync, unlinkSync } from 'fs';
import * as path from 'path';
import Axios from 'axios';
import * as json2csv from 'json2csv';
import { logger } from './logger';
import * as moment from 'moment-timezone';
import * as yazl from 'yazl';
import * as fg from 'fast-glob';

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

export async function getTimeSeriesData(authToken: string, mission: string, dataSet: string, queryTime: number): 
    Promise<Object> {
    let timeSeriesEndpoint = 'v1/timeseries/' + mission;
    let timeSeriesUrl = saildroneUrl + timeSeriesEndpoint;

    let startDate = moment().subtract(queryTime, 'minutes').format();   // subtract minutes from now to start the query
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

            missions.forEach(async mission => {
                logger.info(`Pulling mission ${mission} data...`);

                dataSets.forEach(async dataSet => {
                    logger.info(`\t${dataSet}`);

                    // Pull the mission / dataset time series
                    let response = await getTimeSeriesData(authToken['token'], mission, dataSet, queryRangeInMinutes);
                    if (response === null) {
                        logger.info(`\tdata not available for mission ${mission} ${dataSet}, skipping...`);
                        return;
                    }
                    let data = response['data'];
                    let metadata = response['meta'];
                    let fields = Object.keys(metadata["units"]).toString().split(',');

                    // Convert the Epoch time to ISO-8601 time
                    data = data.map((x: number) => {
                        x['gps_time'] = moment.unix(x['gps_time']).tz(timeZone).format(timeOutputFormat);
                        return x;
                    })

                    // Convert the JSON data to a csv - csv will include the columns headers
                    let csv = json2csv.parse(data);

                    // Write the update file
                    let subfolder = path.join(__dirname, outputFolder, mission)
                    let updateFilename = mission + '_' + dataSet + '_' + moment().tz(timeZone).format("YYYYMMDD_HHmmss") + '.csv';
                    let updateFullPath = path.join(subfolder, updateFilename);
                    if (!existsSync(subfolder)) {
                        mkdirSync(subfolder);
                    }
                    writeFileSync(updateFullPath, csv);

                    // Append the current data to the master file if it exists, otherwise create a new file
                    let masterFilename = mission + '_' + dataSet + '.csv';
                    let masterFullPath = path.join(__dirname, outputFolder, masterFilename);
                    if (existsSync(masterFullPath)) {
                        // Drop the first line of header information
                        csv = "\n" + csv.substring(csv.indexOf("\n") + 1);
                    }
                    appendFileSync(masterFullPath, csv);

                    // Copy the File for Chu
                    // let userMasterFilename = mission + '_' + dataSet + '_for_users.csv';
                    // let userMasterFullPath = path.join(__dirname, outputFolder, userMasterFilename);                    
                    // copyFileSync(masterFullPath, userMasterFullPath);

                    // Write the metdata file
                    let metadataFilename = mission + '_metadata.json';
                    let metadataFullPath = path.join(outputFolder, metadataFilename);
                    if (!existsSync(metadataFullPath)) {
                        writeFileSync(metadataFullPath, JSON.stringify(metadata));
                    }

                    // Update the last updated date time information, for use by the saildrone.htm webpage
                    let updateDateTimeName = "lastUpdatedDateTime.js";
                    let updatedFullPath = path.join(outputFolder, updateDateTimeName);
                    let mjsText = "export function latestUpdate() { return '" + new Date() + "'; }";
                    writeFileSync(updatedFullPath, mjsText);
                })
                logger.info(`\tmission ${mission} data files written`);
            })
            logger.info('Data pull completed');

            // Delete the old zip file if it exists
            if (existsSync(path.join(__dirname, outputFolder, "all_data.zip"))) {
                unlinkSync(path.join(__dirname, outputFolder, "all_data.zip"));
            }

            // Generate the zip file
            let zipFile = new yazl.ZipFile();

            // Get a listing of all of the files of interest and add to the zip file
            let csvFiles = fg.sync([outputFolder + '/**/*.csv', 
                outputFolder + '/**/*.json'], {nocase: true, deep: 0}
            );
            csvFiles.forEach(x => {
                zipFile.addFile(x, x.split("/").pop());
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

getData();
