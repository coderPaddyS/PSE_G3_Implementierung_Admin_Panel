import { fireEvent } from "@testing-library/dom";

export function getAllRows(page: HTMLElement): HTMLCollection {
    return page.getElementsByClassName("row");
}

export function getAllButtons(page: HTMLElement): HTMLCollection {
    return page.getElementsByTagName("button");
}

export function getAllInputs(page: HTMLElement): HTMLCollection {
    return page.getElementsByTagName("input");
}

export function getFilters(page: HTMLElement): HTMLElement {
    return page.getElementsByClassName("filters")[0] as HTMLElement;
}

export function getAdder(page: HTMLElement): HTMLElement {
    return page.getElementsByClassName("adder")[0] as HTMLElement;
}

export function addEntry(adder: HTMLElement, value: string) {
    setValueOfInput(adder, 0, value);
    fireEvent.click(getAllButtons(adder)[0]);
}

export function clickOnButtonForRows(page: HTMLElement, buttonIndex: number) {
    let elements = getAllRows(page);
    for (let i = 0; i < elements.length; ++i) {
        fireEvent.click(getAllButtons(elements[i] as HTMLElement)[buttonIndex]);
    }
}

export function clickOnButtonForSomeRows(page: HTMLElement, indices: number[], buttonIndex: number) {
    let elements = getAllRows(page);
    indices.forEach(index => {
        fireEvent.click(getAllButtons(elements[index] as HTMLElement)[buttonIndex]);
    })
}

export async function setValueOfInput(page: HTMLElement, index: number, value: string | number) {
    await fireEvent.input(getAllInputs(page)[index], {target: {value: String(value)}})
}

export async function toggleFilters(filters: HTMLElement) {
    await fireEvent.click(filters.getElementsByClassName("drop")[0]);
}