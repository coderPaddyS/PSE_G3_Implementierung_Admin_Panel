/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import { ComponentFactory, TableData, TableDataComponent } from "$lib/model/table/TableComponents";
import { TableCrawler } from "$lib/model/table/TableCrawler";
import { TableDataAdditions } from "$lib/model/table/TableDataAdditions";
import { jest } from "@jest/globals";

class DummyCrawler<T> extends TableCrawler<T, DummyCrawler<T>> {
    public crawlData = jest.fn<TableData<T>, any>().mockImplementation(row => row);
}

describe("Testing if TableDataComponent ", () => {
    const factory: ComponentFactory = jest.fn();
    let data;

    beforeEach(() => {
        data = new TableDataComponent<string>(factory);
    });

    test("sets the filterable variable correctly in initialization", () => {
        expect(data.isFilterable()).toBe(false);
    });

    test("has no data after initialization", () => {
        expect(data.getData()).toBe(undefined);
    });

    test("has no children", () => {
        expect(data.getChilds()).toBe(undefined);
    });

    test("is of type TableDataAdditions.COMPONENT", () => {
        expect(data.getType()).toEqual(TableDataAdditions.COMPONENT);
    });

    test("to have the given factory", () => {
        expect(data.getFactory()).toBe(factory);
    });

    test("gets correctly being crawled on", () => {
        let crawler = new DummyCrawler<string>();
        data.getCrawledOn(crawler);

        expect(crawler.crawlData).toBeCalledTimes(1);
    });
});