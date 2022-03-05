import { render } from "@testing-library/svelte";
import Greeter from "$lib/view/Waiting.svelte"

describe("Test Waiting.svelte", () => {
    test("to display correctly with text", () => {
        const { container } = render(Greeter, {
        props: {
                text: "loading",
            }
        });

        expect(container).toHaveTextContent("loading");
        expect(container.getElementsByClassName("waiting")).not.toBeUndefined();
    })
});