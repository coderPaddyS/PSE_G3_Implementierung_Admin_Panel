import { jest } from "@jest/globals";
import { render } from "@testing-library/svelte";
import Setting from "$lib/view/components/settings/Setting.svelte"

describe("Testing Settings.svelte", () => {

    test("renders number input correctly", () => {
        const text = "test";
        const start = 0;
        const update = jest.fn();

        const { container } = render(Setting, {
            text, start, update
        });
        let input = container.getElementsByTagName("input")[0];

        expect(container).toHaveTextContent(text);
        expect(input.value).toBe(String(start));

        expect(update).toBeCalled();
    });

    test("renders string input correctly", () => {
        const text = "test";
        const start = "input";
        const update = jest.fn();

        const { container } = render(Setting, {
            text, start, update
        });
        let input = container.getElementsByTagName("input")[0];

        expect(container).toHaveTextContent(text);
        expect(input.value).toBe(start);

        expect(update).toBeCalled();
    });
});