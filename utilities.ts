import { existsSync, statSync, readSync, openSync, closeSync, stat, truncateSync } from "fs";
import { Buffer } from "buffer";
import * as moment from 'moment-timezone';
import { timeOutputFormat } from './parameters';

export async function getLastLineSync(inputFilePath: string, maxLines: number): Promise<string> {
    let NEW_LINE_CHARACTERS = ["\n", "\r"];
    let char: any = null, charCount: number = 0, lines: string = "", fd: number = null;
    let bytesRead: number = 1, lineCount: number = 0, encoding: string = "utf8";
    let buffer = Buffer.alloc(1);

    if (existsSync(inputFilePath)) {
        let stat = statSync(inputFilePath);
        fd = openSync(inputFilePath, "r");
        while (bytesRead > 0) {
            if (NEW_LINE_CHARACTERS.includes(char)) {
                lineCount++;
            }
            if (lineCount >= maxLines) {
                break;
            }
            bytesRead = readSync(fd, buffer, 0, 1, stat.size - 1 - charCount);
            char = buffer.toString().substr(0, bytesRead);
            lines = char + lines;
            charCount++;
        }
        closeSync(fd);
        return lines;
    }
}

export async function getLastStartDateTime(inputFilePath: string): Promise<Object> {
    let NEW_LINE_CHARACTERS = ["\n", "\r"];
    let char: any = null, charCount: number = 0, fd: number = null;
    let bytesRead: number = 1, lineCount: number = 0, encoding: string = "utf8";
    let lineSplit, line: string = "", startDate: any = null, lineSize: any = null;
    let bytesToDelete: number = 0;
    let buffer = Buffer.alloc(1);

    if (existsSync(inputFilePath)) {
        let stat = statSync(inputFilePath);
        fd = openSync(inputFilePath, "r");
        while (bytesRead > 0) {
            if (NEW_LINE_CHARACTERS.includes(char)) {
                lineSize = line.length;
                line = line.replace("\n", "").replace("\r", "");
                if (line !== "") {
                    lineSplit = line.split(",");
                    console.info(`\t\tLine for getting last date/time: ${lineSplit}`);
                    if (lineSplit.length >= 3) {
                        let v = lineSplit[2];
                        v = v.replace(/"/g, "");
                        startDate = moment.tz(v, timeOutputFormat, true, "UTC").add(1, "minutes");
                        if (startDate.isValid()) {
                            // startDate = startDate.tz("UTC").format();
                            
                            // If lineCount > 1, need to remove the invalid date rows from the csv file
                            if (lineCount > 0) {
                                console.info(`Lines to remove from the csv file: ${lineCount}, byteSize = ${bytesToDelete}`)
                                truncateSync(inputFilePath, stat.size - bytesToDelete);
                            }

                            break;
                        }
                    }
                    bytesToDelete = bytesToDelete + lineSize;
                    lineCount++;
                    console.info(`lineCount = ${lineCount}, line = ${line}, lineSize = ${lineSize}, bytesToDelete = ${bytesToDelete}`);
                    line = "";
                }
                // if (lineCount === 2) break;
            }
            bytesRead = readSync(fd, buffer, 0, 1, stat.size - 1 - charCount);
            char = buffer.toString().substr(0, bytesRead);
            line = char + line;
            charCount++;
        }
        closeSync(fd);
        return startDate;
    }
}

export function letterCheck(word) {
    return (/[A-z]{3}/g).test(word);
}