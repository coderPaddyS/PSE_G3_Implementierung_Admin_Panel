import { fireEvent } from "@testing-library/dom";
import { cleanup, render } from "@testing-library/svelte";
import { jest } from "@jest/globals";
import { Table, TableCell, TableData, TableRow } from "$lib/model/recursive_table/TableComponents";
import TableSort from "$lib/view/components/table/TableSort.svelte";
import MockContext from "./__mocks__/MockContext.svelte";
import { crawlerKey } from "$lib/model/recursive_table/Types";
import type { TableSortingCrawler } from "$lib/model/recursive_table/crawler/SortingCrawler";
import lodash from "lodash";
import { lexicographicSorter } from "$lib/model/tables/manager/TableManager";

describe("Test TableSort.svelte", () => {
    describe("to behave given", () => {
        
        let sorter = jest.fn().mockImplementation((crawler: TableSortingCrawler<number>) => {
            received = crawler;
        });
        let received: TableSortingCrawler<number>;
        let toSort: Table<number>;
        let id: Table<number>;
        let asc: Table<number>;
        let desc: Table<number>
        beforeEach(() => {
            toSort = new Table<number>().add(
                new TableRow<number>().add(new TableCell<number>().add(new TableData<number>(1))),
                new TableRow<number>().add(new TableCell<number>().add(new TableData<number>(7))),
                new TableRow<number>().add(new TableCell<number>().add(new TableData<number>(5))),
            );
            asc = new Table<number>().add(
                new TableRow<number>().add(new TableCell<number>().add(new TableData<number>(1))),
                new TableRow<number>().add(new TableCell<number>().add(new TableData<number>(5))),
                new TableRow<number>().add(new TableCell<number>().add(new TableData<number>(7))),
            );
            desc = new Table<number>().add(
                new TableRow<number>().add(new TableCell<number>().add(new TableData<number>(7))),
                new TableRow<number>().add(new TableCell<number>().add(new TableData<number>(5))),
                new TableRow<number>().add(new TableCell<number>().add(new TableData<number>(1))),
            );
            id = lodash.cloneDeep(toSort);

        })
        afterEach(() => cleanup());
        
        describe("a sorter correctly:", () =>{
            let algorithm = lexicographicSorter(0);
            
            beforeEach(() => {
                sorter.mockClear();
                cleanup();
            })

            test("identity", () => {    
                const { container } = render(MockContext, {
                    props: {
                        key: crawlerKey,
                        value: {sorter},
                        component: TableSort,
                        props: {algorithm}
                    }
                });
                let div = container.getElementsByClassName("sorting-element")[0];

                expect(sorter).toBeCalledTimes(1);
                expect(received.crawlTable(toSort)).toEqual(id);
            });

            test("ascendend", () => {
                const { container } = render(MockContext, {
                    props: {
                        key: crawlerKey,
                        value: {sorter},
                        component: TableSort,
                        props: {algorithm}
                    }
                });
                let div = container.getElementsByClassName("sorting-element")[0];

                fireEvent.click(div);
                expect(sorter).toBeCalledTimes(2);
                expect(received.crawlTable(toSort)).toEqual(asc);
            });

            test("descended", () => {
                const { container } = render(MockContext, {
                    props: {
                        key: crawlerKey,
                        value: {sorter},
                        component: TableSort,
                        props: {algorithm}
                    }
                });
                let div = container.getElementsByClassName("sorting-element")[0];

                fireEvent.click(div);
                fireEvent.click(div);
                expect(sorter).toBeCalledTimes(3);
                expect(received.crawlTable(toSort)).toEqual(desc);
            });

            test("a whole cycle", () => {
                const { container } = render(MockContext, {
                    props: {
                        key: crawlerKey,
                        value: {sorter},
                        component: TableSort,
                        props: {algorithm}
                    }
                });
                let div = container.getElementsByClassName("sorting-element")[0];

                fireEvent.click(div);
                fireEvent.click(div);
                fireEvent.click(div);
                expect(sorter).toBeCalledTimes(4);
                expect(received.crawlTable(toSort)).toEqual(id);
            });
        });

        // test("hidden Testcell correctly", () => {
        //     cell.hide();
        //     const { container } = render(MockContext, {
        //         props: {
        //             key: crawlerKey,
        //             value: crawlOnView,
        //             component: TableCellComp,
        //             props: {cell, index: [], size: ""}
        //         }
        //     });

        //     expect(container).not.toHaveTextContent("Data");
        // });

        // test("cell being undefined correctly", () => {
        //     const { container } = render(TableCellComp, {
        //         props: {cell: undefined, index: [], size: ""}
        //     });

        //     expect(container).not.toHaveTextContent("undefined");
        // });

        // test("cell without children correctly", async () => {
        //     const { container } = render(TableCellComp, {
        //         props: {cell: new TableCell(), index: [], size: ""}
        //     });

        //     let div = container.getElementsByClassName("cell")[0];

        //     expect(div).not.toBe(undefined);
        // });
    });
});