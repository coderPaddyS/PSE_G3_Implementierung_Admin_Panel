// credits to https://github.com/doomnoodles/sveltekit-rust-ssr-template
// We just have to delete this line. Sadly its not recognized as not reachable due to SSR being shut off

import { readFileSync, writeFileSync } from 'fs';

const re = /[^\n]*new URL[^\n]*/g;
for(let crateName of JSON.parse(readFileSync("./.rsw.json", "utf8")).crates) {
    try {
        const fileName = "./src/lib/" + crateName + "/pkg/" + crateName + ".js";
        writeFileSync(fileName, readFileSync(fileName, "utf8").replace(re, ""));
    } catch(err) {
        console.log(err);
    }
}