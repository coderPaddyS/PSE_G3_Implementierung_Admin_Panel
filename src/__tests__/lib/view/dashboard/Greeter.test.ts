import { render } from "@testing-library/svelte";
import Greeter from "$lib/view/dashboard/Greeter.svelte"

describe("Test Greeter.svelte", () => {
    describe("to display correctly", () => {
        test("with name and username", () => {
            const { container } = render(Greeter, {
            props: {
                    name: "tester t",
                    username: "test"
                }
            });

            expect(container).toHaveTextContent("tester t");
            expect(container).toHaveTextContent("(test)");
        });
    })
});