import fs from "fs";

let create: boolean = true;
let startTime;
let naming: string;

export function start(name: string) {
    startTime = Date.now();
    naming = name;
}

export function stop() {
    if (create) {
        fs.writeFileSync("times.log", "");  
        create = false;  
    }
    fs.appendFileSync("times.log", `${naming}, ${(Date.now() - startTime)} ms,\n`);
}

export default {start, stop};