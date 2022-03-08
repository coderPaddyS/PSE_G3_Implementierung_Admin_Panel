import { fireEvent } from "@testing-library/dom";

export function getAllRows(page: HTMLElement): HTMLCollection {
    return page.getElementsByClassName("row");
}

export function getAllButtons(page: HTMLElement): HTMLCollection {
    return page.getElementsByTagName("button");
}

export function clickOnButtonForRows(page: HTMLElement, buttonIndex: number) {
    let elements = getAllRows(page);
    for (let i = 0; i < elements.length; ++i) {
        fireEvent.click(getAllButtons(elements[i] as HTMLElement)[buttonIndex]);
    }
}

export function clickOnButtonForSomeRows(page: HTMLElement, indices: number[], buttonIndex: number) {
    let elements = getAllRows(page);
    indices.forEach(index => fireEvent.click(getAllButtons(elements[index] as HTMLElement)[buttonIndex]))
}