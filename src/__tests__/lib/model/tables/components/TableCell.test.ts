/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import { TableCell, TableData } from "$lib/model/recursive_table/TableComponents";
import { TableCrawler } from "$lib/model/recursive_table/TableCrawler";
import { jest } from "@jest/globals";

class DummyCrawler<T> extends TableCrawler<T, DummyCrawler<T>> {
    public crawlCell = jest.fn<TableCell<T>, any>().mockImplementation(row => row);
}

class DummyUndefinedCrawler<T> extends TableCrawler<T, DummyCrawler<T>> {
    public crawlCell = jest.fn<TableCell<T>, any>().mockImplementation(row => undefined);
}

class DummyTableData extends TableData<string> {
    public constructor() {
        super("data");
    }

    public getData = jest.fn<string[], any>().mockImplementation(() => ["data"]);
}

describe("Testing if TableCell ", () => {
    test("sets the filterable variable correctly in initialization", () => {
        let filterable = new TableCell<string>(true);
        let notFilterable = new TableCell<string>(false);
        let notDefined = new TableCell<string>();

        expect(filterable.isFilterable()).toBe(true);
        expect(notFilterable.isFilterable()).toBe(false);
        expect(notDefined.isFilterable()).toBe(true);
    });

    test("has no data after initialization, but not undefined", () => {
        let cell = new TableCell<string>();
        
        expect(cell.getData()).not.toBe(undefined);
        expect(cell.getData()).toEqual([]);
    });

    test("has no children after initialization, but not undefined", () => {
        let cell = new TableCell<string>();

        expect(cell.getChilds()).not.toBe(undefined);
        expect(cell.getChilds()).toEqual([]);
    });

    test("gets correctly being crawled on", () => {
        let cell = new TableCell<string>();
        let crawler = new DummyCrawler<string>();
        cell.getCrawledOn(crawler)

        expect(crawler.crawlCell).toBeCalledTimes(1);
    });

    test("crawler can change data to undefined", () => {
        let row = new TableCell<string>();
        let crawler = new DummyUndefinedCrawler<string>();
        row.getCrawledOn(crawler);
        expect(row.getData()).toBe(undefined);
    }); 

    test("adds a child correctly", () => {
        let cell = new TableCell<string>();
        let data = new DummyTableData();
        cell.add(data);

        expect(cell.getChilds()).toEqual([data]);
    });

    test("adds children correctly", () => {
        let cell = new TableCell<string>();
        let data = [new DummyTableData(), new DummyTableData(), new DummyTableData()];
        cell.add(...data);

        expect(cell.getChilds()).toEqual(data);
    });

    test("returns data from children correctly", () => {
        let cell = new TableCell<string>();
        let data = [new DummyTableData(), new DummyTableData(), new DummyTableData()];
        cell.add(...data);

        expect(cell.getData()).toEqual(["data", "data", "data"]);
    });
});