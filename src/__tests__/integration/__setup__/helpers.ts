import { fireEvent } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";

export function getAllRows(page: HTMLElement): HTMLCollection {
    return page.getElementsByClassName("row");
}

export function getAllButtons(page: HTMLElement): HTMLCollection {
    return page.getElementsByTagName("button");
}

export function getAllInputs(page: HTMLElement): HTMLCollection {
    return page.getElementsByTagName("input");
}

export function clickOnButtonForRows(page: HTMLElement, buttonIndex: number) {
    let elements = getAllRows(page);
    for (let i = 0; i < elements.length; ++i) {
        fireEvent.click(getAllButtons(elements[i] as HTMLElement)[buttonIndex]);
    }
}

export function clickOnButtonForSomeRows(page: HTMLElement, indices: number[], buttonIndex: number) {
    let elements = getAllRows(page);
    // console.log(elements.length, indices, getAllButtons(elements[0] as HTMLElement)[buttonIndex].textContent);
    indices.forEach(index => {
        fireEvent.click(getAllButtons(elements[index] as HTMLElement)[buttonIndex]);
        console.log(getAllButtons(elements[index] as HTMLElement)[buttonIndex].textContent)
    })
}

export async function setValueOfInput(page: HTMLElement, index: number, value: string | number) {
    await fireEvent.input(getAllInputs(page)[index], {target: {value: String(value)}})
}