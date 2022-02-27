/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import { TableCell, TableRow } from "$lib/model/recursive_table/TableComponents";
import { TableCrawler } from "$lib/model/recursive_table/TableCrawler";
import { jest } from "@jest/globals";

class DummyUndefinedCrawler<T> extends TableCrawler<T, DummyCrawler<T>> {
    public crawlRow = jest.fn<TableRow<T>, any>().mockImplementation(row => undefined);
}

class DummyCrawler<T> extends TableCrawler<T, DummyCrawler<T>> {
    public crawlRow = jest.fn<TableRow<T>, any>().mockImplementation(row => row);
}

class DummyTableCell extends TableCell<string> {
    public getData = jest.fn<string[], any>().mockImplementation(() => ["data"]);
}

describe("Testing if TableRow ", () => {
    test("sets the filterable variable correctly in initialization", () => {
        let filterable = new TableRow<string>(true);
        let notFilterable = new TableRow<string>(false);
        let notDefined = new TableRow<string>();

        expect(filterable.isFilterable()).toBe(true);
        expect(notFilterable.isFilterable()).toBe(false);
        expect(notDefined.isFilterable()).toBe(true);
    });

    test("has no data after initialization, but not undefined", () => {
        let row = new TableRow<string>();
        
        expect(row.getData()).not.toBe(undefined);
        expect(row.getData()).toEqual([]);
    });

    test("has no children after initialization, but not undefined", () => {
        let row = new TableRow<string>();

        expect(row.getChildren()).not.toBe(undefined);
        expect(row.getChildren()).toEqual([]);
    });

    test("gets correctly being crawled on", () => {
        let row = new TableRow<string>();
        let crawler = new DummyCrawler<string>();
        row.getCrawledOn(crawler)

        expect(crawler.crawlRow).toBeCalledTimes(1);
    });

    test("crawler can change data to undefined", () => {
        let row = new TableRow<string>();
        let crawler = new DummyUndefinedCrawler<string>();
        row.getCrawledOn(crawler);
        expect(row.getData()).toBe(undefined);
    }); 

    test("adds a child correctly", () => {
        let row = new TableRow<string>();
        let cell = new TableCell<string>();
        row.add(cell);

        expect(row.getChildren()).toEqual([cell]);
    });

    test("adds children correctly", () => {
        let row = new TableRow<string>();
        let cells = [new TableCell<string>(), new TableCell<string>(), new TableCell<string>()];
        row.add(...cells);

        expect(row.getChildren()).toEqual(cells);
    });

    test("returns data from children correctly", () => {
        let row = new TableRow<string>();
        let cells = [new DummyTableCell(), new DummyTableCell(), new DummyTableCell()];
        row.add(...cells);

        expect(row.getData()).toEqual(["data", "data", "data"]);
    });
});