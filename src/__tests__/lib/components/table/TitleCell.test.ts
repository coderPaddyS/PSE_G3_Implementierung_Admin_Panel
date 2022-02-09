import { fireEvent } from "@testing-library/dom";
import { cleanup, render } from "@testing-library/svelte";
import { jest } from "@jest/globals";
import { TitleCell, TableData, TableRow } from "$lib/model/table/TableComponents";
import TitleCellComp from "$lib/components/table/TitleCellComp.svelte";
import MockContext from "./__mocks__/MockContext.svelte";
import { crawlerKey, Sorter } from "$lib/model/table/Types";

describe("Test TitleCellComp.svelte", () => {
    describe("to render given", () => {
        
        let cell: TitleCell<string>;
        let crawlOnView = jest.fn();
        let sorter = jest.fn();
        beforeEach(() => {
            cell = new TitleCell<string>().set(new TableData("Data"));
        })
        afterEach(() => cleanup());
        
        test("testcell correctly", () => {
            const { container } = render(MockContext, {
                props: {
                    key: crawlerKey,
                    value: crawlOnView,
                    component: TitleCellComp,
                    props: {cell, index: [], size: ""}
                }
            });

            expect(container).toHaveTextContent("Data");
        });

        test("hidden Testcell correctly", () => {
            cell.hide();
            const { container } = render(MockContext, {
                props: {
                    key: crawlerKey,
                    value: crawlOnView,
                    component: TitleCellComp,
                    props: {cell, index: [], size: ""}
                }
            });

            expect(container).not.toHaveTextContent("Data");
        });

        test("cell being undefined correctly", () => {
            const { container } = render(TitleCellComp, {
                props: {cell: undefined, index: [], size: ""}
            });

            expect(container).not.toHaveTextContent("undefined");
        });

        test("cell without children correctly", async () => {
            const { container } = render(TitleCellComp, {
                props: {cell: new TitleCell(), index: [], size: ""}
            });

            let div = container.getElementsByClassName("titlecell")[0];

            expect(div).not.toBe(undefined);
        });

        test("cell without children but with sorter correctly", async () => {
            cell = new TitleCell<string>((a, b) => [a,b]);
            const { container } = render(MockContext, {
                props: {
                    key: crawlerKey,
                    value: {crawlOnView, sorter},
                    component: TitleCellComp,
                    props: {cell, index: [], size: ""}
                }
            });
            let div = container.getElementsByClassName("sorter")[0];

            expect(div).not.toBe(undefined);
        });

        test("testcell with sorter correctly", () => {
            cell = new TitleCell<string>((a, b) => [a,b]).set(new TableData<string>("Data"));
            const { container } = render(MockContext, {
                props: {
                    key: crawlerKey,
                    value: {crawlOnView, sorter},
                    component: TitleCellComp,
                    props: {cell, index: [], size: ""}
                }
            });
            let div = container.getElementsByClassName("sorter")[0];

            expect(container).toHaveTextContent("Data");
            expect(div).not.toBe(undefined);
        });
    });
});