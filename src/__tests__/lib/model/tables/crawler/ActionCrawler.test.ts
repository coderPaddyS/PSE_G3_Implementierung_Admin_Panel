/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import { TableActionCrawler } from "$lib/model/recursive_table/crawler/ActionCrawler"
import { Table, TableCell, TableData, TableDataTable, TableRow } from "$lib/model/recursive_table/TableComponents"

describe("Testing TableActionCrawler", () => {
    describe("to count components", () => {
        let table: Table<number> = new Table<number>().add(
            new TableRow<number>().add(
                new TableCell<number>().add(new TableData<number>(42)),
                new TableCell<number>().add(new TableDataTable<number>(
                    new Table<number>().add(
                        new TableRow<number>().add(
                            new TableCell<number>().add(new TableData<number>(69)),
                            new TableCell<number>().add(new TableDataTable<number>(
                                new Table<number>().add(
                                    new TableRow<number>().add(
                                        new TableCell<number>().add(new TableData<number>(360)),
                                        new TableCell<number>().add(new TableData<number>(420)),       
                                    )
                                )
                            )),                
                        )
                    )
                )),                
            )
        );
        const COUNT = 18;

        test("without a starting index", () => {
            let count: number = 0;
            let crawler = new TableActionCrawler<number>((crawler, comp) => count++);
            table.getCrawledOn(crawler);
            expect(count).toBe(COUNT);
        });

        test("with an empty starting index", () => {
            let count: number = 0;
            let index: Array<number> = [];
            let crawler = new TableActionCrawler<number>((crawler, comp) => count++, index);
            table.getCrawledOn(crawler);
            expect(count).toBe(COUNT);
        });

        test("with a starting index", () => {
            let count: number = 0;
            let index: Array<number> = [0, 1];
            let crawler = new TableActionCrawler<number>((crawler, comp) => count++, index);
            table.getCrawledOn(crawler);
            expect(count).toBe(COUNT - 4);
        });

        test("with a starting index of the last data", () => {
            let count: number = 0;
            let index: Array<number> = [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0];
            let crawler = new TableActionCrawler<number>((crawler, comp) => count++, index);
            table.getCrawledOn(crawler);
            expect(count).toBe(1);
        })
    });

    describe("on undefined components", () => {
        let crawler = new TableActionCrawler<number>((crawler, comp) => {});

        test("on undefined table", () => {
            expect(crawler.crawlTable(undefined)).toBe(undefined);
        });

        test("on undefined table row", () => {
            expect(crawler.crawlRow(undefined)).toBe(undefined);
        });

        test("on undefined table cell", () => {
            expect(crawler.crawlCell(undefined)).toBe(undefined);
        });

        test("on undefined table data", () => {
            expect(crawler.crawlData(undefined)).toBe(undefined);
        });
    });

    describe("on invalid indices", () => {
        let crawler: TableActionCrawler<number>;

        beforeEach(() => {
         crawler = new TableActionCrawler<number>((crawler, comp) => {}, [-1]);
        })
        test("in table", () => {
            expect(() => crawler.crawlTable(new Table())).toThrowError("out of bounce");
        });

        test("in table row", () => {
            expect(() => crawler.crawlRow(new TableRow())).toThrowError("out of bounce");
        });

        test("in table cell", () => {
            expect(() => crawler.crawlCell(new TableCell())).toThrowError("out of bounce");
        });

        test("in table data", () => {
            expect(() => crawler.crawlData(new TableData(0))).toThrowError("child components");
        });

        test("in table data table", () => {
            expect(() => crawler.crawlData(new TableDataTable(new Table()))).toThrowError("out of bounce");
        });
    });

    test("with undefined action", () => {
        expect(() => new TableActionCrawler(undefined).crawlTable(undefined)).toThrowError("needs to have an action");
    });
});