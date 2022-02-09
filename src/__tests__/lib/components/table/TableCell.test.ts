import { fireEvent } from "@testing-library/dom";
import { cleanup, render } from "@testing-library/svelte";
import { jest } from "@jest/globals";
import { TableCell, TableData } from "$lib/model/table/TableComponents";
import TableCellComp from "$lib/components/table/TableCellComp.svelte";
import MockContext from "./__mocks__/MockContext.svelte";
import { crawlerKey } from "$lib/model/table/Types";

describe("Test TableCellComp.svelte", () => {
    describe("to render given", () => {
        
        let cell: TableCell<string>;
        let crawlOnView = jest.fn();
        beforeEach(() => {
            cell = new TableCell<string>().add(new TableData("Data"));
        })
        afterEach(() => cleanup());
        
        test("test cell correctly", () => {
            const { container } = render(MockContext, {
                props: {
                    key: crawlerKey,
                    value: crawlOnView,
                    component: TableCellComp,
                    props: {cell, index: [], size: ""}
                }
            });

            expect(container).toHaveTextContent("Data");
        });

        test("hidden test cell correctly", () => {
            cell.hide();
            const { container } = render(MockContext, {
                props: {
                    key: crawlerKey,
                    value: crawlOnView,
                    component: TableCellComp,
                    props: {cell, index: [], size: ""}
                }
            });

            expect(container).not.toHaveTextContent("Data");
        });

        test("cell being undefined correctly", () => {
            const { container } = render(TableCellComp, {
                props: {cell: undefined, index: [], size: ""}
            });

            expect(container).not.toHaveTextContent("undefined");
        });

        test("cell without children correctly", async () => {
            const { container } = render(TableCellComp, {
                props: {cell: new TableCell(), index: [], size: ""}
            });

            let div = container.getElementsByClassName("cell")[0];

            expect(div).not.toBe(undefined);
        });
    });
});