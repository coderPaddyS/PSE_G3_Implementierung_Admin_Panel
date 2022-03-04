import { render } from "@testing-library/svelte";
import Error from "$lib/view/components/error/ErrorMessage.svelte"
import { fireEvent } from "@testing-library/dom";

describe("Test ErrorMessage.svelte", () => {
    describe("to display correctly", () => {
        test("with one error and removal", () => {
            const { container } = render(Error, {
            props: {
                    errorSupplier: (l) => l(["error"]),
                    remove: (error) => expect(error).toEqual("error")
                }
            });

            expect(container).toHaveTextContent("error");
            let but = container.getElementsByTagName("button")[0];
            fireEvent.click(but)
        });
    });
});