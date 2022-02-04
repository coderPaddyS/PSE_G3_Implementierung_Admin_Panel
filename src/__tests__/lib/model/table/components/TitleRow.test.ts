/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import { TitleRow, TitleCell } from "$lib/model/table/TableComponents";
import { TableCrawler } from "$lib/model/table/TableCrawler";
import { jest } from "@jest/globals";

class DummyCrawler<T> extends TableCrawler<T, DummyCrawler<T>> {
    public crawlTitleRow = jest.fn<TitleRow<T>, any>().mockImplementation(row => row);
}

class DummyUndefinedCrawler<T> extends TableCrawler<T, DummyCrawler<T>> {
    public crawlTitleRow = jest.fn<TitleRow<T>, any>().mockImplementation(row => undefined);
}

class DummyTitleCell extends TitleCell<string> {
    public getData = jest.fn<string[], any>().mockImplementation(() => ["data"]);
}

describe("Testing if TitleRow ", () => {
    test("sets the filterable variable correctly in initialization", () => {
        let notDefined = new TitleRow<string>();

        expect(notDefined.isFilterable()).toBe(false);
    });

    test("has no data after initialization, but not undefined", () => {
        let row = new TitleRow<string>();
        
        expect(row.getData()).not.toBe(undefined);
        expect(row.getData()).toEqual([]);
    });

    test("has no children after initialization, but not undefined", () => {
        let row = new TitleRow<string>();

        expect(row.getChilds()).not.toBe(undefined);
        expect(row.getChilds()).toEqual([]);
    });

    test("gets correctly being crawled on", () => {
        let row = new TitleRow<string>();
        let crawler = new DummyCrawler<string>();
        row.getCrawledOn(crawler)

        expect(crawler.crawlTitleRow).toBeCalledTimes(1);
    });

    test("crawler can change data to undefined", () => {
        let row = new TitleRow<string>();
        let crawler = new DummyUndefinedCrawler<string>();
        row.getCrawledOn(crawler);
        expect(row.getData()).toBe(undefined);
    }); 

    test("adds a child correctly", () => {
        let row = new TitleRow<string>();
        let cell = new DummyTitleCell();
        row.add(cell);

        expect(row.getChilds()).toEqual([cell]);
    });

    test("adds children correctly", () => {
        let row = new TitleRow<string>();
        let cells = [new DummyTitleCell(), new DummyTitleCell(), new DummyTitleCell()];
        row.add(...cells);

        expect(row.getChilds()).toEqual(cells);
    });

    test("returns data from children correctly", () => {
        let row = new TitleRow<string>();
        let cells = [new DummyTitleCell(), new DummyTitleCell(), new DummyTitleCell()];
        row.add(...cells);

        expect(row.getData()).toEqual(["data", "data", "data"]);
    });
});