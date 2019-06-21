// Query Parameters
export let saildroneUrl = 'https://developer-mission.saildrone.com/';   // Saildrone API URL
// export let missions: string[] = ["1023"];                            // Saildrone missions to query
export let missions: string[] = [
    "1039", "1040", "1043", "1044", "1045", "1046", "1047"
];
export let dataSets: string[] = ["vehicle", "atmospheric",              // Datasets to query
                                 "oceanographic", "biogeochemical"];

export let timeZone: string = "UTC"; // "America/Los_Angeles";                    // Timezone to convert to for saildrone data
export let queryRangeInMinutes: number = 30;                            // How far back in minutes to query
export let timeOutputFormat: string = "DD-MMM-YYYY HH:mm:ss";           // Date/Time output format for GPS date/time
export let outputFolder = './output';                                   // Where the data files will be saved
export let logFolder = './logs';

// Testing purposes only - set to false for real operations
export let timeRangeTest: boolean = false;