import { render } from "@testing-library/svelte";
import Adder from "$lib/view/adder/AdderToBlacklist.svelte";
import type { LoginConfiguration } from "$lib/controller/AuthManager";
import { fireEvent } from "@testing-library/dom";
import { jest } from "@jest/globals";

describe("Test AdderToBlacklist.svelte", () => {
    test("to behave correctly", () => {
        const VALUE: string = "TEST";
        const { container } = render(Adder, {
        props: {
                onClick: (v: string) => expect(v).toEqual(VALUE),
                text: "add"
            }
        });

        let input = container.getElementsByTagName("input")[0];
        input.value = VALUE;
        expect(container).toHaveTextContent("add");
        let button = container.getElementsByTagName("button")[0];
        fireEvent.click(button);
    });
});