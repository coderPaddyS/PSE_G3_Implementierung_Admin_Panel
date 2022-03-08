import type { ToDisplayData } from "$lib/model/tables/manager/ToDisplayData";

interface CustomMatchers<R = unknown> {
    toHaveARow(text: string[]): R;
    toHaveMetadata(text: string[]): R;
    toHaveSomeRows(indices: number[], source: ToDisplayData[] | string[]): R;
    toHaveAllRows(source: ToDisplayData[] | string[]): R;
    toHaveSomeMetadata(indices: number[], source: ToDisplayData[] | string[]): R;
    toHaveAllMetadata(source: ToDisplayData[] | string[]): R;
}
  
declare global {
    namespace jest {
        interface Expect extends CustomMatchers {}
        interface Matchers<R> extends CustomMatchers<R> {}
        interface InverseAsymmetricMatchers extends CustomMatchers {}
    }
}

function getTextNodes(node: Node): Node[] {
    let nodes: Node[] = [];
    for (let n = node.firstChild; n != undefined; n = n.nextSibling) {
        if (n.nodeType == Node.TEXT_NODE) {
            nodes.push(n);
        } else {
            nodes = nodes.concat(getTextNodes(n));
        }
    }
    return nodes;
}

function rowMatcher(text: string[], contents: string[]): [boolean, string] {

    for (let row of contents) {
        let matches = true;
        for (let t of text) {
            if (!row.includes(t)) {
                matches = false;
                break;
            }
        }
        if (matches) {
            return [true, row];
        }
    }
    return [false, ""];
}

function getContentsOf(page: HTMLElement, _class: string): string[] {
    let rows = page.getElementsByClassName(_class);
    let contents: string[] = [];
    for (let i = 0;i < rows.length; i++) {
        let acc: Node[] = [];
        rows[i].childNodes.forEach(node => acc.push(...getTextNodes(node)));
        contents.push(acc.map(node => node.textContent).join(" "));
    }
    return contents;
}

function getRowContents(page: HTMLElement): string[] {
    return getContentsOf(page, "row");
}

function getSubTableContents(page: HTMLElement): string[] {
    return getContentsOf(page, "subtable");
}

