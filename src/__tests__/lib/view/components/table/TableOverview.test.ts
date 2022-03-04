import { render, wait } from "@testing-library/svelte";
import TableOverview from "$lib/view/components/table/TableOverview.svelte"

describe("Test TableOverview.svelte", () => {
    describe("to display correctly", () => {
        test("with title and size", async () => {
            const { container } = render(TableOverview, {
            props: {
                    title: "Table Test",
                    size: 10
                }
            });

            expect(container).toHaveTextContent("Table Test");
            expect(container).toHaveTextContent("0");
            await new Promise((r) => setTimeout(r, 1500));
            expect(container).toHaveTextContent("10");
        });
    })
});