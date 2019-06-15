import { existsSync, statSync, read, readSync, open, openSync, close, closeSync } from "fs";
import { Buffer } from "buffer";

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
