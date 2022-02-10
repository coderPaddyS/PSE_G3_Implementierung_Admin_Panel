/// SPDX-License-Identifier: GPL-3.0-or-later
/// 
/// 2022, Patrick Schneider <patrick@itermori.de>

import { Table, TableCell, TableRow, TitleCell, TitleRow } from "$lib/model/table/TableComponents";
import { TableCrawler } from "$lib/model/table/TableCrawler";
import { jest } from "@jest/globals";
import lodash from "lodash";

class DummyCrawler<T> extends TableCrawler<T, DummyCrawler<T>> {
    public crawlTable = jest.fn<Table<T>, any>().mockImplementation(row => row);
}

class DummyUndefinedCrawler<T> extends TableCrawler<T, DummyCrawler<T>> {
    public crawlTable = jest.fn<Table<T>, any>().mockImplementation(row => undefined);
}

class DummyTableRow extends TableRow<string> {
    public getData = jest.fn<string[], any>().mockImplementation(() => ["data"]);
}

class DummyTitleCell extends TitleCell<string> {
    private dummyData: string[];

    public constructor(data: string) {
        super();
        this.dummyData = [data];
    }

    private getterData(): string[] {
        return this.dummyData;
    }

    public getData = jest.fn<string[], any>().mockImplementation(this.getterData);
}

class DummyTableCell extends TableCell<string> {
    private dummyData: string[];

    public constructor(data: string) {
        super();
        this.dummyData = [data];
    }

    private getterData(): string[] {
        return this.dummyData;
    }
    public getData = jest.fn<string[], any>().mockImplementation(this.getterData);
}

describe("Testing if Table ", () => {
    test("sets the filterable variable correctly in initialization", () => {
        let notDefined = new Table<string>();

        expect(notDefined.isFilterable()).toBe(true);
    });

    test("has no data after initialization, but not undefined", () => {
        let table = new Table<string>();
        
        expect(table.getData()).not.toBe(undefined);
        expect(table.getData()).toEqual([]);
    });

    test("has no children after initialization, but not undefined", () => {
        let table = new Table<string>();

        expect(table.getChilds()).not.toBe(undefined);
        expect(table.getChilds()).toEqual([]);
    });

    test("has no title after initialization", () => {
        let table = new Table<string>();

        expect(table.getTitle()).toBe(undefined);
    });

    test("gets correctly being crawled on", () => {
        let table = new Table<string>();
        let crawler = new DummyCrawler<string>();
        table.getCrawledOn(crawler)

        expect(crawler.crawlTable).toBeCalledTimes(1);
    });

    test("crawler can change data to undefined", () => {
        let table = new Table<string>();
        let crawler = new DummyUndefinedCrawler<string>();
        table.getCrawledOn(crawler);
        expect(table.getData()).toBe(undefined);
    }); 

    test("adds a child correctly", () => {
        let table = new Table<string>();
        let row = new TableRow<string>();
        table.add(row);

        expect(table.getChilds()).toEqual([row]);
    });

    test("adds children correctly", () => {
        let table = new Table<string>();
        let rows = [new DummyTableRow(), new DummyTableRow(), new DummyTableRow()];
        table.add(...rows);

        expect(table.getChilds()).toEqual(rows);
    });

    test("sets title correctly", () => {
        let table = new Table<string>();
        let row = new TitleRow<string>();
        table.setTitle(row);

        expect(table.getTitle()).toEqual(row);
    });

    test("returns data from children correctly without title", () => {
        let table = new Table<string>();
        let rows = [
            new TableRow<string>().add(...[new DummyTableCell("row1"), new DummyTableCell("cell2"), new DummyTableCell("cell3")]),
            new TableRow<string>().add(...[new DummyTableCell("row2"), new DummyTableCell("cell2"), new DummyTableCell("cell3")]),
        ];
        table.add(...rows);

        expect(table.getData()).toEqual([{row1: "cell2,cell3"}, {row2: "cell2,cell3"}]);
    });

    test("returns data from child correctly with title", () => {
        let table = new Table<string>();
        let title = new TitleRow<string>().add(new DummyTitleCell("title1"), new DummyTitleCell("title2"), new DummyTitleCell("title3"));
        let row = new TableRow<string>().add(new DummyTableCell("data1"), new DummyTableCell("data2"), new DummyTableCell("data3"));
        table.add(row);
        table.setTitle(title);

        expect(table.getData()).toEqual([{"title1": "data1", "title2": "data2", "title3": "data3"}]);
    });

    test("sets childs accordingly", () => {
        let table = new Table<string>();
        let rows = [
            new TableRow<string>().add(...[new DummyTableCell("row1"), new DummyTableCell("cell2"), new DummyTableCell("cell3")]),
            new TableRow<string>().add(...[new DummyTableCell("row2"), new DummyTableCell("cell2"), new DummyTableCell("cell3")]),
        ];
        table.add(rows[0]);
        expect(table.getChilds()).toEqual([rows[0]]);
        table.setChilds(rows);
        expect(table.getChilds()).toBe(rows);
    });

    test("removes row by index correctly", () => {
        let table = new Table<string>();
        let rows = [
            new TableRow<string>().add(...[new DummyTableCell("row1"), new DummyTableCell("cell2"), new DummyTableCell("cell3")]),
            new TableRow<string>().add(...[new DummyTableCell("row2"), new DummyTableCell("cell2"), new DummyTableCell("cell3")]),
        ];
        table.setChilds(lodash.cloneDeep(rows));
        expect(table.getChilds()).toEqual(rows);

        // valid index
        expect(table.remove(0)).toBe(true);
        expect(table.getChilds()).toEqual([rows[1]]);

        // invalid indices
        expect(table.remove(1)).toBe(false);
        expect(table.remove(-1)).toBe(false);

        // valid index
        expect(table.remove(0)).toBe(true);
        expect(table.getChilds()).toEqual([]);

        // invalid index on empty
        expect(table.remove(0)).toBe(false);
    });
    
    test("matches data correctly", () => {
        let table = new Table<string>();
        let title = new TitleRow<string>().add(new DummyTitleCell("title1"), new DummyTitleCell("title2"), new DummyTitleCell("title3"));
        let row = new TableRow<string>().add(new DummyTableCell("data1"), new DummyTableCell("data2"), new DummyTableCell("data3"));
        table.add(row);
        table.setTitle(title);

        expect(table.matchData(row.getData())).toEqual({"0": ["title1", ["data1"]], "1": ["title2", ["data2"]], "2": ["title3", ["data3"]]});
    })
});