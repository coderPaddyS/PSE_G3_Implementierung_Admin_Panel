import { fireEvent } from "@testing-library/dom";
import { cleanup, render } from "@testing-library/svelte";
import { jest } from "@jest/globals";
import { TableCell, TableData, TableRow } from "$lib/model/recursive_table/TableComponents";
import TableRowComp from "$lib/view/components/table/TableRowComp.svelte";
import MockContext from "./__mocks__/MockContext.svelte";
import { crawlerKey } from "$lib/model/recursive_table/Types";

describe("Test TableRowComp.svelte", () => {
    describe("to render given", () => {
        
        let row: TableRow<string>;
        let crawlOnView = jest.fn();
        beforeEach(() => {
            row = new TableRow<string>().add(new TableCell<string>().add(new TableData("Data")));
        })
        afterEach(() => cleanup());
        
        test("test row correctly", () => {
            const { container } = render(MockContext, {
                props: {
                    key: crawlerKey,
                    value: crawlOnView,
                    component: TableRowComp,
                    props: {row, index: [], size: ""}
                }
            });

            expect(container).toHaveTextContent("Data");
        });

        test("hidden test row correctly", () => {
            row.hide();
            const { container } = render(MockContext, {
                props: {
                    key: crawlerKey,
                    value: crawlOnView,
                    component: TableRowComp,
                    props: {row, index: [], size: ""}
                }
            });

            expect(container).not.toHaveTextContent("Data");
        });

        test("row being undefined correctly", () => {
            const { container } = render(TableRowComp, {
                props: {row: undefined, index: [], size: ""}
            });

            expect(container).not.toHaveTextContent("undefined");
        });

        test("row without children correctly", async () => {
            const { container } = render(TableRowComp, {
                props: {row: new TableRow(), index: [], size: ""}
            });

            let div = container.getElementsByClassName("row")[0];

            expect(div).not.toBe(undefined);
        });
    });
});