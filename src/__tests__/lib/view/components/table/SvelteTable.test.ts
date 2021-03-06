import { fireEvent } from "@testing-library/dom";
import { cleanup, render } from "@testing-library/svelte";
import { jest } from "@jest/globals";
import { TitleCell, TableData, TableRow, TitleRow, Table, TableCell} from "$lib/model/recursive_table/TableComponents";
import SvelteTable from "$lib/view/components/table/SvelteTable.svelte";
import { TableActionCrawler } from "$lib/model/recursive_table/crawler/ActionCrawler";
import type { TableCrawler } from "$lib/model/recursive_table/TableCrawler";
import { LexicographicFilter } from "$lib/model/tables/manager/filter/LexicographicFilter";

describe("Test SvelteTable.svelte", () => {
    describe("to render given", () => {
        
        let table: Table<string>;
        let supplier = () => table;
        let updater = (listener) => listener(supplier());
        let filterableData = () => [[0, new LexicographicFilter("Title")]];
        beforeEach(() => {
            table = new Table<string>()
                .setTitle(new TitleRow<string>().add(new TitleCell<string>().set(new TableData("Title"))))
                .add(new TableRow<string>().add(new TableCell<string>().add(new TableData("Data"))));
        })
        afterEach(() => cleanup());
        
        test("test table correctly", () => {
            const { container } = render(SvelteTable, {
                props: {
                    size: "",
                    supplier,
                    updater,
                    filterableData
                }
            });
            expect(container).toHaveTextContent("Data");
            expect(container).toHaveTextContent("Title");
        });

        test("test extra crawlers being called correctly", () => {
            let extraCrawlers = new Map<Symbol, TableActionCrawler<string>>();
            let action = jest.fn();
            let crawler = new TableActionCrawler<string>(action);
            extraCrawlers.set(Symbol(), crawler)
            const { container } = render(SvelteTable, {
                props: {
                    size: "",
                    supplier,
                    updater,
                    filterableData,
                    extraCrawlers,
                }
            });
            expect(container).toHaveTextContent("Data");
            expect(container).toHaveTextContent("Title");
            expect(action).toBeCalled();
        });

        test("test table with sorter correctly", () => {
            let table = new Table<string>()
                .setTitle(new TitleRow<string>().add(new TitleCell<string>((a, b) => [a,b]).set(new TableData("Title"))))
                .add(new TableRow<string>().add(new TableCell<string>().add(new TableData("Data"))));
            const { container } = render(SvelteTable, {
            props: {
                    size: "",
                    supplier,
                    updater,
                    filterableData
                }
            });

            expect(container).toHaveTextContent("Data");
            expect(container).toHaveTextContent("Title");
        });

    });
});