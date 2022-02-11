/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import { Table, TableCell, TableData, TableDataHTML, TableDataTable, TableRow } from "$lib/model/recursive_table/TableComponents";
import { TableCrawler } from "$lib/model/recursive_table/TableCrawler";
import { TableDataAdditions } from "$lib/model/recursive_table/TableDataAdditions";
import { jest } from "@jest/globals";

const DATA = "data";

class DummyCrawler<T> extends TableCrawler<T, DummyCrawler<T>> {
    public crawlData = jest.fn<TableData<T>, any>().mockImplementation(row => row);
}

class DummyTable extends Table<string> {
    public getData = jest.fn<string[], any>().mockImplementation(() => [DATA]);
}

describe("Testing if TableDataTable ", () => {
    let table = new DummyTable();
    let data;
    let noData;

    beforeEach(() => {
        data = new TableDataTable<string>(table);
        noData = new TableDataTable<string>(undefined);
    });

    test("sets the filterable variable correctly in initialization", () => {
        expect(data.isFilterable()).toBe(true);
        expect(noData.isFilterable()).toBe(true);
    });

    test("has given data after initialization", () => {
        expect(data.getData()).toEqual([DATA]);
        expect(noData.getData()).toEqual(undefined);
    });

    test("has the table as only child", () => {
        expect(data.getChilds()).toEqual([table]);
        expect(noData.getChilds()).toEqual(undefined);
    });

    test("is of type TableDataAdditions.TABLE", () => {
        expect(data.getType()).toEqual(TableDataAdditions.TABLE);
        expect(noData.getType()).toEqual(TableDataAdditions.TABLE);
    });

    test("to have no factory", () => {
        expect(data.getFactory()).toBe(undefined);
        expect(noData.getFactory()).toBe(undefined);
    });

    test("gets correctly being crawled on", () => {
        let crawler = new DummyCrawler<string>();

        data.getCrawledOn(crawler);
        expect(crawler.crawlData).toBeCalledTimes(1);

        noData.getCrawledOn(crawler);
        expect(crawler.crawlData).toBeCalledTimes(2);
    });
});