/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import { TableData } from "$lib/model/recursive_table/TableComponents";
import { TableCrawler } from "$lib/model/recursive_table/TableCrawler";
import { TableDataAdditions } from "$lib/model/recursive_table/TableDataAdditions";
import { jest } from "@jest/globals";

class DummyCrawler<T> extends TableCrawler<T, DummyCrawler<T>> {
    public crawlData = jest.fn<TableData<T>, any>().mockImplementation(row => row);
}

class DummyUndefinedCrawler<T> extends TableCrawler<T, DummyCrawler<T>> {
    public crawlData = jest.fn<TableData<T>, any>().mockImplementation(row => undefined);
}

describe("Testing if TableData ", () => {
    const DATA = "data"
    let data;

    beforeEach(() => {
        data = new TableData<string>(DATA);
    })
    test("sets the filterable variable correctly in initialization", () => {
        expect(data.isFilterable()).toBe(true);
    });

    test("has given data after initialization", () => {
        expect(data.getData()).toEqual([DATA]);
    });

    test("has no children", () => {
        expect(data.getChilds()).toBe(undefined);
    });

    test("is of type TableDataAdditions.VALUE", () => {
        expect(data.getType()).toEqual(TableDataAdditions.VALUE);
    });

    test("to have no factory", () => {
        expect(data.getFactory()).toBe(undefined);
    });

    test("gets correctly being crawled on", () => {
        let crawler = new DummyCrawler<string>();
        data.getCrawledOn(crawler)

        expect(crawler.crawlData).toBeCalledTimes(1);
    });

    test("crawler can change data to undefined", () => {
        let crawler = new DummyUndefinedCrawler<string>();
        data.getCrawledOn(crawler);

        expect(data.getData()).toBe(undefined);
    }); 
});