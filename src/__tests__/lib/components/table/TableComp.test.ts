import { fireEvent } from "@testing-library/dom";
import { cleanup, render } from "@testing-library/svelte";
import { jest } from "@jest/globals";
import { TitleCell, TableData, TableRow, TitleRow, Table, TableCell} from "$lib/model/table/TableComponents";
import TableComp from "$lib/components/table/TableComp.svelte";
import MockContext from "./__mocks__/MockContext.svelte";
import { crawlerKey, Sorter } from "$lib/model/table/Types";

describe("Test TableComp.svelte", () => {
    describe("to render given", () => {
        
        let table: Table<string>;
        let crawlOnView = jest.fn();
        let sorter = jest.fn();
        beforeEach(() => {
            table = new Table<string>()
                .setTitle(new TitleRow<string>().add(new TitleCell<string>().set(new TableData("Title"))))
                .add(new TableRow<string>().add(new TableCell<string>().add(new TableData("Data"))));
        })
        afterEach(() => cleanup());
        
        test("test table correctly", () => {
            const { container } = render(MockContext, {
                props: {
                    key: crawlerKey,
                    value: crawlOnView,
                    component: TableComp,
                    props: {table, index: [], size: ""}
                }
            });

            expect(container).toHaveTextContent("Data");
            expect(container).toHaveTextContent("Title");
        });

        test("hidden test table correctly", () => {
            table.hide();
            const { container } = render(MockContext, {
                props: {
                    key: crawlerKey,
                    value: crawlOnView,
                    component: TableComp,
                    props: {table, index: [], size: ""}
                }
            });

            expect(container).not.toHaveTextContent("Data");
            expect(container).not.toHaveTextContent("Title");
        });

        test("table being undefined correctly", () => {
            const { container } = render(TableComp, {
                props: {table: undefined, index: [], size: ""}
            });

            expect(container).not.toHaveTextContent("undefined");
        });

        test("table without children correctly", async () => {
            const { container } = render(TableComp, {
                props: {table: new Table<string>(), index: [], size: ""}
            });

            let div = container.getElementsByClassName("table")[0];

            expect(div).not.toBe(undefined);
        });

        test("table without children but with title correctly", async () => {
            table.remove(0);
            const { container } = render(MockContext, {
                props: {
                    key: crawlerKey,
                    value: {crawlOnView, sorter},
                    component: TableComp,
                    props: {table, index: [], size: ""}
                }
            });
            let div = container.getElementsByClassName("row")[0];

            expect(div).toBe(undefined);
            expect(container).toHaveTextContent("Title");
        });
    });
});