export const matchers = {
    toHaveARow(page: HTMLElement, text: string[]) {
        
        let contents: string[] = getRowContents(page);
        let [matches, where] = rowMatcher(text, contents);
        if (matches) {
            return {
                message: () =>
                    `expected ${text.join(" ")} not to be in ${page.textContent}. Matched ${where}.`,
                pass: true,
            };
        } else {
            return {
                message: () =>
                    `expected ${text.join(" ")} to be in ${page.textContent}.`,
                pass: false,
            };
        }
    },

    toHaveMetadata(page: HTMLElement, text: string[]) {

        let contents: string[] = getSubTableContents(page);
        let [matches, where] = rowMatcher(text, contents);
        if (matches) {
            return {
                message: () =>
                    `expected ${text.join(" ")} not to be in ${page.textContent}. Matched ${where}.`,
                pass: true,
            };
        } else {
            return {
                message: () =>
                    `expected ${text.join(" ")} to be in ${page.textContent}.`,
                pass: false,
            };
        }
    },

    toHaveSomeRows(page: HTMLElement, indices: number[], source: ToDisplayData[] | string[]) {
        let contents = getRowContents(page);
        let texts: string[][] = typeof source[0] === 'string' ? 
            (source as string[]).map((e: string) => [e]) : 
            (source as ToDisplayData[]).map((s: ToDisplayData) => s.toDisplayData() as string[]);
        let result: [boolean, string, string[]][] = indices.map(index => [...rowMatcher(texts[index], contents), texts[index]]);
        let matches = result.filter(([matches,]) => !matches).length == 0;
        if (matches) {
            let matched: [string, string[]][] = result.filter(([matches,]) => matches).map(([_, where, text]) => [where, text]);
            return {
                message: () =>
                    matched.map(([where, text]) => `expected ${text.join(" ")} not to be in ${page.textContent}. Matched ${where}.`).join("\n"),
                pass: true,
            };
        } else {
            let matched: [string, string[]][] = result.filter(([matches,]) => !matches).map(([_, where, text]) => [where, text]);
            return {
                message: () =>
                    matched.map(([where, text]) => `expected ${text.join(" ")} to be in ${page.textContent}.`).join("\n"),
                
                pass: false,
            };
        }
    }, 

    toHaveAllRows(page: HTMLElement, source: ToDisplayData[] | string[]) {
        let contents = getRowContents(page);
        let texts: string[][] = typeof source[0] === 'string' ? 
            (source as string[]).map((e: string) => [e]) : 
            (source as ToDisplayData[]).map((s: ToDisplayData) => s.toDisplayData() as string[]);
        let result: [boolean, string, string[]][] = texts.map(e => [...rowMatcher(e, contents), e]);
        let matches = result.filter(([matches,]) => !matches).length == 0;
        if (matches) {
            let matched: [string, string[]][] = result.filter(([matches,]) => matches).map(([_, where, text]) => [where, text]);
            return {
                message: () =>
                    matched.map(([where, text]) => `expected ${text.join(" ")} not to be in ${page.textContent}. Matched ${where}.`).join("\n"),
                pass: true,
            };
        } else {
            let matched: [string, string[]][] = result.filter(([matches,]) => !matches).map(([_, where, text]) => [where, text]);
            return {
                message: () =>
                    matched.map(([where, text]) => `expected ${text.join(" ")} to be in ${page.textContent}.`).join("\n"),
                
                pass: false,
            };
        }
    }, 

    toHaveSomeMetadata(page: HTMLElement, indices: number[], source: ToDisplayData[] | string[]) {
        let contents = getSubTableContents(page);
        let texts: string[][] = typeof source[0] === 'string' ? 
            (source as string[]).map((e: string) => [e]) : 
            (source as ToDisplayData[]).map((s: ToDisplayData) => s.toDisplayData() as string[]);
        let result: [boolean, string, string[]][] = indices.map(index => [...rowMatcher(texts[index], contents), texts[index]]);
        let matches = result.filter(([matches,]) => !matches).length == 0;
        if (matches) {
            let matched: [string, string[]][] = result.filter(([matches,]) => matches).map(([_, where, text]) => [where, text]);
            return {
                message: () =>
                    matched.map(([where, text]) => `expected ${text.join(" ")} not to be in ${page.textContent}. Matched ${where}.`).join("\n"),
                pass: true,
            };
        } else {
            let matched: [string, string[]][] = result.filter(([matches,]) => !matches).map(([_, where, text]) => [where, text]);
            return {
                message: () =>
                    matched.map(([where, text]) => `expected ${text.join(" ")} to be in ${page.textContent}.`).join("\n"),
                
                pass: false,
            };
        }
    }, 


    toHaveAllMetadata(page: HTMLElement, source: ToDisplayData[] | string[]) {
        let contents = getSubTableContents(page);
        let texts: string[][] = typeof source[0] === 'string' ? 
            (source as string[]).map((e: string) => [e]) : 
            (source as ToDisplayData[]).map((s: ToDisplayData) => s.toDisplayData() as string[]);
        let result: [boolean, string, string[]][] = texts.map(e => [...rowMatcher(e, contents), e]);
        let matches = result.filter(([matches,]) => !matches).length == 0;
        if (matches) {
            let matched: [string, string[]][] = result.filter(([matches,]) => matches).map(([_, where, text]) => [where, text]);
            return {
                message: () =>
                    matched.map(([where, text]) => `expected ${text.join(" ")} not to be in ${page.textContent}. Matched ${where}.`).join("\n"),
                pass: true,
            };
        } else {
            let matched: [string, string[]][] = result.filter(([matches,]) => !matches).map(([_, where, text]) => [where, text]);
            return {
                message: () =>
                    matched.map(([where, text]) => `expected ${text.join(" ")} to be in ${page.textContent}.`).join("\n"),
                
                pass: false,
            };
        }
    }, 
}