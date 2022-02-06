/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import { TableData, TableDataHTML } from "$lib/model/table/TableComponents";
import { TableCrawler } from "$lib/model/table/TableCrawler";
import { TableDataAdditions } from "$lib/model/table/TableDataAdditions";
import { jest } from "@jest/globals";

class DummyCrawler<T> extends TableCrawler<T, DummyCrawler<T>> {
    public crawlData = jest.fn<TableData<T>, any>().mockImplementation(row => row);
}

describe("Testing if TableDataHTML ", () => {
    const DATA = "data"
    let data;

    beforeEach(() => {
        data = new TableDataHTML<string>(DATA);
    });

    test("sets the filterable variable correctly in initialization", () => {
        expect(data.isFilterable()).toBe(true);
    });

    test("has given data after initialization", () => {
        expect(data.getData()).toEqual([DATA]);
    });

    test("has no children", () => {
        expect(data.getChilds()).toBe(undefined);
    });

    test("is of type TableDataAdditions.HTML", () => {
        expect(data.getType()).toEqual(TableDataAdditions.HTML);
    });

    test("to have no factory", () => {
        expect(data.getFactory()).toBe(undefined);
    });

    test("gets correctly being crawled on", () => {
        let crawler = new DummyCrawler<string>();
        data.getCrawledOn(crawler);

        expect(crawler.crawlData).toBeCalledTimes(1);
    });    
});