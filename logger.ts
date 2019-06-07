import { existsSync, mkdirSync } from 'fs';
import * as path from 'path';
// import logjson from './log.json';
import { configure, getLogger } from 'log4js';
import { logFolder } from './parameters';

const logDir = path.resolve(path.join(__dirname, './logs'));
if (!existsSync(logDir)) {
    mkdirSync(logDir);
}
export const errorLog = path.resolve(path.join(logDir, 'error.log'));
export const appLog = path.resolve(path.join(logDir, 'app.log'));

let logConfig = {
    "appenders": {
        "app": {
            "type": "dateFile",
            "filename": appLog,
            "pattern": "-yyyy-MM-dd-hh-mm",
            "alwaysIncludePattern": true,
            "keepFileExt": true, 
            "daysToKeep": 15,
            "flags": 'as'
        },
        "app2": {
            "type": "fileSync",
            "filename": appLog,
            "maxLogSize": 1048576,
            "backups": 100

        },
        "error": {
            "type": "fileSync",
            "filename": errorLog,
            "maxLogSize": 1048576,
            "backups": 100
        },
        "console": { "type": "console" }
    },
    "categories": { 
        "default": { "appenders": [ "app", "app2", "console" ], "level": "debug" },
        "error": { "appenders": [ "error" ], "level": "error" }
    }
};
configure(logConfig);
export const logger = getLogger("default");
export const errorLogger = getLogger("error");
logger.level = "debug";

