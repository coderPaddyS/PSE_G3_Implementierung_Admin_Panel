/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import { TitleCell, TableData, TableRow } from "$lib/model/table/TableComponents";
import { TableCrawler } from "$lib/model/table/TableCrawler";
import type { Sorter } from "$lib/model/table/Types";
import { jest } from "@jest/globals";

class DummyCrawler<T> extends TableCrawler<T, DummyCrawler<T>> {
    public crawlTitleCell = jest.fn<TitleCell<T>, any>().mockImplementation(row => row);
}

class DummyUndefinedCrawler<T> extends TableCrawler<T, DummyCrawler<T>> {
    public crawlTitleCell = jest.fn<TitleCell<T>, any>().mockImplementation(row => undefined);
}

class DummyTableData extends TableData<string> {
    public constructor() {
        super("data");
    }

    public getData = jest.fn<string[], any>().mockImplementation(() => ["data"]);
}

describe("Testing if TitleCell ", () => {
    test("sets the filterable variable correctly in initialization", () => {
        let notDefined = new TitleCell<string>();

        expect(notDefined.isFilterable()).toBe(false);
    });

    test("has no data after initialization, but not undefined", () => {
        let cell = new TitleCell<string>();
        
        expect(cell.getData()).not.toBe(undefined);
        expect(cell.getData()).toEqual([]);
    });

    test("has no children after initialization, but not undefined", () => {
        let cell = new TitleCell<string>();

        expect(cell.getChilds()).not.toBe(undefined);
        expect(cell.getChilds()).toEqual([]);
    });

    test("has no sorter after initialization without specifying", () => {
        let cell = new TitleCell<string>();

        expect(cell.getSorter()).toBe(undefined);
    });

    test("returns a previously set sorter", () => {
        let sorter: Sorter<TableRow<string>> = (a, b) => [a, b];
        let cell = new TitleCell<string>(sorter);
        
        expect(cell.getSorter()).toBe(sorter);
    });

    test("sets data correctly and replaces", () => {
        let data = new DummyTableData();
        let replace = new DummyTableData();
        let cell = new TitleCell<string>();

        cell.set(data);
        expect(cell.getChilds()).toEqual([data]);

        cell.set(replace);
        expect(cell.getChilds()[0] != data).toBe(true);
    });

    test("gets correctly being crawled on", () => {
        let cell = new TitleCell<string>();
        let crawler = new DummyCrawler<string>();
        cell.getCrawledOn(crawler)

        expect(crawler.crawlTitleCell).toBeCalledTimes(1);
    });

    test("crawler can change data to undefined", () => {
        let cell = new TitleCell<string>();
        let crawler = new DummyUndefinedCrawler<string>();
        cell.getCrawledOn(crawler);
        expect(cell.getData()).toBe(undefined);
    }); 

    test("adds a child correctly", () => {
        let cell = new TitleCell<string>();
        let data = new DummyTableData();
        cell.add(data);

        expect(cell.getChilds()).toEqual([data]);
    });

    test("adds children correctly", () => {
        let cell = new TitleCell<string>();
        let data = [new DummyTableData(), new DummyTableData(), new DummyTableData()];
        cell.add(...data);

        expect(cell.getChilds()).toEqual(data);
    });

    test("returns data from children correctly", () => {
        let cell = new TitleCell<string>();
        let data = [new DummyTableData(), new DummyTableData(), new DummyTableData()];
        cell.add(...data);

        expect(cell.getData()).toEqual(["data", "data", "data"]);
    });
});